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
  profession?: string
  monthly_amount?: number
  payment_schedule?: number
  is_active?: boolean
  created_at: string
  updated_at: string
}

export type MarketingPayment = {
  id: string
  client_id: string
  amount: number
  payment_date: string
  month_year: string // e.g., '2026-10'
  notes?: string
  created_at: string
}

export type Project = {
  id: string
  client_id: string
  name: string
  description: string | null
  contract_amount: number | null
  charity_enabled: boolean
  charity_percentage: number | null
  charity_basis: 'contract' | 'received' | 'profit'
  created_at: string
  updated_at: string
}

export type ProjectPayment = {
  id: string
  project_id: string
  amount: number
  payment_date: string
  method: string | null
  notes: string | null
  created_at: string
}

export type Developer = {
  id: string
  name: string
  phone: string | null
  role: string | null
  status: 'active' | 'inactive'
  notes: string | null
  created_at: string
}

export type ProjectDeveloper = {
  id: string
  project_id: string
  developer_id: string
  developer_name?: string
  agreed_amount: number
  created_at: string
}

export type DeveloperPayment = {
  id: string
  developer_id: string
  project_id: string
  amount: number
  payment_date: string
  payment_type?: 'advance' | 'payment'
  method: string | null
  notes: string | null
  created_at: string
}

export type PersonalExpense = {
  id: string
  amount: number
  category: string
  description: string | null
  expense_date: string
  method: string | null
  created_at: string
}

export type LoanStatus = 'active' | 'partially_paid' | 'fully_paid' | 'overdue'

export type Loan = {
  id: string
  person_name: string
  amount_given: number
  date_given: string
  expected_return_date: string | null
  notes: string | null
  status: LoanStatus
  created_at: string
}

export type LoanPayment = {
  id: string
  loan_id: string
  amount_returned: number
  payment_date: string
  notes: string | null
  created_at: string
}

export type Setting = {
  id: string
  key: string
  value: string
  updated_at: string
}

export type User = {
  id: string
  username: string
  password_hash: string
  created_at: string
}

