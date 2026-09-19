import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { Bindings, Variables } from './types'
import { authRouter } from './routes/auth'
import { accountsRouter } from './routes/accounts'
import { transactionsRouter } from './routes/transactions'
import { budgetsRouter } from './routes/budgets'
import { goalsRouter } from './routes/goals'
import { settingsRouter } from './routes/settings'

const app = new Hono<{ Bindings: Bindings; Variables: Variables }>()

// Global CORS Middleware
app.use(
  '*',
  cors({
    origin: (origin) => {
      // Allow all localhost origins and pages.dev deployments
      if (!origin || origin.includes('localhost') || origin.includes('127.0.0.1') || origin.endsWith('.pages.dev')) {
        return origin || '*'
      }
      return '*'
    },
    allowHeaders: ['Content-Type', 'Authorization'],
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    exposeHeaders: ['Content-Length'],
    maxAge: 86400,
    credentials: true,
  })
)

// Health check
app.get('/', (c) => c.json({ status: 'ok', service: 'AcheeZ API', version: '1.0.0' }))
app.get('/health', (c) => c.json({ status: 'healthy', timestamp: new Date().toISOString() }))

// Mount Routers
app.route('/api/auth', authRouter)
app.route('/api/accounts', accountsRouter)
app.route('/api/transactions', transactionsRouter)
app.route('/api/budgets', budgetsRouter)
app.route('/api/goals', goalsRouter)
app.route('/api/settings', settingsRouter)

// 404 Not Found handler
app.notFound((c) => {
  return c.json({ error: 'Endpoint tidak ditemukan', path: c.req.path }, 404)
})

// Error handler
app.onError((err, c) => {
  console.error('API Error:', err)
  return c.json(
    {
      error: err.message || 'Internal Server Error',
    },
    500
  )
})

export default app
