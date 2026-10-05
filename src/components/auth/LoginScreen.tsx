'use client'

import { useState, useEffect } from 'react'
import { Lock, Unlock } from 'lucide-react'
import { hasUsers, createUser, verifyUser, setSessionActive } from '@/lib/auth'

interface LoginScreenProps {
  onSuccess: () => void
  isLockedDueToInactivity?: boolean
}

export function LoginScreen({ onSuccess, isLockedDueToInactivity = false }: LoginScreenProps) {
  const [isFirstTime, setIsFirstTime] = useState(true)
  const [loading, setLoading] = useState(true)
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    async function checkUsers() {
      const exists = await hasUsers()
      setIsFirstTime(!exists)
      setLoading(false)
    }
    checkUsers()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (isFirstTime) {
      if (!username || !password) {
        setError('Please provide a username and password/PIN')
        return
      }
      await createUser(username, password)
      setSessionActive()
      onSuccess()
    } else {
      const valid = await verifyUser(password)
      if (valid) {
        setSessionActive()
        onSuccess()
      } else {
        setError('Incorrect password or PIN')
      }
    }
  }

  if (loading) return null

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-xl">
            {isFirstTime ? <Unlock size={32} /> : <Lock size={32} />}
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 tracking-tight">
          {isLockedDueToInactivity ? 'AXIORA LOCKED' : isFirstTime ? 'Setup Axiora Security' : 'Welcome Back'}
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {isLockedDueToInactivity 
            ? 'Your session was locked due to inactivity.' 
            : isFirstTime 
              ? 'Create a local account to secure your financial data.' 
              : 'Enter your password or PIN to unlock.'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {isFirstTime && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Username</label>
                <div className="mt-1">
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={e => setUsername(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700">Password / PIN</label>
              <div className="mt-1">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            {error && (
              <div className="text-sm text-red-600 font-medium">
                {error}
              </div>
            )}

            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                {isFirstTime ? 'Setup & Unlock' : 'Unlock'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
