'use client'

import { Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

import { useAuth } from '@/contexts/AuthContext'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireKYC?: boolean
}

export function ProtectedRoute({ children, requireKYC = false }: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/signin')
    } else if (!loading && user && requireKYC && user.profile?.kyc_status !== 'verified') {
      router.push('/profile')
    }
  }, [user, loading, router, requireKYC])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  if (requireKYC && user.profile?.kyc_status !== 'verified') {
    return null
  }

  return <>{children}</>
}