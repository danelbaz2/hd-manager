/**
 * Tag Query Hooks
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAllPrimaryTags,
  createPrimaryTag,
  updatePrimaryTag,
  deletePrimaryTag,
  getAllSecondaryTags,
  createSecondaryTag,
  updateSecondaryTag,
  deleteSecondaryTag,
  type PrimaryTag,
  type PrimaryTagFormPayload,
  type SecondaryTag,
  type SecondaryTagFormPayload,
} from "./tags.api";
import { queryKeys, queryClient as globalQueryClient } from "@api/queryClient";
import { useAuth } from "@features/auth";

// ===== Primary Tag Queries =====
export const usePrimaryTagsQuery = () => {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: queryKeys.primaryTags.all,
    queryFn: async () => {
      const response = await getAllPrimaryTags();
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error || "Failed to fetch primary tags");
    },
    enabled: !!isAuthenticated,
  });
};

export const useCreatePrimaryTagMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tag: PrimaryTagFormPayload) => {
      const response = await createPrimaryTag(tag);
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

export const useUpdatePrimaryTagMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, tag }: { id: string; tag: Partial<PrimaryTagFormPayload> }) => {
      const response = await updatePrimaryTag(id, tag);
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

// ===== Secondary Tag Queries =====
export const useSecondaryTagsQuery = (primaryTagId?: string) => {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: primaryTagId
      ? [...queryKeys.secondaryTags.all, primaryTagId]
      : queryKeys.secondaryTags.all,
    queryFn: async () => {
      const response = await getAllSecondaryTags(
        primaryTagId ? { primaryTagId } : undefined
      );
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error || "Failed to fetch secondary tags");
    },
    enabled: !!isAuthenticated,
  });
};

export const useCreateSecondaryTagMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tag: SecondaryTagFormPayload) => {
      const response = await createSecondaryTag(tag);
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

export const useUpdateSecondaryTagMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, tag }: { id: string; tag: Partial<SecondaryTagFormPayload> }) => {
      const response = await updateSecondaryTag(id, tag);
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

/**
 * Invalidate all tag queries (for WebSocket updates)
 */
export const invalidateTagQueries = () => {
  globalQueryClient.invalidateQueries({ queryKey: queryKeys.primaryTags.all });
  globalQueryClient.invalidateQueries({ queryKey: queryKeys.secondaryTags.all });
};

export type { PrimaryTag, PrimaryTagFormPayload, SecondaryTag, SecondaryTagFormPayload };
