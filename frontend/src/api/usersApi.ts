// Users API - handles all user-related API requests
import { API_ENDPOINTS, apiRequest, type ApiResponse } from "./apiConfig";
import { safeMutationAuto } from "./socketAwareApi";
import { type UserFormData } from "../schemas/userTypes";

// User response interface (matches GET /api/users response)
export interface User {
  id: string;
  fullName: string;
  username: string;
  role: string;
  color: string;
  profileImage: string | null;
  nickname: string | null;  // Optional display nickname
  base?: {
    isDeleted: boolean;
    isActive: boolean;
    createdAt: number;
    updatedAt: number;
    entityType: string;
    createdBy?: string;
    updatedBy?: string;
  };
}

/**
 * Get all users
 */
export const getAllUsers = async (): Promise<ApiResponse<User[]>> => {
  return apiRequest<User[]>(`${API_ENDPOINTS.users}/`);
};

/**
 * Create a new user with idempotency protection
 */
export const createUser = async (userData: UserFormData): Promise<ApiResponse<User>> => {
  return safeMutationAuto('createUser', async () => {
    const response = await apiRequest<User>(`${API_ENDPOINTS.users}/`, {
      method: "POST",
      body: JSON.stringify(userData),
    });

    if (response.success) {
      response.message = "User created successfully";
    }

    return response;
  });
};

/**
 * Update a user by ID with idempotency protection
 */
export const updateUser = async (
  userId: string,
  userData: Partial<UserFormData>
): Promise<ApiResponse<User>> => {
  return safeMutationAuto(`updateUser:${userId}`, async () => {
    const response = await apiRequest<User>(`${API_ENDPOINTS.users}/${userId}`, {
      method: "PUT",
      body: JSON.stringify(userData),
    });

    if (response.success) {
      response.message = "User updated successfully";
    }

    return response;
  });
};

/**
 * Delete a user by ID with idempotency protection
 */
export const deleteUser = async (userId: string): Promise<ApiResponse<null>> => {
  return safeMutationAuto(`deleteUser:${userId}`, async () => {
    const response = await apiRequest<null>(`${API_ENDPOINTS.users}/${userId}`, {
      method: "DELETE",
    });

    if (response.success) {
      response.message = "User deleted successfully";
    }

    return response;
  });
};

