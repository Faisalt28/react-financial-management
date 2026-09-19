import { useEffect, useState, useMemo } from 'react'
import { Search, Filter, Trash2, Edit2, Plus, ArrowUpDown } from 'lucide-react'
import { useTransactionStore } from '../../store/transactionStore.js'
import { useAccountStore } from '../../store/accountStore.js'
import { TransactionModal } from '../../components/forms/TransactionModal.jsx'
import { ConfirmModal, Button, Input, Select, Badge, EmptyState, Spinner } from '@/components/ui'
import { formatCurrency, formatCompact, CATEGORIES } from '../../lib/constants.js'
import { formatDate, getCategoryById, parseTxDate } from '../../lib/utils.js'

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
      if (filters.accountId && tx.accountId !== filters.accountId) return false
      if (filters.month) {
        const d = parseTxDate(tx.date)
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

  const income = filtered
    .filter(t => t.type === 'income')
    .reduce((s, t) => s + (Number(t.amount) || 0), 0)
  const expense = filtered
    .filter(t => t.type === 'expense')
    .reduce((s, t) => s + (Number(t.amount) || 0), 0)
  const net = income - expense

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Summary - Fully responsive cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { label: 'Pemasukan', value: income, color: '#10b981', prefix: '+' },
          { label: 'Pengeluaran', value: expense, color: '#f43f5e', prefix: '-' },
          {
            label: 'Sisa Bersih (Net)',
            value: net,
            color: net >= 0 ? '#10b981' : '#f43f5e',
            prefix: net >= 0 ? '+' : ''
          },
        ].map(s => (
          <div
            key={s.label}
            className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-center shadow-xs"
          >
            <p className="text-xs text-zinc-500 mb-1 font-medium">{s.label}</p>
            <p className="text-xl font-bold" style={{ color: s.color }}>
              {s.prefix}{formatCompact(Math.abs(s.value))}
            </p>
            <p className="text-xs text-zinc-400 mt-0.5 font-medium">
              {s.prefix}{formatCurrency(Math.abs(s.value))}
            </p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="p-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-950 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <div className="flex-1">
            <Input
              placeholder="Cari catatan transaksi..."
              value={filters.search}
              onChange={e => setFilter('search', e.target.value)}
              icon={<Search size={15} />}
              id="tx-search"
            />
          </div>
          <Button
            onClick={() => { setEditData(null); setShowModal(true) }}
            id="add-tx-btn"
            className="flex-shrink-0"
          >
            <Plus size={16} /> Tambah Transaksi
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
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

      {/* Transaction List / Table */}
      <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden shadow-xs">
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
            {/* Desktop Table View (Hidden on mobile) */}
            <div className="hidden md:block">
              {/* Header */}
              <div className="grid grid-cols-12 gap-2 px-5 py-3.5 border-b border-zinc-100 dark:border-zinc-800 text-xs font-semibold text-zinc-400 uppercase tracking-wider bg-zinc-50/50 dark:bg-zinc-900/30">
                <div className="col-span-4">Transaksi</div>
                <div className="col-span-2">Kategori</div>
                <div className="col-span-2">Akun</div>
                <div className="col-span-2">Tanggal</div>
                <div className="col-span-1 text-right">Jumlah</div>
                <div className="col-span-1 text-right pr-2">Aksi</div>
              </div>

              {paginated.map((tx) => {
                const cat = getCategoryById(tx.categoryId)
                const acc = accounts.find(a => a.id === tx.accountId)
                const isIncome = tx.type === 'income'
                const isExpense = tx.type === 'expense'

                return (
                  <div
                    key={tx.id}
                    className="grid grid-cols-12 gap-2 px-5 py-4 border-b border-zinc-100 dark:border-zinc-900 hover:bg-zinc-50/60 dark:hover:bg-zinc-900/40 transition-colors items-center"
                  >
                    <div className="col-span-4 flex items-center gap-3 min-w-0">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0"
                        style={{ background: cat.color + '15' }}
                      >
                        {tx.type === 'transfer' ? '↔️' : cat.icon}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                          {tx.note || cat.name}
                        </p>
                        <div className="mt-0.5">
                          <Badge variant={tx.type}>
                            {isIncome ? 'Pemasukan' : isExpense ? 'Pengeluaran' : 'Transfer'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="col-span-2 text-xs text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5 truncate">
                      <span>{cat.icon}</span> <span>{cat.name}</span>
                    </div>
                    <div className="col-span-2 text-xs text-zinc-600 dark:text-zinc-400 flex items-center gap-1.5 truncate">
                      <span>{acc?.icon || '💳'}</span> <span>{acc?.name || '-'}</span>
                    </div>
                    <div className="col-span-2 text-xs text-zinc-500 dark:text-zinc-400">
                      {formatDate(tx.date)}
                    </div>
                    <div className={`col-span-1 text-right font-bold text-sm ${isIncome ? 'text-emerald-600 dark:text-emerald-400' : isExpense ? 'text-zinc-900 dark:text-zinc-100' : 'text-blue-500'}`}>
                      {isIncome ? '+' : isExpense ? '-' : ''}
                      {formatCompact(tx.amount)}
                    </div>
                    <div className="col-span-1 flex justify-end gap-1">
                      <button
                        onClick={() => handleEdit(tx)}
                        id={`edit-tx-${tx.id}`}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                        title="Edit Transaksi"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => setDeleteId(tx.id)}
                        id={`delete-tx-${tx.id}`}
                        className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                        title="Hapus Transaksi"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Mobile Card List View (Visible only on mobile / small screens) */}
            <div className="block md:hidden divide-y divide-zinc-100 dark:divide-zinc-900">
              {paginated.map((tx) => {
                const cat = getCategoryById(tx.categoryId)
                const acc = accounts.find(a => a.id === tx.accountId)
                const isIncome = tx.type === 'income'
                const isExpense = tx.type === 'expense'

                return (
                  <div key={tx.id} className="p-4 space-y-2.5 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-colors">
                    {/* Top Row: Icon, Note/Category, Amount */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 shadow-2xs"
                          style={{ background: cat.color + '15' }}
                        >
                          {tx.type === 'transfer' ? '↔️' : cat.icon}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">
                            {tx.note || cat.name}
                          </p>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5 mt-0.5">
                            <span>{cat.icon} {cat.name}</span>
                          </p>
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <p className={`text-base font-black ${isIncome ? 'text-emerald-600 dark:text-emerald-400' : isExpense ? 'text-zinc-900 dark:text-zinc-100' : 'text-blue-500'}`}>
                          {isIncome ? '+' : isExpense ? '-' : ''}{formatCurrency(tx.amount)}
                        </p>
                        <div className="mt-0.5 flex justify-end">
                          <Badge variant={tx.type}>
                            {isIncome ? 'Pemasukan' : isExpense ? 'Pengeluaran' : 'Transfer'}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    {/* Bottom Row: Account, Date, and Actions */}
                    <div className="flex items-center justify-between pt-1 border-t border-zinc-100 dark:border-zinc-900/80 text-xs text-zinc-400">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 text-zinc-600 dark:text-zinc-300 font-medium">
                          {acc?.icon || '💳'} {acc?.name || '-'}
                        </span>
                        <span>&bull;</span>
                        <span>{formatDate(tx.date)}</span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleEdit(tx)}
                          id={`edit-mobile-tx-${tx.id}`}
                          className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                          aria-label="Edit"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          onClick={() => setDeleteId(tx.id)}
                          id={`delete-mobile-tx-${tx.id}`}
                          className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer"
                          aria-label="Hapus"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-4 border-t border-zinc-100 dark:border-zinc-800">
                <p className="text-xs text-zinc-500 dark:text-zinc-400">{filtered.length} transaksi ditemukan</p>
                <div className="flex items-center gap-2">
                  <Button variant="secondary" size="sm" onClick={() => setPage(p => p - 1)} disabled={page === 1} id="prev-page">
                    ← Prev
                  </Button>
                  <span className="flex items-center px-3 text-xs font-medium text-zinc-600 dark:text-zinc-400">{page} / {totalPages}</span>
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
