'use client'

import { useEffect, useState } from 'react'

import { Navigation } from '@/components/Navigation'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/contexts/AuthContext'

interface PendingKYC {
  id: string
  full_name: string | null
  phone: string | null
  country: string | null
  kyc_status: string
  updated_at: string
}

export default function AdminPage() {
  const { user } = useAuth()
  const [pending, setPending] = useState<PendingKYC[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchPending = async () => {
    if (!user?.email) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/kyc/pending', {
        headers: { 'x-admin-email': user.email as string },
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Failed to load')
      setPending(json.data || [])
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const approve = async (userId: string) => {
    if (!user?.email) return
    const res = await fetch('/api/admin/kyc/approve', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-email': user.email as string,
      },
      body: JSON.stringify({ userId }),
    })
    const json = await res.json()
    if (!res.ok) throw new Error(json.error || 'Failed to approve')
    await fetchPending()
  }

  useEffect(() => {
    fetchPending()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.email])

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Admin</h1>

          <Card>
            <CardHeader>
              <CardTitle>Pending KYC</CardTitle>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="text-sm text-red-600 mb-4">{error}</div>
              )}
              {loading ? (
                <div className="text-gray-500">Loading...</div>
              ) : pending.length === 0 ? (
                <div className="text-gray-500">No pending KYC</div>
              ) : (
                <div className="space-y-3">
                  {pending.map((p) => (
                    <div key={p.id} className="flex items-center justify-between p-4 border rounded-lg bg-white">
                      <div>
                        <div className="font-medium text-gray-900">{p.full_name || 'Unnamed User'}</div>
                        <div className="text-sm text-gray-600">{p.country || '—'} • {p.phone || '—'}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button onClick={() => approve(p.id)} className="bg-cyan-600 hover:bg-cyan-700">Approve</Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    </ProtectedRoute>
  )
}


