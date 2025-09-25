import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          phone: string | null
          country: string | null
          kyc_status: 'unverified' | 'pending' | 'verified'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          phone?: string | null
          country?: string | null
          kyc_status?: 'unverified' | 'pending' | 'verified'
          created_at?: string
          updated_at?: string
        }
        Update: {
          full_name?: string | null
          phone?: string | null
          country?: string | null
          kyc_status?: 'unverified' | 'pending' | 'verified'
          updated_at?: string
        }
      }
      wallets: {
        Row: {
          id: string
          user_id: string
          balance: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          balance?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          balance?: number
          updated_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          type: 'credit' | 'debit'
          amount: number
          description: string
          reference: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'credit' | 'debit'
          amount: number
          description: string
          reference?: string | null
          created_at?: string
        }
        Update: {
          type?: 'credit' | 'debit'
          amount?: number
          description?: string
          reference?: string | null
        }
      }
      ajo_groups: {
        Row: {
          id: string
          owner_id: string
          title: string
          contribution_amount: number
          frequency: 'weekly' | 'monthly'
          start_date: string
          status: 'draft' | 'active' | 'completed'
          current_cycle: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          title: string
          contribution_amount: number
          frequency: 'weekly' | 'monthly'
          start_date: string
          status?: 'draft' | 'active' | 'completed'
          current_cycle?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          title?: string
          contribution_amount?: number
          frequency?: 'weekly' | 'monthly'
          start_date?: string
          status?: 'draft' | 'active' | 'completed'
          current_cycle?: number
          updated_at?: string
        }
      }
      ajo_members: {
        Row: {
          id: string
          group_id: string
          user_id: string
          position: number
          joined_at: string
        }
        Insert: {
          id?: string
          group_id: string
          user_id: string
          position: number
          joined_at?: string
        }
        Update: {
          position?: number
        }
      }
      ajo_cycles: {
        Row: {
          id: string
          group_id: string
          cycle_number: number
          payout_user_id: string | null
          paid_out: boolean
          payout_amount: number
          payout_date: string | null
          created_at: string
        }
        Insert: {
          id?: string
          group_id: string
          cycle_number: number
          payout_user_id?: string | null
          paid_out?: boolean
          payout_amount?: number
          payout_date?: string | null
          created_at?: string
        }
        Update: {
          payout_user_id?: string | null
          paid_out?: boolean
          payout_amount?: number
          payout_date?: string | null
        }
      }
      ajo_ledger: {
        Row: {
          id: string
          group_id: string
          user_id: string
          cycle_number: number
          movement: 'contribution' | 'payout'
          amount: number
          created_at: string
        }
        Insert: {
          id?: string
          group_id: string
          user_id: string
          cycle_number: number
          movement: 'contribution' | 'payout'
          amount: number
          created_at?: string
        }
        Update: {
          movement?: 'contribution' | 'payout'
          amount?: number
        }
      }
    }
  }
}