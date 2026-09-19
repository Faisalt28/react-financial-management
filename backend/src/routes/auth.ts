import { Hono } from 'hono'
import { sign } from 'hono/jwt'
import { Bindings, Variables, User } from '../types'
import { hashPassword, verifyPassword, generateId } from '../lib/crypto'
import { sendOtpEmail } from '../lib/email'
import { authMiddleware } from '../middleware/auth'

export const authRouter = new Hono<{ Bindings: Bindings; Variables: Variables }>()

// Register
authRouter.post('/register', async (c) => {
  const body = await c.req.json().catch(() => null)
  if (!body || !body.email || !body.password || !body.name) {
    return c.json({ error: 'Nama, email, dan password wajib diisi' }, 400)
  }

  const email = body.email.trim().toLowerCase()
  const name = body.name.trim()
  const password = body.password

  if (password.length < 6) {
    return c.json({ error: 'Password minimal 6 karakter' }, 400)
  }

  // Check if existing
  const existing = await c.env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(email).first()
  if (existing) {
    return c.json({ error: 'Email sudah terdaftar' }, 400)
  }

  const userId = generateId()
  const passwordHash = await hashPassword(password)
  const now = new Date().toISOString()

  await c.env.DB.prepare(
    'INSERT INTO users (id, name, email, password_hash, created_at) VALUES (?, ?, ?, ?, ?)'
  ).bind(userId, name, email, passwordHash, now).run()

  const safeUser = { id: userId, name, email, avatar: null, created_at: now }
  const secret = c.env.JWT_SECRET || 'financeflow-super-secret-jwt-key-change-in-prod'
  const token = await sign(
    {
      sub: userId,
      email,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30, // 30 days
    },
    secret
  )

  return c.json({ user: safeUser, token }, 201)
})

// Login
authRouter.post('/login', async (c) => {
  const body = await c.req.json().catch(() => null)
  if (!body || !body.email || !body.password) {
    return c.json({ error: 'Email dan password wajib diisi' }, 400)
  }

  const email = body.email.trim().toLowerCase()
  const password = body.password

  const user = await c.env.DB.prepare(
    'SELECT * FROM users WHERE email = ?'
  ).bind(email).first<User>()

  if (!user) {
    return c.json({ error: 'Email atau password salah' }, 401)
  }

  const isValid = await verifyPassword(password, user.password_hash)
  if (!isValid) {
    return c.json({ error: 'Email atau password salah' }, 401)
  }

  const safeUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    created_at: user.created_at,
  }

  const secret = c.env.JWT_SECRET || 'financeflow-super-secret-jwt-key-change-in-prod'
  const token = await sign(
    {
      sub: user.id,
      email: user.email,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30, // 30 days
    },
    secret
  )

  return c.json({ user: safeUser, token })
})

// Current authenticated user info
authRouter.get('/me', authMiddleware, async (c) => {
  const userId = c.get('userId')
  const user = await c.env.DB.prepare(
    'SELECT id, name, email, avatar, created_at FROM users WHERE id = ?'
  ).bind(userId).first()

  if (!user) {
    return c.json({ error: 'Pengguna tidak ditemukan' }, 404)
  }

  return c.json({ user })
})

// Update profile (name, avatar)
authRouter.put('/profile', authMiddleware, async (c) => {
  const userId = c.get('userId')
  const body = await c.req.json().catch(() => null)
  if (!body) return c.json({ error: 'Body tidak valid' }, 400)

  const name = body.name?.trim()
  const avatar = body.avatar || null

  if (!name) {
    return c.json({ error: 'Nama wajib diisi' }, 400)
  }

  await c.env.DB.prepare(
    'UPDATE users SET name = ?, avatar = ? WHERE id = ?'
  ).bind(name, avatar, userId).run()

  const updated = await c.env.DB.prepare(
    'SELECT id, name, email, avatar, created_at FROM users WHERE id = ?'
  ).bind(userId).first()

  return c.json({ user: updated })
})

