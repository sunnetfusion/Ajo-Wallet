'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

import { AuthUser, authService } from '@/lib/auth'

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<any>
  signUp: (email: string, password: string, fullName: string) => Promise<any>
  signOut: () => Promise<void>
  updateProfile: (updates: any) => Promise<any>
  submitKYC: () => Promise<any>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial user
    authService.getCurrentUser().then((user) => {
      setUser(user)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = authService.onAuthStateChange((user) => {
      setUser(user)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const refreshUser = async () => {
    const user = await authService.getCurrentUser()
    setUser(user)
  }

  const signIn = async (email: string, password: string) => {
    const result = await authService.signIn(email, password)
    if (!result.error) {
      const user = await authService.getCurrentUser()
      setUser(user)
    }
    return result
  }

  const signUp = async (email: string, password: string, fullName: string) => {
    const result = await authService.signUp(email, password, fullName)
    return result
  }

  const signOut = async () => {
    await authService.signOut()
    setUser(null)
  }

  const updateProfile = async (updates: any) => {
    const result = await authService.updateProfile(updates)
    if (!result.error) {
      await refreshUser()
    }
    return result
  }

  const submitKYC = async () => {
    const result = await authService.submitKYC()
    if (!result.error) {
      await refreshUser()
    }
    return result
  }

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
    submitKYC,
    refreshUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}