import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { EyeIcon, EyeOffIcon, Mail, Lock, Sun, Moon } from 'lucide-react'
import { useAuthStore } from '@/store/authStore.js'
import { useThemeStore } from '@/store/themeStore.js'
import { Button, Card, Input, Checkbox } from '@/components/ui'
import logo from '@/assets/logo.png'

export function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [remember, setRemember] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuthStore()
  const { isDark, toggle } = useThemeStore()
  const navigate = useNavigate()

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await login(form.email, form.password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="relative isolate flex min-h-dvh w-full items-center justify-center overflow-hidden bg-white dark:bg-black text-foreground transition-colors duration-200">
      {/* Theme toggle — top right */}
      <button
        onClick={toggle}
        id="auth-theme-toggle"
        className="absolute top-5 right-5 z-20 p-2.5 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-black dark:hover:text-white transition-colors shadow-xs"
        aria-label="Toggle theme"
      >
        {isDark ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      {/* Subtle monochrome ambient light */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-neutral-200/50 dark:bg-zinc-900/60 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-neutral-200/50 dark:bg-zinc-900/60 blur-3xl" />
      </div>

      <div className="relative z-10 container mx-auto flex min-h-dvh items-center justify-center px-4 py-12">
        <Card className="relative w-full max-w-md p-8 shadow-xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/90 rounded-2xl">
          {/* Header */}
          <div className="mb-8 flex flex-col items-center">
            <div className="my-2 flex justify-center">
              <img
                src={logo}
                alt="FinanceFlow Logo"
                className="w-20 h-20 object-contain drop-shadow-md"
              />
            </div>
            <h1 className="mt-2 mb-1 text-center text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
              Selamat Datang
            </h1>
            <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
              Masuk untuk melanjutkan ke FinanceFlow
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Email */}
            <div className="relative">
              <Input
                type="email"
                placeholder="email@contoh.com"
                className="bg-zinc-50/50 dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800 ps-10 h-11 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-100"
                autoComplete="email"
                value={form.email}
                onChange={e => set('email', e.target.value)}
                id="login-email"
                required
              />
              <Mail className="text-zinc-400 dark:text-zinc-500 absolute start-3 top-1/2 size-4 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Password */}
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                className="bg-zinc-50/50 dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800 ps-10 pe-10 h-11 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-100"
                autoComplete="current-password"
                value={form.password}
                onChange={e => set('password', e.target.value)}
                id="login-password"
                required
              />
              <Lock className="text-zinc-400 dark:text-zinc-500 absolute start-3 top-1/2 size-4 -translate-y-1/2 pointer-events-none" />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute end-0 top-0 h-full w-10 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-transparent"
                onClick={() => setShowPassword(p => !p)}
                id="toggle-password"
              >
                {showPassword
                  ? <EyeIcon className="size-4" />
                  : <EyeOffIcon className="size-4" />
                }
              </Button>
            </div>

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between pt-1 pb-1">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="remember-me"
                  checked={remember}
                  onCheckedChange={setRemember}
                  className="border-zinc-300 dark:border-zinc-700 data-[state=checked]:bg-black data-[state=checked]:text-white dark:data-[state=checked]:bg-white dark:data-[state=checked]:text-black"
                />
                <label htmlFor="remember-me" className="text-sm font-normal text-zinc-600 dark:text-zinc-400 cursor-pointer select-none">
                  Ingat saya
                </label>
              </div>
              <Link to="/forgot-password" className="text-sm font-medium text-zinc-900 dark:text-zinc-100 underline-offset-4 hover:underline" id="forgot-pass">
                Lupa password?
              </Link>
            </div>

            {/* Error */}
            {error && (
              <p className="text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 px-3 py-2.5 rounded-lg">
                {error}
              </p>
            )}

            {/* Sign In Button: Black in light mode, White in dark mode (monochrome) */}
            <Button
              type="submit"
              className="h-11 w-full cursor-pointer bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200 font-medium transition-all shadow-xs"
              disabled={loading}
              id="login-submit"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Memproses...
                </span>
              ) : 'Masuk'}
            </Button>
          </form>

          {/* Sign Up Link */}
          <p className="mt-8 flex justify-center gap-1.5 text-center text-sm text-zinc-500 dark:text-zinc-400">
            <span>Belum punya akun?</span>
            <Link to="/register" className="text-zinc-900 dark:text-white font-semibold underline underline-offset-4 hover:opacity-80" id="go-register">
              Daftar sekarang
            </Link>
          </p>
        </Card>
      </div>
    </section>
  )
}
