/**
 * Military Hierarchy React Query Hooks
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getMilitaryHierarchy, 
  updateMilitaryHierarchy,
  createMilitaryUnit,
  deleteMilitaryUnit,
  type MilitaryHierarchy
} from '../militaryHierarchyApi';
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

/**
 * Hook to apply incremental operations to military hierarchy (Admin only)
 */
export function useApplyHierarchyOperationsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (params: {
      unitType: 'pikud' | 'ugda' | 'hativa' | 'gdud';
      action: 'create' | 'delete';
      name?: string;
      parentKeys?: { pikudKey?: string; ugdaKey?: string; hativaKey?: string };
    }) => {
      if (params.action === 'create') {
        return createMilitaryUnit(params.unitType, params.name!, params.parentKeys);
      } else {
        return deleteMilitaryUnit(params.unitType, params.name!, params.parentKeys);
      }
    },
    onSuccess: (response) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: queryKeys.militaryHierarchy.all });
      // Update cache immediately with new hierarchy
      if (response.success && response.data) {
        queryClient.setQueryData(queryKeys.militaryHierarchy.all, response.data.hierarchy);
      }
    },
  });
}
