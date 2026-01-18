/**
 * User Query Hooks
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllUsers, createUser, updateUser, deleteUser, type User } from "./users.api";
import { queryKeys, queryClient as globalQueryClient } from "@api/queryClient";
import { useAuth } from "@features/auth";
import { type UserFormData } from "../types/user.types";

/**
 * Hook to fetch all users
 */
export const useUsersQuery = () => {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: queryKeys.users.all,
    queryFn: async () => {
      const response = await getAllUsers();
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error || "Failed to fetch users");
    },
    enabled: !!isAuthenticated,
  });
};

/**
 * Hook for creating a user
 */
export const useCreateUserMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (user: UserFormData) => {
      const response = await createUser(user);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error || "Failed to create user");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
  });
};

/**
 * Hook for updating a user
 */
export const useUpdateUserMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, user }: { id: string; user: Partial<UserFormData> }) => {
      const response = await updateUser(id, user);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error || "Failed to update user");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
  });
};

/**
 * Hook for deleting a user
 */
export const useDeleteUserMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await deleteUser(id);
      if (response.success) {
        return id;
      }
      throw new Error(response.error || "Failed to delete user");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    },
  });
};

/**
 * Invalidate user queries (for WebSocket updates)
 */
export const invalidateUserQueries = () => {
  globalQueryClient.invalidateQueries({ queryKey: queryKeys.users.all });
};

export type { User };
