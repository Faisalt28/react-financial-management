export type Bindings = {
  DB: D1Database
  JWT_SECRET: string
  RESEND_API_KEY?: string
  EMAIL_FROM?: string
}

export type Variables = {
  userId: string
}

export interface User {
  id: string
  name: string
  email: string
  password_hash: string
  avatar?: string | null
  created_at: string
}

export interface Account {
  id: string
  user_id: string
  name: string
  type: string
  balance: number
  color: string
  icon: string
  created_at: string
}

export interface Transaction {
  id: string
  user_id: string
  type: 'income' | 'expense' | 'transfer'
  category_id: string
  account_id: string
  to_account_id?: string | null
  amount: number
  date: string
  note?: string | null
  description?: string | null
  created_at: string
}

export interface Budget {
  id: string
  user_id: string
  category_id: string
  month: number
  year: number
  amount: number
  created_at: string
}

export interface Goal {
  id: string
  user_id: string
  name: string
  target_amount: number
  current_amount: number
  deadline?: string | null
  color: string
  icon: string
  status: 'active' | 'completed' | 'cancelled'
  created_at: string
}
