import { Hono } from 'hono'
import { Bindings, Variables, Budget } from '../types'
import { generateId } from '../lib/crypto'
import { authMiddleware } from '../middleware/auth'

export const budgetsRouter = new Hono<{ Bindings: Bindings; Variables: Variables }>()

budgetsRouter.use('*', authMiddleware)

// Get all budgets (optionally filtered by month & year)
budgetsRouter.get('/', async (c) => {
  const userId = c.get('userId')
  const { month, year } = c.req.query()

  let query = 'SELECT * FROM budgets WHERE user_id = ?'
  const params: any[] = [userId]

  if (month !== undefined && year !== undefined) {
    query += ' AND month = ? AND year = ?'
    params.push(Number(month), Number(year))
  }

  query += ' ORDER BY created_at ASC'

  const { results } = await c.env.DB.prepare(query).bind(...params).all<Budget>()
  return c.json({ budgets: results || [] })
})

// Create budget
budgetsRouter.post('/', async (c) => {
  const userId = c.get('userId')
  const body = await c.req.json().catch(() => null)
  if (!body || !body.categoryId || body.amount === undefined || body.month === undefined || body.year === undefined) {
    return c.json({ error: 'Data anggaran tidak lengkap' }, 400)
  }

  const id = generateId()
  const categoryId = body.categoryId
  const month = Number(body.month)
  const year = Number(body.year)
  const amount = Number(body.amount) || 0
  const now = new Date().toISOString()

  // Check if budget for this category and month/year already exists
  const existing = await c.env.DB.prepare(
    'SELECT id FROM budgets WHERE user_id = ? AND category_id = ? AND month = ? AND year = ?'
  ).bind(userId, categoryId, month, year).first<Budget>()

  if (existing) {
    // Update existing instead
    await c.env.DB.prepare(
      'UPDATE budgets SET amount = ? WHERE id = ?'
    ).bind(amount, existing.id).run()

    const updated = await c.env.DB.prepare('SELECT * FROM budgets WHERE id = ?').bind(existing.id).first<Budget>()
    return c.json({ budget: updated })
  }

  await c.env.DB.prepare(
    'INSERT INTO budgets (id, user_id, category_id, month, year, amount, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
  ).bind(id, userId, categoryId, month, year, amount, now).run()

  const created = await c.env.DB.prepare('SELECT * FROM budgets WHERE id = ?').bind(id).first<Budget>()
  return c.json({ budget: created }, 201)
})

// Update budget
budgetsRouter.put('/:id', async (c) => {
  const userId = c.get('userId')
  const id = c.req.param('id')
  const body = await c.req.json().catch(() => null)
  if (!body || body.amount === undefined) {
    return c.json({ error: 'Jumlah anggaran wajib diisi' }, 400)
  }

  const amount = Number(body.amount) || 0

  await c.env.DB.prepare(
    'UPDATE budgets SET amount = ? WHERE id = ? AND user_id = ?'
  ).bind(amount, id, userId).run()

  const updated = await c.env.DB.prepare('SELECT * FROM budgets WHERE id = ?').bind(id).first<Budget>()
  return c.json({ budget: updated })
})

// Delete budget
budgetsRouter.delete('/:id', async (c) => {
  const userId = c.get('userId')
  const id = c.req.param('id')

  await c.env.DB.prepare(
    'DELETE FROM budgets WHERE id = ? AND user_id = ?'
  ).bind(id, userId).run()

  return c.json({ success: true })
})
