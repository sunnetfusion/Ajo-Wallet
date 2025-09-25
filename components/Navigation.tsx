'use client'

import { Wallet, Users, User, LogOut, Shield } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/contexts/AuthContext'
import { adminService } from '@/lib/admin'


export function Navigation() {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    if (user?.email) {
      adminService.isAdmin(user.email).then(setIsAdmin)
    }
  }, [user])

  const handleSignOut = async () => {
    await signOut()
    router.push('/auth/signin')
  }

  const getKYCStatusColor = (status: string) => {
    switch (status) {
      case 'verified': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-red-100 text-red-800'
    }
  }

  const getInitials = (name: string | null | undefined) => {
    if (!name) return 'U'
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  }

  if (!user) return null

  return (
    <nav className="border-b bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link href="/dashboard" className="text-xl font-bold text-cyan-600">
              Wallet + Ajo
            </Link>
            
            <div className="hidden md:flex items-center space-x-6">
              <Link
                href="/dashboard"
                className="flex items-center space-x-2 text-gray-700 hover:text-cyan-600 transition-colors"
              >
                <Wallet className="h-4 w-4" />
                <span>Wallet</span>
              </Link>
              
              <Link
                href="/ajo"
                className="flex items-center space-x-2 text-gray-700 hover:text-cyan-600 transition-colors"
              >
                <Users className="h-4 w-4" />
                <span>Ajo Groups</span>
              </Link>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-cyan-100 text-cyan-600">
                    {getInitials(user.profile?.full_name)}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-80" align="end">
              <div className="flex items-center space-x-3 p-3">
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-cyan-100 text-cyan-600">
                    {getInitials(user.profile?.full_name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user.profile?.full_name || 'Unnamed User'}
                  </p>
                  <p className="text-sm text-gray-500 truncate">
                    {user.email}
                  </p>
                </div>
                <Badge 
                  className={`text-xs ${getKYCStatusColor(user.profile?.kyc_status || 'unverified')}`}
                >
                  {user.profile?.kyc_status || 'unverified'}
                </Badge>
              </div>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem asChild>
                <Link href="/profile" className="flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>Profile & KYC</span>
                </Link>
              </DropdownMenuItem>
              
              <DropdownMenuItem asChild className="md:hidden">
                <Link href="/dashboard" className="flex items-center space-x-2">
                  <Wallet className="h-4 w-4" />
                  <span>Wallet</span>
                </Link>
              </DropdownMenuItem>
              
              <DropdownMenuItem asChild className="md:hidden">
                <Link href="/ajo" className="flex items-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span>Ajo Groups</span>
                </Link>
              </DropdownMenuItem>
              
              {isAdmin && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/admin" className="flex items-center space-x-2">
                      <Shield className="h-4 w-4" />
                      <span>Admin Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                </>
              )}
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem 
                onClick={handleSignOut}
                className="flex items-center space-x-2 text-red-600"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </nav>
  )
}