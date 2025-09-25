'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { format } from 'date-fns'

import { Navigation } from '@/components/Navigation'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/contexts/AuthContext'
import { useGroupDetails } from '@/hooks/useAjo'

export default function GroupDetailsPage() {
  const params = useParams()
  const groupId = params?.id as string
  const { user } = useAuth()
  const { data, isLoading } = useGroupDetails(groupId)

  const group = data?.data?.group
  const members = data?.data?.members || []
  const cycles = data?.data?.cycles || []
  const ledger = data?.data?.ledger || []

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Group Details</h1>
            <Link href="/ajo"><Button variant="outline">Back</Button></Link>
          </div>

          {isLoading ? (
            <div className="text-gray-500">Loading...</div>
          ) : !group ? (
            <div className="text-gray-500">Group not found</div>
          ) : (
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>{group.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-gray-500">Contribution</div>
                        <div className="font-semibold">₦{Number(group.contribution_amount).toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Frequency</div>
                        <div className="font-semibold capitalize">{group.frequency}</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Start Date</div>
                        <div className="font-semibold">{format(new Date(group.start_date), 'MMM dd, yyyy')}</div>
                      </div>
                      <div>
                        <div className="text-gray-500">Status</div>
                        <div className="font-semibold capitalize">{group.status}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Ledger</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {ledger.length === 0 ? (
                      <div className="text-gray-500">No ledger entries</div>
                    ) : (
                      <div className="space-y-3">
                        {ledger.map((l: any) => (
                          <div key={l.id} className="flex items-center justify-between p-3 border rounded-lg bg-white">
                            <div>
                              <div className="text-sm text-gray-600">Cycle {l.cycle_number} • {l.movement}</div>
                              <div className="text-xs text-gray-500">{format(new Date(l.created_at), 'MMM dd, yyyy • h:mm a')}</div>
                            </div>
                            <div className="font-semibold">₦{Number(l.amount).toLocaleString()}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Members</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {members.length === 0 ? (
                      <div className="text-gray-500">No members</div>
                    ) : (
                      <div className="space-y-2">
                        {members.map((m: any) => (
                          <div key={m.id} className="flex items-center justify-between p-3 border rounded-lg bg-white">
                            <div className="text-sm">{m.user?.full_name || m.user_id}</div>
                            <div className="text-xs text-gray-500">Pos {m.position}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Cycles</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {cycles.length === 0 ? (
                      <div className="text-gray-500">No cycles yet</div>
                    ) : (
                      <div className="space-y-2">
                        {cycles.map((c: any) => (
                          <div key={c.id} className="flex items-center justify-between p-3 border rounded-lg bg-white">
                            <div className="text-sm">Cycle {c.cycle_number} • ₦{Number(c.payout_amount).toLocaleString()}</div>
                            <div className="text-xs text-gray-500">{c.payout_user?.full_name || '—'}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  )
}


