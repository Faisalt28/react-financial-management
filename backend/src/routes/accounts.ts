import { Hono } from 'hono'
import { Bindings, Variables, Account } from '../types'
import { generateId } from '../lib/crypto'
import { authMiddleware } from '../middleware/auth'

export const accountsRouter = new Hono<{ Bindings: Bindings; Variables: Variables }>()

accountsRouter.use('*', authMiddleware)

// Get all accounts for logged in user
accountsRouter.get('/', async (c) => {
  const userId = c.get('userId')
  const { results } = await c.env.DB.prepare(
    'SELECT * FROM accounts WHERE user_id = ? ORDER BY created_at ASC'
  ).bind(userId).all<Account>()

  return c.json({ accounts: results || [] })
})

// Create new account
accountsRouter.post('/', async (c) => {
  const userId = c.get('userId')
  const body = await c.req.json().catch(() => null)
  if (!body || !body.name) {
    return c.json({ error: 'Nama akun wajib diisi' }, 400)
  }

  const id = generateId()
  const name = body.name.trim()
  const type = body.type || 'cash'
  const balance = Number(body.balance) || 0
  const color = body.color || '#10b981'
  const icon = body.icon || '💵'
  const now = new Date().toISOString()

  await c.env.DB.prepare(
    'INSERT INTO accounts (id, user_id, name, type, balance, color, icon, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  ).bind(id, userId, name, type, balance, color, icon, now).run()

  const created = await c.env.DB.prepare('SELECT * FROM accounts WHERE id = ?').bind(id).first<Account>()
  return c.json({ account: created }, 201)
})

// Update account
accountsRouter.put('/:id', async (c) => {
  const userId = c.get('userId')
  const id = c.req.param('id')
  const body = await c.req.json().catch(() => null)
  if (!body) return c.json({ error: 'Body tidak valid' }, 400)

  // Verify ownership
  const existing = await c.env.DB.prepare(
    'SELECT id FROM accounts WHERE id = ? AND user_id = ?'
  ).bind(id, userId).first()

  if (!existing) {
    return c.json({ error: 'Akun tidak ditemukan' }, 404)
  }

  const name = body.name !== undefined ? body.name.trim() : undefined
  const type = body.type
  const balance = body.balance !== undefined ? Number(body.balance) : undefined
  const color = body.color
  const icon = body.icon

  // Build dynamic update
  const updates: string[] = []
  const values: any[] = []

  if (name !== undefined) { updates.push('name = ?'); values.push(name) }
  if (type !== undefined) { updates.push('type = ?'); values.push(type) }
  if (balance !== undefined) { updates.push('balance = ?'); values.push(balance) }
  if (color !== undefined) { updates.push('color = ?'); values.push(color) }
  if (icon !== undefined) { updates.push('icon = ?'); values.push(icon) }

  if (updates.length > 0) {
    values.push(id, userId)
    await c.env.DB.prepare(
      `UPDATE accounts SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`
    ).bind(...values).run()
  }

  const updated = await c.env.DB.prepare('SELECT * FROM accounts WHERE id = ?').bind(id).first<Account>()
  return c.json({ account: updated })
})

// Delete account
accountsRouter.delete('/:id', async (c) => {
  const userId = c.get('userId')
  const id = c.req.param('id')

  const result = await c.env.DB.prepare(
    'DELETE FROM accounts WHERE id = ? AND user_id = ?'
  ).bind(id, userId).run()

  if (!result.success) {
    return c.json({ error: 'Gagal menghapus akun' }, 500)
  }

  return c.json({ success: true })
})
