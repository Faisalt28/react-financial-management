import { useEffect, useState } from 'react'
import { Plus, Edit2, Trash2, Wallet } from 'lucide-react'
import { useAccountStore } from '../../store/accountStore.js'
import { useTransactionStore } from '../../store/transactionStore.js'
import { Modal, ConfirmModal, Button, Input, Select, EmptyState } from '@/components/ui'
import { formatCurrency, formatCompact, ACCOUNT_TYPES, ACCOUNT_COLORS } from '../../lib/constants.js'
import { formatDate } from '../../lib/utils.js'

const defaultForm = { name: '', type: 'cash', balance: '0', color: '#10b981', icon: '💵' }

const accountIconMap = { bank: '🏦', cash: '💵', ewallet: '📲', credit: '💳', investment: '📊' }

export function AccountsPage() {
  const { accounts, fetchAccounts, addAccount, updateAccount, deleteAccount, getTotalBalance } = useAccountStore()
  const { transactions, fetchTransactions, getByAccount } = useTransactionStore()
  const [showModal, setShowModal] = useState(false)
  const [editData, setEditData] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [selectedAccount, setSelectedAccount] = useState(null)
  const [form, setForm] = useState(defaultForm)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => { fetchAccounts(); fetchTransactions() }, [])

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const openAdd = () => { setEditData(null); setForm(defaultForm); setError(''); setShowModal(true) }
  const openEdit = (acc) => {
    setEditData(acc)
    setForm({ name: acc.name, type: acc.type, balance: String(acc.balance || 0), color: acc.color, icon: acc.icon })
    setError('')
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name) { setError('Nama akun harus diisi'); return }
    setLoading(true)
    try {
      const data = { ...form, balance: Number(form.balance) || 0 }
      if (editData) {
        await updateAccount(editData.id, data)
      } else {
        await addAccount(data)
      }
      setShowModal(false)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    setLoading(true)
    await deleteAccount(deleteId)
    setLoading(false)
    setDeleteId(null)
    if (selectedAccount?.id === deleteId) setSelectedAccount(null)
  }

  const totalBalance = getTotalBalance()
  const accountTx = selectedAccount ? getByAccount(selectedAccount.id).slice(0, 10) : []

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Total balance card */}
      <div className="p-6 text-center rounded-2xl border-2 border-zinc-950 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-[4px_4px_0px_0px_#9333ea]">
        <p className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1">Total Saldo Semua Akun</p>
        <p className="text-3xl sm:text-4xl font-black text-zinc-900 dark:text-white tracking-tight">{formatCurrency(totalBalance)}</p>
        <p className="text-xs text-zinc-500 font-medium mt-1">{accounts.length} akun & dompet terdaftar</p>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-zinc-900 dark:text-white uppercase tracking-tight">Daftar Akun & Dompet</h2>
          <p className="text-xs text-zinc-500 font-medium">Kelola dompet tunai, rekening tabungan, dan dompet digital Anda</p>
        </div>
        <Button size="sm" onClick={openAdd} id="add-account-btn" className="bg-purple-600 text-white hover:bg-purple-700 border-2 border-zinc-950 dark:border-zinc-700 font-bold gap-1.5 shadow-[2px_2px_0px_0px_#000]">
          <Plus size={16} /> Tambah Akun
        </Button>
      </div>

      {/* Account cards */}
      {accounts.length === 0 ? (
        <EmptyState icon="🏦" title="Belum ada akun" description="Tambahkan akun bank, dompet, atau e-wallet Anda"
          action={<Button onClick={openAdd} id="empty-add-acc">Tambah Akun</Button>} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.map(acc => (
            <div
              key={acc.id}
              className={`p-5 rounded-2xl border-2 transition-all cursor-pointer relative overflow-hidden ${
                selectedAccount?.id === acc.id
                  ? 'border-zinc-950 dark:border-zinc-100 shadow-[6px_6px_0px_0px_#9333ea] bg-purple-50/40 dark:bg-purple-950/20'
                  : 'border-zinc-950 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-[4px_4px_0px_0px_#9333ea] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_#9333ea]'
              }`}
              onClick={() => setSelectedAccount(s => s?.id === acc.id ? null : acc)}
              id={`account-card-${acc.id}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl bg-purple-50 dark:bg-purple-950/40 border-2 border-zinc-950 dark:border-zinc-800 shadow-[2px_2px_0px_0px_#9333ea]">
                    {acc.icon}
                  </div>
                  <div>
                    <p className="text-sm font-black text-zinc-900 dark:text-white uppercase">{acc.name}</p>
                    <p className="text-xs text-zinc-500 font-medium">{ACCOUNT_TYPES.find(t => t.id === acc.type)?.name || 'Dompet'}</p>
                  </div>
                </div>
                <div className="flex gap-1.5">
                  <button onClick={e => { e.stopPropagation(); openEdit(acc) }} id={`edit-acc-${acc.id}`}
                    className="p-1.5 rounded-lg border-2 border-zinc-950 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-purple-600 hover:bg-purple-50 shadow-[1px_1px_0px_0px_#000] transition-colors">
                    <Edit2 size={13} />
                  </button>
                  <button onClick={e => { e.stopPropagation(); setDeleteId(acc.id) }} id={`del-acc-${acc.id}`}
                    className="p-1.5 rounded-lg border-2 border-zinc-950 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:text-rose-500 hover:bg-rose-50 shadow-[1px_1px_0px_0px_#000] transition-colors">
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
              <p className="text-2xl font-black text-zinc-900 dark:text-white">{formatCompact(acc.balance || 0)}</p>
              <p className="text-xs text-zinc-500 font-medium mt-0.5">{formatCurrency(acc.balance || 0)}</p>
            </div>
          ))}
        </div>
      )}

      {/* Account transactions */}
      {selectedAccount && (
        <div className="rounded-2xl border-2 border-zinc-950 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 shadow-[4px_4px_0px_0px_#9333ea]">
          <h3 className="text-sm font-black text-zinc-900 dark:text-white uppercase tracking-tight mb-4">
            Transaksi Terakhir — {selectedAccount.icon} {selectedAccount.name}
          </h3>
          {accountTx.length === 0 ? (
            <p className="text-sm text-zinc-500 text-center py-6 font-medium">Belum ada transaksi</p>
          ) : (
            <div className="space-y-2 divide-y-2 divide-zinc-100 dark:divide-zinc-900">
              {accountTx.map(tx => (
                <div key={tx.id} className="flex items-center justify-between py-2.5">
                  <div>
                    <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{tx.note || tx.type}</p>
                    <p className="text-xs text-zinc-500 font-medium">{formatDate(tx.date)}</p>
                  </div>
                  <span className={`font-black text-sm ${tx.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : tx.type === 'expense' ? 'text-rose-600 dark:text-rose-400' : 'text-purple-600'}`}>
                    {tx.type === 'income' ? '+' : tx.type === 'expense' ? '-' : '↔'}{formatCompact(tx.amount)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Account modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editData ? 'Edit Akun' : 'Tambah Akun'} size="sm">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Nama Akun" placeholder="contoh: BCA Utama" value={form.name} onChange={e => set('name', e.target.value)} id="acc-name" required />
          <Select label="Tipe Akun" value={form.type} onChange={e => { set('type', e.target.value); set('icon', accountIconMap[e.target.value] || '🏦') }} id="acc-type">
            {ACCOUNT_TYPES.map(t => <option key={t.id} value={t.id}>{t.icon} {t.name}</option>)}
          </Select>
          <Input label="Saldo Awal (Rp)" type="number" placeholder="0" value={form.balance} onChange={e => set('balance', e.target.value)} id="acc-balance" />
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-400">Warna</label>
            <div className="flex gap-2 flex-wrap">
              {ACCOUNT_COLORS.map(c => (
                <button key={c} type="button" onClick={() => set('color', c)}
                  className="w-7 h-7 rounded-full transition-all duration-200"
                  style={{ background: c, outline: form.color === c ? `2px solid ${c}` : 'none', outlineOffset: '2px' }} />
              ))}
            </div>
          </div>
          {error && <p className="text-xs text-rose-400 bg-rose-500/10 px-3 py-2 rounded-lg">{error}</p>}
          <div className="flex gap-3">
            <Button type="button" variant="secondary" onClick={() => setShowModal(false)} className="flex-1" id="acc-cancel">Batal</Button>
            <Button type="submit" loading={loading} className="flex-1" id="acc-submit">{editData ? 'Simpan' : 'Tambah'}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmModal isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete}
        title="Hapus Akun" message="Akun yang dihapus tidak dapat dikembalikan." loading={loading} />
    </div>
  )
}
