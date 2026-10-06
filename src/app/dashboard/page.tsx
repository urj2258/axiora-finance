'use client'

import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import { ArrowDownRight, ArrowUpRight, Wallet, TrendingUp, Users, Smartphone, Code2 } from 'lucide-react'

export default function Dashboard() {
  const projectPayments = useLiveQuery(() => db.project_payments.toArray())
  const marketingPayments = useLiveQuery(() => db.marketing_payments.toArray())
  const developerPayments = useLiveQuery(() => db.developer_payments.toArray())
  const personalExpenses = useLiveQuery(() => db.personal_expenses.toArray())
  const loans = useLiveQuery(() => db.loans.toArray())
  const loanPayments = useLiveQuery(() => db.loan_payments.toArray())
  const projects = useLiveQuery(() => db.projects.toArray())
  const projectDevelopers = useLiveQuery(() => db.project_developers.toArray())
  const clients = useLiveQuery(() => db.clients.toArray())

  if (!projectPayments || !marketingPayments || !developerPayments || !personalExpenses || !loans || !loanPayments || !projects || !projectDevelopers || !clients) {
    return null
  }

  // Calculate actual money received
  const totalDevReceived = projectPayments.reduce((sum, p) => sum + p.amount, 0)
  const totalMarketingReceived = marketingPayments.reduce((sum, p) => sum + p.amount, 0)
  const totalLoansReturned = loanPayments.reduce((sum, p) => sum + p.amount_returned, 0)
  
  const totalReceived = totalDevReceived + totalMarketingReceived + totalLoansReturned

  // Calculate actual money spent
  const totalDevPaid = developerPayments.reduce((sum, p) => sum + p.amount, 0)
  const totalPersonalSpent = personalExpenses.reduce((sum, e) => sum + e.amount, 0)
  const totalLoansGiven = loans.reduce((sum, l) => sum + l.amount_given, 0)
  
  const totalSpent = totalDevPaid + totalPersonalSpent + totalLoansGiven

  // 1. Current Money
  const currentMoney = totalReceived - totalSpent

  // 2. Development Profit & Developer Remaining
  let totalProjectValue = 0
  let totalDeveloperCost = 0
  projects.forEach(p => {
    totalProjectValue += p.contract_amount || 0
    const devs = projectDevelopers.filter(pd => pd.project_id === p.id)
    devs.forEach(d => {
      totalDeveloperCost += d.agreed_amount
    })
  })
  const totalDevProfit = totalProjectValue - totalDeveloperCost
  const devPaymentsRemaining = totalDeveloperCost - totalDevPaid
  const devRemainingToReceive = totalProjectValue - totalDevReceived

  // 3. Marketing This Month
  const d = new Date()
  const currentMonth = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
  const marketingThisMonth = marketingPayments
    .filter(p => p.month_year === currentMonth)
    .reduce((sum, p) => sum + p.amount, 0)
    
  const activeMarketingClients = clients.filter(c => c.is_active !== false && c.monthly_amount)
  const expectedMarketingThisMonth = activeMarketingClients.reduce((sum, c) => sum + (c.monthly_amount || 0), 0)
  const marketingRemainingThisMonth = expectedMarketingThisMonth - marketingThisMonth

  // 4. Loans Outstanding
  const loansOutstanding = totalLoansGiven - totalLoansReturned

  // 5. Net Profit
  const netProfitAfterExpenses = totalDevProfit - totalPersonalSpent

  const StatCard = ({ title, value, subtitle, icon: Icon, colorClass }: any) => (
    <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-4">
      <div className={`p-3 rounded-xl flex-shrink-0 ${colorClass}`}>
        <Icon size={24} className="w-5 h-5 md:w-6 md:h-6" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-medium text-gray-500 mb-1 truncate">{title}</p>
        <h3 className="text-xl md:text-2xl font-bold text-gray-900 break-words">Rs. {value.toLocaleString()}</h3>
        {subtitle && <p className="text-xs md:text-sm text-gray-400 mt-1">{subtitle}</p>}
      </div>
    </div>
  )

  return (
    <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm md:text-base text-gray-500 mt-1">Your financial overview</p>
        </div>
      </div>

      {/* TOP CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        <StatCard 
          title="Current Money / Cash Available" 
          value={currentMoney} 
          icon={Wallet} 
          colorClass="bg-blue-100 text-blue-600" 
        />
        <StatCard 
          title="Total Development Expected Profit" 
          value={totalDevProfit} 
          icon={TrendingUp} 
          colorClass="bg-green-100 text-green-600" 
        />
        <StatCard 
          title="Marketing Received This Month" 
          value={marketingThisMonth} 
          subtitle={`Remaining: Rs. ${marketingRemainingThisMonth.toLocaleString()}`}
          icon={Smartphone} 
          colorClass="bg-purple-100 text-purple-600" 
        />
        <StatCard 
          title="Developer Amount Remaining" 
          value={devPaymentsRemaining} 
          icon={Code2} 
          colorClass="bg-orange-100 text-orange-600" 
        />
        <StatCard 
          title="Personal Expenses Total" 
          value={totalPersonalSpent} 
          icon={ArrowDownRight} 
          colorClass="bg-red-100 text-red-600" 
        />
        <StatCard 
          title="Money Given as Loans" 
          value={loansOutstanding} 
          icon={Users} 
          colorClass="bg-yellow-100 text-yellow-600" 
        />
      </div>

      {/* NET PROFIT BREAKDOWN CARD */}
      <div className="bg-white p-4 md:p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-4">Net Profit After Personal Expenses</h2>
        
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
          <div className="space-y-3 flex-grow w-full md:w-auto">
            <div className="flex justify-between items-center text-sm md:text-base">
              <span className="text-gray-600">Development Expected Profit</span>
              <span className="font-semibold text-gray-900">Rs. {totalDevProfit.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-sm md:text-base border-b border-gray-100 pb-3">
              <span className="text-gray-600">Less: Personal Expenses</span>
              <span className="font-semibold text-red-600">- Rs. {totalPersonalSpent.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center text-base md:text-lg pt-1">
              <span className="font-bold text-gray-900">Net Profit</span>
              <span className="font-bold text-green-600">Rs. {netProfitAfterExpenses.toLocaleString()}</span>
            </div>
          </div>
          
          <div className="bg-blue-50 p-4 rounded-xl text-sm text-blue-800 w-full md:max-w-xs xl:max-w-sm">
            <p><strong>Note:</strong> Personal expenses reduce your net profit, while loans are tracked separately because they are expected to be returned.</p>
          </div>
        </div>
      </div>

      {/* OVERVIEW SECTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        
        {/* MONEY COMING IN */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 md:p-6 border-b border-gray-100 flex items-center gap-3">
            <div className="p-2 bg-green-100 text-green-600 rounded-lg flex-shrink-0">
              <ArrowUpRight className="w-4 h-4 md:w-5 md:h-5" />
            </div>
            <h2 className="text-base md:text-lg font-bold text-gray-900">Money Coming In</h2>
          </div>
          <div className="p-4 md:p-6 space-y-6">
            <div>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end mb-2 gap-1">
                <span className="text-sm md:text-base text-gray-600 font-medium">Development Remaining</span>
                <span className="text-lg md:text-xl font-bold text-gray-900">Rs. {devRemainingToReceive.toLocaleString()}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: `${Math.min(100, (totalDevReceived / totalProjectValue) * 100 || 0)}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end mb-2 gap-1">
                <span className="text-sm md:text-base text-gray-600 font-medium">Marketing Remaining (This Month)</span>
                <span className="text-lg md:text-xl font-bold text-gray-900">Rs. {marketingRemainingThisMonth.toLocaleString()}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: `${Math.min(100, (marketingThisMonth / expectedMarketingThisMonth) * 100 || 0)}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* MONEY GOING OUT */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 md:p-6 border-b border-gray-100 flex items-center gap-3">
            <div className="p-2 bg-red-100 text-red-600 rounded-lg flex-shrink-0">
              <ArrowDownRight className="w-4 h-4 md:w-5 md:h-5" />
            </div>
            <h2 className="text-base md:text-lg font-bold text-gray-900">Money Going Out</h2>
          </div>
          <div className="p-4 md:p-6 space-y-4 md:space-y-6">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 border-b border-gray-50 gap-1">
              <span className="text-sm md:text-base text-gray-600 font-medium">Developer Payments Remaining</span>
              <span className="text-lg md:text-xl font-bold text-orange-600">Rs. {devPaymentsRemaining.toLocaleString()}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 border-b border-gray-50 gap-1">
              <span className="text-sm md:text-base text-gray-600 font-medium">Personal Expenses (Total)</span>
              <span className="text-lg md:text-xl font-bold text-gray-900">Rs. {totalPersonalSpent.toLocaleString()}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-2 gap-1">
              <span className="text-sm md:text-base text-gray-600 font-medium">Loans Given (Outstanding)</span>
              <span className="text-lg md:text-xl font-bold text-gray-900">Rs. {loansOutstanding.toLocaleString()}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
