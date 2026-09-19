import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { EyeIcon, EyeOffIcon, Mail, Lock, KeyRound, ArrowLeft, Sun, Moon, CheckCircle2 } from 'lucide-react'
import { useThemeStore } from '@/store/themeStore.js'
import { Button, Card, Input } from '@/components/ui'
import { api } from '@/lib/api'
import logo from '@/assets/logo.png'

export function ForgotPasswordPage() {
  const [step, setStep] = useState(1) // 1: request OTP, 2: verify & reset, 3: success
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [devOtpInfo, setDevOtpInfo] = useState('')
  const { isDark, toggle } = useThemeStore()
  const navigate = useNavigate()

  // Step 1: Send OTP
  const handleRequestOtp = async (e) => {
    e.preventDefault()
    if (!email) {
      setError('Masukkan email Anda')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await api.auth.forgotPassword(email)
      if (res.devOtp) {
        setDevOtpInfo(res.devOtp)
      }
      setStep(2)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Step 2: Verify OTP and set new password
  const handleResetPassword = async (e) => {
    e.preventDefault()
    if (!otp) {
      setError('Masukkan kode OTP 6-digit')
      return
    }
    if (newPassword.length < 6) {
      setError('Password baru minimal 6 karakter')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('Konfirmasi password tidak cocok')
      return
    }

    setLoading(true)
    setError('')
    try {
      await api.auth.resetPassword(email, otp, newPassword)
      setStep(3)
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
        className="fixed top-5 right-5 z-50 p-2.5 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-all shadow-xs"
        aria-label="Toggle theme"
      >
        {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
      </button>

      {/* Subtle background ambient blur */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-zinc-100 dark:bg-zinc-900/60 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-zinc-100 dark:bg-zinc-900/60 blur-3xl" />
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
              {step === 3 ? 'Password Berhasil Direset' : 'Lupa Password'}
            </h1>
            <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
              {step === 1 && 'Masukkan email Anda untuk menerima kode OTP'}
              {step === 2 && `Masukkan kode OTP yang dikirim ke ${email}`}
              {step === 3 && 'Kata sandi Anda telah diperbarui, silakan masuk kembali'}
            </p>
          </div>

          {/* Dev Mode Notification if active */}
          {devOtpInfo && step === 2 && (
            <div className="mb-4 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 text-amber-800 dark:text-amber-300 text-xs">
              <span className="font-semibold">Kode OTP Simulasi:</span> <strong>{devOtpInfo}</strong> (Gunakan kode ini untuk reset).
            </div>
          )}

          {/* Step 1: Request OTP */}
          {step === 1 && (
            <form onSubmit={handleRequestOtp} className="flex flex-col gap-4">
              <div className="relative">
                <Input
                  type="email"
                  placeholder="email@contoh.com"
                  className="bg-zinc-50/50 dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800 ps-10 h-11 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-100"
                  autoComplete="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  id="forgot-email"
                  required
                />
                <Mail className="text-zinc-400 dark:text-zinc-500 absolute start-3 top-1/2 size-4 -translate-y-1/2 pointer-events-none" />
              </div>

              {error && (
                <p className="text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 px-3 py-2.5 rounded-lg">
                  {error}
                </p>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 text-sm font-semibold rounded-lg bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 transition-colors mt-2"
                id="request-otp-btn"
              >
                {loading ? 'Mengirim Kode...' : 'Kirim Kode OTP'}
              </Button>

              <div className="text-center pt-2">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
                >
                  <ArrowLeft className="size-4" /> Kembali ke Halaman Masuk
                </Link>
              </div>
            </form>
          )}

          {/* Step 2: Verify OTP & Set New Password */}
          {step === 2 && (
            <form onSubmit={handleResetPassword} className="flex flex-col gap-4">
              {/* OTP Input */}
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Kode OTP 6-Digit"
                  className="bg-zinc-50/50 dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800 ps-10 h-11 text-sm tracking-widest font-semibold text-zinc-900 dark:text-zinc-100 placeholder:tracking-normal placeholder:font-normal placeholder:text-zinc-400 focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-100"
                  maxLength={6}
                  value={otp}
                  onChange={e => setOtp(e.target.value)}
                  id="reset-otp"
                  required
                />
                <KeyRound className="text-zinc-400 dark:text-zinc-500 absolute start-3 top-1/2 size-4 -translate-y-1/2 pointer-events-none" />
              </div>

              {/* New Password */}
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password Baru (min. 6 karakter)"
                  className="bg-zinc-50/50 dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800 ps-10 pe-10 h-11 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-100"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  id="reset-new-password"
                  required
                />
                <Lock className="text-zinc-400 dark:text-zinc-500 absolute start-3 top-1/2 size-4 -translate-y-1/2 pointer-events-none" />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute end-0 top-0 h-full w-10 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-transparent"
                  onClick={() => setShowPassword(p => !p)}
                  id="toggle-new-password"
                >
                  {showPassword ? <EyeIcon className="size-4" /> : <EyeOffIcon className="size-4" />}
                </Button>
              </div>

              {/* Confirm Password */}
              <div className="relative">
                <Input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Ulangi Password Baru"
                  className="bg-zinc-50/50 dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800 ps-10 pe-10 h-11 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus-visible:ring-zinc-900 dark:focus-visible:ring-zinc-100"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  id="reset-confirm-password"
                  required
                />
                <Lock className="text-zinc-400 dark:text-zinc-500 absolute start-3 top-1/2 size-4 -translate-y-1/2 pointer-events-none" />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute end-0 top-0 h-full w-10 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-transparent"
                  onClick={() => setShowConfirmPassword(p => !p)}
                  id="toggle-confirm-password"
                >
                  {showConfirmPassword ? <EyeIcon className="size-4" /> : <EyeOffIcon className="size-4" />}
                </Button>
              </div>

              {error && (
                <p className="text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 px-3 py-2.5 rounded-lg">
                  {error}
                </p>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 text-sm font-semibold rounded-lg bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 transition-colors mt-2"
                id="reset-submit-btn"
              >
                {loading ? 'Menyimpan Password...' : 'Reset Password'}
              </Button>

              <div className="flex justify-between items-center text-xs text-zinc-500 pt-2">
                <button
                  type="button"
                  onClick={() => { setStep(1); setError(''); }}
                  className="hover:underline text-zinc-700 dark:text-zinc-300"
                >
                  Ubah Email
                </button>
                <button
                  type="button"
                  onClick={handleRequestOtp}
                  className="hover:underline text-zinc-700 dark:text-zinc-300"
                >
                  Kirim Ulang Kode OTP
                </button>
              </div>
            </form>
          )}

          {/* Step 3: Success */}
          {step === 3 && (
            <div className="flex flex-col items-center text-center gap-4 py-4">
              <div className="size-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 mb-2">
                <CheckCircle2 className="size-8" />
              </div>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Password akun Anda telah berhasil diperbarui. Silakan login menggunakan password baru Anda.
              </p>
              <Button
                onClick={() => navigate('/login')}
                className="w-full h-11 text-sm font-semibold rounded-lg bg-black text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 transition-colors mt-2"
                id="back-to-login-btn"
              >
                Masuk Sekarang
              </Button>
            </div>
          )}
        </Card>
      </div>
    </section>
  )
}
