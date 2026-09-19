const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8787'

function getToken(): string | null {
  return localStorage.getItem('ff_token')
}

export function setToken(token: string) {
  localStorage.setItem('ff_token', token)
}

export function removeToken() {
  localStorage.removeItem('ff_token')
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const url = `${API_BASE}${endpoint}`
  const res = await fetch(url, {
    ...options,
    headers,
  })

  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    throw new Error(data.error || 'Terjadi kesalahan pada server')
  }

  return data as T
}

export const api = {
  // Auth
  auth: {
    register: (name: string, email: string, password: string) =>
      request<{ user: any; token: string }>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
      }),
    login: (email: string, password: string) =>
      request<{ user: any; token: string }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),
    me: () => request<{ user: any }>('/api/auth/me'),
    updateProfile: (data: { name: string; avatar?: string | null }) =>
      request<{ user: any }>('/api/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    updatePassword: (currentPassword: string, newPassword: string) =>
      request<{ success: boolean; message: string }>('/api/auth/password', {
        method: 'PUT',
        body: JSON.stringify({ currentPassword, newPassword }),
      }),
    forgotPassword: (email: string) =>
      request<{ success: boolean; message: string; devOtp?: string }>('/api/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      }),
    resetPassword: (email: string, otp: string, newPassword: string) =>
      request<{ success: boolean; message: string }>('/api/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ email, otp, newPassword }),
      }),
  },

  // Accounts (Wallets)
  accounts: {
    getAll: () => request<{ accounts: any[] }>('/api/accounts'),
    create: (data: any) =>
      request<{ account: any }>('/api/accounts', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: any) =>
      request<{ account: any }>(`/api/accounts/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      request<{ success: boolean }>(`/api/accounts/${id}`, {
        method: 'DELETE',
      }),
  },

  // Transactions
  transactions: {
    getAll: (params: Record<string, string> = {}) => {
      const qs = new URLSearchParams(params).toString()
      return request<{ transactions: any[] }>(`/api/transactions${qs ? `?${qs}` : ''}`)
    },
    create: (data: any) =>
      request<{ transaction: any }>('/api/transactions', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: any) =>
      request<{ transaction: any }>(`/api/transactions/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      request<{ success: boolean }>(`/api/transactions/${id}`, {
        method: 'DELETE',
      }),
  },

  // Budgets
  budgets: {
    getAll: (month?: number, year?: number) => {
      const params: Record<string, string> = {}
      if (month !== undefined) params.month = String(month)
      if (year !== undefined) params.year = String(year)
      const qs = new URLSearchParams(params).toString()
      return request<{ budgets: any[] }>(`/api/budgets${qs ? `?${qs}` : ''}`)
    },
    create: (data: any) =>
      request<{ budget: any }>('/api/budgets', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: any) =>
      request<{ budget: any }>(`/api/budgets/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      request<{ success: boolean }>(`/api/budgets/${id}`, {
        method: 'DELETE',
      }),
  },

  // Goals
  goals: {
    getAll: () => request<{ goals: any[] }>('/api/goals'),
    create: (data: any) =>
      request<{ goal: any }>('/api/goals', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    update: (id: string, data: any) =>
      request<{ goal: any }>(`/api/goals/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),
    delete: (id: string) =>
      request<{ success: boolean }>(`/api/goals/${id}`, {
        method: 'DELETE',
      }),
  },

  // Settings
  settings: {
    resetData: () =>
      request<{ success: boolean; message: string }>('/api/settings/reset', {
        method: 'POST',
      }),
  },
}
