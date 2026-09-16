import React from 'react'
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer'
import { Agency, Client, Project, Transaction } from '@/types'
import { calculateSummary } from '@/utils/format'

// Format currency for PDF (since Intl.NumberFormat might behave differently in node/pdf environments without polyfills, a simple formatter is safer)
const formatCurrencyPDF = (amount: number) => {
  return `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

// Create styles
const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: '#ffffff',
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 30,
    borderBottomWidth: 2,
    borderBottomColor: '#1e293b',
    paddingBottom: 15,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0f172a',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 5,
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    backgroundColor: '#f8fafc',
    padding: 15,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  summaryBox: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 10,
    color: '#64748b',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  summaryValueGreen: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#16a34a',
    marginTop: 4,
  },
  summaryValueRed: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#dc2626',
    marginTop: 4,
  },
  agencyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    borderBottomWidth: 1.5,
    borderBottomColor: '#0f172a',
    paddingBottom: 5,
    marginTop: 20,
    marginBottom: 15,
  },
  agencyName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  clientName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#334155',
    marginTop: 15,
    marginBottom: 10,
    marginLeft: 10,
  },
  table: {
    display: 'flex',
    flexDirection: 'column',
    width: 'auto',
    marginBottom: 20,
    marginLeft: 10,
  },
  tableRowHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#cbd5e1',
    backgroundColor: '#f1f5f9',
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  tableColProject: { width: '40%' },
  tableColRev: { width: '20%', textAlign: 'right' },
  tableColExp: { width: '20%', textAlign: 'right' },
  tableColProfit: { width: '20%', textAlign: 'right' },
  tableCellHeader: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#475569',
  },
  tableCell: {
    fontSize: 10,
    color: '#334155',
  },
  tableCellGreen: {
    fontSize: 10,
    color: '#16a34a',
  },
  tableCellRed: {
    fontSize: 10,
    color: '#dc2626',
  },
  tableCellBold: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  transactionsTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#64748b',
    marginTop: 8,
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  transactionRow: {
    flexDirection: 'row',
    paddingVertical: 3,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    marginLeft: 15,
  },
  txDate: { width: '20%', fontSize: 9, color: '#94a3b8' },
  txDesc: { width: '60%', fontSize: 9, color: '#475569' },
  txAmount: { width: '20%', fontSize: 9, textAlign: 'right' },
  pageNumber: {
    position: 'absolute',
    fontSize: 10,
    bottom: 30,
    left: 0,
    right: 0,
    textAlign: 'center',
    color: '#94a3b8',
  },
})

interface FinancialReportPDFProps {
  agencies: Agency[]
  clients: Client[]
  projects: Project[]
  transactions: Transaction[]
}

export function FinancialReportPDF({ agencies, clients, projects, transactions }: FinancialReportPDFProps) {
  const grandTotal = calculateSummary(transactions)

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Axiora Finance</Text>
          <Text style={styles.subtitle}>Financial Report • Generated {new Date().toLocaleDateString()}</Text>
        </View>

        {/* Global Summary */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryBox}>
            <Text style={styles.summaryLabel}>Total Net Income</Text>
            <Text style={styles.summaryValue}>{formatCurrencyPDF(grandTotal.remaining)}</Text>
          </View>
          <View style={{ ...styles.summaryBox, alignItems: 'flex-end' }}>
            <Text style={styles.summaryValueGreen}>+ {formatCurrencyPDF(grandTotal.revenue)} Rev</Text>
            <Text style={styles.summaryValueRed}>- {formatCurrencyPDF(grandTotal.expenses)} Exp</Text>
          </View>
        </View>

        {/* Agencies */}
        {agencies.map((agency, index) => {
          const agencyClients = clients.filter(c => c.agency_id === agency.id)
          const agencyClientIds = agencyClients.map(c => c.id)
          const agencyProjects = projects.filter(p => agencyClientIds.includes(p.client_id))
          const agencyProjectIds = agencyProjects.map(p => p.id)
          const agencyTxs = transactions.filter(t => agencyProjectIds.includes(t.project_id))
          const agencySummary = calculateSummary(agencyTxs)

          if (agencyTxs.length === 0) return null

          return (
            <View key={agency.id} break={index > 0}>
              <View style={styles.agencyHeader}>
                <Text style={styles.agencyName}>{agency.name} Division</Text>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.summaryValue}>{formatCurrencyPDF(agencySummary.remaining)}</Text>
                  <Text style={{ fontSize: 9, color: '#64748b' }}>NET INCOME</Text>
                </View>
              </View>

              {agencyClients.map(client => {
                const clientProjects = agencyProjects.filter(p => p.client_id === client.id)
                const clientProjectIds = clientProjects.map(p => p.id)
                const clientTxs = transactions.filter(t => clientProjectIds.includes(t.project_id))
                
                if (clientTxs.length === 0) return null

                return (
                  <View key={client.id} style={{ marginBottom: 25 }}>
                    <View style={styles.table}>
                      {/* Fixed Header: Repeats on new pages. Keeps Client Name and Column Headers together safely. */}
                      <View style={{ backgroundColor: '#ffffff', paddingBottom: 6 }} fixed>
                        <Text style={{ ...styles.clientName, marginTop: 10, marginBottom: 8, marginLeft: 0 }}>{client.name}</Text>
                        <View style={{ ...styles.tableRowHeader, backgroundColor: '#f1f5f9', borderTopWidth: 1, borderTopColor: '#cbd5e1' }}>
                          <View style={styles.tableColProject}><Text style={styles.tableCellHeader}>Project</Text></View>
                          <View style={styles.tableColRev}><Text style={styles.tableCellHeader}>Revenue</Text></View>
                          <View style={styles.tableColExp}><Text style={styles.tableCellHeader}>Expenses</Text></View>
                          <View style={styles.tableColProfit}><Text style={styles.tableCellHeader}>Profit</Text></View>
                        </View>
                      </View>

                      {/* Projects Rows */}
                      {clientProjects.map(project => {
                        const projectTxs = transactions.filter(t => t.project_id === project.id)
                        if (projectTxs.length === 0) return null
                        const pSummary = calculateSummary(projectTxs)

                        const pRevs = projectTxs.filter(t => t.type === 'revenue')
                        const pExps = projectTxs.filter(t => t.type === 'expense')

                        return (
                          <View key={project.id} style={{ marginBottom: 15 }}>
                            {/* Project Header + First Revenue (or Expense) wrapped together to prevent widowed headings */}
                            <View wrap={false}>
                              <View style={styles.tableRow}>
                                <View style={styles.tableColProject}><Text style={styles.tableCellBold}>{project.name}</Text></View>
                                <View style={styles.tableColRev}><Text style={styles.tableCellGreen}>{formatCurrencyPDF(pSummary.revenue)}</Text></View>
                                <View style={styles.tableColExp}><Text style={styles.tableCellRed}>{formatCurrencyPDF(pSummary.expenses)}</Text></View>
                                <View style={styles.tableColProfit}><Text style={styles.tableCellBold}>{formatCurrencyPDF(pSummary.remaining)}</Text></View>
                              </View>
                              
                              <View style={{ paddingVertical: 4, paddingHorizontal: 8, backgroundColor: '#fafafa' }}>
                                {pRevs.length > 0 && (
                                  <>
                                    <Text style={styles.transactionsTitle}>Revenue</Text>
                                    {pRevs.slice(0, 1).map(tx => (
                                      <View key={tx.id} style={styles.transactionRow}>
                                        <Text style={styles.txDate}>{new Date(tx.transaction_date).toLocaleDateString()}</Text>
                                        <Text style={styles.txDesc}>{tx.description || 'Revenue'}</Text>
                                        <Text style={{ ...styles.txAmount, color: '#16a34a' }}>{formatCurrencyPDF(tx.amount)}</Text>
                                      </View>
                                    ))}
                                  </>
                                )}
                                {pRevs.length === 0 && pExps.length > 0 && (
                                  <>
                                    <Text style={styles.transactionsTitle}>Expenses</Text>
                                    {pExps.slice(0, 1).map(tx => (
                                      <View key={tx.id} style={styles.transactionRow}>
                                        <Text style={styles.txDate}>{new Date(tx.transaction_date).toLocaleDateString()}</Text>
                                        <Text style={styles.txDesc}>{tx.category || 'Expense'}{tx.description ? ` - ${tx.description}` : ''}</Text>
                                        <Text style={{ ...styles.txAmount, color: '#dc2626' }}>{formatCurrencyPDF(tx.amount)}</Text>
                                      </View>
                                    ))}
                                  </>
                                )}
                              </View>
                            </View>
                            
                            {/* Rest of transactions flow naturally */}
                            <View style={{ paddingHorizontal: 8, backgroundColor: '#fafafa', paddingBottom: 4 }}>
                              {pRevs.length > 1 && pRevs.slice(1).map(tx => (
                                <View key={tx.id} style={styles.transactionRow} wrap={false}>
                                  <Text style={styles.txDate}>{new Date(tx.transaction_date).toLocaleDateString()}</Text>
                                  <Text style={styles.txDesc}>{tx.description || 'Revenue'}</Text>
                                  <Text style={{ ...styles.txAmount, color: '#16a34a' }}>{formatCurrencyPDF(tx.amount)}</Text>
                                </View>
                              ))}
                              
                              {pExps.length > 0 && (
                                <>
                                  {pRevs.length > 0 && (
                                    <View wrap={false}>
                                      <Text style={styles.transactionsTitle}>Expenses</Text>
                                      {pExps.slice(0, 1).map(tx => (
                                        <View key={tx.id} style={styles.transactionRow}>
                                          <Text style={styles.txDate}>{new Date(tx.transaction_date).toLocaleDateString()}</Text>
                                          <Text style={styles.txDesc}>{tx.category || 'Expense'}{tx.description ? ` - ${tx.description}` : ''}</Text>
                                          <Text style={{ ...styles.txAmount, color: '#dc2626' }}>{formatCurrencyPDF(tx.amount)}</Text>
                                        </View>
                                      ))}
                                    </View>
                                  )}
                                  
                                  {(pRevs.length > 0 ? pExps.slice(1) : pExps.slice(1)).map(tx => (
                                    <View key={tx.id} style={styles.transactionRow} wrap={false}>
                                      <Text style={styles.txDate}>{new Date(tx.transaction_date).toLocaleDateString()}</Text>
                                      <Text style={styles.txDesc}>{tx.category || 'Expense'}{tx.description ? ` - ${tx.description}` : ''}</Text>
                                      <Text style={{ ...styles.txAmount, color: '#dc2626' }}>{formatCurrencyPDF(tx.amount)}</Text>
                                    </View>
                                  ))}
                                </>
                              )}
                            </View>
                          </View>
                        )
                      })}
                    </View>
                  </View>
                )
              })}
            </View>
          )
        })}
        
        {/* Footer with Page Numbers */}
        <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => (
          `Page ${pageNumber} of ${totalPages}`
        )} fixed />
      </Page>
    </Document>
  )
}
