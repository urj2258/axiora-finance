import { 
  Project, ProjectPayment, 
  ProjectDeveloper, DeveloperPayment, PersonalExpense, Loan, LoanPayment 
} from '@/types'

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: 'PKR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount).replace('PKR', 'Rs.')
}

export function calculateSummary(transactions: any[]): any {
  const revenue = transactions.filter(t => t.type === 'revenue').reduce((sum, t) => sum + Number(t.amount), 0)
  const expenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + Number(t.amount), 0)
  return {
    revenue,
    expenses,
    remaining: revenue - expenses
  }
}

export interface ProjectFinancials {
  contractAmount: number
  received: number
  remaining: number
  developerCost: number
  otherExpenses: number
  charity: number
  estimatedProfit: number
}

export function calculateProjectFinancials(
  project: Project,
  payments: ProjectPayment[],
  projectDevs: ProjectDeveloper[],
  devPayments: DeveloperPayment[], // To track paid vs agreed? We only need agreed for project cost, or maybe paid? The prompt said "Developer Cost". Usually that means agreed amount.
  expenses: any[]
): ProjectFinancials {
  const contractAmount = project.contract_amount || 0
  const received = payments.reduce((sum, p) => sum + Number(p.amount), 0)
  const remaining = contractAmount - received
  
  const developerCost = projectDevs.reduce((sum, d) => sum + Number(d.agreed_amount), 0)
  const otherExpenses = expenses.filter(e => e.type === 'expense').reduce((sum, e) => sum + Number(e.amount), 0)

  // Charity calculation
  let charity = 0
  if (project.charity_enabled && project.charity_percentage) {
    const pct = project.charity_percentage / 100
    if (project.charity_basis === 'contract') {
      charity = contractAmount * pct
    } else if (project.charity_basis === 'received') {
      charity = received * pct
    } else if (project.charity_basis === 'profit') {
      // rough profit before charity
      const roughProfit = received - developerCost - otherExpenses
      if (roughProfit > 0) charity = roughProfit * pct
    }
  }

  const estimatedProfit = contractAmount - developerCost - otherExpenses - charity

  return {
    contractAmount,
    received,
    remaining,
    developerCost,
    otherExpenses,
    charity,
    estimatedProfit
  }
}

export function calculateDeveloperPayables(
  assignments: ProjectDeveloper[],
  payments: DeveloperPayment[]
) {
  const agreed = assignments.reduce((sum, a) => sum + Number(a.agreed_amount), 0)
  const paid = payments.reduce((sum, p) => sum + Number(p.amount), 0)
  return {
    agreed,
    paid,
    remaining: agreed - paid
  }
}

export function calculateUdharSummary(loans: Loan[], payments: LoanPayment[]) {
  const totalGiven = loans.reduce((sum, l) => sum + Number(l.amount_given), 0)
  const totalReturned = payments.reduce((sum, p) => sum + Number(p.amount_returned), 0)
  return {
    totalGiven,
    totalReturned,
    remaining: totalGiven - totalReturned
  }
}
