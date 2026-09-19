import { Hono } from 'hono'
import { Bindings, Variables, Transaction } from '../types'
import { generateId } from '../lib/crypto'
import { authMiddleware } from '../middleware/auth'

export const transactionsRouter = new Hono<{ Bindings: Bindings; Variables: Variables }>()

transactionsRouter.use('*', authMiddleware)

// Get all transactions for user (with optional month, year, type filters)
transactionsRouter.get('/', async (c) => {
  const userId = c.get('userId')
  const { type, accountId, categoryId, month, year } = c.req.query()

  let query = 'SELECT * FROM transactions WHERE user_id = ?'
  const params: any[] = [userId]

  if (type) {
    query += ' AND type = ?'
    params.push(type)
  }
  if (accountId) {
    query += ' AND (account_id = ? OR to_account_id = ?)'
    params.push(accountId, accountId)
  }
  if (categoryId) {
    query += ' AND category_id = ?'
    params.push(categoryId)
  }
  if (month && year) {
    const formattedMonth = String(month).padStart(2, '0')
    const prefix = `${year}-${formattedMonth}`
    query += ' AND date LIKE ?'
    params.push(`${prefix}%`)
  }

  query += ' ORDER BY date DESC, created_at DESC'

  const { results } = await c.env.DB.prepare(query).bind(...params).all<Transaction>()
  return c.json({ transactions: results || [] })
})

