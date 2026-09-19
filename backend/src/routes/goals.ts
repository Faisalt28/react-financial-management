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

// Delete goal
goalsRouter.delete('/:id', async (c) => {
  const userId = c.get('userId')
  const id = c.req.param('id')

  await c.env.DB.prepare(
    'DELETE FROM goals WHERE id = ? AND user_id = ?'
  ).bind(id, userId).run()

  return c.json({ success: true })
})
