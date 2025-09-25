'use client'

import { User, Shield, CheckCircle, Clock, XCircle, Save } from 'lucide-react'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'

import { Navigation } from '@/components/Navigation'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { useAuth } from '@/contexts/AuthContext'


const countries = [
  'Nigeria',
  'Ghana',
  'Kenya',
  'South Africa',
  'Uganda',
  'Tanzania',
  'Rwanda',
  'Senegal',
  'Other'
]

export default function ProfilePage() {
  const { user, updateProfile, submitKYC } = useAuth()
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    country: '',
  })
  const [loading, setLoading] = useState(false)
  const [submittingKYC, setSubmittingKYC] = useState(false)

  useEffect(() => {
    if (user?.profile) {
      setFormData({
        full_name: user.profile.full_name || '',
        phone: user.profile.phone || '',
        country: user.profile.country || '',
      })
    }
  }, [user])

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleUpdateProfile = async () => {
    setLoading(true)
    try {
      const { error } = await updateProfile(formData)
      if (error) {
        toast.error(error.message)
      } else {
        toast.success('Profile updated successfully!')
      }
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitKYC = async () => {
    // Validate required fields
    if (!formData.full_name || !formData.phone || !formData.country) {
      toast.error('Please complete your profile before submitting KYC')
      return
    }

    setSubmittingKYC(true)
    try {
      // Update profile first
      const { error: profileError } = await updateProfile(formData)
      if (profileError) {
        toast.error(profileError.message)
        return
      }

      // Submit KYC
      const { error } = await submitKYC()
      if (error) {
        toast.error(error.message)
      } else {
        toast.success('KYC submitted for review!')
      }
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setSubmittingKYC(false)
    }
  }

  const getKYCStatus = () => {
    const status = user?.profile?.kyc_status || 'unverified'
    
    switch (status) {
      case 'verified':
        return {
          icon: <CheckCircle className="h-5 w-5 text-green-600" />,
          badge: <Badge className="bg-green-100 text-green-800">Verified</Badge>,
          title: 'KYC Verified',
          description: 'Your identity has been verified successfully. You can now access all features.',
          color: 'border-green-200 bg-green-50',
          canSubmit: false
        }
      case 'pending':
        return {
          icon: <Clock className="h-5 w-5 text-yellow-600" />,
          badge: <Badge className="bg-yellow-100 text-yellow-800">Under Review</Badge>,
          title: 'KYC Under Review',
          description: 'Your KYC submission is being reviewed. This usually takes 1-2 business days.',
          color: 'border-yellow-200 bg-yellow-50',
          canSubmit: false
        }
      default:
        return {
          icon: <XCircle className="h-5 w-5 text-red-600" />,
          badge: <Badge className="bg-red-100 text-red-800">Not Verified</Badge>,
          title: 'KYC Required',
          description: 'Complete your profile and submit your KYC to access all features including creating Ajo groups.',
          color: 'border-red-200 bg-red-50',
          canSubmit: true
        }
    }
  }

  const kycStatus = getKYCStatus()

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Profile & KYC</h1>
            <p className="text-gray-600 mt-2">
              Manage your profile information and verify your identity
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {/* Profile Information */}
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <User className="h-5 w-5" />
                    <CardTitle>Profile Information</CardTitle>
                  </div>
                  <CardDescription>
                    Update your personal information and contact details
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      value={user?.email || ''}
                      disabled
                      className="bg-gray-50"
                    />
                    <p className="text-sm text-gray-500">
                      Email cannot be changed
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="full_name">Full Name *</Label>
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={(e) => handleChange('full_name', e.target.value)}
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      placeholder="Enter your phone number"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="country">Country *</Label>
                    <Select value={formData.country} onValueChange={(value) => handleChange('country', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your country" />
                      </SelectTrigger>
                      <SelectContent>
                        {countries.map((country) => (
                          <SelectItem key={country} value={country}>
                            {country}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />

                  <Button 
                    onClick={handleUpdateProfile}
                    disabled={loading}
                    className="w-full"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {loading ? 'Saving...' : 'Save Profile'}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* KYC Status */}
            <div>
              <Card className={`${kycStatus.color} border-2`}>
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <Shield className="h-5 w-5" />
                    <CardTitle className="text-lg">KYC Status</CardTitle>
                  </div>
                  <div className="flex items-center space-x-2">
                    {kycStatus.icon}
                    {kycStatus.badge}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">
                      {kycStatus.title}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {kycStatus.description}
                    </p>
                  </div>

                  {kycStatus.canSubmit && (
                    <div className="space-y-4">
                      <Alert>
                        <AlertDescription>
                          <strong>Required for KYC:</strong>
                          <ul className="mt-2 space-y-1 text-sm">
                            <li>• Complete profile information</li>
                            <li>• Valid phone number</li>
                            <li>• Country of residence</li>
                          </ul>
                        </AlertDescription>
                      </Alert>

                      <Button
                        onClick={handleSubmitKYC}
                        disabled={submittingKYC || !formData.full_name || !formData.phone || !formData.country}
                        className="w-full bg-cyan-600 hover:bg-cyan-700"
                      >
                        {submittingKYC ? 'Submitting...' : 'Submit for KYC Review'}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Account Info */}
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle className="text-lg">Account Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Account Created</span>
                    <span className="text-gray-900">
                      {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">User ID</span>
                    <span className="text-gray-900 font-mono text-xs">
                      {user?.id?.slice(0, 8)}...
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Status</span>
                    <Badge variant="secondary">Active</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}