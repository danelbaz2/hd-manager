// History API - handles all history entry-related API requests
import { API_ENDPOINTS, apiRequest, type ApiResponse } from "./apiConfig";

// History Entry interfaces
export interface HistoryEntry {
  _id: string;
  entityId: string;
  entityType: string;
  action: "CREATE" | "UPDATE" | "DELETE";
  userId: string;
  timestamp: number;
  oldState?: Record<string, unknown>;
  newState?: Record<string, unknown>;
  changes?: Record<string, unknown>;
}

export interface HistoryEntryFormData {
  entityId: string;
  entityType: string;
  action: "CREATE" | "UPDATE" | "DELETE";
  userId: string;
  timestamp?: number;
  oldState?: Record<string, unknown>;
  newState?: Record<string, unknown>;
  changes?: Record<string, unknown>;
}

export interface HistoryQueryParams {
  entityId?: string;
}

/**
 * Get all history entries with optional filtering by entityId
 */
export const getHistoryEntries = async (
  params?: HistoryQueryParams
): Promise<ApiResponse<HistoryEntry[]>> => {
  let url = `${API_ENDPOINTS.historyEntries}/`;

  if (params?.entityId) {
    url += `?entityId=${encodeURIComponent(params.entityId)}`;
  }

  return apiRequest<HistoryEntry[]>(url);
};

/**
 * Create a new history entry
 */
export const createHistoryEntry = async (
  entryData: HistoryEntryFormData
): Promise<ApiResponse<HistoryEntry>> => {
  const response = await apiRequest<HistoryEntry>(`${API_ENDPOINTS.historyEntries}/`, {
    method: "POST",
    body: JSON.stringify(entryData),
  });

  if (response.success) {
    response.message = "History entry created successfully";
  }

  return response;
};