// Create transaction
transactionsRouter.post('/', async (c) => {
  const userId = c.get('userId')
  const body = await c.req.json().catch(() => null)
  if (!body || !body.type || !body.amount || !body.accountId || !body.date) {
    return c.json({ error: 'Data transaksi tidak lengkap' }, 400)
  }

  const id = generateId()
  const type = body.type
  const categoryId = body.categoryId || 'other'
  const accountId = body.accountId
  const toAccountId = body.toAccountId || null
  const amount = Math.abs(Number(body.amount)) || 0
  const date = body.date
  const note = body.note || null
  const description = body.description || null
  const now = new Date().toISOString()

  const statements: D1PreparedStatement[] = [
    c.env.DB.prepare(
      'INSERT INTO transactions (id, user_id, type, category_id, account_id, to_account_id, amount, date, note, description, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    ).bind(id, userId, type, categoryId, accountId, toAccountId, amount, date, note, description, now)
  ]

  // Atomic balance updates
  if (type === 'expense') {
    statements.push(
      c.env.DB.prepare('UPDATE accounts SET balance = balance - ? WHERE id = ? AND user_id = ?')
        .bind(amount, accountId, userId)
    )
  } else if (type === 'income') {
    statements.push(
      c.env.DB.prepare('UPDATE accounts SET balance = balance + ? WHERE id = ? AND user_id = ?')
        .bind(amount, accountId, userId)
    )
  } else if (type === 'transfer' && toAccountId) {
    statements.push(
      c.env.DB.prepare('UPDATE accounts SET balance = balance - ? WHERE id = ? AND user_id = ?')
        .bind(amount, accountId, userId),
      c.env.DB.prepare('UPDATE accounts SET balance = balance + ? WHERE id = ? AND user_id = ?')
        .bind(amount, toAccountId, userId)
    )
  }

  await c.env.DB.batch(statements)

  const created = await c.env.DB.prepare('SELECT * FROM transactions WHERE id = ?').bind(id).first<Transaction>()
  return c.json({ transaction: created }, 201)
})

// Update transaction
transactionsRouter.put('/:id', async (c) => {
  const userId = c.get('userId')
  const id = c.req.param('id')
  const body = await c.req.json().catch(() => null)
  if (!body) return c.json({ error: 'Body tidak valid' }, 400)

  const oldTx = await c.env.DB.prepare(
    'SELECT * FROM transactions WHERE id = ? AND user_id = ?'
  ).bind(id, userId).first<Transaction>()

  if (!oldTx) {
    return c.json({ error: 'Transaksi tidak ditemukan' }, 404)
  }

  const statements: D1PreparedStatement[] = []

  // 1. Revert old balance adjustment
  if (oldTx.type === 'expense') {
    statements.push(
      c.env.DB.prepare('UPDATE accounts SET balance = balance + ? WHERE id = ? AND user_id = ?')
        .bind(oldTx.amount, oldTx.account_id, userId)
    )
  } else if (oldTx.type === 'income') {
    statements.push(
      c.env.DB.prepare('UPDATE accounts SET balance = balance - ? WHERE id = ? AND user_id = ?')
        .bind(oldTx.amount, oldTx.account_id, userId)
    )
  } else if (oldTx.type === 'transfer' && oldTx.to_account_id) {
    statements.push(
      c.env.DB.prepare('UPDATE accounts SET balance = balance + ? WHERE id = ? AND user_id = ?')
        .bind(oldTx.amount, oldTx.account_id, userId),
      c.env.DB.prepare('UPDATE accounts SET balance = balance - ? WHERE id = ? AND user_id = ?')
        .bind(oldTx.amount, oldTx.to_account_id, userId)
    )
  }

  // 2. Prepare new values
  const newType = body.type !== undefined ? body.type : oldTx.type
  const newAmount = body.amount !== undefined ? Math.abs(Number(body.amount)) : oldTx.amount
  const newCategoryId = body.categoryId !== undefined ? body.categoryId : oldTx.category_id
  const newAccountId = body.accountId !== undefined ? body.accountId : oldTx.account_id
  const newToAccountId = body.toAccountId !== undefined ? body.toAccountId : oldTx.to_account_id
  const newDate = body.date !== undefined ? body.date : oldTx.date
  const newNote = body.note !== undefined ? body.note : oldTx.note
  const newDescription = body.description !== undefined ? body.description : oldTx.description

  statements.push(
    c.env.DB.prepare(
      'UPDATE transactions SET type = ?, category_id = ?, account_id = ?, to_account_id = ?, amount = ?, date = ?, note = ?, description = ? WHERE id = ? AND user_id = ?'
    ).bind(newType, newCategoryId, newAccountId, newToAccountId, newAmount, newDate, newNote, newDescription, id, userId)
  )

  // 3. Apply new balance adjustment
  if (newType === 'expense') {
    statements.push(
      c.env.DB.prepare('UPDATE accounts SET balance = balance - ? WHERE id = ? AND user_id = ?')
        .bind(newAmount, newAccountId, userId)
    )
  } else if (newType === 'income') {
    statements.push(
      c.env.DB.prepare('UPDATE accounts SET balance = balance + ? WHERE id = ? AND user_id = ?')
        .bind(newAmount, newAccountId, userId)
    )
  } else if (newType === 'transfer' && newToAccountId) {
    statements.push(
      c.env.DB.prepare('UPDATE accounts SET balance = balance - ? WHERE id = ? AND user_id = ?')
        .bind(newAmount, newAccountId, userId),
      c.env.DB.prepare('UPDATE accounts SET balance = balance + ? WHERE id = ? AND user_id = ?')
        .bind(newAmount, newToAccountId, userId)
    )
  }

  await c.env.DB.batch(statements)

  const updated = await c.env.DB.prepare('SELECT * FROM transactions WHERE id = ?').bind(id).first<Transaction>()
  return c.json({ transaction: updated })
})

// Delete transaction
transactionsRouter.delete('/:id', async (c) => {
  const userId = c.get('userId')
  const id = c.req.param('id')

  const tx = await c.env.DB.prepare(
    'SELECT * FROM transactions WHERE id = ? AND user_id = ?'
  ).bind(id, userId).first<Transaction>()

  if (!tx) {
    return c.json({ error: 'Transaksi tidak ditemukan' }, 404)
  }

  const statements: D1PreparedStatement[] = [
    c.env.DB.prepare('DELETE FROM transactions WHERE id = ? AND user_id = ?').bind(id, userId)
  ]

  // Revert balance adjustment
  if (tx.type === 'expense') {
    statements.push(
      c.env.DB.prepare('UPDATE accounts SET balance = balance + ? WHERE id = ? AND user_id = ?')
        .bind(tx.amount, tx.account_id, userId)
    )
  } else if (tx.type === 'income') {
    statements.push(
      c.env.DB.prepare('UPDATE accounts SET balance = balance - ? WHERE id = ? AND user_id = ?')
        .bind(tx.amount, tx.account_id, userId)
    )
  } else if (tx.type === 'transfer' && tx.to_account_id) {
    statements.push(
      c.env.DB.prepare('UPDATE accounts SET balance = balance + ? WHERE id = ? AND user_id = ?')
        .bind(tx.amount, tx.account_id, userId),
      c.env.DB.prepare('UPDATE accounts SET balance = balance - ? WHERE id = ? AND user_id = ?')
        .bind(tx.amount, tx.to_account_id, userId)
    )
  }

  await c.env.DB.batch(statements)
  return c.json({ success: true })
})
