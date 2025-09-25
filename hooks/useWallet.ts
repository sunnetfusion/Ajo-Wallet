import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

import { useAuth } from '@/contexts/AuthContext'
import { walletService } from '@/lib/wallet'

export function useWallet() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const {
    data: wallet,
    isLoading: walletLoading,
    error: walletError,
  } = useQuery({
    queryKey: ['wallet', user?.id],
    queryFn: () => user ? walletService.getWallet(user.id) : null,
    enabled: !!user,
  })

  const {
    data: transactions,
    isLoading: transactionsLoading,
    error: transactionsError,
  } = useQuery({
    queryKey: ['transactions', user?.id],
    queryFn: () => user ? walletService.getTransactions(user.id) : null,
    enabled: !!user,
  })

  const fundWalletMutation = useMutation({
    mutationFn: ({ amount, description }: { amount: number; description: string }) =>
      walletService.fundWallet(user!.id, amount, description),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet', user?.id] })
      queryClient.invalidateQueries({ queryKey: ['transactions', user?.id] })
    },
  })

  const withdrawMutation = useMutation({
    mutationFn: ({ amount, description }: { amount: number; description: string }) =>
      walletService.withdrawFromWallet(user!.id, amount, description),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wallet', user?.id] })
      queryClient.invalidateQueries({ queryKey: ['transactions', user?.id] })
    },
  })

  return {
    wallet: wallet?.data,
    walletError: wallet?.error || walletError,
    walletLoading,
    transactions: transactions?.data,
    transactionsError: transactions?.error || transactionsError,
    transactionsLoading,
    fundWallet: fundWalletMutation.mutate,
    withdraw: withdrawMutation.mutate,
    isLoading: fundWalletMutation.isPending || withdrawMutation.isPending,
  }
}