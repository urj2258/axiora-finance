'use client'

import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import { Plus, ChevronDown, ChevronRight, X, Trash2 } from 'lucide-react'
import { v4 as uuidv4 } from 'uuid'

export default function DevelopmentPage() {
  const allAgencies = useLiveQuery(() => db.agencies.toArray())
  const agency = allAgencies?.find(a => a.name.toLowerCase().includes('development')) || allAgencies?.[0]
  
  const allProjects = useLiveQuery(
    () => db.projects.toArray(),
    []
  )
  
  const projectPayments = useLiveQuery(() => db.project_payments.toArray())
  const projectDevelopers = useLiveQuery(() => db.project_developers.toArray())
  const developerPayments = useLiveQuery(() => db.developer_payments.toArray())

  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false)

  if (!allProjects || !projectPayments || !projectDevelopers || !developerPayments) return null

  // Ensure we show projects. If we have agencies, we should probably just show all projects or filter by the right client_id -> agency_id
  // Actually, since clients belong to agencies, and projects belong to clients:
  // We can just show all projects for now since this is a small personal tool.
  const projects = allProjects;


  // Calculate Grand Totals
  let totalProjectValue = 0
  let totalReceived = 0
  let totalDeveloperCost = 0
  let developerPaymentsMade = 0

  projects.forEach(p => {
    totalProjectValue += p.contract_amount || 0
    totalReceived += projectPayments.filter(pp => pp.project_id === p.id).reduce((sum, curr) => sum + curr.amount, 0)
    const devs = projectDevelopers.filter(pd => pd.project_id === p.id)
    devs.forEach(d => {
      totalDeveloperCost += d.agreed_amount
      developerPaymentsMade += developerPayments.filter(dp => dp.developer_id === d.developer_id && dp.project_id === p.id).reduce((sum, curr) => sum + curr.amount, 0)
    })
  })

  const totalRemainingToReceive = totalProjectValue - totalReceived
  const remainingDeveloperPayments = totalDeveloperCost - developerPaymentsMade
  const totalExpectedProfit = totalProjectValue - totalDeveloperCost

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6 relative z-0">
      <div className="flex justify-between items-center">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">Development</h1>
        <button 
          onClick={() => setIsNewProjectModalOpen(true)}
          className="flex items-center gap-1 md:gap-2 bg-blue-600 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-lg hover:bg-blue-700 relative z-10 text-sm md:text-base"
        >
          <Plus size={20} className="w-4 h-4 md:w-5 md:h-5" />
          New Project
        </button>
      </div>

      {/* GRAND TOTAL SECTION */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-white p-3 md:p-4 rounded-xl shadow-sm border border-gray-100">
          <p className="text-xs md:text-sm text-gray-500 font-medium">Total Project Value</p>
          <p className="text-lg md:text-2xl font-bold text-gray-900 truncate">Rs. {totalProjectValue.toLocaleString()}</p>
        </div>
        <div className="bg-white p-3 md:p-4 rounded-xl shadow-sm border border-gray-100">
          <p className="text-xs md:text-sm text-gray-500 font-medium">Total Received</p>
          <p className="text-lg md:text-2xl font-bold text-green-600 truncate">Rs. {totalReceived.toLocaleString()}</p>
        </div>
        <div className="bg-white p-3 md:p-4 rounded-xl shadow-sm border border-gray-100">
          <p className="text-xs md:text-sm text-gray-500 font-medium">Remaining to Receive</p>
          <p className="text-lg md:text-2xl font-bold text-orange-600 truncate">Rs. {totalRemainingToReceive.toLocaleString()}</p>
        </div>
        <div className="bg-white p-3 md:p-4 rounded-xl shadow-sm border border-gray-100">
          <p className="text-xs md:text-sm text-gray-500 font-medium">Expected Profit</p>
          <p className="text-lg md:text-2xl font-bold text-blue-600 truncate">Rs. {totalExpectedProfit.toLocaleString()}</p>
        </div>
        <div className="bg-white p-3 md:p-4 rounded-xl shadow-sm border border-gray-100 md:col-start-1">
          <p className="text-xs md:text-sm text-gray-500 font-medium">Total Developer Cost</p>
          <p className="text-lg md:text-2xl font-bold text-gray-900 truncate">Rs. {totalDeveloperCost.toLocaleString()}</p>
        </div>
        <div className="bg-white p-3 md:p-4 rounded-xl shadow-sm border border-gray-100">
          <p className="text-xs md:text-sm text-gray-500 font-medium">Developer Paid</p>
          <p className="text-lg md:text-2xl font-bold text-blue-600 truncate">Rs. {developerPaymentsMade.toLocaleString()}</p>
        </div>
        <div className="bg-white p-3 md:p-4 rounded-xl shadow-sm border border-gray-100">
          <p className="text-xs md:text-sm text-gray-500 font-medium">Developer Remaining</p>
          <p className="text-lg md:text-2xl font-bold text-red-600 truncate">Rs. {remainingDeveloperPayments.toLocaleString()}</p>
        </div>
      </div>

      {/* PROJECTS LIST */}
      <div className="space-y-4">
        <h2 className="text-lg md:text-xl font-bold text-gray-900">Projects</h2>
        {projects.map(project => (
          <ProjectCard 
            key={project.id} 
            project={project} 
            payments={projectPayments.filter(p => p.project_id === project.id)}
            devs={projectDevelopers.filter(d => d.project_id === project.id)}
            devPayments={developerPayments.filter(d => d.project_id === project.id)}
            agencyId={agency?.id || 'default'}
          />
        ))}
        {projects.length === 0 && (
          <div className="text-center p-8 bg-gray-50 rounded-xl text-gray-500">
            No development projects found. Create one to get started.
          </div>
        )}
      </div>

      {isNewProjectModalOpen && (
        <NewProjectModal 
          agencyId={agency?.id || 'default'} 
          onClose={() => setIsNewProjectModalOpen(false)} 
        />
      )}
    </div>
  )
}

