// Users API - handles all user-related API requests
import { API_ENDPOINTS, apiRequest, type ApiResponse } from "./apiConfig";
import { type UserFormData } from "../schemas/userentity";

// User response interface
export interface User {
  entityId: string;
  fullName: string;
  username: string;
  role: string;
  color: string;
  profileImage: string | null;
  base?: {
    isDeleted: boolean;
    isActive: boolean;
    createdAt: number;
    updatedAt: number;
    lut: number;
    entityType: string;
  };
}

/**
 * Get all users
 */
export const getAllUsers = async (): Promise<ApiResponse<User[]>> => {
  return apiRequest<User[]>(`${API_ENDPOINTS.users}/`);
};

/**
 * Create a new user
 */
export const createUser = async (userData: UserFormData): Promise<ApiResponse<User>> => {
  console.log("Creating user:", userData);
  const response = await apiRequest<User>(`${API_ENDPOINTS.users}/`, {
    method: "POST", 
    body: JSON.stringify(userData),
  });
  
  if (response.success) {
    console.log("User created successfully:", response.data);
    response.message = "User created successfully";
  }
  
  return response;
};

/**
 * Update a user by ID
 */
export const updateUser = async (
  userId: string,
  userData: Partial<UserFormData>
): Promise<ApiResponse<User>> => {
  const response = await apiRequest<User>(`${API_ENDPOINTS.users}/${userId}`, {
    method: "PUT",
    body: JSON.stringify(userData),
  });
  
  if (response.success) {
    response.message = "User updated successfully";
  }
  
  return response;
};

/**
 * Delete a user by ID
 */
export const deleteUser = async (userId: string): Promise<ApiResponse<null>> => {
  const response = await apiRequest<null>(`${API_ENDPOINTS.users}/${userId}`, {
    method: "DELETE",
  });
  
  if (response.success) {
    response.message = "User deleted successfully";
  }
  
  return response;
};
