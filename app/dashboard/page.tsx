'use client'

import { format } from 'date-fns'
import { Wallet, Plus, Minus, TrendingUp, TrendingDown, Clock, AlertCircle, Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'

import { Navigation } from '@/components/Navigation'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/contexts/AuthContext'
import { useWallet } from '@/hooks/useWallet'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'


function WalletCard() {
  const { wallet, fundWallet, withdraw, isLoading } = useWallet()
  const [showBalance, setShowBalance] = useState(true)
  const [fundAmount, setFundAmount] = useState('')
  const [withdrawAmount, setWithdrawAmount] = useState('')
  const [fundDialogOpen, setFundDialogOpen] = useState(false)
  const [withdrawDialogOpen, setWithdrawDialogOpen] = useState(false)

  const handleFund = async () => {
    const amount = parseFloat(fundAmount)
    if (amount <= 0) {
      toast.error('Amount must be greater than 0')
      return
    }
    
    try {
      fundWallet(
        { amount, description: `Wallet funding - ${format(new Date(), 'MMM dd, yyyy')}` },
        {
          onSuccess: () => {
            toast.success(`₦${amount.toLocaleString()} added to wallet`)
            setFundAmount('')
            setFundDialogOpen(false)
          },
          onError: (error: any) => {
            toast.error(error.message)
          },
        }
      )
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  const handleWithdraw = async () => {
    const amount = parseFloat(withdrawAmount)
    if (amount <= 0) {
      toast.error('Amount must be greater than 0')
      return
    }
    
    try {
      withdraw(
        { amount, description: `Wallet withdrawal - ${format(new Date(), 'MMM dd, yyyy')}` },
        {
          onSuccess: () => {
            toast.success(`₦${amount.toLocaleString()} withdrawn from wallet`)
            setWithdrawAmount('')
            setWithdrawDialogOpen(false)
          },
          onError: (error: any) => {
            toast.error(error.message)
          },
        }
      )
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  return (
    <Card className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white border-none">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Wallet className="h-6 w-6" />
            <CardTitle>Wallet Balance</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowBalance(!showBalance)}
            className="text-white hover:bg-white/20"
          >
            {showBalance ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="text-cyan-100 text-sm">Available Balance</p>
            <p className="text-3xl font-bold">
              {showBalance 
                ? `₦${Number(wallet?.balance || 0).toLocaleString()}` 
                : '₦••••••'
              }
            </p>
          </div>

          <div className="flex space-x-3">
            <Dialog open={fundDialogOpen} onOpenChange={setFundDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="secondary" className="flex-1">
                  <Plus className="h-4 w-4 mr-2" />
                  Fund Wallet
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Fund Your Wallet</DialogTitle>
                  <DialogDescription>
                    Add money to your wallet. This is a demo, so no real payment is processed.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="fundAmount">Amount (₦)</Label>
                    <Input
                      id="fundAmount"
                      type="number"
                      placeholder="Enter amount"
                      value={fundAmount}
                      onChange={(e) => setFundAmount(e.target.value)}
                      min="1"
                    />
                  </div>
                  <Button 
                    onClick={handleFund} 
                    disabled={!fundAmount || isLoading}
                    className="w-full"
                  >
                    {isLoading ? 'Processing...' : 'Add Funds'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={withdrawDialogOpen} onOpenChange={setWithdrawDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="secondary" className="flex-1">
                  <Minus className="h-4 w-4 mr-2" />
                  Withdraw
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Withdraw from Wallet</DialogTitle>
                  <DialogDescription>
                    Withdraw money from your wallet. Available balance: ₦{Number(wallet?.balance || 0).toLocaleString()}
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="withdrawAmount">Amount (₦)</Label>
                    <Input
                      id="withdrawAmount"
                      type="number"
                      placeholder="Enter amount"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      min="1"
                      max={wallet?.balance || 0}
                    />
                  </div>
                  {parseFloat(withdrawAmount) > Number(wallet?.balance || 0) && (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Insufficient funds. Available balance: ₦{Number(wallet?.balance || 0).toLocaleString()}
                      </AlertDescription>
                    </Alert>
                  )}
                  <Button 
                    onClick={handleWithdraw} 
                    disabled={!withdrawAmount || isLoading || parseFloat(withdrawAmount) > Number(wallet?.balance || 0)}
                    className="w-full"
                  >
                    {isLoading ? 'Processing...' : 'Withdraw'}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function TransactionHistory() {
  const { transactions, transactionsLoading } = useWallet()

  if (transactionsLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2" />
                </div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
        <CardDescription>
          Your wallet activity and transaction history
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!transactions || transactions.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No transactions yet</p>
            <p className="text-sm text-gray-400 mt-1">
              Fund your wallet or make your first Ajo contribution to see transactions here
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {transactions.slice(0, 10).map((transaction) => (
              <div key={transaction.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    transaction.type === 'credit' ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {transaction.type === 'credit' ? (
                      <TrendingUp className="h-5 w-5 text-green-600" />
                    ) : (
                      <TrendingDown className="h-5 w-5 text-red-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{transaction.description}</p>
                    <p className="text-sm text-gray-500">
                      {format(new Date(transaction.created_at), 'MMM dd, yyyy • h:mm a')}
                    </p>
                    {transaction.reference && (
                      <p className="text-xs text-gray-400">Ref: {transaction.reference}</p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${
                    transaction.type === 'credit' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.type === 'credit' ? '+' : '-'}₦{Number(transaction.amount).toLocaleString()}
                  </p>
                  <Badge 
                    variant={transaction.type === 'credit' ? 'secondary' : 'outline'}
                    className="text-xs"
                  >
                    {transaction.type}
                  </Badge>
                </div>
              </div>
            ))}
            {transactions.length > 10 && (
              <div className="text-center pt-4">
                <Button variant="outline" size="sm">
                  View All Transactions
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function KYCStatus() {
  const { user, submitKYC } = useAuth()
  const [submitting, setSubmitting] = useState(false)

  const handleSubmitKYC = async () => {
    setSubmitting(true)
    try {
      const { error } = await submitKYC()
      if (error) {
        toast.error(error.message)
      } else {
        toast.success('KYC submitted for review')
      }
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'verified':
        return {
          color: 'bg-green-50 border-green-200',
          badgeColor: 'bg-green-100 text-green-800',
          icon: '✓',
          title: 'KYC Verified',
          description: 'Your identity has been verified. You can now create Ajo groups.',
          action: null
        }
      case 'pending':
        return {
          color: 'bg-yellow-50 border-yellow-200',
          badgeColor: 'bg-yellow-100 text-yellow-800',
          icon: '⏳',
          title: 'KYC Under Review',
          description: 'Your KYC submission is being reviewed. This usually takes 1-2 business days.',
          action: null
        }
      default:
        return {
          color: 'bg-red-50 border-red-200',
          badgeColor: 'bg-red-100 text-red-800',
          icon: '!',
          title: 'KYC Required',
          description: 'Complete your KYC verification to create Ajo groups and access all features.',
          action: (
            <Button 
              onClick={handleSubmitKYC} 
              disabled={submitting}
              className="bg-cyan-600 hover:bg-cyan-700"
            >
              {submitting ? 'Submitting...' : 'Submit KYC'}
            </Button>
          )
        }
    }
  }

  const config = getStatusConfig(user?.profile?.kyc_status || 'unverified')

  return (
    <Card className={`${config.color} border`}>
      <CardContent className="pt-6">
        <div className="flex items-start space-x-3">
          <div className="text-2xl">{config.icon}</div>
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <h3 className="font-semibold text-gray-900">{config.title}</h3>
              <Badge className={config.badgeColor}>
                {user?.profile?.kyc_status || 'unverified'}
              </Badge>
            </div>
            <p className="text-sm text-gray-600 mb-3">{config.description}</p>
            {config.action}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function DashboardPage() {
  const { user } = useAuth()

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {user?.profile?.full_name || 'there'}!
            </h1>
            <p className="text-gray-600 mt-2">
              Manage your wallet and track your Ajo savings progress
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
            <div className="md:col-span-2">
              <WalletCard />
            </div>
            <div>
              <KYCStatus />
            </div>
          </div>

          <div className="grid gap-6">
            <TransactionHistory />
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}