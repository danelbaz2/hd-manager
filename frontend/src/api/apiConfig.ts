// Base API configuration and shared types
import { getApiUrl, getApiMaxRetries, getApiRetryDelay } from '../config/runtimeConfig';

// Get base API URL - uses runtime config (can be changed after Docker build)
// Note: Using getter function to ensure value is read at runtime
export function getApiBaseUrl(): string {
  return getApiUrl();
}

// For backwards compatibility, export as const but components should prefer getApiBaseUrl()
export const API_BASE_URL = getApiUrl();

// API Endpoints - use getters for runtime resolution
export const getApiEndpoints = () => ({
  users: `${getApiBaseUrl()}/users`,
  tasks: `${getApiBaseUrl()}/tasks`,
  tags: `${getApiBaseUrl()}/tags`,
  contacts: `${getApiBaseUrl()}/contacts`,
  historyEntries: `${getApiBaseUrl()}/history-entries`,
  chatMessages: `${getApiBaseUrl()}/chat`,
  uploads: `${getApiBaseUrl()}/uploads`,
} as const);

// For backwards compatibility
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

// Retry configuration - uses runtime config (can be changed after Docker build)
const getMaxRetries = () => getApiMaxRetries();
const getRetryDelayMs = () => getApiRetryDelay();

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

  // Note: JWT is now sent automatically via HttpOnly cookie
  // No need to manually add Authorization header

  const requestOptions: RequestInit = {
    ...options,
    credentials: 'include', // Required for cookies to be sent cross-origin
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  // Retry logic for network errors
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= getMaxRetries(); attempt++) {
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

      if (isNetworkError && attempt < getMaxRetries()) {
        await delay(getRetryDelayMs() * (attempt + 1)); // Exponential backoff
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
