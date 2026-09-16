export type Agency = {
  id: string
  name: string
  created_at: string
}

export type Client = {
  id: string
  agency_id: string
  name: string
  notes: string | null
  created_at: string
  updated_at: string
}

export type Project = {
  id: string
  client_id: string
  name: string
  description: string | null
  created_at: string
  updated_at: string
}

export type TransactionType = 'revenue' | 'expense'

export type Transaction = {
  id: string
  project_id: string
  type: TransactionType
  amount: number
  category: string | null
  description: string | null
  transaction_date: string
  created_at: string
  updated_at: string
}

export type FinancialSummary = {
  revenue: number
  expenses: number
  remaining: number
}

export type Setting = {
  id: string
  key: string
  value: string
  updated_at: string
}
