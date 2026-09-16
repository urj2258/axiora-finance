import { FinancialSummary, Transaction } from '@/types'

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount).replace('PKR', 'Rs.')
}

export function calculateSummary(transactions: Transaction[]): FinancialSummary {
  const revenue = transactions.filter(t => t.type === 'revenue').reduce((sum, t) => sum + Number(t.amount), 0)
  const expenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0)
  return {
    revenue,
    expenses,
    remaining: revenue - expenses
  }
}
