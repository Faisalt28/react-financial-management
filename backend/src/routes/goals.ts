import { Hono } from 'hono'
import { Bindings, Variables, Goal } from '../types'
import { generateId } from '../lib/crypto'
import { authMiddleware } from '../middleware/auth'

export const goalsRouter = new Hono<{ Bindings: Bindings; Variables: Variables }>()

goalsRouter.use('*', authMiddleware)

// Get all goals for user
goalsRouter.get('/', async (c) => {
  const userId = c.get('userId')
  const { results } = await c.env.DB.prepare(
    'SELECT * FROM goals WHERE user_id = ? ORDER BY created_at DESC'
  ).bind(userId).all<Goal>()

  return c.json({ goals: results || [] })
})

// Create goal
goalsRouter.post('/', async (c) => {
  const userId = c.get('userId')
  const body = await c.req.json().catch(() => null)
  if (!body || !body.name || !body.targetAmount) {
    return c.json({ error: 'Nama dan target tabungan wajib diisi' }, 400)
  }

  const id = generateId()
  const name = body.name.trim()
  const targetAmount = Number(body.targetAmount) || 0
  const currentAmount = Number(body.currentAmount) || 0
  const deadline = body.deadline || null
  const color = body.color || '#6366f1'
  const icon = body.icon || '🎯'
  const status = body.status || 'active'
  const now = new Date().toISOString()

  await c.env.DB.prepare(
    'INSERT INTO goals (id, user_id, name, target_amount, current_amount, deadline, color, icon, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
  ).bind(id, userId, name, targetAmount, currentAmount, deadline, color, icon, status, now).run()

  const created = await c.env.DB.prepare('SELECT * FROM goals WHERE id = ?').bind(id).first<Goal>()
  return c.json({ goal: created }, 201)
})

// Update goal (including add/withdraw funds)
goalsRouter.put('/:id', async (c) => {
  const userId = c.get('userId')
  const id = c.req.param('id')
  const body = await c.req.json().catch(() => null)
  if (!body) return c.json({ error: 'Body tidak valid' }, 400)

  const existing = await c.env.DB.prepare(
    'SELECT * FROM goals WHERE id = ? AND user_id = ?'
  ).bind(id, userId).first<Goal>()

  if (!existing) {
    return c.json({ error: 'Target tabungan tidak ditemukan' }, 404)
  }

  const name = body.name !== undefined ? body.name.trim() : existing.name
  const targetAmount = body.targetAmount !== undefined ? Number(body.targetAmount) : existing.target_amount
  const currentAmount = body.currentAmount !== undefined ? Number(body.currentAmount) : existing.current_amount
  const deadline = body.deadline !== undefined ? body.deadline : existing.deadline
  const color = body.color !== undefined ? body.color : existing.color
  const icon = body.icon !== undefined ? body.icon : existing.icon
  const status = currentAmount >= targetAmount ? 'completed' : (body.status || existing.status)

  await c.env.DB.prepare(
    'UPDATE goals SET name = ?, target_amount = ?, current_amount = ?, deadline = ?, color = ?, icon = ?, status = ? WHERE id = ? AND user_id = ?'
  ).bind(name, targetAmount, currentAmount, deadline, color, icon, status, id, userId).run()

  const updated = await c.env.DB.prepare('SELECT * FROM goals WHERE id = ?').bind(id).first<Goal>()
  return c.json({ goal: updated })
})

// Deposit funds into a goal from a selected account
goalsRouter.post('/:id/deposit', async (c) => {
  const userId = c.get('userId')
  const goalId = c.req.param('id')
  const body = await c.req.json().catch(() => null)

  if (!body || !body.accountId || !body.amount) {
    return c.json({ error: 'Akun sumber dana dan nominal setoran wajib diisi' }, 400)
  }

  const amount = Math.abs(Number(body.amount)) || 0
  if (amount <= 0) {
    return c.json({ error: 'Nominal setoran harus lebih besar dari 0' }, 400)
  }

  const accountId = body.accountId
  const note = body.note || null

  // 1. Check goal
  const goal = await c.env.DB.prepare(
    'SELECT * FROM goals WHERE id = ? AND user_id = ?'
  ).bind(goalId, userId).first<Goal>()

  if (!goal) {
    return c.json({ error: 'Target tabungan tidak ditemukan' }, 404)
  }

  // 2. Check account
  const account = await c.env.DB.prepare(
    'SELECT * FROM accounts WHERE id = ? AND user_id = ?'
  ).bind(accountId, userId).first<{ id: string; name: string; balance: number }>()

  if (!account) {
    return c.json({ error: 'Akun / dompet sumber dana tidak ditemukan' }, 404)
  }

  if (account.balance < amount) {
    return c.json({
      error: `Saldo ${account.name} tidak mencukupi (Tersedia: Rp ${account.balance.toLocaleString('id-ID')})`
    }, 400)
  }

  const now = new Date().toISOString()
  const today = now.slice(0, 10)
  const txId = generateId()
  const txNote = note ? note.trim() : `Setoran Tabungan: ${goal.name}`
  const newCurrentAmount = (goal.current_amount || 0) + amount
  const newStatus = newCurrentAmount >= goal.target_amount ? 'completed' : goal.status

  // 3. Batch atomic execution: deduct account, increase goal, create expense transaction
  await c.env.DB.batch([
    c.env.DB.prepare(
      'UPDATE accounts SET balance = balance - ? WHERE id = ? AND user_id = ?'
    ).bind(amount, accountId, userId),
    c.env.DB.prepare(
      'UPDATE goals SET current_amount = ?, status = ? WHERE id = ? AND user_id = ?'
    ).bind(newCurrentAmount, newStatus, goalId, userId),
    c.env.DB.prepare(
      'INSERT INTO transactions (id, user_id, type, category_id, account_id, to_account_id, amount, date, note, description, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    ).bind(txId, userId, 'expense', 'investment', accountId, null, amount, today, txNote, `Setor ke tabungan "${goal.name}"`, now)
  ])

  const updatedGoal = await c.env.DB.prepare('SELECT * FROM goals WHERE id = ?').bind(goalId).first<Goal>()
  const updatedAccount = await c.env.DB.prepare('SELECT * FROM accounts WHERE id = ?').bind(accountId).first()

  return c.json({
    success: true,
    goal: updatedGoal,
    account: updatedAccount,
    transactionId: txId
  })
})

// Delete goal
goalsRouter.delete('/:id', async (c) => {
  const userId = c.get('userId')
  const id = c.req.param('id')

  await c.env.DB.prepare(
    'DELETE FROM goals WHERE id = ? AND user_id = ?'
  ).bind(id, userId).run()

  return c.json({ success: true })
})