// Change password
authRouter.put('/password', authMiddleware, async (c) => {
  const userId = c.get('userId')
  const body = await c.req.json().catch(() => null)
  if (!body || !body.currentPassword || !body.newPassword) {
    return c.json({ error: 'Password saat ini dan password baru wajib diisi' }, 400)
  }

  if (body.newPassword.length < 6) {
    return c.json({ error: 'Password baru minimal 6 karakter' }, 400)
  }

  const user = await c.env.DB.prepare(
    'SELECT password_hash FROM users WHERE id = ?'
  ).bind(userId).first<{ password_hash: string }>()

  if (!user) {
    return c.json({ error: 'Pengguna tidak ditemukan' }, 404)
  }

  const isOldValid = await verifyPassword(body.currentPassword, user.password_hash)
  if (!isOldValid) {
    return c.json({ error: 'Password saat ini tidak cocok' }, 400)
  }

  const newHash = await hashPassword(body.newPassword)
  await c.env.DB.prepare(
    'UPDATE users SET password_hash = ? WHERE id = ?'
  ).bind(newHash, userId).run()

  return c.json({ success: true, message: 'Password berhasil diperbarui' })
})

// Request Password Reset OTP
authRouter.post('/forgot-password', async (c) => {
  const body = await c.req.json().catch(() => null)
  if (!body || !body.email) {
    return c.json({ error: 'Email wajib diisi' }, 400)
  }

  const email = body.email.trim().toLowerCase()

  // Check if user exists
  const user = await c.env.DB.prepare('SELECT id FROM users WHERE email = ?').bind(email).first()
  if (!user) {
    // For security and UX, inform that if the email is registered, OTP is sent
    return c.json({ error: 'Email tidak ditemukan dalam sistem' }, 404)
  }

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString()
  const resetId = generateId()
  const expiresAt = Date.now() + 15 * 60 * 1000 // 15 mins
  const now = new Date().toISOString()

  // Delete previous OTPs for this email and save new one
  await c.env.DB.batch([
    c.env.DB.prepare('DELETE FROM password_resets WHERE email = ?').bind(email),
    c.env.DB.prepare(
      'INSERT INTO password_resets (id, email, otp, expires_at, created_at) VALUES (?, ?, ?, ?, ?)'
    ).bind(resetId, email, otp, expiresAt, now),
  ])

  // Send OTP Email via Resend
  const emailRes = await sendOtpEmail({
    toEmail: email,
    otp,
    apiKey: c.env.RESEND_API_KEY,
    fromEmail: c.env.EMAIL_FROM,
  })

  return c.json({
    success: true,
    message: 'Kode verifikasi telah dikirim ke email Anda.',
    devOtp: emailRes.devOtp, // Only populated when RESEND_API_KEY is not configured yet
  })
})

// Verify OTP & Reset Password
authRouter.post('/reset-password', async (c) => {
  const body = await c.req.json().catch(() => null)
  if (!body || !body.email || !body.otp || !body.newPassword) {
    return c.json({ error: 'Email, kode OTP, dan password baru wajib diisi' }, 400)
  }

  const email = body.email.trim().toLowerCase()
  const otp = body.otp.trim()
  const newPassword = body.newPassword

  if (newPassword.length < 6) {
    return c.json({ error: 'Password baru minimal 6 karakter' }, 400)
  }

  const now = Date.now()
  const record = await c.env.DB.prepare(
    'SELECT * FROM password_resets WHERE email = ? AND otp = ? AND expires_at > ?'
  ).bind(email, otp, now).first<{ id: string }>()

  if (!record) {
    return c.json({ error: 'Kode OTP tidak valid atau telah kedaluwarsa' }, 400)
  }

  const passwordHash = await hashPassword(newPassword)

  await c.env.DB.batch([
    c.env.DB.prepare('UPDATE users SET password_hash = ? WHERE email = ?').bind(passwordHash, email),
    c.env.DB.prepare('DELETE FROM password_resets WHERE email = ?').bind(email),
  ])

  return c.json({ success: true, message: 'Password berhasil direset. Silakan login dengan password baru.' })
})
