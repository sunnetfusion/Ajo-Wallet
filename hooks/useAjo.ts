import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

import { useAuth } from '@/contexts/AuthContext'
import { ajoService } from '@/lib/ajo'

export function useAjo() {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const {
    data: groups,
    isLoading: groupsLoading,
    error: groupsError,
  } = useQuery({
    queryKey: ['ajo-groups', user?.id],
    queryFn: () => user ? ajoService.getUserGroups(user.id) : null,
    enabled: !!user,
  })

  const createGroupMutation = useMutation({
    mutationFn: ajoService.createGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ajo-groups', user?.id] })
    },
  })

  const joinGroupMutation = useMutation({
    mutationFn: ajoService.joinGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ajo-groups', user?.id] })
    },
  })

  const leaveGroupMutation = useMutation({
    mutationFn: ajoService.leaveGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ajo-groups', user?.id] })
    },
  })

  const startGroupMutation = useMutation({
    mutationFn: ajoService.startGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ajo-groups', user?.id] })
    },
  })

  const contributeMutation = useMutation({
    mutationFn: ajoService.contributeToGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ajo-groups', user?.id] })
      queryClient.invalidateQueries({ queryKey: ['wallet', user?.id] })
      queryClient.invalidateQueries({ queryKey: ['transactions', user?.id] })
    },
  })

  const advanceCycleMutation = useMutation({
    mutationFn: ajoService.advanceCycle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ajo-groups', user?.id] })
      queryClient.invalidateQueries({ queryKey: ['wallet', user?.id] })
      queryClient.invalidateQueries({ queryKey: ['transactions', user?.id] })
    },
  })

  return {
    groups: groups?.data,
    groupsError: groups?.error || groupsError,
    groupsLoading,
    createGroup: createGroupMutation.mutate,
    joinGroup: joinGroupMutation.mutate,
    leaveGroup: leaveGroupMutation.mutate,
    startGroup: startGroupMutation.mutate,
    contribute: contributeMutation.mutate,
    advanceCycle: advanceCycleMutation.mutate,
    isLoading: createGroupMutation.isPending || joinGroupMutation.isPending || 
              leaveGroupMutation.isPending || startGroupMutation.isPending ||
              contributeMutation.isPending || advanceCycleMutation.isPending,
  }
}

export function useGroupDetails(groupId: string) {
  return useQuery({
    queryKey: ['group-details', groupId],
    queryFn: () => ajoService.getGroupDetails(groupId),
    enabled: !!groupId,
  })
}