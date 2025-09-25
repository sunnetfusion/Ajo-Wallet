import { supabase } from './supabase'

export const walletService = {
  async getWallet(userId: string) {
    const { data, error } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', userId)
      .single()

    return { data, error }
  },

  async getTransactions(userId: string) {
    const { data, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    return { data, error }
  },

  async fundWallet(userId: string, amount: number, description: string) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || user.id !== userId) throw new Error('Unauthorized')

    // Get current wallet
    const { data: wallet, error: walletError } = await this.getWallet(userId)
    if (walletError) throw walletError

    const newBalance = Number(wallet.balance) + amount

    // Start transaction
    const { data: updatedWallet, error: updateError } = await supabase
      .from('wallets')
      .update({
        balance: newBalance,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .select()
      .single()

    if (updateError) throw updateError

    // Record transaction
    const { data: transaction, error: transactionError } = await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        type: 'credit',
        amount,
        description,
        reference: `FUND-${Date.now()}`,
      })
      .select()
      .single()

    if (transactionError) throw transactionError

    return { wallet: updatedWallet, transaction }
  },

  async withdrawFromWallet(userId: string, amount: number, description: string) {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user || user.id !== userId) throw new Error('Unauthorized')

    // Get current wallet
    const { data: wallet, error: walletError } = await this.getWallet(userId)
    if (walletError) throw walletError

    if (Number(wallet.balance) < amount) {
      throw new Error('Insufficient funds')
    }

    const newBalance = Number(wallet.balance) - amount

    // Update wallet
    const { data: updatedWallet, error: updateError } = await supabase
      .from('wallets')
      .update({
        balance: newBalance,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .select()
      .single()

    if (updateError) throw updateError

    // Record transaction
    const { data: transaction, error: transactionError } = await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        type: 'debit',
        amount,
        description,
        reference: `WITHDRAW-${Date.now()}`,
      })
      .select()
      .single()

    if (transactionError) throw transactionError

    return { wallet: updatedWallet, transaction }
  },
}