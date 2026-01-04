/**
 * User Query Hooks
 * TanStack Query hooks for user data management
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
  type User,
} from "../usersApi";
import { type UserFormData } from "../../schemas/userTypes";
import { queryKeys } from "../queryClient";

/**
 * Hook to fetch all users
 */
export const useUsersQuery = () => {
  return useQuery({
    queryKey: queryKeys.users.all,
    queryFn: async () => {
      const response = await getAllUsers();
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error || "Failed to fetch users");
    },
    // Users change infrequently, cache for longer
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook for creating a user
 */
export const useCreateUserMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userData: UserFormData) => {
      const response = await createUser(userData);
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
    mutationFn: async ({ id, userData }: { id: string; userData: Partial<UserFormData> }) => {
      const response = await updateUser(id, userData);
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

// Re-export types
export type { User };
