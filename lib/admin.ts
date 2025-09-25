import { supabase } from './supabase'

export const adminService = {
  async isAdmin(email: string): Promise<boolean> {
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com'
    return email === adminEmail
  },

  async getPendingKYC() {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        id,
        full_name,
        phone,
        country,
        kyc_status,
        created_at,
        updated_at
      `)
      .eq('kyc_status', 'pending')
      .order('updated_at', { ascending: false })

    return { data, error }
  },

  async approveKYC(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        kyc_status: 'verified',
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single()

    return { data, error }
  },

  async rejectKYC(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        kyc_status: 'unverified',
        updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single()

    return { data, error }
  },

  async getAllUsers() {
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        id,
        full_name,
        phone,
        country,
        kyc_status,
        created_at,
        wallets(balance),
        ajo_groups!ajo_groups_owner_id_fkey(id, title, status)
      `)
      .order('created_at', { ascending: false })

    return { data, error }
  },

  async getGroupsForManagement() {
    const { data, error } = await supabase
      .from('ajo_groups')
      .select(`
        id,
        title,
        contribution_amount,
        frequency,
        start_date,
        status,
        current_cycle,
        created_at,
        owner:profiles!ajo_groups_owner_id_fkey(full_name),
        members:ajo_members(id, position, user:profiles!ajo_members_user_id_fkey(full_name))
      `)
      .order('created_at', { ascending: false })

    return { data, error }
  },
}