import { useEffect, useState } from 'react'
import { Plus, Trash2, Target, CheckCircle2, Clock } from 'lucide-react'
import { useGoalStore } from '../../store/goalStore.js'
import { Modal, ConfirmModal, Button, Input, Textarea, ProgressBar, Badge, EmptyState } from '@/components/ui'
import { formatCurrency, formatCompact } from '../../lib/constants.js'
import { calcProgress, formatDate, estimateMonthsToGoal } from '../../lib/utils.js'

const goalEmojis = ['🏠', '🚗', '✈️', '💻', '📱', '👨‍🎓', '💍', '🏖️', '💰', '🎯']

export function GoalsPage() {
  const { goals, fetchGoals, addGoal, addContribution, updateGoal, deleteGoal } = useGoalStore()
  const [showAddModal, setShowAddModal] = useState(false)
  const [showContrib, setShowContrib] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [contribAmount, setContribAmount] = useState('')
  const [form, setForm] = useState({ name: '', targetAmount: '', deadline: '', description: '', emoji: '🎯', monthlyContrib: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { fetchGoals() }, [])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleAdd = async (e) => {
    e.preventDefault()
    if (!form.name || !form.targetAmount || Number(form.targetAmount) <= 0) {
      setError('Nama dan target nominal harus diisi')
      return
    }
    setLoading(true)
    try {
      await addGoal({
        name: form.name,
        targetAmount: Number(form.targetAmount),
        deadline: form.deadline || null,
        description: form.description,
        emoji: form.emoji,
        monthlyContrib: Number(form.monthlyContrib) || 0,
      })
      setShowAddModal(false)
      setForm({ name: '', targetAmount: '', deadline: '', description: '', emoji: '🎯', monthlyContrib: '' })
      setError('')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleContrib = async () => {
    if (!contribAmount || Number(contribAmount) <= 0) return
    setLoading(true)
    await addContribution(showContrib.id, Number(contribAmount))
    setLoading(false)
    setShowContrib(null)
    setContribAmount('')
  }

  const active = goals.filter(g => g.status !== 'completed')
  const completed = goals.filter(g => g.status === 'completed')

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Aktif', value: active.length, color: '#6366f1', icon: '🎯' },
          { label: 'Selesai', value: completed.length, color: '#10b981', icon: '✅' },
          {
            label: 'Total Terkumpul',
            value: formatCompact(goals.reduce((s, g) => s + (g.currentAmount || 0), 0)),
            color: '#f59e0b', icon: '💰'
          },
        ].map(s => (
          <div key={s.label} className="glass-card p-4 text-center">
            <p className="text-2xl mb-1">{s.icon}</p>
            <p className="text-lg font-bold" style={{ color: s.color }}>{s.value}</p>
            <p className="text-xs text-slate-500">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center">
        <h2 className="text-base font-semibold text-slate-300">Tujuan Keuangan</h2>
        <Button size="sm" onClick={() => { setShowAddModal(true); setError('') }} id="add-goal-btn">
          <Plus size={16} /> Buat Tujuan
        </Button>
      </div>

      {goals.length === 0 ? (
        <EmptyState icon="🎯" title="Belum ada tujuan" description="Buat target keuangan untuk memotivasi tabungan Anda"
          action={<Button onClick={() => setShowAddModal(true)} id="empty-add-goal">Buat Tujuan Pertama</Button>} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goals.map(goal => {
            const pct = calcProgress(goal.currentAmount, goal.targetAmount)
            const remaining = Math.max(0, goal.targetAmount - (goal.currentAmount || 0))
            const months = estimateMonthsToGoal(remaining, goal.monthlyContrib)
            const isCompleted = goal.status === 'completed'

            return (
              <div key={goal.id} className="glass-card p-5 glass-card-hover relative overflow-hidden">
                {isCompleted && (
                  <div className="absolute top-3 right-3">
                    <Badge variant="success">✅ Selesai</Badge>
                  </div>
                )}

                <div className="flex items-start gap-3 mb-4">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
                    style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.2)' }}>
                    {goal.emoji || '🎯'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-semibold text-white truncate">{goal.name}</p>
                    {goal.description && <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{goal.description}</p>}
                    {goal.deadline && (
                      <div className="flex items-center gap-1 mt-1">
                        <Clock size={11} className="text-slate-600" />
                        <span className="text-xs text-slate-600">Target: {formatDate(goal.deadline)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Progress */}
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Terkumpul</span>
                    <span className="text-slate-300">
                      {formatCompact(goal.currentAmount || 0)} / {formatCompact(goal.targetAmount)}
                    </span>
                  </div>
                  <ProgressBar current={goal.currentAmount || 0} target={goal.targetAmount} showLabel={false}
                    color={isCompleted ? '#10b981' : '#6366f1'} />
                  <div className="flex justify-between text-xs">
                    <span style={{ color: isCompleted ? '#10b981' : '#818cf8' }}>{pct}% tercapai</span>
                    {!isCompleted && months && (
                      <span className="text-slate-600">~{months} bulan lagi</span>
                    )}
                  </div>
                </div>

                {!isCompleted && (
                  <p className="text-xs text-slate-600 mb-4">
                    Sisa: <span className="text-slate-400">{formatCurrency(remaining)}</span>
                  </p>
                )}

                <div className="flex gap-2">
                  {!isCompleted && (
                    <Button size="sm" variant="outline" onClick={() => { setShowContrib(goal); setContribAmount('') }}
                      className="flex-1" id={`contrib-${goal.id}`}>
                      + Setor Dana
                    </Button>
                  )}
                  <button onClick={() => setDeleteId(goal.id)} id={`del-goal-${goal.id}`}
                    className="p-2 rounded-lg text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Add goal modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Buat Tujuan Baru" size="md">
        <form onSubmit={handleAdd} className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-400">Ikon</label>
            <div className="flex flex-wrap gap-2">
              {goalEmojis.map(e => (
                <button key={e} type="button" onClick={() => set('emoji', e)}
                  className={`w-10 h-10 rounded-xl text-xl transition-all ${form.emoji === e ? 'ring-2 ring-brand-500 bg-brand-500/20' : 'hover:bg-white/5'}`}>
                  {e}
                </button>
              ))}
            </div>
          </div>
          <Input label="Nama Tujuan" placeholder="contoh: Beli Laptop" value={form.name} onChange={e => set('name', e.target.value)} id="goal-name" required />
          <Input label="Target Nominal (Rp)" type="number" placeholder="10000000" value={form.targetAmount}
            onChange={e => set('targetAmount', e.target.value)} id="goal-target" required />
          <Input label="Target Bulanan (Rp, opsional)" type="number" placeholder="500000" value={form.monthlyContrib}
            onChange={e => set('monthlyContrib', e.target.value)} id="goal-monthly" />
          <Input label="Batas Waktu (opsional)" type="date" value={form.deadline}
            onChange={e => set('deadline', e.target.value)} id="goal-deadline" />
          <Textarea label="Deskripsi (opsional)" placeholder="Ceritakan tujuan Anda..." value={form.description}
            onChange={e => set('description', e.target.value)} id="goal-desc" />
          {error && <p className="text-xs text-rose-400 bg-rose-500/10 px-3 py-2 rounded-lg">{error}</p>}
          <div className="flex gap-3">
            <Button type="button" variant="secondary" onClick={() => setShowAddModal(false)} className="flex-1" id="goal-cancel">Batal</Button>
            <Button type="submit" loading={loading} className="flex-1" id="goal-submit">Buat Tujuan</Button>
          </div>
        </form>
      </Modal>

      {/* Contribution modal */}
      <Modal isOpen={!!showContrib} onClose={() => setShowContrib(null)} title={`Setor ke "${showContrib?.name}"`} size="sm">
        <div className="space-y-4">
          <Input label="Jumlah Setoran (Rp)" type="number" placeholder="100000" value={contribAmount}
            onChange={e => setContribAmount(e.target.value)} id="contrib-amount" autoFocus />
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setShowContrib(null)} className="flex-1" id="contrib-cancel">Batal</Button>
            <Button onClick={handleContrib} loading={loading} className="flex-1" id="contrib-submit">Setor</Button>
          </div>
        </div>
      </Modal>

      <ConfirmModal isOpen={!!deleteId} onClose={() => setDeleteId(null)}
        onConfirm={async () => { await deleteGoal(deleteId); setDeleteId(null) }}
        title="Hapus Tujuan" message="Tujuan yang dihapus tidak dapat dikembalikan." />
    </div>
  )
}
