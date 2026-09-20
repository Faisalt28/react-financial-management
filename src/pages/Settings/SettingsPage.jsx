import { useState, useRef } from 'react'
import { User, Mail, Lock, Trash2, Save, Eye, EyeOff, Camera, Upload, Check, LogOut, AlertTriangle, ShieldCheck } from 'lucide-react'
import { useAuthStore } from '../../store/authStore.js'
import { Card, CardHeader, CardTitle, Button, Input, Modal, ConfirmModal, Badge } from '@/components/ui'
import { api } from '@/lib/api'
import { useNavigate } from 'react-router-dom'

export function SettingsPage() {
  const { user, updateProfile, logout } = useAuthStore()
  const navigate = useNavigate()
  const fileInputRef = useRef(null)

  const [profileForm, setProfileForm] = useState({ name: user?.name || '', email: user?.email || '' })
  const [passForm, setPassForm] = useState({ current: '', newPass: '', confirm: '' })
  const [showPass, setShowPass] = useState(false)
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [profileSaved, setProfileSaved] = useState(false)
  const [photoSaved, setPhotoSaved] = useState(false)
  const [photoLoading, setPhotoLoading] = useState(false)
  const [passSaved, setPassSaved] = useState(false)
  const [passError, setPassError] = useState('')
  const [loading, setLoading] = useState(false)

  const saveProfile = async (e) => {
    e.preventDefault()
    await updateProfile({ name: profileForm.name, avatar: user?.avatar })
    setProfileSaved(true)
    setTimeout(() => setProfileSaved(false), 2000)
  }

  // Handle Photo File Upload with client-side canvas compression
  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      alert('Pilih file gambar (JPG, PNG, atau WebP)')
      return
    }

    setPhotoLoading(true)
    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.onload = async () => {
        const canvas = document.createElement('canvas')
        const size = 256
        canvas.width = size
        canvas.height = size
        const ctx = canvas.getContext('2d')

        const minDim = Math.min(img.width, img.height)
        const sx = (img.width - minDim) / 2
        const sy = (img.height - minDim) / 2

        ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, size, size)
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85)

        try {
          await updateProfile({ name: profileForm.name || user?.name, avatar: dataUrl })
          setPhotoSaved(true)
          setTimeout(() => setPhotoSaved(false), 2500)
        } catch (err) {
          alert(err.message || 'Gagal menyimpan foto profil')
        } finally {
          setPhotoLoading(false)
          if (fileInputRef.current) fileInputRef.current.value = ''
        }
      }
      img.src = event.target?.result
    }
    reader.readAsDataURL(file)
  }

  const handleRemovePhoto = async () => {
    setPhotoLoading(true)
    try {
      await updateProfile({ name: profileForm.name || user?.name, avatar: null })
      setPhotoSaved(true)
      setTimeout(() => setPhotoSaved(false), 2000)
    } catch (err) {
      alert(err.message || 'Gagal menghapus foto profil')
    } finally {
      setPhotoLoading(false)
    }
  }

  const savePassword = async (e) => {
    e.preventDefault()
    setPassError('')
    if (passForm.newPass.length < 6) { setPassError('Password baru minimal 6 karakter'); return }
    if (passForm.newPass !== passForm.confirm) { setPassError('Konfirmasi password tidak cocok'); return }
    try {
      await api.auth.updatePassword(passForm.current, passForm.newPass)
      setPassForm({ current: '', newPass: '', confirm: '' })
      setPassSaved(true)
      setTimeout(() => setPassSaved(false), 2000)
    } catch (err) {
      setPassError(err.message)
    }
  }

  const handleReset = async () => {
    setLoading(true)
    try {
      await api.settings.resetData()
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
    setShowResetConfirm(false)
    logout()
    navigate('/login')
  }

  const handleLogout = () => {
    setShowLogoutConfirm(false)
    logout()
    navigate('/login')
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in pb-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 dark:text-white uppercase">
          Pengaturan & Profil
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 font-medium">
          Kelola informasi akun, foto profil, keamanan sandi, dan preferensi data Anda.
        </p>
      </div>

      {/* 1. Profil Pengguna */}
      <Card>
        <CardHeader>
          <CardTitle>Profil Pengguna</CardTitle>
        </CardHeader>
        <div className="p-6 pt-0 space-y-6">
          {/* Avatar Section */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-5 p-4 rounded-xl border-2 border-zinc-950 dark:border-zinc-800 bg-purple-50/40 dark:bg-purple-950/20 shadow-[2px_2px_0px_0px_#9333ea]">
            <div className="relative group flex-shrink-0">
              <div className="w-20 h-20 rounded-2xl overflow-hidden flex items-center justify-center text-3xl font-black flex-shrink-0 bg-purple-600 text-white dark:bg-purple-600 dark:text-white shadow-sm border-2 border-zinc-950 dark:border-zinc-700">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  user?.name?.charAt(0)?.toUpperCase() || 'U'
                )}
              </div>

              {/* Quick camera badge button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title="Ganti Foto Profil"
                className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-purple-600 text-white shadow-md hover:scale-105 transition-all border-2 border-zinc-950 cursor-pointer"
              >
                <Camera size={14} />
              </button>
            </div>

            <div className="flex-1 min-w-0 text-center sm:text-left space-y-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <p className="font-black text-base text-zinc-900 dark:text-white uppercase truncate">{user?.name}</p>
                <Badge variant="success" className="text-[10px]">
                  Akun Aktif
                </Badge>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium truncate">{user?.email}</p>

              {/* Photo Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={handlePhotoSelect}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={photoLoading}
                  className="h-8 text-xs gap-1.5 border-2 border-zinc-950 dark:border-zinc-700 font-bold shadow-[2px_2px_0px_0px_#000]"
                >
                  <Upload size={13} />
                  <span>{photoLoading ? 'Memproses...' : 'Upload Foto'}</span>
                </Button>

                {user?.avatar && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    disabled={photoLoading}
                    className="h-8 px-2.5 rounded-lg border-2 border-zinc-950 dark:border-zinc-700 text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 shadow-[1px_1px_0px_0px_#000] transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 size={13} />
                    <span>Hapus Foto</span>
                  </button>
                )}

                {photoSaved && (
                  <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                    <Check size={14} /> Foto disimpan!
                  </span>
                )}
              </div>
            </div>
          </div>

          <form onSubmit={saveProfile} className="space-y-4">
            <Input
              label="Nama Lengkap"
              value={profileForm.name}
              onChange={e => setProfileForm(f => ({ ...f, name: e.target.value }))}
              icon={<User size={15} />}
              id="settings-name"
              required
            />
            <div>
              <Input
                label="Email Akun"
                value={profileForm.email}
                icon={<Mail size={15} />}
                id="settings-email"
                disabled
              />
              <span className="text-[11px] text-zinc-400 font-medium mt-1 block">
                Email terdaftar digunakan sebagai identitas akun dan tidak dapat diganti secara langsung.
              </span>
            </div>
            <div className="pt-1">
              <Button type="submit" id="save-profile-btn" className="flex items-center gap-2 bg-purple-600 text-white hover:bg-purple-700 border-2 border-zinc-950 dark:border-zinc-700 font-bold shadow-[2px_2px_0px_0px_#000]">
                <Save size={15} />
                {profileSaved ? '✅ Tersimpan!' : 'Simpan Profil'}
              </Button>
            </div>
          </form>
        </div>
      </Card>

      {/* 2. Ubah Password */}
      <Card>
        <CardHeader>
          <CardTitle>Ubah Password</CardTitle>
        </CardHeader>
        <div className="p-6 pt-0">
          <form onSubmit={savePassword} className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">Password Saat Ini</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 pointer-events-none"><Lock size={15} /></span>
                <Input
                  type={showPass ? 'text' : 'password'}
                  value={passForm.current}
                  onChange={e => setPassForm(f => ({ ...f, current: e.target.value }))}
                  className="pl-9 pr-10"
                  id="current-pass"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(s => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
                >
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
            <Input label="Password Baru" type="password" value={passForm.newPass}
              onChange={e => setPassForm(f => ({ ...f, newPass: e.target.value }))}
              icon={<Lock size={15} />} id="new-pass" placeholder="Min. 6 karakter" required />
            <Input label="Konfirmasi Password Baru" type="password" value={passForm.confirm}
              onChange={e => setPassForm(f => ({ ...f, confirm: e.target.value }))}
              icon={<Lock size={15} />} id="confirm-pass" placeholder="Ulangi password baru" required />
            {passError && <p className="text-xs text-rose-500 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 px-3 py-2 rounded-xl font-medium">{passError}</p>}
            <div className="pt-1">
              <Button type="submit" id="save-pass-btn" className="bg-purple-600 text-white hover:bg-purple-700 border-2 border-zinc-950 dark:border-zinc-700 font-bold shadow-[2px_2px_0px_0px_#000]">
                {passSaved ? '✅ Password diubah!' : 'Ubah Password'}
              </Button>
            </div>
          </form>
        </div>
      </Card>

      {/* 3. Informasi Aplikasi */}
      <Card>
        <CardHeader>
          <CardTitle>Informasi Aplikasi</CardTitle>
        </CardHeader>
        <div className="p-6 pt-0">
          <div className="divide-y-2 divide-zinc-100 dark:divide-zinc-900 text-xs sm:text-sm">
            {[
              { label: 'Nama Aplikasi', value: 'AcheeZ Financial Management' },
              { label: 'Versi Rilis', value: '1.0.0' },
              { label: 'Penyimpanan Database', value: 'Cloudflare D1 (Global Edge DB)' },
              { label: 'Backend Worker', value: 'Cloudflare Workers (Hono)' },
              { label: 'Hosting Web', value: 'Cloudflare Pages' },
            ].map(i => (
              <div key={i.label} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
                <span className="text-zinc-500 dark:text-zinc-400 font-medium">{i.label}</span>
                <span className="text-zinc-900 dark:text-zinc-200 font-bold text-right">{i.value}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* 4. Zona Bahaya (Reset Semua Data) */}
      <Card className="border-2 border-rose-600/60 dark:border-rose-500/60 shadow-[4px_4px_0px_0px_#f43f5e]">
        <CardHeader>
          <CardTitle className="text-rose-600 dark:text-rose-400 flex items-center gap-2">
            <AlertTriangle size={18} />
            <span>Zona Bahaya</span>
          </CardTitle>
        </CardHeader>
        <div className="p-6 pt-0 space-y-4">
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium">
            Fitur ini akan mengosongkan seluruh riwayat mutasi transaksi, daftar rekening akun & dompet, batas anggaran bulanan, serta target tabungan Anda dari database. Tindakan ini permanen dan tidak dapat dibatalkan.
          </p>
          <Button
            variant="danger"
            onClick={() => setShowResetConfirm(true)}
            id="reset-data-btn"
            className="w-full sm:w-auto border-2 border-zinc-950 dark:border-zinc-700 bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-[2px_2px_0px_0px_#000] gap-2"
          >
            <Trash2 size={15} />
            <span>Reset Semua Data Saya</span>
          </Button>
        </div>
      </Card>

      {/* 5. Keluar Akun (Paling Bawah) */}
      <div className="p-5 rounded-2xl border-2 border-zinc-950 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-[4px_4px_0px_0px_#9333ea] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-0.5">
          <h3 className="text-base font-black text-zinc-900 dark:text-white uppercase tracking-tight flex items-center gap-2">
            <LogOut size={18} className="text-rose-600 dark:text-rose-400" />
            <span>Keluar Akun</span>
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
            Selesaikan sesi masuk Anda di perangkat ini. Anda dapat masuk kembali kapan saja.
          </p>
        </div>
        <Button
          type="button"
          onClick={() => setShowLogoutConfirm(true)}
          id="profile-logout-btn"
          className="bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/50 border-2 border-zinc-950 dark:border-zinc-700 font-bold shadow-[2px_2px_0px_0px_#000] gap-2 w-full sm:w-auto"
        >
          <LogOut size={16} />
          <span>Keluar Akun</span>
        </Button>
      </div>

      {/* =========================================================
          POP UP RESET SEMUA DATA (DEAD CENTER ON PC & MOBILE)
          ========================================================= */}
      <Modal
        isOpen={showResetConfirm}
        onClose={() => { if (!loading) setShowResetConfirm(false) }}
        title="Reset Semua Data"
        size="sm"
        className="border-2 border-rose-600 dark:border-rose-500 shadow-[8px_8px_0px_0px_#f43f5e]"
      >
        <div className="flex flex-col items-center text-center py-2 space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-rose-100 dark:bg-rose-950/60 border-2 border-zinc-950 dark:border-zinc-700 text-rose-600 dark:text-rose-400 flex items-center justify-center shadow-[3px_3px_0px_0px_#f43f5e]">
            <AlertTriangle size={28} />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-base font-black text-zinc-900 dark:text-white uppercase tracking-tight">
              Hapus Semua Data Keuangan?
            </h3>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 font-medium leading-relaxed">
              ⚠️ Seluruh transaksi, rekening akun, batas anggaran, dan target tabungan Anda akan <strong>dihapus permanen</strong> dari cloud database. Anda akan otomatis logout setelah reset selesai.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2.5 w-full pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowResetConfirm(false)}
              disabled={loading}
              className="flex-1 order-2 sm:order-1 border-2 border-zinc-950 dark:border-zinc-700 font-bold"
              id="cancel-reset-btn"
            >
              Batal
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleReset}
              loading={loading}
              className="flex-1 order-1 sm:order-2 bg-rose-600 hover:bg-rose-700 text-white font-bold border-2 border-zinc-950 dark:border-zinc-700 shadow-[2px_2px_0px_0px_#000]"
              id="confirm-reset-btn"
            >
              Ya, Reset Semua
            </Button>
          </div>
        </div>
      </Modal>

      {/* =========================================================
          POP UP KONFIRMASI LOGOUT
          ========================================================= */}
      <ConfirmModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
        title="Keluar dari Akun"
        message="Apakah Anda yakin ingin mengakhiri sesi masuk pada akun ini?"
        confirmText="Ya, Keluar"
      />
    </div>
  )
}

