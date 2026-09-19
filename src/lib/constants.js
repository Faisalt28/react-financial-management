// Kategori transaksi default
export const CATEGORIES = [
  // Pengeluaran
  { id: 'food', name: 'Makanan & Minuman', icon: '🍜', color: '#f59e0b', type: 'expense' },
  { id: 'transport', name: 'Transportasi', icon: '🚗', color: '#3b82f6', type: 'expense' },
  { id: 'shopping', name: 'Belanja', icon: '🛍️', color: '#ec4899', type: 'expense' },
  { id: 'entertainment', name: 'Hiburan', icon: '🎬', color: '#8b5cf6', type: 'expense' },
  { id: 'health', name: 'Kesehatan', icon: '💊', color: '#10b981', type: 'expense' },
  { id: 'education', name: 'Pendidikan', icon: '📚', color: '#06b6d4', type: 'expense' },
  { id: 'bills', name: 'Tagihan & Utilitas', icon: '⚡', color: '#f97316', type: 'expense' },
  { id: 'rent', name: 'Sewa & Rumah', icon: '🏠', color: '#84cc16', type: 'expense' },
  { id: 'beauty', name: 'Kecantikan', icon: '💄', color: '#f43f5e', type: 'expense' },
  { id: 'sports', name: 'Olahraga', icon: '💪', color: '#14b8a6', type: 'expense' },
  { id: 'travel', name: 'Perjalanan', icon: '✈️', color: '#6366f1', type: 'expense' },
  { id: 'subscription', name: 'Langganan', icon: '📱', color: '#a855f7', type: 'expense' },
  { id: 'other_expense', name: 'Lainnya', icon: '💸', color: '#94a3b8', type: 'expense' },

  // Pemasukan
  { id: 'salary', name: 'Gaji', icon: '💼', color: '#10b981', type: 'income' },
  { id: 'freelance', name: 'Freelance', icon: '💻', color: '#06b6d4', type: 'income' },
  { id: 'investment', name: 'Investasi', icon: '📈', color: '#f59e0b', type: 'income' },
  { id: 'business', name: 'Bisnis', icon: '🏢', color: '#8b5cf6', type: 'income' },
  { id: 'gift', name: 'Hadiah', icon: '🎁', color: '#ec4899', type: 'income' },
  { id: 'other_income', name: 'Pemasukan Lain', icon: '💰', color: '#34d399', type: 'income' },
]

// Tipe akun
export const ACCOUNT_TYPES = [
  { id: 'bank', name: 'Rekening Bank', icon: '🏦' },
  { id: 'cash', name: 'Uang Tunai', icon: '💵' },
  { id: 'ewallet', name: 'Dompet Digital', icon: '📲' },
  { id: 'credit', name: 'Kartu Kredit', icon: '💳' },
  { id: 'investment', name: 'Investasi', icon: '📊' },
]

// Warna akun
export const ACCOUNT_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e',
  '#f97316', '#f59e0b', '#10b981', '#06b6d4',
  '#3b82f6', '#84cc16',
]

// Format mata uang IDR
export const formatCurrency = (amount, currency = 'IDR') => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

// Format angka singkat (1.2 jt, 500 rb)
export const formatCompact = (amount) => {
  if (Math.abs(amount) >= 1_000_000_000) return `${(amount / 1_000_000_000).toFixed(1)} M`
  if (Math.abs(amount) >= 1_000_000) return `${(amount / 1_000_000).toFixed(1)} Jt`
  if (Math.abs(amount) >= 1_000) return `${(amount / 1_000).toFixed(0)} Rb`
  return String(amount)
}

// Nama bulan Bahasa Indonesia
export const MONTHS_ID = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
]

// Tipe transaksi
export const TRANSACTION_TYPES = [
  { id: 'expense', name: 'Pengeluaran', color: '#f43f5e' },
  { id: 'income', name: 'Pemasukan', color: '#10b981' },
  { id: 'transfer', name: 'Transfer', color: '#6366f1' },
]
