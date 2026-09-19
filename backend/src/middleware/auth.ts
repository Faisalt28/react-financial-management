import { MiddlewareHandler } from 'hono'
import { verify } from 'hono/jwt'
import { Bindings, Variables } from '../types'

export const authMiddleware: MiddlewareHandler<{ Bindings: Bindings; Variables: Variables }> = async (c, next) => {
  const authHeader = c.req.header('Authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ error: 'Tidak terautentikasi, silakan login terlebih dahulu' }, 401)
  }

  const token = authHeader.substring(7)
  const secret = c.env.JWT_SECRET || 'financeflow-super-secret-jwt-key-change-in-prod'

  try {
    const payload = await verify(token, secret, 'HS256')
    if (!payload || !payload.sub) {
      return c.json({ error: 'Token tidak valid' }, 401)
    }
    c.set('userId', payload.sub as string)
    await next()
  } catch (err) {
    return c.json({ error: 'Sesi telah kedaluwarsa atau token tidak valid' }, 401)
  }
}
