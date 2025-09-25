'use client'

import { format } from 'date-fns'
import { Users, Plus, Calendar, DollarSign, Crown, AlertCircle, Eye, Play, UserPlus } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { toast } from 'sonner'

import { Navigation } from '@/components/Navigation'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useAjo } from '@/hooks/useAjo'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuth } from '@/contexts/AuthContext'


function CreateGroupDialog() {
  const { createGroup, isLoading } = useAjo()
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    contribution_amount: '',
    frequency: '',
    start_date: '',
  })

  const canCreateGroup = user?.profile?.kyc_status === 'verified'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!canCreateGroup) {
      toast.error('KYC verification required to create Ajo groups')
      return
    }

    const amount = parseFloat(formData.contribution_amount)
    if (amount <= 0) {
      toast.error('Contribution amount must be greater than 0')
      return
    }

    try {
      createGroup({
        title: formData.title,
        contribution_amount: amount,
        frequency: formData.frequency as 'weekly' | 'monthly',
        start_date: formData.start_date,
      }, {
        onSuccess: () => {
          toast.success('Ajo group created successfully!')
          setOpen(false)
          setFormData({ title: '', contribution_amount: '', frequency: '', start_date: '' })
        },
        onError: (error: any) => {
          toast.error(error.message)
        },
      })
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const minDate = new Date()
  minDate.setDate(minDate.getDate() + 1) // Tomorrow

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-cyan-600 hover:bg-cyan-700">
          <Plus className="h-4 w-4 mr-2" />
          Create Ajo Group
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Ajo Group</DialogTitle>
          <DialogDescription>
            Set up a new savings group for you and your community
          </DialogDescription>
        </DialogHeader>

        {!canCreateGroup && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You need to complete KYC verification to create Ajo groups.{' '}
              <Link href="/profile" className="underline font-medium">
                Complete KYC
              </Link>
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Group Title</Label>
            <Input
              id="title"
              placeholder="e.g., Family Savings Circle"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="amount">Contribution Amount (₦)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="10000"
              min="1"
              value={formData.contribution_amount}
              onChange={(e) => setFormData({ ...formData, contribution_amount: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="frequency">Contribution Frequency</Label>
            <Select
              value={formData.frequency}
              onValueChange={(value) => setFormData({ ...formData, frequency: value })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="start_date">Start Date</Label>
            <Input
              id="start_date"
              type="date"
              min={minDate.toISOString().split('T')[0]}
              value={formData.start_date}
              onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              required
            />
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading || !canCreateGroup}
          >
            {isLoading ? 'Creating...' : 'Create Group'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function GroupCard({ group, isOwner }: { group: any; isOwner: boolean }) {
  const { startGroup, isLoading } = useAjo()
  const memberCount = group.ajo_members?.length || 0

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'active':
        return { color: 'bg-green-100 text-green-800', text: 'Active' }
      case 'completed':
        return { color: 'bg-blue-100 text-blue-800', text: 'Completed' }
      default:
        return { color: 'bg-yellow-100 text-yellow-800', text: 'Draft' }
    }
  }

  const statusConfig = getStatusConfig(group.status)

  const handleStartGroup = async () => {
    try {
      startGroup(group.id, {
        onSuccess: () => {
          toast.success('Group started successfully!')
        },
        onError: (error: any) => {
          toast.error(error.message)
        },
      })
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <CardTitle className="text-lg">{group.title}</CardTitle>
              {isOwner && (
                <Crown className="h-4 w-4 text-yellow-500" />
              )}
            </div>
            <CardDescription>
              Created by {group.owner?.full_name}
            </CardDescription>
          </div>
          <Badge className={statusConfig.color}>
            {statusConfig.text}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Contribution</span>
              <p className="font-semibold">₦{Number(group.contribution_amount).toLocaleString()}</p>
            </div>
            <div>
              <span className="text-gray-500">Frequency</span>
              <p className="font-semibold capitalize">{group.frequency}</p>
            </div>
            <div>
              <span className="text-gray-500">Members</span>
              <p className="font-semibold">{memberCount}</p>
            </div>
            <div>
              <span className="text-gray-500">Start Date</span>
              <p className="font-semibold">
                {format(new Date(group.start_date), 'MMM dd, yyyy')}
              </p>
            </div>
          </div>

          <div className="flex space-x-2">
            <Button asChild variant="outline" className="flex-1">
              <Link href={`/ajo/${group.id}`}>
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </Link>
            </Button>
            
            {isOwner && group.status === 'draft' && memberCount >= 2 && (
              <Button
                onClick={handleStartGroup}
                disabled={isLoading}
                size="sm"
                className="bg-green-600 hover:bg-green-700"
              >
                <Play className="h-4 w-4 mr-1" />
                Start
              </Button>
            )}
          </div>

          {isOwner && group.status === 'draft' && memberCount < 2 && (
            <Alert>
              <UserPlus className="h-4 w-4" />
              <AlertDescription className="text-xs">
                Need at least 2 members to start the group
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default function AjoPage() {
  const { groups, groupsLoading, groupsError } = useAjo()
  const { user } = useAuth()

  if (groupsLoading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <Navigation />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-white p-6 rounded-lg shadow">
                    <div className="h-6 bg-gray-200 rounded mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  </div>
                ))}
              </div>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    )
  }

  if (groupsError) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <Navigation />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Failed to load Ajo groups. Please try again later.
              </AlertDescription>
            </Alert>
          </main>
        </div>
      </ProtectedRoute>
    )
  }

  const myGroups = groups?.filter(g => g.owner_id === user?.id) || []
  const joinedGroups = groups?.filter(g => g.owner_id !== user?.id) || []

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Ajo Groups</h1>
              <p className="text-gray-600 mt-2">
                Manage your savings groups and track contributions
              </p>
            </div>
            <CreateGroupDialog />
          </div>

          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-4 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-cyan-600" />
                  <span className="text-sm font-medium text-gray-600">Total Groups</span>
                </div>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {groups?.length || 0}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <Crown className="h-4 w-4 text-yellow-600" />
                  <span className="text-sm font-medium text-gray-600">Groups Owned</span>
                </div>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {myGroups.length}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <UserPlus className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-gray-600">Groups Joined</span>
                </div>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {joinedGroups.length}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium text-gray-600">Active Groups</span>
                </div>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {groups?.filter(g => g.status === 'active').length || 0}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Groups List */}
          {!groups || groups.length === 0 ? (
            <Card>
              <CardContent className="py-12">
                <div className="text-center">
                  <Users className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No Ajo groups yet
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Create your first Ajo group or join an existing one to start saving together
                  </p>
                  <CreateGroupDialog />
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-8">
              {myGroups.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    My Groups ({myGroups.length})
                  </h2>
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {myGroups.map((group) => (
                      <GroupCard
                        key={group.id}
                        group={group}
                        isOwner={true}
                      />
                    ))}
                  </div>
                </div>
              )}

              {joinedGroups.length > 0 && (
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    Groups I&apos;ve Joined ({joinedGroups.length})
                  </h2>
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {joinedGroups.map((group) => (
                      <GroupCard
                        key={group.id}
                        group={group}
                        isOwner={false}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  )
}