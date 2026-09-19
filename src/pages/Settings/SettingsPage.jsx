import { useState, useRef } from 'react'
import { User, Mail, Lock, Trash2, Save, Eye, EyeOff, Camera, Upload, X, Check } from 'lucide-react'
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
        // Create canvas to crop & resize to max 256x256 square
        const canvas = document.createElement('canvas')
        const size = 256
        canvas.width = size
        canvas.height = size
        const ctx = canvas.getContext('2d')

        // Center crop math
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

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      {/* Profile */}
      <Card>
        <CardHeader><CardTitle>Profil Pengguna</CardTitle></CardHeader>

        {/* Avatar Section */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-5 mb-6 p-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/30">
          <div className="relative group self-start sm:self-center">
            <div className="w-20 h-20 rounded-2xl overflow-hidden flex items-center justify-center text-3xl font-bold flex-shrink-0 bg-zinc-900 text-white dark:bg-zinc-800 dark:text-zinc-100 shadow-sm border border-zinc-200 dark:border-zinc-700">
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
              className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-black text-white dark:bg-white dark:text-black shadow-md hover:scale-105 transition-all border-2 border-white dark:border-zinc-950"
            >
              <Camera size={14} />
            </button>
          </div>

          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex items-center gap-2">
              <p className="font-bold text-base text-zinc-900 dark:text-white truncate">{user?.name}</p>
              <Badge variant="outline" className="border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/30 text-[10px]">
                Akun Aktif
              </Badge>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">{user?.email}</p>

            {/* Photo Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-2">
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
                className="h-8 text-xs gap-1.5"
              >
                <Upload size={13} />
                <span>{photoLoading ? 'Memproses...' : 'Upload Foto'}</span>
              </Button>

              {user?.avatar && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  disabled={photoLoading}
                  className="h-8 px-2.5 rounded-md text-xs text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors flex items-center gap-1"
                >
                  <Trash2 size={13} />
                  <span>Hapus Foto</span>
                </button>
              )}

              {photoSaved && (
                <span className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
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
          />
          <Input
            label="Email Akun"
            value={profileForm.email}
            icon={<Mail size={15} />}
            id="settings-email"
            disabled
          />
          <Button type="submit" id="save-profile-btn" className="flex items-center gap-2">
            <Save size={15} />
            {profileSaved ? '✅ Tersimpan!' : 'Simpan Profil'}
          </Button>
        </form>
      </Card>

      {/* Change password */}
      <Card>
        <CardHeader><CardTitle>Ubah Password</CardTitle></CardHeader>
        <form onSubmit={savePassword} className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Password Saat Ini</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400 dark:text-zinc-500 pointer-events-none"><Lock size={15} /></span>
              <Input
                type={showPass ? 'text' : 'password'}
                value={passForm.current}
                onChange={e => setPassForm(f => ({ ...f, current: e.target.value }))}
                className="pl-9 pr-10"
                id="current-pass"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPass(s => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>
          <Input label="Password Baru" type="password" value={passForm.newPass}
            onChange={e => setPassForm(f => ({ ...f, newPass: e.target.value }))}
            icon={<Lock size={15} />} id="new-pass" placeholder="Min. 6 karakter" />
          <Input label="Konfirmasi Password Baru" type="password" value={passForm.confirm}
            onChange={e => setPassForm(f => ({ ...f, confirm: e.target.value }))}
            icon={<Lock size={15} />} id="confirm-pass" placeholder="Ulangi password baru" />
          {passError && <p className="text-xs text-rose-400 bg-rose-500/10 px-3 py-2 rounded-lg">{passError}</p>}
          <Button type="submit" id="save-pass-btn">
            {passSaved ? '✅ Password diubah!' : 'Ubah Password'}
          </Button>
        </form>
      </Card>

      {/* App info */}
      <Card>
        <CardHeader><CardTitle>Informasi Aplikasi</CardTitle></CardHeader>
        <div className="space-y-3 text-sm">
          {[
            { label: 'Aplikasi', value: 'AcheeZ Financial Management' },
            { label: 'Versi', value: '1.0.0' },
            { label: 'Penyimpanan Database', value: 'Cloudflare D1 (Global Edge DB)' },
            { label: 'Backend Worker', value: 'Cloudflare Workers (Hono)' },
            { label: 'Hosting Web', value: 'Cloudflare Pages' },
          ].map(i => (
            <div key={i.label} className="flex justify-between py-2 border-b border-zinc-100 dark:border-zinc-800/60 last:border-0">
              <span className="text-zinc-500 dark:text-zinc-400">{i.label}</span>
              <span className="text-zinc-900 dark:text-zinc-200 font-medium">{i.value}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Danger zone */}
      <Card>
        <CardHeader><CardTitle className="text-rose-600 dark:text-rose-400">Zona Bahaya</CardTitle></CardHeader>
        <div className="space-y-3">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Menghapus semua data akan mengosongkan seluruh riwayat transaksi, rekening akun, batas anggaran, dan target tabungan Anda. Tindakan ini tidak dapat dibatalkan.
          </p>
          <Button variant="danger" onClick={() => setShowResetConfirm(true)} id="reset-data-btn">
            <Trash2 size={15} /> Reset Semua Data Saya
          </Button>
        </div>
      </Card>

      <ConfirmModal
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        onConfirm={handleReset}
        title="Reset Semua Data"
        message="⚠️ Semua data keuangan Anda akan dihapus permanen dari cloud database. Anda akan logout secara otomatis. Yakin?"
        confirmText="Ya, Reset Semua"
        loading={loading}
      />
    </div>
  )
}

