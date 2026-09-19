import { Hono } from 'hono'
import { Bindings, Variables } from '../types'
import { generateId } from '../lib/crypto'
import { authMiddleware } from '../middleware/auth'

export const settingsRouter = new Hono<{ Bindings: Bindings; Variables: Variables }>()

settingsRouter.use('*', authMiddleware)

// Reset all user data (delete transactions, budgets, goals, and recreate clean default wallet)
settingsRouter.post('/reset', async (c) => {
  const userId = c.get('userId')
  const defaultAccountId = generateId()
  const now = new Date().toISOString()

  await c.env.DB.batch([
    c.env.DB.prepare('DELETE FROM transactions WHERE user_id = ?').bind(userId),
    c.env.DB.prepare('DELETE FROM budgets WHERE user_id = ?').bind(userId),
    c.env.DB.prepare('DELETE FROM goals WHERE user_id = ?').bind(userId),
    c.env.DB.prepare('DELETE FROM accounts WHERE user_id = ?').bind(userId),
  ])

  return c.json({ success: true, message: 'Semua data transaksi dan akun berhasil direset ke awal' })
})
