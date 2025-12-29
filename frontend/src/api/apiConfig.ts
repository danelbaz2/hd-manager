// Base API configuration and shared types

// Get base API URL from environment variable (includes /api)
export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// API Endpoints
export const API_ENDPOINTS = {
  users: `${API_BASE_URL}/users`,
  tasks: `${API_BASE_URL}/tasks`,
  tags: `${API_BASE_URL}/tags`,
  contacts: `${API_BASE_URL}/contacts`,
  historyEntries: `${API_BASE_URL}/history-entries`,
  chatMessages: `${API_BASE_URL}/chat`,
  uploads: `${API_BASE_URL}/uploads`,
} as const;

// Generic API Response interface
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  aborted?: boolean;  // Flag to indicate request was aborted (not a real error)
}

// Generic fetch wrapper with error handling
export async function apiRequest<T>(
  url: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const defaultHeaders: Record<string, string> = {
      "Content-Type": "application/json",
    };

    // Add Authorization header if token exists
    const token = sessionStorage.getItem("auth_token");
    if (token) {
      defaultHeaders["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.message || data.error || `HTTP error! status: ${response.status}`,
      };
    }

    return {
      success: true,
      data: data,
    };
  } catch (error) {
    // Handle AbortError silently - this happens when:
    // 1. Component unmounts during request
    // 2. WebSocket triggers a refresh that cancels pending requests
    // 3. User navigates away from the page
    if (error instanceof Error && error.name === "AbortError") {
      console.log("API request aborted (this is usually fine):", url);
      return {
        success: false,
        aborted: true,
        error: "Request was cancelled",
      };
    }
    
    console.error("API Request Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}
