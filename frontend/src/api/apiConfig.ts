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

// Retry configuration
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 500;

// Helper: delay function
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Generic fetch wrapper with error handling and retry logic
export async function apiRequest<T>(
  url: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const defaultHeaders: Record<string, string> = {
    "Content-Type": "application/json",
  };

  // Add Authorization header if token exists
  const token = sessionStorage.getItem("auth_token");
  if (token) {
    defaultHeaders["Authorization"] = `Bearer ${token}`;
  }

  const requestOptions = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  // Retry logic for network errors
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(url, requestOptions);
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
      // Handle AbortError silently - don't retry
      if (error instanceof Error && error.name === "AbortError") {
        console.log("API request aborted (this is usually fine):", url);
        return {
          success: false,
          aborted: true,
          error: "Request was cancelled",
        };
      }

      lastError = error instanceof Error ? error : new Error("Unknown error");
      
      // Check if it's a network error (Failed to fetch) - retry these
      const isNetworkError = lastError.message.includes("Failed to fetch") || 
                             lastError.message.includes("NetworkError") ||
                             lastError.message.includes("Network request failed");
      
      if (isNetworkError && attempt < MAX_RETRIES) {
        console.log(`API request failed (attempt ${attempt + 1}/${MAX_RETRIES + 1}), retrying in ${RETRY_DELAY_MS}ms...`, url);
        await delay(RETRY_DELAY_MS * (attempt + 1)); // Exponential backoff
        continue; // Retry
      }
      
      // Don't retry for non-network errors
      break;
    }
  }

  // All retries exhausted or non-retryable error
  console.error("API Request Error after retries:", lastError);
  return {
    success: false,
    error: lastError?.message || "An unexpected error occurred",
  };
}
