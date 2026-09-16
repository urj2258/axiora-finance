import { formatCurrency } from '@/utils/format'
import { FinancialSummary } from '@/types'

interface SummaryCardProps {
  title: string
  summary: FinancialSummary
  actionLabel?: string
  actionHref?: string
  editHref?: string
}

export function SummaryCard({ title, summary, actionLabel, actionHref, editHref }: SummaryCardProps) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col relative">
      {editHref && (
        <a href={editHref} className="absolute top-6 right-6 text-sm text-gray-400 hover:text-gray-900">
          Edit
        </a>
      )}
      <h3 className="text-lg font-bold text-gray-900 mb-6 uppercase tracking-wider pr-8">{title}</h3>
      <div className="space-y-4 mb-8 flex-1">
        <div className="flex justify-between items-center pb-4 border-b border-gray-50">
          <span className="text-gray-500 font-medium">Revenue</span>
          <span className="text-gray-900 font-semibold">{formatCurrency(summary.revenue)}</span>
        </div>
        <div className="flex justify-between items-center pb-4 border-b border-gray-50">
          <span className="text-gray-500 font-medium">Expenses</span>
          <span className="text-red-600 font-semibold">{formatCurrency(summary.expenses)}</span>
        </div>
        <div className="flex justify-between items-center pt-2">
          <span className="text-gray-900 font-bold">Remaining</span>
          <span className={`font-bold ${summary.remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(summary.remaining)}
          </span>
        </div>
      </div>
      {actionLabel && actionHref && (
        <a 
          href={actionHref}
          className="block w-full text-center py-2.5 px-4 border border-gray-200 text-sm font-medium rounded-lg text-gray-700 bg-gray-50 hover:bg-gray-100 transition-colors"
        >
          {actionLabel}
        </a>
      )}
    </div>
  )
}
