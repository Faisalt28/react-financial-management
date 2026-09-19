import Dexie from 'dexie'

export const db = new Dexie('FinanceFlowDB')

db.version(1).stores({
  transactions: '++id, type, categoryId, accountId, toAccountId, date, amount, createdAt',
  accounts: '++id, name, type, createdAt',
  budgets: '++id, categoryId, month, year, amount',
  goals: '++id, name, targetAmount, currentAmount, deadline, status, createdAt',
  categories: '++id, name, icon, color, type',
})

db.version(2).stores({
  transactions: '++id, userId, type, categoryId, accountId, toAccountId, date, amount, createdAt',
  accounts: '++id, userId, name, type, createdAt',
  budgets: '++id, userId, categoryId, month, year, amount',
  goals: '++id, userId, name, targetAmount, currentAmount, deadline, status, createdAt',
  categories: '++id, name, icon, color, type',
})

// Seed data akun default khusus untuk setiap user baru (hanya Uang Tunai dengan saldo 0)
export async function seedDefaultData(userId) {
  if (!userId) return
  const userAccountCount = await db.accounts.where('userId').equals(userId).count()
  if (userAccountCount === 0) {
    await db.accounts.add({
      name: 'Uang Tunai',
      type: 'cash',
      balance: 0,
      color: '#10b981',
      icon: '💵',
      userId,
      createdAt: new Date().toISOString()
    })
  }
}
