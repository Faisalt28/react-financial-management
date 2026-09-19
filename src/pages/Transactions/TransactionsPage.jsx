import { useEffect, useState, useMemo } from 'react'
import { Search, Filter, Trash2, Edit2, Plus, ArrowUpDown } from 'lucide-react'
import { useTransactionStore } from '../../store/transactionStore.js'
import { useAccountStore } from '../../store/accountStore.js'
import { TransactionModal } from '../../components/forms/TransactionModal.jsx'
import { ConfirmModal, Button, Input, Select, Badge, EmptyState, Spinner } from '@/components/ui'
import { formatCurrency, formatCompact, CATEGORIES } from '../../lib/constants.js'
import { formatDate, getCategoryById } from '../../lib/utils.js'

const ITEMS_PER_PAGE = 15

export function TransactionsPage() {
  const { transactions, fetchTransactions, deleteTransaction, loading } = useTransactionStore()
  const { accounts, fetchAccounts } = useAccountStore()
  const [showModal, setShowModal] = useState(false)
  const [editData, setEditData] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [page, setPage] = useState(1)

  const [filters, setFilters] = useState({
    search: '',
    type: '',
    categoryId: '',
    accountId: '',
    month: '',
  })

  useEffect(() => {
    fetchTransactions()
    fetchAccounts()
  }, [])

  const setFilter = (k, v) => { setFilters(f => ({ ...f, [k]: v })); setPage(1) }

  const filtered = useMemo(() => {
    return transactions.filter(tx => {
      if (filters.search && !tx.note?.toLowerCase().includes(filters.search.toLowerCase())) return false
      if (filters.type && tx.type !== filters.type) return false
      if (filters.categoryId && tx.categoryId !== filters.categoryId) return false
      if (filters.accountId && tx.accountId !== Number(filters.accountId)) return false
      if (filters.month) {
        const d = new Date(tx.date)
        const ym = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
        if (ym !== filters.month) return false
      }
      return true
    })
  }, [transactions, filters])

  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)
  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE)

  const handleDelete = async () => {
    setDeleteLoading(true)
    await deleteTransaction(deleteId)
    await fetchAccounts()
    setDeleteLoading(false)
    setDeleteId(null)
  }

  const handleEdit = (tx) => {
    setEditData(tx)
    setShowModal(true)
  }

  const income = filtered.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const expense = filtered.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0)

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Pemasukan', value: income, color: '#10b981', prefix: '+' },
          { label: 'Pengeluaran', value: expense, color: '#f43f5e', prefix: '-' },
          { label: 'Selisih', value: income - expense, color: income - expense >= 0 ? '#6366f1' : '#f43f5e', prefix: '' },
        ].map(s => (
          <div key={s.label} className="glass-card p-4 text-center">
            <p className="text-xs text-slate-500 mb-1">{s.label}</p>
            <p className="text-lg font-bold" style={{ color: s.color }}>
              {s.prefix}{formatCompact(Math.abs(s.value))}
            </p>
            <p className="text-xs text-slate-600">{formatCurrency(Math.abs(s.value))}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="glass-card p-4 space-y-3">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <Input
              placeholder="Cari transaksi..."
              value={filters.search}
              onChange={e => setFilter('search', e.target.value)}
              icon={<Search size={14} />}
              id="tx-search"
            />
          </div>
          <Button
            onClick={() => { setEditData(null); setShowModal(true) }}
            size="sm"
            id="add-tx-btn"
          >
            <Plus size={16} /> Tambah
          </Button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Select value={filters.type} onChange={e => setFilter('type', e.target.value)} id="filter-type">
            <option value="">Semua Tipe</option>
            <option value="income">Pemasukan</option>
            <option value="expense">Pengeluaran</option>
            <option value="transfer">Transfer</option>
          </Select>
          <Select value={filters.categoryId} onChange={e => setFilter('categoryId', e.target.value)} id="filter-category">
            <option value="">Semua Kategori</option>
            {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
          </Select>
          <Select value={filters.accountId} onChange={e => setFilter('accountId', e.target.value)} id="filter-account">
            <option value="">Semua Akun</option>
            {accounts.map(a => <option key={a.id} value={a.id}>{a.icon} {a.name}</option>)}
          </Select>
          <Input
            type="month"
            value={filters.month}
            onChange={e => setFilter('month', e.target.value)}
            id="filter-month"
          />
        </div>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-16"><Spinner /></div>
        ) : paginated.length === 0 ? (
          <EmptyState
            icon="💸"
            title="Tidak ada transaksi"
            description="Coba ubah filter atau tambah transaksi baru"
            action={<Button onClick={() => { setEditData(null); setShowModal(true) }} id="empty-add-tx">Tambah Transaksi</Button>}
          />
        ) : (
          <div>
            {/* Header */}
            <div className="grid grid-cols-12 gap-2 px-5 py-3 border-b border-white/5 text-xs font-medium text-slate-500 uppercase tracking-wider">
              <div className="col-span-4">Transaksi</div>
              <div className="col-span-2">Kategori</div>
              <div className="col-span-2">Akun</div>
              <div className="col-span-2">Tanggal</div>
              <div className="col-span-1 text-right">Jumlah</div>
              <div className="col-span-1"></div>
            </div>
            {paginated.map((tx, idx) => {
              const cat = getCategoryById(tx.categoryId)
              const acc = accounts.find(a => a.id === tx.accountId)
              return (
                <div
                  key={tx.id}
                  className="grid grid-cols-12 gap-2 px-5 py-4 border-b border-white/3 hover:bg-white/2 transition-colors items-center"
                  style={{ animationDelay: `${idx * 0.03}s` }}
                >
                  <div className="col-span-4 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0"
                      style={{ background: cat.color + '15' }}>
                      {tx.type === 'transfer' ? '↔️' : cat.icon}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-300 truncate">{tx.note || cat.name}</p>
                      <Badge variant={tx.type}>{tx.type === 'income' ? 'Pemasukan' : tx.type === 'expense' ? 'Pengeluaran' : 'Transfer'}</Badge>
                    </div>
                  </div>
                  <div className="col-span-2 text-xs text-slate-500">{cat.icon} {cat.name}</div>
                  <div className="col-span-2 text-xs text-slate-500">{acc?.icon} {acc?.name || '-'}</div>
                  <div className="col-span-2 text-xs text-slate-500">{formatDate(tx.date)}</div>
                  <div className={`col-span-1 text-right font-semibold text-sm ${tx.type === 'income' ? 'text-emerald-400' : tx.type === 'expense' ? 'text-rose-400' : 'text-brand-400'}`}>
                    {tx.type === 'income' ? '+' : tx.type === 'expense' ? '-' : ''}
                    {formatCompact(tx.amount)}
                  </div>
                  <div className="col-span-1 flex justify-end gap-1">
                    <button
                      onClick={() => handleEdit(tx)}
                      id={`edit-tx-${tx.id}`}
                      className="p-1.5 rounded-lg text-slate-600 hover:text-brand-400 hover:bg-brand-500/10 transition-colors"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button
                      onClick={() => setDeleteId(tx.id)}
                      id={`delete-tx-${tx.id}`}
                      className="p-1.5 rounded-lg text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              )
            })}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-4">
                <p className="text-xs text-slate-500">{filtered.length} transaksi ditemukan</p>
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm" onClick={() => setPage(p => p - 1)} disabled={page === 1} id="prev-page">
                    ← Prev
                  </Button>
                  <span className="flex items-center px-3 text-xs text-slate-400">{page} / {totalPages}</span>
                  <Button variant="secondary" size="sm" onClick={() => setPage(p => p + 1)} disabled={page === totalPages} id="next-page">
                    Next →
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <TransactionModal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setEditData(null) }}
        editData={editData}
      />
      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Hapus Transaksi"
        message="Apakah Anda yakin ingin menghapus transaksi ini? Saldo akun akan dikembalikan."
        loading={deleteLoading}
      />
    </div>
  )
}
