import { useState, useEffect } from 'react'
import { Modal, Button, Input, Select, Textarea } from '@/components/ui'
import { useTransactionStore } from '../../store/transactionStore.js'
import { useAccountStore } from '../../store/accountStore.js'
import { CATEGORIES, TRANSACTION_TYPES, formatCurrency } from '../../lib/constants.js'
import { format } from 'date-fns'
import { cn } from '../../lib/utils.js'

const defaultForm = {
  type: 'expense',
  amount: '',
  categoryId: 'food',
  accountId: '',
  toAccountId: '',
  date: format(new Date(), 'yyyy-MM-dd'),
  note: '',
  description: '',
}

export function TransactionModal({ isOpen, onClose, editData = null }) {
  const { addTransaction, updateTransaction, fetchTransactions } = useTransactionStore()
  const { accounts, fetchAccounts } = useAccountStore()
  const [form, setForm] = useState(defaultForm)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isOpen) {
      fetchAccounts()
      if (editData) {
        setForm({ ...defaultForm, ...editData, amount: String(editData.amount) })
      } else {
        setForm({
          ...defaultForm,
          accountId: accounts.length > 0 ? accounts[0].id : '',
          date: format(new Date(), 'yyyy-MM-dd')
        })
      }
      setError('')
    }
  }, [isOpen, editData])

  useEffect(() => {
    if (accounts.length > 0 && !form.accountId) {
      setForm(f => ({ ...f, accountId: accounts[0].id }))
    }
  }, [accounts, form.accountId])

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const filteredCategories = CATEGORIES.filter(c =>
    form.type === 'transfer' ? false : c.type === form.type
  )

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.amount || isNaN(Number(form.amount)) || Number(form.amount) <= 0) {
      setError('Jumlah harus diisi dan lebih dari 0')
      return
    }
    if (!form.accountId) {
      setError('Pilih akun')
      return
    }
    if (form.type === 'transfer' && form.accountId === form.toAccountId) {
      setError('Akun sumber dan tujuan tidak boleh sama')
      return
    }
    setLoading(true)
    setError('')
    try {
      const data = { ...form, amount: Number(form.amount) }
      if (editData?.id) {
        await updateTransaction(editData.id, data)
      } else {
        await addTransaction(data)
      }
      await fetchAccounts()
      onClose()
    } catch (err) {
      setError(err.message || 'Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={editData ? 'Edit Transaksi' : 'Tambah Transaksi'} size="md">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Type tabs */}
        <div className="flex gap-1 p-1 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)' }}>
          {TRANSACTION_TYPES.map(t => (
            <button
              key={t.id}
              type="button"
              id={`tx-type-${t.id}`}
              onClick={() => {
                set('type', t.id)
                if (t.id !== 'transfer') set('categoryId', t.id === 'expense' ? 'food' : 'salary')
              }}
              className={cn(
                'flex-1 py-2 rounded-lg text-xs font-medium transition-all duration-200',
                form.type === t.id
                  ? 'text-white shadow-lg'
                  : 'text-slate-500 hover:text-slate-300'
              )}
              style={form.type === t.id ? { background: t.color + '20', color: t.color, border: `1px solid ${t.color}30` } : {}}
            >
              {t.name}
            </button>
          ))}
        </div>

        {/* Amount */}
        <Input
          label="Jumlah"
          type="number"
          placeholder="0"
          value={form.amount}
          onChange={e => set('amount', e.target.value)}
          id="tx-amount"
          min="1"
          required
        />

        {/* Category (not for transfer) */}
        {form.type !== 'transfer' && (
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-400">Kategori</label>
            <div className="grid grid-cols-4 gap-1.5 max-h-36 overflow-y-auto pr-1">
              {filteredCategories.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  id={`cat-${cat.id}`}
                  onClick={() => set('categoryId', cat.id)}
                  className={cn(
                    'flex flex-col items-center gap-1 p-2 rounded-xl text-xs transition-all duration-200',
                    form.categoryId === cat.id
                      ? 'text-white'
                      : 'text-slate-500 hover:bg-white/5 hover:text-slate-300'
                  )}
                  style={form.categoryId === cat.id
                    ? { background: cat.color + '20', border: `1px solid ${cat.color}40`, color: cat.color }
                    : { border: '1px solid transparent' }
                  }
                >
                  <span className="text-lg">{cat.icon}</span>
                  <span className="leading-tight text-center line-clamp-1">{cat.name.split(' ')[0]}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Account */}
        <Select
          label="Dari Akun"
          value={form.accountId || ''}
          onChange={e => set('accountId', e.target.value)}
          id="tx-account"
        >
          {accounts.length === 0 ? (
            <option value="">Belum ada akun terdaftar</option>
          ) : (
            accounts.map(acc => (
              <option key={acc.id} value={acc.id}>
                {acc.icon} {acc.name} ({formatCurrency(acc.balance || 0)})
              </option>
            ))
          )}
        </Select>

        {/* To Account (transfer) */}
        {form.type === 'transfer' && (
          <Select
            label="Ke Akun"
            value={form.toAccountId || ''}
            onChange={e => set('toAccountId', e.target.value)}
            id="tx-to-account"
          >
            <option value="">Pilih akun tujuan</option>
            {accounts.filter(a => a.id !== form.accountId).map(acc => (
              <option key={acc.id} value={acc.id}>
                {acc.icon} {acc.name} ({formatCurrency(acc.balance || 0)})
              </option>
            ))}
          </Select>
        )}

        {/* Date */}
        <Input
          label="Tanggal"
          type="date"
          value={form.date}
          onChange={e => set('date', e.target.value)}
          id="tx-date"
        />

        {/* Note */}
        <Input
          label="Catatan (opsional)"
          placeholder="Tambahkan catatan..."
          value={form.note}
          onChange={e => set('note', e.target.value)}
          id="tx-note"
        />

        {error && <p className="text-xs text-rose-400 bg-rose-500/10 px-3 py-2 rounded-lg">{error}</p>}

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1" id="tx-cancel">Batal</Button>
          <Button type="submit" loading={loading} className="flex-1" id="tx-submit">
            {editData ? 'Simpan Perubahan' : 'Tambah Transaksi'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
