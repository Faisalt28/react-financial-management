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
        className="fixed top-5 right-5 z-50 p-2.5 rounded-xl bg-white dark:bg-zinc-900 border-2 border-zinc-950 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-purple-50 dark:hover:bg-purple-950 shadow-[2px_2px_0px_0px_#9333ea] transition-all"
        aria-label="Toggle theme"
      >
        {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
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
              {step === 3 ? 'Password Berhasil Direset' : 'Lupa Password'}
            </h1>
            <p className="text-center text-sm text-zinc-500 dark:text-zinc-400 font-medium">
              {step === 1 && 'Masukkan email Anda untuk menerima kode OTP'}
              {step === 2 && `Masukkan kode OTP yang dikirim ke ${email}`}
              {step === 3 && 'Kata sandi Anda telah diperbarui, silakan masuk kembali'}
            </p>
          </div>

          {/* Dev Mode Notification if active */}
          {devOtpInfo && step === 2 && (
            <div className="mb-4 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-300 text-xs shadow-[2px_2px_0px_0px_#f59e0b]">
              <span className="font-bold">Kode OTP Simulasi:</span> <strong>{devOtpInfo}</strong> (Gunakan kode ini untuk reset).
            </div>
          )}

          {/* Step 1: Request OTP */}
          {step === 1 && (
            <form onSubmit={handleRequestOtp} className="flex flex-col gap-4">
              <div className="relative">
                <Input
                  type="email"
                  placeholder="email@contoh.com"
                  autoComplete="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  id="forgot-email"
                  required
                />
              </div>

              {error && (
                <p className="text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border-2 border-rose-200 dark:border-rose-900/50 px-3 py-2.5 rounded-xl font-medium">
                  {error}
                </p>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 text-sm font-black uppercase tracking-wider rounded-xl bg-purple-600 text-white hover:bg-purple-700 border-2 border-zinc-950 dark:border-zinc-700 shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff] transition-colors mt-2"
                id="request-otp-btn"
              >
                {loading ? 'Mengirim Kode...' : 'Kirim Kode OTP'}
              </Button>

              <div className="text-center pt-2">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-1.5 text-sm font-bold text-zinc-700 dark:text-zinc-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
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
                  className="tracking-widest font-black text-center"
                  maxLength={6}
                  value={otp}
                  onChange={e => setOtp(e.target.value)}
                  id="reset-otp"
                  required
                />
              </div>

              {/* New Password */}
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password Baru (min. 6 karakter)"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  id="reset-new-password"
                  required
                />
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
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  id="reset-confirm-password"
                  required
                />
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
                <p className="text-xs text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 border-2 border-rose-200 dark:border-rose-900/50 px-3 py-2.5 rounded-xl font-medium">
                  {error}
                </p>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 text-sm font-black uppercase tracking-wider rounded-xl bg-purple-600 text-white hover:bg-purple-700 border-2 border-zinc-950 dark:border-zinc-700 shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff] transition-colors mt-2"
                id="reset-submit-btn"
              >
                {loading ? 'Menyimpan Password...' : 'Reset Password'}
              </Button>

              <div className="flex justify-between items-center text-xs font-bold text-zinc-500 pt-2">
                <button
                  type="button"
                  onClick={() => { setStep(1); setError(''); }}
                  className="hover:underline text-purple-600 dark:text-purple-400"
                >
                  Ubah Email
                </button>
                <button
                  type="button"
                  onClick={handleRequestOtp}
                  className="hover:underline text-purple-600 dark:text-purple-400"
                >
                  Kirim Ulang Kode OTP
                </button>
              </div>
            </form>
          )}

          {/* Step 3: Success */}
          {step === 3 && (
            <div className="flex flex-col items-center text-center gap-4 py-4">
              <div className="size-16 rounded-2xl bg-emerald-100 dark:bg-emerald-950/50 border-2 border-zinc-950 dark:border-zinc-800 shadow-[4px_4px_0px_0px_#10b981] flex items-center justify-center text-emerald-600 mb-2">
                <CheckCircle2 className="size-8" />
              </div>
              <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                Password akun Anda telah berhasil diperbarui. Silakan login menggunakan password baru Anda.
              </p>
              <Button
                onClick={() => navigate('/login')}
                className="w-full h-11 text-sm font-black uppercase tracking-wider rounded-xl bg-purple-600 text-white hover:bg-purple-700 border-2 border-zinc-950 dark:border-zinc-700 shadow-[4px_4px_0px_0px_#000] dark:shadow-[4px_4px_0px_0px_#fff] transition-colors mt-2"
                id="back-to-login-btn"
              >
                Masuk Sekarang
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
