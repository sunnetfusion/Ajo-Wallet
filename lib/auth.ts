import { User } from '@supabase/supabase-js'

import { supabase } from './supabase'

export interface AuthUser extends User {
  profile?: {
    full_name: string | null
    phone: string | null
    country: string | null
    kyc_status: 'unverified' | 'pending' | 'verified'
  }
}

export const authService = {
  async signUp(email: string, password: string, fullName: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    })
    return { data, error }
  },

  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  },

  async signOut() {
    const { error } = await supabase.auth.signOut()
    return { error }
  },

  async getCurrentUser(): Promise<AuthUser | null> {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return null

    // Fetch user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    return {
      ...user,
      profile: profile || undefined,
    } as AuthUser
  },

  async updateProfile(updates: {
    full_name?: string
    phone?: string
    country?: string
  }) {
    const user = await this.getCurrentUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)
      .select()
      .single()

    return { data, error }
  },

  async submitKYC() {
    const user = await this.getCurrentUser()
    if (!user) throw new Error('Not authenticated')

    const { data, error } = await supabase
      .from('profiles')
      .update({
        kyc_status: 'pending',
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)
      .select()
      .single()

    return { data, error }
  },

  onAuthStateChange(callback: (user: AuthUser | null) => void) {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const user = await this.getCurrentUser()
        callback(user)
      } else {
        callback(null)
      }
    })
  },
}