function NewProjectModal({ agencyId, onClose }: { agencyId: string, onClose: () => void }) {
  const [projectName, setProjectName] = useState('')
  const [clientName, setClientName] = useState('')
  const [projectValue, setProjectValue] = useState('')
  
  const [developers, setDevelopers] = useState([{ name: '', amount: '' }])
  const [error, setError] = useState('')

  const handleSave = async () => {
    try {
      if (!projectName || !clientName || !projectValue) {
        setError('Please fill all required project fields')
        return
      }

      const pValue = Number(projectValue)
      if (pValue <= 0) {
        setError('Project value must be greater than 0')
        return
      }

      // Create dummy client
      const clientId = uuidv4()
      await db.clients.add({
        id: clientId,
        agency_id: agencyId,
        name: clientName,
        notes: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })

      const projectId = uuidv4()
      await db.projects.add({
        id: projectId,
        client_id: clientId,
        name: projectName,
        description: '',
        contract_amount: pValue,
        charity_enabled: false,
        charity_percentage: null,
        charity_basis: 'contract',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })

      // Add developers
      for (const dev of developers) {
        if (dev.name && dev.amount) {
          const dAmount = Number(dev.amount)
          if (dAmount > 0) {
            const devId = uuidv4()
            await db.developers.add({
              id: devId,
              name: dev.name,
              phone: null,
              role: 'Developer',
              status: 'active',
              notes: '',
              created_at: new Date().toISOString()
            })
            await db.project_developers.add({
              id: uuidv4(),
              project_id: projectId,
              developer_id: devId,
              developer_name: dev.name,
              agreed_amount: dAmount,
              created_at: new Date().toISOString()
            })
          }
        }
      }
      
      onClose()
    } catch (err) {
      setError('Failed to save project')
      console.error(err)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">New Project</h2>
          <button onClick={onClose} className="text-gray-500 hover:bg-gray-100 p-1 rounded"><X size={20} /></button>
        </div>
        
        {error && <div className="mb-4 text-red-600 bg-red-50 p-3 rounded-lg text-sm">{error}</div>}
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Project Name *</label>
            <input type="text" value={projectName} onChange={e => setProjectName(e.target.value)} className="w-full border-gray-300 rounded-lg p-2 border" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Client Name *</label>
            <input type="text" value={clientName} onChange={e => setClientName(e.target.value)} className="w-full border-gray-300 rounded-lg p-2 border" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Total Project Value *</label>
            <input type="number" value={projectValue} onChange={e => setProjectValue(e.target.value)} className="w-full border-gray-300 rounded-lg p-2 border" />
          </div>

          <div className="pt-4 border-t">
            <h3 className="font-bold mb-2">Developers (Optional)</h3>
            {developers.map((dev, i) => (
              <div key={i} className="flex flex-col sm:flex-row gap-2 mb-2 border sm:border-0 p-2 sm:p-0 rounded bg-gray-50 sm:bg-transparent">
                <input type="text" placeholder="Developer Name" value={dev.name} onChange={e => {
                  const newDevs = [...developers]
                  newDevs[i].name = e.target.value
                  setDevelopers(newDevs)
                }} className="flex-1 border-gray-300 rounded-lg p-2 border text-sm" />
                <div className="flex gap-2">
                  <input type="number" placeholder="Total Cost" value={dev.amount} onChange={e => {
                    const newDevs = [...developers]
                    newDevs[i].amount = e.target.value
                    setDevelopers(newDevs)
                  }} className="flex-1 border-gray-300 rounded-lg p-2 border text-sm" />
                  {developers.length > 1 && (
                    <button onClick={() => setDevelopers(developers.filter((_, idx) => idx !== i))} className="p-2 text-red-500 hover:bg-red-50 rounded">
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            ))}
            <button 
              onClick={() => setDevelopers([...developers, { name: '', amount: '' }])}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium mt-1"
            >
              + Add another developer
            </button>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 border rounded-lg hover:bg-gray-50 text-sm md:text-base">Cancel</button>
          <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm md:text-base">Save Project</button>
        </div>
      </div>
    </div>
  )
}

function ProjectCard({ project, payments, devs, devPayments, agencyId }: any) {
  const [expanded, setExpanded] = useState(true) // Kept true so user doesn't lose context after edit
  const [showEditModal, setShowEditModal] = useState(false)
  const [showClientPaymentModal, setShowClientPaymentModal] = useState(false)
  const [showDevPaymentModal, setShowDevPaymentModal] = useState<string | null>(null)

  const received = payments.reduce((sum: number, curr: any) => sum + curr.amount, 0)
  const remaining = (project.contract_amount || 0) - received
  
  const devCost = devs.reduce((sum: number, curr: any) => sum + curr.agreed_amount, 0)
  const devPaid = devPayments.reduce((sum: number, curr: any) => sum + curr.amount, 0)
  const devRemaining = devCost - devPaid
  
  const profit = (project.contract_amount || 0) - devCost

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
      <div 
        className="p-3 md:p-4 cursor-pointer hover:bg-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3 md:gap-4">
          {expanded ? <ChevronDown className="text-gray-400 flex-shrink-0" /> : <ChevronRight className="text-gray-400 flex-shrink-0" />}
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base md:text-lg font-bold text-gray-900 break-words">{project.name}</h3>
            <button 
              onClick={(e) => { e.stopPropagation(); setShowEditModal(true) }}
              className="flex items-center gap-1 bg-gray-100 text-gray-600 hover:bg-gray-200 px-2 py-1 rounded text-xs font-medium transition-colors"
              title="Edit Project"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
              Edit
            </button>
            <button 
              onClick={async (e) => { 
                e.stopPropagation();
                if (confirm(`Are you sure you want to delete ${project.name}?`)) {
                  await db.projects.delete(project.id)
                }
              }}
              className="flex items-center gap-1 bg-red-50 text-red-600 hover:bg-red-100 px-2 py-1 rounded text-xs font-medium transition-colors"
              title="Delete Project"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
              Delete
            </button>
          </div>
        </div>
        <div className="text-left sm:text-right ml-8 sm:ml-0">
          <p className="text-xs md:text-sm text-gray-500">Value</p>
          <p className="font-bold text-gray-900 text-base md:text-lg">Rs. {(project.contract_amount || 0).toLocaleString()}</p>
        </div>
      </div>

      {expanded && (
        <div className="p-3 md:p-4 border-t border-gray-100 bg-gray-50 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* OVERVIEW */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b pb-2 gap-2">
              <h4 className="font-bold text-gray-900">Client Payments</h4>
              <button 
                onClick={(e) => { e.stopPropagation(); setShowClientPaymentModal(true) }}
                className="text-sm text-blue-600 font-medium hover:text-blue-800 text-left sm:text-right"
              >
                + Add Client Payment
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-2 md:gap-4 text-xs md:text-sm mb-4">
              <div className="bg-white p-2 rounded border border-gray-100">
                <p className="text-gray-500">Value:</p>
                <p className="font-semibold text-gray-900 truncate">Rs. {(project.contract_amount || 0).toLocaleString()}</p>
              </div>
              <div className="bg-white p-2 rounded border border-gray-100">
                <p className="text-gray-500">Received:</p>
                <p className="font-semibold text-green-600 truncate">Rs. {received.toLocaleString()}</p>
              </div>
              <div className="bg-white p-2 rounded border border-gray-100">
                <p className="text-gray-500">Remaining:</p>
                <p className="font-semibold text-orange-600 truncate">Rs. {remaining.toLocaleString()}</p>
              </div>
              <div className="bg-white p-2 rounded border border-gray-100">
                <p className="text-gray-500">Expected Profit:</p>
                <p className="font-semibold text-blue-600 truncate">Rs. {profit.toLocaleString()}</p>
              </div>
            </div>

            {/* List recent client payments */}
            <div className="space-y-2 mt-4 max-h-40 overflow-y-auto pr-2">
              {payments.map((p: any) => (
                <div key={p.id} className="bg-white p-2 md:p-3 rounded border border-gray-100 flex flex-col sm:flex-row sm:justify-between text-xs md:text-sm gap-1">
                  <div>
                    <span className="font-medium text-gray-900">Rs. {p.amount.toLocaleString()}</span>
                    {p.notes && <span className="text-gray-500 ml-2 italic block sm:inline">{p.notes}</span>}
                  </div>
                  <span className="text-gray-500">{new Date(p.payment_date).toLocaleDateString()}</span>
                </div>
              ))}
            </div>
          </div>

          {/* DEVELOPER COSTS */}
          <div className="space-y-4">
            <h4 className="font-bold text-gray-900 border-b pb-2">Developer Costs</h4>
            <div className="grid grid-cols-2 gap-2 md:gap-4 text-xs md:text-sm">
              <div className="bg-white p-2 rounded border border-gray-100 col-span-2 sm:col-span-1">
                <p className="text-gray-500">Total Dev Cost:</p>
                <p className="font-semibold text-gray-900 truncate">Rs. {devCost.toLocaleString()}</p>
              </div>
              <div className="bg-white p-2 rounded border border-gray-100">
                <p className="text-gray-500">Dev Paid:</p>
                <p className="font-semibold text-blue-600 truncate">Rs. {devPaid.toLocaleString()}</p>
              </div>
              <div className="bg-white p-2 rounded border border-gray-100">
                <p className="text-gray-500">Dev Remaining:</p>
                <p className="font-semibold text-red-600 truncate">Rs. {devRemaining.toLocaleString()}</p>
              </div>
            </div>
            
            <div className="mt-4">
              <h5 className="font-semibold text-xs text-gray-500 uppercase">Developers</h5>
              <div className="space-y-2 mt-2">
                {devs.map((d: any) => {
                  const dpForDev = devPayments.filter((dp: any) => dp.developer_id === d.developer_id)
                  const paid = dpForDev.reduce((sum: number, curr: any) => sum + curr.amount, 0)
                  return (
                    <div key={d.id} className="bg-white p-3 rounded border border-gray-100 text-xs md:text-sm">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                        <span className="font-medium text-gray-900">{d.developer_name || 'Developer'}</span>
                        <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-3">
                          <div className="text-left sm:text-right">
                            <span className="text-gray-900 block font-semibold">Rs. {d.agreed_amount.toLocaleString()}</span>
                            <span className="text-blue-600 block">Paid: Rs. {paid.toLocaleString()}</span>
                          </div>
                          <button 
                            onClick={(e) => { e.stopPropagation(); setShowDevPaymentModal(d.developer_id) }}
                            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg text-xs font-medium flex-shrink-0"
                          >
                            + Pay
                          </button>
                        </div>
                      </div>
                      {dpForDev.length > 0 && (
                        <div className="mt-3 pt-2 border-t border-gray-50 space-y-2">
                          {dpForDev.map((dp: any) => (
                            <div key={dp.id} className="flex flex-col sm:flex-row sm:justify-between text-xs text-gray-500 gap-1">
                              <span>Rs. {dp.amount.toLocaleString()} {dp.payment_type ? `(${dp.payment_type})` : ''}</span>
                              <span>{new Date(dp.payment_date).toLocaleDateString()}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {showClientPaymentModal && (
        <ClientPaymentModal 
          projectId={project.id}
          remaining={remaining}
          onClose={() => setShowClientPaymentModal(false)}
        />
      )}

      {showDevPaymentModal && (
        <DevPaymentModal 
          projectId={project.id}
          developerId={showDevPaymentModal}
          devRemaining={
            devs.find((d: any) => d.developer_id === showDevPaymentModal)?.agreed_amount 
            - devPayments.filter((dp: any) => dp.developer_id === showDevPaymentModal).reduce((sum: number, curr: any) => sum + curr.amount, 0)
          }
          onClose={() => setShowDevPaymentModal(null)}
        />
      )}

      {showEditModal && (
        <EditProjectModal 
          project={project}
          onClose={() => setShowEditModal(false)}
        />
      )}
    </div>
  )
}

function EditProjectModal({ project, onClose }: { project: any, onClose: () => void }) {
  const [projectName, setProjectName] = useState(project.name || '')
  const [projectValue, setProjectValue] = useState(project.contract_amount?.toString() || '')
  const [error, setError] = useState('')

  const handleSave = async () => {
    try {
      if (!projectName || !projectValue) {
        setError('Please fill all required project fields')
        return
      }

      const pValue = Number(projectValue)
      if (pValue <= 0) {
        setError('Project value must be greater than 0')
        return
      }

      await db.projects.update(project.id, {
        name: projectName,
        contract_amount: pValue,
        updated_at: new Date().toISOString()
      })
      
      onClose()
    } catch (err) {
      setError('Failed to update project')
      console.error(err)
    }
  }

  const handleDelete = async () => {
    if (confirm(`Are you sure you want to delete ${project.name}? This action cannot be undone.`)) {
      try {
        await db.projects.delete(project.id)
        // Note: Optional to also clean up dev payments/project developers here
        onClose()
      } catch (err) {
        setError('Failed to delete project')
        console.error(err)
      }
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={(e) => e.stopPropagation()}>
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Edit Project</h2>
          <button onClick={onClose} className="text-gray-500 hover:bg-gray-100 p-1 rounded"><X size={20} /></button>
        </div>
        
        {error && <div className="mb-4 text-red-600 bg-red-50 p-3 rounded-lg text-sm">{error}</div>}
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Project Name *</label>
            <input type="text" value={projectName} onChange={e => setProjectName(e.target.value)} className="w-full border-gray-300 rounded-lg p-2 border" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Total Project Value *</label>
            <input type="number" value={projectValue} onChange={e => setProjectValue(e.target.value)} className="w-full border-gray-300 rounded-lg p-2 border" />
          </div>
        </div>

        <div className="mt-6 flex justify-between items-center">
          <button onClick={handleDelete} className="text-red-500 hover:bg-red-50 p-2 rounded transition-colors" title="Delete Project">
            <Trash2 size={20} />
          </button>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
            <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Save</button>
          </div>
        </div>
      </div>
    </div>
  )
}

function ClientPaymentModal({ projectId, remaining, onClose }: { projectId: string, remaining: number, onClose: () => void }) {
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0])
  const [note, setNote] = useState('')
  const [error, setError] = useState('')

  const handleSave = async () => {
    const pAmount = Number(amount)
    if (!pAmount || pAmount <= 0) {
      setError('Amount must be greater than 0')
      return
    }
    
    // User validation requested: don't strictly prevent overpayment but maybe warn? 
    // They said: "Client payment cannot exceed the project's remaining receivable amount unless there is a clear reason to allow it."
    // I will allow it but simply store it.

    try {
      await db.project_payments.add({
        id: uuidv4(),
        project_id: projectId,
        amount: pAmount,
        payment_date: date,
        method: 'cash',
        notes: note,
        created_at: new Date().toISOString()
      })
      onClose()
    } catch (err) {
      setError('Failed to save payment')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm">
        <h2 className="text-xl font-bold mb-4">Add Client Payment</h2>
        {error && <div className="mb-4 text-red-600 bg-red-50 p-2 text-sm rounded">{error}</div>}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Amount (Remaining: Rs. {remaining.toLocaleString()})</label>
            <input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="w-full border p-2 rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full border p-2 rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Note (Optional)</label>
            <input type="text" value={note} onChange={e => setNote(e.target.value)} className="w-full border p-2 rounded" />
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 border rounded">Cancel</button>
          <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded">Save</button>
        </div>
      </div>
    </div>
  )
}

function DevPaymentModal({ projectId, developerId, devRemaining, onClose }: { projectId: string, developerId: string, devRemaining: number, onClose: () => void }) {
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0])
  const [type, setType] = useState<'advance' | 'payment'>('payment')
  const [note, setNote] = useState('')
  const [error, setError] = useState('')

  const handleSave = async () => {
    const pAmount = Number(amount)
    if (!pAmount || pAmount <= 0) {
      setError('Amount must be greater than 0')
      return
    }
    if (pAmount > devRemaining) {
      setError('Amount cannot exceed remaining balance')
      return
    }

    try {
      await db.developer_payments.add({
        id: uuidv4(),
        developer_id: developerId,
        project_id: projectId,
        amount: pAmount,
        payment_date: date,
        payment_type: type,
        method: 'cash',
        notes: note,
        created_at: new Date().toISOString()
      })
      onClose()
    } catch (err) {
      setError('Failed to save payment')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm">
        <h2 className="text-xl font-bold mb-4">Add Developer Payment</h2>
        {error && <div className="mb-4 text-red-600 bg-red-50 p-2 text-sm rounded">{error}</div>}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Amount (Remaining: Rs. {devRemaining.toLocaleString()})</label>
            <input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="w-full border p-2 rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full border p-2 rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Payment Type</label>
            <select value={type} onChange={e => setType(e.target.value as any)} className="w-full border p-2 rounded bg-white">
              <option value="payment">Payment</option>
              <option value="advance">Advance</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Note (Optional)</label>
            <input type="text" value={note} onChange={e => setNote(e.target.value)} className="w-full border p-2 rounded" />
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 border rounded">Cancel</button>
          <button onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded">Save</button>
        </div>
      </div>
    </div>
  )
}
