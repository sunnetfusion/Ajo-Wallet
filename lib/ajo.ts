import { supabase } from './supabase'
import { walletService } from './wallet'

export const ajoService = {
  async createGroup(data: {
    title: string
    contribution_amount: number
    frequency: 'weekly' | 'monthly'
    start_date: string
  }) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    // Check if user is KYC verified
    const { data: profile } = await supabase
      .from('profiles')
      .select('kyc_status')
      .eq('id', user.id)
      .single()

    if (!profile || profile.kyc_status !== 'verified') {
      throw new Error('KYC verification required to create Ajo groups')
    }

    const { data: group, error } = await supabase
      .from('ajo_groups')
      .insert({
        owner_id: user.id,
        ...data,
      })
      .select()
      .single()

    if (error) throw error

    // Add owner as first member
    await supabase
      .from('ajo_members')
      .insert({
        group_id: group.id,
        user_id: user.id,
        position: 1,
      })

    return group
  },

  async getUserGroups(userId: string) {
    const { data, error } = await supabase
      .from('ajo_groups')
      .select(`
        *,
        ajo_members!inner(position),
        owner:profiles!ajo_groups_owner_id_fkey(full_name)
      `)
      .or(`owner_id.eq.${userId},ajo_members.user_id.eq.${userId}`)

    return { data, error }
  },

  async getGroupDetails(groupId: string) {
    const { data: group, error: groupError } = await supabase
      .from('ajo_groups')
      .select(`
        *,
        owner:profiles!ajo_groups_owner_id_fkey(full_name)
      `)
      .eq('id', groupId)
      .single()

    if (groupError) return { data: null, error: groupError }

    // Get members
    const { data: members, error: membersError } = await supabase
      .from('ajo_members')
      .select(`
        *,
        user:profiles!ajo_members_user_id_fkey(full_name)
      `)
      .eq('group_id', groupId)
      .order('position')

    if (membersError) return { data: null, error: membersError }

    // Get cycles
    const { data: cycles, error: cyclesError } = await supabase
      .from('ajo_cycles')
      .select(`
        *,
        payout_user:profiles!ajo_cycles_payout_user_id_fkey(full_name)
      `)
      .eq('group_id', groupId)
      .order('cycle_number')

    // Get ledger
    const { data: ledger, error: ledgerError } = await supabase
      .from('ajo_ledger')
      .select(`
        *,
        user:profiles!ajo_ledger_user_id_fkey(full_name)
      `)
      .eq('group_id', groupId)
      .order('created_at', { ascending: false })

    return {
      data: {
        group,
        members: members || [],
        cycles: cycles || [],
        ledger: ledger || [],
      },
      error: null
    }
  },

  async joinGroup(groupId: string) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    // Check if group is still in draft
    const { data: group } = await supabase
      .from('ajo_groups')
      .select('status')
      .eq('id', groupId)
      .single()

    if (!group || group.status !== 'draft') {
      throw new Error('Cannot join group that has already started')
    }

    // Get next position
    const { data: members } = await supabase
      .from('ajo_members')
      .select('position')
      .eq('group_id', groupId)
      .order('position', { ascending: false })
      .limit(1)

    const nextPosition = members?.[0]?.position ? members[0].position + 1 : 1

    const { data, error } = await supabase
      .from('ajo_members')
      .insert({
        group_id: groupId,
        user_id: user.id,
        position: nextPosition,
      })
      .select()
      .single()

    return { data, error }
  },

  async leaveGroup(groupId: string) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    // Check if group is still in draft
    const { data: group } = await supabase
      .from('ajo_groups')
      .select('status, owner_id')
      .eq('id', groupId)
      .single()

    if (!group || group.status !== 'draft') {
      throw new Error('Cannot leave group that has already started')
    }

    if (group.owner_id === user.id) {
      throw new Error('Group owner cannot leave the group')
    }

    const { error } = await supabase
      .from('ajo_members')
      .delete()
      .eq('group_id', groupId)
      .eq('user_id', user.id)

    return { error }
  },

  async startGroup(groupId: string) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    // Verify ownership
    const { data: group } = await supabase
      .from('ajo_groups')
      .select('owner_id, status')
      .eq('id', groupId)
      .single()

    if (!group || group.owner_id !== user.id) {
      throw new Error('Only group owner can start the group')
    }

    if (group.status !== 'draft') {
      throw new Error('Group has already been started')
    }

    // Get member count
    const { data: members } = await supabase
      .from('ajo_members')
      .select('id')
      .eq('group_id', groupId)

    if (!members || members.length < 2) {
      throw new Error('Group needs at least 2 members to start')
    }

    // Update group status
    const { error } = await supabase
      .from('ajo_groups')
      .update({
        status: 'active',
        updated_at: new Date().toISOString(),
      })
      .eq('id', groupId)

    return { error }
  },

  async contributeToGroup(groupId: string) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    // Get group details
    const { data: groupData } = await this.getGroupDetails(groupId)
    if (!groupData) throw new Error('Group not found')

    const { group, members } = groupData
    
    if (group.status !== 'active') {
      throw new Error('Group is not active')
    }

    // Check if user is a member
    const isMember = members.some(m => m.user_id === user.id)
    if (!isMember) throw new Error('You are not a member of this group')

    // Check if user has already contributed this cycle
    const { data: existingContribution } = await supabase
      .from('ajo_ledger')
      .select('id')
      .eq('group_id', groupId)
      .eq('user_id', user.id)
      .eq('cycle_number', group.current_cycle + 1)
      .eq('movement', 'contribution')
      .single()

    if (existingContribution) {
      throw new Error('You have already contributed to this cycle')
    }

    // Deduct from wallet
    await walletService.withdrawFromWallet(
      user.id,
      Number(group.contribution_amount),
      `Ajo contribution to ${group.title} - Cycle ${group.current_cycle + 1}`
    )

    // Record in ledger
    const { data, error } = await supabase
      .from('ajo_ledger')
      .insert({
        group_id: groupId,
        user_id: user.id,
        cycle_number: group.current_cycle + 1,
        movement: 'contribution',
        amount: group.contribution_amount,
      })
      .select()
      .single()

    return { data, error }
  },

  async advanceCycle(groupId: string) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    // Get group details
    const { data: groupData } = await this.getGroupDetails(groupId)
    if (!groupData) throw new Error('Group not found')

    const { group, members } = groupData

    if (group.owner_id !== user.id) {
      throw new Error('Only group owner can advance cycles')
    }

    const nextCycle = group.current_cycle + 1

    // Check if all members have contributed
    const { data: contributions } = await supabase
      .from('ajo_ledger')
      .select('user_id')
      .eq('group_id', groupId)
      .eq('cycle_number', nextCycle)
      .eq('movement', 'contribution')

    const contributorIds = contributions?.map(c => c.user_id) || []
    const allMemberIds = members.map(m => m.user_id)

    const missingContributors = allMemberIds.filter(id => !contributorIds.includes(id))
    if (missingContributors.length > 0) {
      throw new Error('Not all members have contributed to this cycle')
    }

    // Calculate payout amount
    const payoutAmount = Number(group.contribution_amount) * members.length

    // Determine payout recipient (FIFO based on position)
    const sortedMembers = [...members].sort((a, b) => a.position - b.position)
    
    // Find next member who hasn't received payout
    let payoutMember = sortedMembers[0] // Default to first member
    for (const member of sortedMembers) {
      const { data: previousPayout } = await supabase
        .from('ajo_ledger')
        .select('id')
        .eq('group_id', groupId)
        .eq('user_id', member.user_id)
        .eq('movement', 'payout')
        .single()

      if (!previousPayout) {
        payoutMember = member
        break
      }
    }

    // Create cycle record
    await supabase
      .from('ajo_cycles')
      .insert({
        group_id: groupId,
        cycle_number: nextCycle,
        payout_user_id: payoutMember.user_id,
        paid_out: true,
        payout_amount: payoutAmount,
        payout_date: new Date().toISOString(),
      })

    // Record payout in ledger
    await supabase
      .from('ajo_ledger')
      .insert({
        group_id: groupId,
        user_id: payoutMember.user_id,
        cycle_number: nextCycle,
        movement: 'payout',
        amount: payoutAmount,
      })

    // Credit recipient's wallet
    await walletService.fundWallet(
      payoutMember.user_id,
      payoutAmount,
      `Ajo payout from ${group.title} - Cycle ${nextCycle}`
    )

    // Update group current cycle
    await supabase
      .from('ajo_groups')
      .update({
        current_cycle: nextCycle,
        updated_at: new Date().toISOString(),
      })
      .eq('id', groupId)

    // Check if all cycles completed
    const { data: allPayouts } = await supabase
      .from('ajo_ledger')
      .select('user_id')
      .eq('group_id', groupId)
      .eq('movement', 'payout')

    if (allPayouts && allPayouts.length >= members.length) {
      await supabase
        .from('ajo_groups')
        .update({
          status: 'completed',
          updated_at: new Date().toISOString(),
        })
        .eq('id', groupId)
    }

    return { payoutMember, payoutAmount }
  },
}