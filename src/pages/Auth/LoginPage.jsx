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
        className="absolute top-5 right-5 z-20 p-2.5 rounded-xl border-2 border-zinc-950 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-purple-50 dark:hover:bg-purple-950 shadow-[2px_2px_0px_0px_#9333ea] transition-colors"
        aria-label="Toggle theme"
      >
        {isDark ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      <div className="relative z-10 container mx-auto flex min-h-dvh items-center justify-center px-4 py-12">
        <div className="relative w-full max-w-md p-8 bg-white dark:bg-zinc-950 border-2 border-zinc-950 dark:border-zinc-800 rounded-2xl shadow-[8px_8px_0px_0px_#9333ea]">
          {/* Header */}
          <div className="mb-8 flex flex-col items-center">
            <div className="my-2 flex justify-center p-2 rounded-2xl border-2 border-zinc-950 dark:border-zinc-800 bg-purple-50 dark:bg-purple-950/40 shadow-[3px_3px_0px_0px_#9333ea]">
              <img
                src={logo}
                alt="AcheeZ Logo"
                className="w-16 h-16 object-contain"
              />
            </div>
            <h1 className="mt-3 mb-1 text-center text-2xl font-black uppercase tracking-tight text-zinc-900 dark:text-white">
              Selamat Datang
            </h1>
            <p className="text-center text-sm text-zinc-500 dark:text-zinc-400 font-medium">
              Masuk untuk melanjutkan ke AcheeZ
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Email */}
            <div className="relative">
              <Input
                type="email"
                placeholder="email@contoh.com"
                autoComplete="email"
                value={form.email}
                onChange={e => set('email', e.target.value)}
                id="login-email"
                required
              />
            </div>

            {/* Password */}
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                autoComplete="current-password"
                value={form.password}
                onChange={e => set('password', e.target.value)}
                id="login-password"
                required
              />
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
                  className="border-2 border-zinc-950 dark:border-zinc-700 data-[state=checked]:bg-purple-600 data-[state=checked]:text-white"
                />
                <label htmlFor="remember-me" className="text-sm font-bold text-zinc-700 dark:text-zinc-300 cursor-pointer select-none">
                  Ingat saya
                </label>
              </div>
              <Link to="/forgot-password" className="text-sm font-bold text-purple-600 dark:text-purple-400 underline-offset-4 hover:underline" id="forgot-pass">
                Lupa password?
              </Link>
            </div>

            {/* Error */}
            {error && (
              <p className="text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border-2 border-rose-200 dark:border-rose-900/50 px-3 py-2.5 rounded-xl font-medium">
                {error}
              </p>
            )}

            {/* Sign In Button */}
            <Button
              type="submit"
              className="h-11 w-full cursor-pointer bg-purple-600 text-white hover:bg-purple-700 border-2 border-zinc-950 dark:border-zinc-700 font-black uppercase tracking-wider transition-all shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff] mt-1"
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
          <p className="mt-8 flex justify-center gap-1.5 text-center text-sm text-zinc-500 dark:text-zinc-400 font-medium">
            <span>Belum punya akun?</span>
            <Link to="/register" className="text-purple-600 dark:text-purple-400 font-bold underline underline-offset-4 hover:opacity-80" id="go-register">
              Daftar sekarang
            </Link>
          </p>
        </div>
      </div>
    </section>
  )
}
