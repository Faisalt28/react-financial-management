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
        <div className="flex gap-2 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-900 border-2 border-zinc-950 dark:border-zinc-800">
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
                'flex-1 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all duration-150',
                form.type === t.id
                  ? 'bg-purple-600 text-white border-2 border-zinc-950 shadow-[2px_2px_0px_0px_#000]'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white border-2 border-transparent'
              )}
            >
              {t.name}
            </button>
          ))}
        </div>

        {/* Amount */}
        <Input
          label="Jumlah (Rp)"
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
            <label className="text-xs font-bold uppercase tracking-wider text-zinc-700 dark:text-zinc-300">Kategori</label>
            <div className="grid grid-cols-4 gap-2 max-h-40 overflow-y-auto pr-1">
              {filteredCategories.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  id={`cat-${cat.id}`}
                  onClick={() => set('categoryId', cat.id)}
                  className={cn(
                    'flex flex-col items-center gap-1 p-2 rounded-xl text-xs font-bold transition-all duration-150',
                    form.categoryId === cat.id
                      ? 'bg-purple-50 dark:bg-purple-950/50 border-2 border-purple-600 text-purple-700 dark:text-purple-300 shadow-[2px_2px_0px_0px_#9333ea]'
                      : 'border-2 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:border-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                  )}
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

        {error && <p className="text-xs text-rose-500 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 px-3 py-2 rounded-xl">{error}</p>}

        <div className="flex gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1" id="tx-cancel">Batal</Button>
          <Button type="submit" loading={loading} className="flex-1 bg-purple-600 text-white hover:bg-purple-700 border-2 border-zinc-950 dark:border-zinc-700 font-bold shadow-[2px_2px_0px_0px_#000]" id="tx-submit">
            {editData ? 'Simpan Perubahan' : 'Tambah Transaksi'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
