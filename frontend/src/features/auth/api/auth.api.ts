// Auth API - handles all authentication-related API requests
import { API_BASE_URL, apiRequest, type ApiResponse } from "@api/apiConfig";

// Auth response interface (matches login response)
export interface AuthUser {
  id: string;
  fullName: string;
  username: string;
  role: string;
  color: string;
  profileImage: string | null;
  nickname: string | null;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  user: AuthUser;
  message: string;
}

export interface MeResponse {
  user: AuthUser;
}

/**
 * Login user with credentials
 * On success, JWT is set as HttpOnly cookie by the server
 */
export const loginUser = async (credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
  const response = await apiRequest<LoginResponse>(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    body: JSON.stringify(credentials),
  });

  if (response.success) {
    response.message = "Login successful";
  }

  return response;
};

/**
 * Get current user data using JWT cookie
 */
export const getCurrentUser = async (): Promise<ApiResponse<MeResponse>> => {
  return apiRequest<MeResponse>(`${API_BASE_URL}/auth/me`, {
    method: "GET",
  });
};

/**
 * Logout user - clears the HttpOnly JWT cookie on the server
 */
export const logoutUser = async (): Promise<ApiResponse<{ message: string }>> => {
  return apiRequest<{ message: string }>(`${API_BASE_URL}/auth/logout`, {
    method: "POST",
  });
};
