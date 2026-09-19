import { useState } from 'react'
import { User, Mail, Lock, Trash2, Save, Eye, EyeOff, Plus, Edit2 } from 'lucide-react'
import { useAuthStore } from '../../store/authStore.js'
import { Card, CardHeader, CardTitle, Button, Input, Modal, ConfirmModal, Badge } from '@/components/ui'
import { CATEGORIES, ACCOUNT_COLORS } from '../../lib/constants.js'
import { api } from '@/lib/api'
import { useNavigate } from 'react-router-dom'

export function SettingsPage() {
  const { user, updateProfile, logout } = useAuthStore()
  const navigate = useNavigate()
  const [profileForm, setProfileForm] = useState({ name: user?.name || '', email: user?.email || '' })
  const [passForm, setPassForm] = useState({ current: '', newPass: '', confirm: '' })
  const [showPass, setShowPass] = useState(false)
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [profileSaved, setProfileSaved] = useState(false)
  const [passSaved, setPassSaved] = useState(false)
  const [passError, setPassError] = useState('')
  const [loading, setLoading] = useState(false)

  const saveProfile = async (e) => {
    e.preventDefault()
    await updateProfile({ name: profileForm.name })
    setProfileSaved(true)
    setTimeout(() => setProfileSaved(false), 2000)
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

  const avatarColors = ['#4f46e5', '#7c3aed', '#0891b2', '#059669', '#d97706', '#dc2626']

  return (
    <div className="max-w-2xl mx-auto space-y-5 animate-fade-in">
      {/* Profile */}
      <Card>
        <CardHeader><CardTitle>Profil Pengguna</CardTitle></CardHeader>

        {/* Avatar */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)' }}>
            {user?.name?.charAt(0)?.toUpperCase()}
          </div>
          <div>
            <p className="font-semibold text-white">{user?.name}</p>
            <p className="text-sm text-slate-500">{user?.email}</p>
            <Badge variant="default" className="mt-1">Pengguna Lokal</Badge>
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
            label="Email"
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
            { label: 'Versi', value: '1.0.0' },
            { label: 'Penyimpanan', value: 'IndexedDB (Lokal)' },
            { label: 'Framework', value: 'React 19 + Vite' },
            { label: 'Styling', value: 'Tailwind CSS v4' },
          ].map(i => (
            <div key={i.label} className="flex justify-between py-2 border-b border-white/5">
              <span className="text-slate-500">{i.label}</span>
              <span className="text-slate-300 font-medium">{i.value}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Danger zone */}
      <Card>
        <CardHeader><CardTitle className="text-rose-400/70">Zona Bahaya</CardTitle></CardHeader>
        <div className="space-y-3">
          <p className="text-sm text-slate-500">Menghapus semua data akan menghapus seluruh transaksi, akun, anggaran, dan tujuan keuangan Anda. Tindakan ini tidak dapat dibatalkan.</p>
          <Button variant="danger" onClick={() => setShowResetConfirm(true)} id="reset-data-btn">
            <Trash2 size={15} /> Hapus Semua Data
          </Button>
        </div>
      </Card>

      <ConfirmModal
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        onConfirm={handleReset}
        title="Hapus Semua Data"
        message="⚠️ Semua data keuangan Anda akan dihapus permanen. Anda akan keluar dan perlu daftar ulang. Yakin?"
        confirmText="Ya, Hapus Semua"
        loading={loading}
      />
    </div>
  )
}
