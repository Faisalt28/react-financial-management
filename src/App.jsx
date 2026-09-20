import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuthStore } from './store/authStore.js'
import { useThemeStore } from './store/themeStore.js'
import { AppLayout } from './components/layout/AppLayout.jsx'
import { LoginPage } from './pages/Auth/LoginPage.jsx'
import { RegisterPage } from './pages/Auth/RegisterPage.jsx'
import { ForgotPasswordPage } from './pages/Auth/ForgotPasswordPage.jsx'
import { DashboardPage } from './pages/Dashboard/DashboardPage.jsx'
import { TransactionsPage } from './pages/Transactions/TransactionsPage.jsx'
import { AccountsPage } from './pages/Accounts/AccountsPage.jsx'
import { BudgetPage } from './pages/Budget/BudgetPage.jsx'
import { GoalsPage } from './pages/Goals/GoalsPage.jsx'
import { ReportsPage } from './pages/Reports/ReportsPage.jsx'
import { SettingsPage } from './pages/Settings/SettingsPage.jsx'
import { LandingPage } from './pages/Landing/LandingPage.jsx'

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuthStore()
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return children
}

function PublicRoute({ children }) {
  const { isAuthenticated } = useAuthStore()
  if (isAuthenticated) return <Navigate to="/dashboard" replace />
  return children
}

export default function App() {
  const { init } = useThemeStore()

  useEffect(() => {
    init()
  }, [])

  return (
    <Routes>
      {/* Landing page */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/landing" element={<LandingPage />} />

      {/* Public routes */}
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
      <Route path="/forgot-password" element={<PublicRoute><ForgotPasswordPage /></PublicRoute>} />

      {/* Protected routes */}
      <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/transactions" element={<TransactionsPage />} />
        <Route path="/accounts" element={<AccountsPage />} />
        <Route path="/budget" element={<BudgetPage />} />
        <Route path="/goals" element={<GoalsPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
