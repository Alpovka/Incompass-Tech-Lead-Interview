// Firebase Auth Context (base version WITHOUT dataSyncSetting)
import React, { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext({})

export const AuthProvider = (props) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Mock user authentication
    const mockUser = {
      uid: 'mock-user-id',
      email: 'admin@example.com',
      displayName: 'Mock Admin',
      role: 'admin',
      company: 'mock-company-id',
      status: 'active',
      features: {
        finchIntegration: true,
        dataIngestion: true,
        goals: true,
        dataSync: true
      },
      permissions: {},
      dataSyncSetting: false
    }

    setUser(mockUser)
    setLoading(false)
  }, [])

  const value = {
    user,
    loading,
    signOut: () => setUser(null)
  }

  return <AuthContext.Provider value={value} {...props} />
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

