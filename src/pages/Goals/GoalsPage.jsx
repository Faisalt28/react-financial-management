import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Trash2, Target, CheckCircle2, Clock, Wallet, AlertCircle, ArrowUpRight } from 'lucide-react'
import { useGoalStore } from '../../store/goalStore.js'
import { useAccountStore } from '../../store/accountStore.js'
import { Modal, ConfirmModal, Button, Input, Textarea, ProgressBar, Badge, EmptyState } from '@/components/ui'
import { formatCurrency, formatCompact } from '../../lib/constants.js'
import { calcProgress, formatDate, estimateMonthsToGoal, cn } from '../../lib/utils.js'

const goalEmojis = ['🏠', '🚗', '✈️', '💻', '📱', '👨‍🎓', '💍', '🏖️', '💰', '🎯']

export function GoalsPage() {
  const { goals, fetchGoals, addGoal, depositToGoal, deleteGoal } = useGoalStore()
  const { accounts, fetchAccounts } = useAccountStore()

  const [showAddModal, setShowAddModal] = useState(false)
  const [depositGoal, setDepositGoal] = useState(null)
  const [deleteId, setDeleteId] = useState(null)

  // Deposit Form State
  const [selectedAccountId, setSelectedAccountId] = useState('')
  const [depositAmount, setDepositAmount] = useState('')
  const [depositNote, setDepositNote] = useState('')
  const [depositLoading, setDepositLoading] = useState(false)
  const [depositError, setDepositError] = useState('')

  // Add Goal Form State
  const [form, setForm] = useState({ name: '', targetAmount: '', deadline: '', description: '', emoji: '🎯', monthlyContrib: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchGoals()
    fetchAccounts()
  }, [])

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
        icon: form.emoji,
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

  // Open Deposit Modal for a specific goal
  const openDepositModal = (goal) => {
    setDepositGoal(goal)
    setDepositAmount('')
    setDepositNote('')
    setDepositError('')
    // Preselect first account that has positive balance if possible
    const withPositive = accounts.find(a => (Number(a.balance) || 0) > 0)
    setSelectedAccountId(withPositive ? withPositive.id : (accounts[0]?.id || ''))
  }

  const selectedAccount = accounts.find(a => a.id === selectedAccountId)
  const selectedAccountBalance = Number(selectedAccount?.balance) || 0
  const numDepositAmount = Number(depositAmount) || 0
  const remainingForDepositGoal = depositGoal ? Math.max(0, depositGoal.targetAmount - (depositGoal.currentAmount || 0)) : 0

  const handleDepositSubmit = async (e) => {
    e?.preventDefault()
    if (!depositGoal) return
    if (!selectedAccountId) {
      setDepositError('Pilih akun atau dompet asal sumber dana')
      return
    }
    if (numDepositAmount <= 0) {
      setDepositError('Nominal setoran harus lebih dari Rp 0')
      return
    }
    if (numDepositAmount > selectedAccountBalance) {
      setDepositError(`Saldo ${selectedAccount.name} tidak mencukupi (Tersedia: ${formatCurrency(selectedAccountBalance)})`)
      return
    }

    setDepositLoading(true)
    setDepositError('')
    try {
      await depositToGoal(depositGoal.id, {
        accountId: selectedAccountId,
        amount: numDepositAmount,
        note: depositNote.trim() || `Setor Tabungan: ${depositGoal.name}`,
      })
      setDepositGoal(null)
      setDepositAmount('')
      setDepositNote('')
    } catch (err) {
      setDepositError(err.message || 'Gagal memproses setoran tabungan')
    } finally {
      setDepositLoading(false)
    }
  }

  const active = goals.filter(g => g.status !== 'completed')
  const completed = goals.filter(g => g.status === 'completed')
  const totalCollected = goals.reduce((s, g) => s + (g.currentAmount || 0), 0)

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 dark:text-white uppercase">
            Target & Tabungan
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 font-medium">
            Rencanakan dan kumpulkan dana impian dengan setoran langsung dari rekening & dompet Anda.
          </p>
        </div>
        <Button
          onClick={() => { setShowAddModal(true); setError('') }}
          id="add-goal-btn"
          className="gap-1.5 bg-purple-600 text-white hover:bg-purple-700 border-2 border-zinc-950 dark:border-zinc-700 font-bold shadow-[2px_2px_0px_0px_#000]"
        >
          <Plus size={16} />
          <span>Buat Target Baru</span>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl border-2 border-zinc-950 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-[4px_4px_0px_0px_#9333ea]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Target Berjalan</span>
            <span className="text-lg">🎯</span>
          </div>
          <p className="text-2xl font-black tracking-tight text-zinc-900 dark:text-white mt-1">
            {active.length} <span className="text-xs font-medium text-zinc-500">tujuan</span>
          </p>
        </div>

        <div className="p-4 rounded-2xl border-2 border-zinc-950 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-[4px_4px_0px_0px_#9333ea]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Tercapai & Selesai</span>
            <span className="text-lg">✅</span>
          </div>
          <p className="text-2xl font-black tracking-tight text-emerald-600 dark:text-emerald-400 mt-1">
            {completed.length} <span className="text-xs font-medium text-zinc-500">tujuan</span>
          </p>
        </div>

        <div className="p-4 rounded-2xl border-2 border-zinc-950 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-[4px_4px_0px_0px_#9333ea]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">Total Dana Terkumpul</span>
            <span className="text-lg">💰</span>
          </div>
          <p className="text-2xl font-black tracking-tight text-zinc-900 dark:text-white mt-1">
            {formatCurrency(totalCollected)}
          </p>
        </div>
      </div>

      {/* Goals Grid */}
      {goals.length === 0 ? (
        <EmptyState
          icon="🎯"
          title="Belum ada target tabungan"
          description="Buat pos tabungan untuk impian Anda, lalu setor dana langsung dari rekening Anda secara bertahap."
          action={
            <Button onClick={() => setShowAddModal(true)} id="empty-add-goal">
              Buat Target Tabungan Pertama
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {goals.map(goal => {
            const pct = calcProgress(goal.currentAmount, goal.targetAmount)
            const remaining = Math.max(0, goal.targetAmount - (goal.currentAmount || 0))
            const months = estimateMonthsToGoal(remaining, goal.monthlyContrib)
            const isCompleted = goal.status === 'completed' || goal.currentAmount >= goal.targetAmount

            return (
              <div
                key={goal.id}
                className="p-5 rounded-2xl border-2 border-zinc-950 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-[4px_4px_0px_0px_#9333ea] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_#9333ea] transition-all duration-200 flex flex-col justify-between relative"
              >
                {/* Header Card */}
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl bg-purple-50 dark:bg-purple-950/40 border-2 border-zinc-950 dark:border-zinc-800 shadow-[2px_2px_0px_0px_#9333ea] flex-shrink-0">
                        {goal.icon || goal.emoji || '🎯'}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-base font-black text-zinc-900 dark:text-white uppercase truncate">
                            {goal.name}
                          </h3>
                          {isCompleted && (
                            <Badge variant="success" className="text-[10px] px-1.5 py-0.5">
                              Selesai
                            </Badge>
                          )}
                        </div>
                        {goal.description && (
                          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 line-clamp-1 font-medium">
                            {goal.description}
                          </p>
                        )}
                        {goal.deadline && (
                          <div className="flex items-center gap-1.5 mt-1 text-[11px] text-zinc-500 font-medium">
                            <Clock size={12} />
                            <span>Target: {formatDate(goal.deadline)}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => setDeleteId(goal.id)}
                      id={`del-goal-${goal.id}`}
                      title="Hapus target"
                      className="p-1.5 rounded-lg border-2 border-zinc-950 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 hover:text-rose-500 hover:bg-rose-50 shadow-[1px_1px_0px_0px_#000] transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  {/* Progress Bar & Amounts */}
                  <div className="space-y-2 my-4 bg-zinc-50 dark:bg-zinc-900/50 p-3 rounded-xl border-2 border-zinc-950 dark:border-zinc-800 shadow-[2px_2px_0px_0px_#9333ea]">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider text-[10px]">Terkumpul</span>
                      <span className="font-black text-zinc-900 dark:text-white">
                        {formatCurrency(goal.currentAmount || 0)}{' '}
                        <span className="text-zinc-400 font-normal">/ {formatCurrency(goal.targetAmount)}</span>
                      </span>
                    </div>

                    <ProgressBar
                      current={goal.currentAmount || 0}
                      target={goal.targetAmount}
                      showLabel={false}
                      color={isCompleted ? '#10b981' : '#9333ea'}
                    />

                    <div className="flex justify-between items-center text-xs">
                      <span className={cn('font-bold', isCompleted ? 'text-emerald-600 dark:text-emerald-400' : 'text-purple-600 dark:text-purple-400')}>
                        {pct}% Tercapai
                      </span>
                      {!isCompleted && remaining > 0 && (
                        <span className="text-zinc-500 text-[11px] font-medium">
                          Kurang {formatCurrency(remaining)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="pt-2 flex items-center gap-2">
                  {!isCompleted ? (
                    <Button
                      onClick={() => openDepositModal(goal)}
                      id={`contrib-${goal.id}`}
                      className="flex-1 gap-2 bg-purple-600 text-white hover:bg-purple-700 border-2 border-zinc-950 dark:border-zinc-700 font-bold h-9 text-xs shadow-[2px_2px_0px_0px_#000]"
                    >
                      <Plus size={15} />
                      <span>Setor Dana dari Akun</span>
                    </Button>
                  ) : (
                    <div className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/40 rounded-xl border-2 border-zinc-950 dark:border-zinc-800 shadow-[2px_2px_0px_0px_#10b981]">
                      <CheckCircle2 size={15} />
                      <span>Target Tabungan Berhasil Tercapai!</span>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* =========================================================
          MODAL SETOR DANA DARI AKUN / DOMPET TERDAFTAR
          ========================================================= */}
      <Modal
        isOpen={!!depositGoal}
        onClose={() => { if (!depositLoading) setDepositGoal(null) }}
        title={`Setor Dana ke "${depositGoal?.name}"`}
        size="md"
      >
        {depositGoal && (
          <form onSubmit={handleDepositSubmit} className="space-y-4">
            {/* Goal Progress Snippet */}
            <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="text-2xl">{depositGoal.icon || depositGoal.emoji || '🎯'}</span>
                <div>
                  <p className="text-xs text-zinc-500">Target Tabungan</p>
                  <p className="text-sm font-bold text-zinc-900 dark:text-white">{depositGoal.name}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-zinc-500">Sisa Target</p>
                <p className="text-sm font-bold text-zinc-900 dark:text-white">
                  {formatCurrency(remainingForDepositGoal)}
                </p>
              </div>
            </div>

            {/* Pilih Akun / Dompet Asal */}
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Pilih Akun / Dompet Sumber Dana
              </label>

              {accounts.length === 0 ? (
                <div className="p-4 rounded-xl border border-amber-300 dark:border-amber-800/80 bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-300 text-xs space-y-2">
                  <div className="flex items-center gap-2 font-semibold">
                    <AlertCircle size={16} />
                    <span>Belum ada akun atau dompet terdaftar</span>
                  </div>
                  <p className="text-[11px] text-amber-800 dark:text-amber-400">
                    Untuk menyetor dana ke tabungan, Anda harus memiliki akun rekening atau dompet terlebih dahulu.
                  </p>
                  <Link to="/accounts" className="inline-block pt-1">
                    <Button size="sm" variant="outline" className="h-8 text-xs gap-1">
                      <Wallet size={14} /> Tambah Akun Rekening
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
                  {accounts.map(acc => {
                    const isSelected = selectedAccountId === acc.id
                    const bal = Number(acc.balance) || 0
                    const isZeroOrNegative = bal <= 0

                    return (
                      <button
                        key={acc.id}
                        type="button"
                        onClick={() => {
                          setSelectedAccountId(acc.id)
                          setDepositError('')
                        }}
                        className={cn(
                          'p-3 rounded-xl border text-left flex items-center justify-between transition-all',
                          isSelected
                            ? 'border-zinc-900 dark:border-white bg-zinc-100/80 dark:bg-zinc-800/80 shadow-2xs'
                            : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-950'
                        )}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="text-xl flex-shrink-0">{acc.icon || '💳'}</span>
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-zinc-900 dark:text-white truncate">
                              {acc.name}
                            </p>
                            <p className={cn('text-[11px]', isZeroOrNegative ? 'text-rose-500' : 'text-zinc-500 dark:text-zinc-400')}>
                              {formatCurrency(bal)}
                            </p>
                          </div>
                        </div>

                        <div className={cn(
                          'w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0',
                          isSelected
                            ? 'border-zinc-900 bg-zinc-900 text-white dark:border-white dark:bg-white dark:text-zinc-900'
                            : 'border-zinc-300 dark:border-zinc-700'
                        )}>
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-current" />}
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Input Nominal Setoran */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Nominal Setoran (Rp)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-zinc-400">
                  Rp
                </span>
                <input
                  type="number"
                  placeholder="0"
                  min="1"
                  max={selectedAccountBalance > 0 ? selectedAccountBalance : undefined}
                  value={depositAmount}
                  onChange={e => {
                    setDepositAmount(e.target.value)
                    setDepositError('')
                  }}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white text-base font-semibold focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white transition-all"
                  autoFocus
                />
              </div>

              {/* Quick Preset Buttons */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {[50000, 100000, 250000, 500000].map(amt => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => {
                      setDepositAmount(String(amt))
                      setDepositError('')
                    }}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors"
                  >
                    +{formatCompact(amt)}
                  </button>
                ))}

                {remainingForDepositGoal > 0 && remainingForDepositGoal <= selectedAccountBalance && (
                  <button
                    type="button"
                    onClick={() => {
                      setDepositAmount(String(remainingForDepositGoal))
                      setDepositError('')
                    }}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium border border-zinc-900/20 dark:border-white/20 bg-zinc-900/5 dark:bg-white/5 text-zinc-900 dark:text-white hover:bg-zinc-900/10 transition-colors"
                  >
                    Sisa Target ({formatCompact(remainingForDepositGoal)})
                  </button>
                )}

                {selectedAccountBalance > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setDepositAmount(String(selectedAccountBalance))
                      setDepositError('')
                    }}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium border border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition-colors"
                  >
                    Semua Saldo
                  </button>
                )}
              </div>

              {/* Real-time Validation / Info */}
              {selectedAccount && numDepositAmount > selectedAccountBalance && (
                <p className="text-xs text-rose-500 flex items-center gap-1 mt-1">
                  <AlertCircle size={13} />
                  <span>Saldo tidak mencukupi. Saldo tersedia: {formatCurrency(selectedAccountBalance)}</span>
                </p>
              )}
              {selectedAccount && numDepositAmount > 0 && numDepositAmount <= selectedAccountBalance && (
                <p className="text-xs text-zinc-400 mt-1">
                  Sisa saldo di {selectedAccount.name} setelah setor: {formatCurrency(selectedAccountBalance - numDepositAmount)}
                </p>
              )}
            </div>

            {/* Catatan / Keterangan (Opsional) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                Catatan (Opsional)
              </label>
              <input
                type="text"
                placeholder={`contoh: Sisihkan gaji untuk ${depositGoal.name}`}
                value={depositNote}
                onChange={e => setDepositNote(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-white transition-all"
              />
            </div>

            {/* Error Message */}
            {depositError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2">
                <AlertCircle size={16} className="flex-shrink-0" />
                <span>{depositError}</span>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDepositGoal(null)}
                disabled={depositLoading}
                className="flex-1"
                id="deposit-cancel"
              >
                Batal
              </Button>
              <Button
                type="submit"
                loading={depositLoading}
                disabled={
                  depositLoading ||
                  accounts.length === 0 ||
                  !selectedAccountId ||
                  numDepositAmount <= 0 ||
                  numDepositAmount > selectedAccountBalance
                }
                className="flex-1 bg-purple-600 text-white hover:bg-purple-700 border-2 border-zinc-950 dark:border-zinc-700 font-bold shadow-[2px_2px_0px_0px_#000]"
                id="deposit-submit"
              >
                Konfirmasi Setoran
              </Button>
            </div>
          </form>
        )}
      </Modal>

      {/* =========================================================
          MODAL BUAT TARGET TABUNGAN BARU
          ========================================================= */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Buat Target Tabungan Baru" size="md">
        <form onSubmit={handleAdd} className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
              Pilih Ikon
            </label>
            <div className="flex flex-wrap gap-2">
              {goalEmojis.map(e => (
                <button
                  key={e}
                  type="button"
                  onClick={() => set('emoji', e)}
                  className={cn(
                    'w-10 h-10 rounded-xl text-xl transition-all',
                    form.emoji === e
                      ? 'ring-2 ring-zinc-900 dark:ring-white bg-zinc-100 dark:bg-zinc-800 scale-105'
                      : 'hover:bg-zinc-100 dark:hover:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800'
                  )}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          <Input
            label="Nama Target Tabungan"
            placeholder="contoh: Dana Darurat, Beli Laptop M3, Liburan Jepang"
            value={form.name}
            onChange={e => set('name', e.target.value)}
            id="goal-name"
            required
          />

          <Input
            label="Target Nominal (Rp)"
            type="number"
            placeholder="contoh: 15000000"
            value={form.targetAmount}
            onChange={e => set('targetAmount', e.target.value)}
            id="goal-target"
            required
          />

          <Input
            label="Target Setoran Bulanan (Rp, Opsional)"
            type="number"
            placeholder="contoh: 1000000"
            value={form.monthlyContrib}
            onChange={e => set('monthlyContrib', e.target.value)}
            id="goal-monthly"
          />

          <Input
            label="Batas Waktu Capaian (Opsional)"
            type="date"
            value={form.deadline}
            onChange={e => set('deadline', e.target.value)}
            id="goal-deadline"
          />

          <Textarea
            label="Deskripsi / Catatan Rencana"
            placeholder="Tuliskan motivasi atau catatan mengenai target ini..."
            value={form.description}
            onChange={e => set('description', e.target.value)}
            id="goal-desc"
          />

          {error && (
            <p className="text-xs text-rose-500 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 p-2.5 rounded-xl">
              {error}
            </p>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowAddModal(false)}
              className="flex-1"
              id="goal-cancel"
            >
              Batal
            </Button>
            <Button
              type="submit"
              loading={loading}
              className="flex-1 bg-purple-600 text-white hover:bg-purple-700 border-2 border-zinc-950 dark:border-zinc-700 font-bold shadow-[2px_2px_0px_0px_#000]"
              id="goal-submit"
            >
              Simpan Target
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Konfirmasi Hapus */}
      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={async () => {
          await deleteGoal(deleteId)
          setDeleteId(null)
        }}
        title="Hapus Target Tabungan"
        message="Target tabungan yang dihapus tidak dapat dikembalikan. Data mutasi transaksi yang telah disetor sebelumnya tetap tercatat di riwayat."
      />
    </div>
  )
}

