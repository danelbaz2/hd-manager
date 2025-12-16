// Base API configuration and shared types

// Get base API URL from environment variable
export const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// API Endpoints
export const API_ENDPOINTS = {
  users: `${API_BASE_URL}/api/users`,
  tasks: `${API_BASE_URL}/api/tasks`,
  tags: `${API_BASE_URL}/api/tags`,
  systemContacts: `${API_BASE_URL}/api/system-contacts`,
  historyEntries: `${API_BASE_URL}/api/history-entries`,
  chatMessages: `${API_BASE_URL}/api/chat-messages`,
} as const;

// Generic API Response interface
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Generic fetch wrapper with error handling
export async function apiRequest<T>(
  url: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const defaultHeaders = {
      "Content-Type": "application/json",
    };

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
    console.error("API Request Error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "An unexpected error occurred",
    };
  }
}
