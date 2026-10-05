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

  const StatCard = ({ title, value, subtitle, icon: Icon, colorClass }: any) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-start gap-4">
      <div className={`p-3 rounded-xl ${colorClass}`}>
        <Icon size={24} />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-gray-900">Rs. {value.toLocaleString()}</h3>
        {subtitle && <p className="text-sm text-gray-400 mt-1">{subtitle}</p>}
      </div>
    </div>
  )

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">Your financial overview</p>
        </div>
      </div>

      {/* TOP CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard 
          title="Current Money / Cash Available" 
          value={currentMoney} 
          icon={Wallet} 
          colorClass="bg-blue-100 text-blue-600" 
        />
        <StatCard 
          title="Total Development Profit" 
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

      {/* OVERVIEW SECTIONS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* MONEY COMING IN */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center gap-3">
            <div className="p-2 bg-green-100 text-green-600 rounded-lg">
              <ArrowUpRight size={20} />
            </div>
            <h2 className="text-lg font-bold text-gray-900">Money Coming In</h2>
          </div>
          <div className="p-6 space-y-6">
            <div>
              <div className="flex justify-between items-end mb-2">
                <span className="text-gray-600 font-medium">Development Remaining</span>
                <span className="text-xl font-bold text-gray-900">Rs. {devRemainingToReceive.toLocaleString()}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: `${Math.min(100, (totalDevReceived / totalProjectValue) * 100 || 0)}%` }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-end mb-2">
                <span className="text-gray-600 font-medium">Marketing Remaining (This Month)</span>
                <span className="text-xl font-bold text-gray-900">Rs. {marketingRemainingThisMonth.toLocaleString()}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: `${Math.min(100, (marketingThisMonth / expectedMarketingThisMonth) * 100 || 0)}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* MONEY GOING OUT */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex items-center gap-3">
            <div className="p-2 bg-red-100 text-red-600 rounded-lg">
              <ArrowDownRight size={20} />
            </div>
            <h2 className="text-lg font-bold text-gray-900">Money Going Out</h2>
          </div>
          <div className="p-6 space-y-6">
            <div className="flex justify-between items-center py-2 border-b border-gray-50">
              <span className="text-gray-600 font-medium">Developer Payments Remaining</span>
              <span className="text-xl font-bold text-orange-600">Rs. {devPaymentsRemaining.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-50">
              <span className="text-gray-600 font-medium">Personal Expenses (Total)</span>
              <span className="text-xl font-bold text-gray-900">Rs. {totalPersonalSpent.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600 font-medium">Loans Given (Outstanding)</span>
              <span className="text-xl font-bold text-gray-900">Rs. {loansOutstanding.toLocaleString()}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
