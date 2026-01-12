/**
 * Military Hierarchy React Query Hooks
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getMilitaryHierarchy, updateMilitaryHierarchy, type MilitaryHierarchy } from '../militaryHierarchyApi';
import { queryKeys } from '../queryClient';

/**
 * Hook to fetch military hierarchy
 */
export function useMilitaryHierarchyQuery() {
  return useQuery({
    queryKey: queryKeys.militaryHierarchy.all,
    queryFn: async () => {
      const response = await getMilitaryHierarchy();
      if (!response.success || !response.data) {
        throw new Error(response.error || 'Failed to fetch military hierarchy');
      }
      return response.data.hierarchy;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes - hierarchy doesn't change often
  });
}

/**
 * Hook to update military hierarchy (Admin only)
 */
export function useUpdateMilitaryHierarchyMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (hierarchy: MilitaryHierarchy) => updateMilitaryHierarchy(hierarchy),
    onSuccess: (response) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.militaryHierarchy.all });
      // Optionally update cache immediately
      if (response.success && response.data) {
        queryClient.setQueryData(queryKeys.militaryHierarchy.all, response.data.hierarchy);
      }
    },
  });
}
