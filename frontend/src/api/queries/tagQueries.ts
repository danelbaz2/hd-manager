/**
 * Tag Query Hooks
 * TanStack Query hooks for primary and secondary tags
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAllPrimaryTags,
  createPrimaryTag,
  updatePrimaryTag,
  deletePrimaryTag,
  type PrimaryTag,
  type PrimaryTagFormPayload,
} from "../primaryTagsApi";
import {
  getAllSecondaryTags,
  createSecondaryTag,
  updateSecondaryTag,
  deleteSecondaryTag,
  type SecondaryTag,
  type SecondaryTagFormPayload,
} from "../secondaryTagsApi";
import { queryKeys } from "../queryClient";

// ============== Primary Tags ==============

/**
 * Hook to fetch all primary tags
 */
export const usePrimaryTagsQuery = () => {
  return useQuery({
    queryKey: queryKeys.primaryTags.all,
    queryFn: async () => {
      const response = await getAllPrimaryTags();
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error || "Failed to fetch primary tags");
    },
    // Tags rarely change, cache for longer
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * Hook for creating a primary tag
 */
export const useCreatePrimaryTagMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tagData: PrimaryTagFormPayload) => {
      const response = await createPrimaryTag(tagData);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error || "Failed to create primary tag");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.primaryTags.all });
    },
  });
};

/**
 * Hook for updating a primary tag
 */
export const useUpdatePrimaryTagMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, tagData }: { id: string; tagData: Partial<PrimaryTagFormPayload> }) => {
      const response = await updatePrimaryTag(id, tagData);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error || "Failed to update primary tag");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.primaryTags.all });
    },
  });
};

/**
 * Hook for deleting a primary tag
 */
export const useDeletePrimaryTagMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await deletePrimaryTag(id);
      if (response.success) {
        return id;
      }
      throw new Error(response.error || "Failed to delete primary tag");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.primaryTags.all });
    },
  });
};

// ============== Secondary Tags ==============

/**
 * Hook to fetch all secondary tags
 */
export const useSecondaryTagsQuery = () => {
  return useQuery({
    queryKey: queryKeys.secondaryTags.all,
    queryFn: async () => {
      const response = await getAllSecondaryTags();
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error || "Failed to fetch secondary tags");
    },
    // Tags rarely change, cache for longer
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * Hook for creating a secondary tag
 */
export const useCreateSecondaryTagMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tagData: SecondaryTagFormPayload) => {
      const response = await createSecondaryTag(tagData);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error || "Failed to create secondary tag");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.secondaryTags.all });
    },
  });
};

/**
 * Hook for updating a secondary tag
 */
export const useUpdateSecondaryTagMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, tagData }: { id: string; tagData: Partial<SecondaryTagFormPayload> }) => {
      const response = await updateSecondaryTag(id, tagData);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error || "Failed to update secondary tag");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.secondaryTags.all });
    },
  });
};

/**
 * Hook for deleting a secondary tag
 */
export const useDeleteSecondaryTagMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await deleteSecondaryTag(id);
      if (response.success) {
        return id;
      }
      throw new Error(response.error || "Failed to delete secondary tag");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.secondaryTags.all });
    },
  });
};

// Re-export types
export type { PrimaryTag, PrimaryTagFormPayload, SecondaryTag, SecondaryTagFormPayload };
