// Tasks API - handles all task-related API requests
import { API_ENDPOINTS, apiRequest, type ApiResponse } from "./apiConfig";

// Task interfaces
export interface TaskBase {
  isDeleted: boolean;
  createdAt: number;
  updatedAt: number;

  entityType: string;
}

// Valid status values: pending (פתוח), in_progress (בטיפול), completed (סגור), cancelled (מבוטל)
export type TaskStatus = "pending" | "in_progress" | "completed" | "cancelled";

// Valid priority values: low, medium, high
export type TaskPriority = "low" | "medium" | "high";

export interface Task {
  id: string;
  title?: string;
  description?: string;
  date?: number;
  deadline?: number;
  responsibleUserIds?: string[];  // User IDs responsible for the task
  participantIds?: string[];      // Optional: Contact IDs participating
  primaryTagIds?: string[];        // Primary Tag IDs (categories)
  secondaryTagIds?: string[];      // Secondary Tag IDs (new two-tier tag system)
  priority?: TaskPriority;
  status?: TaskStatus;
  base?: TaskBase;
}

export interface TaskFormData {
  title?: string;
  description?: string;
  date?: number;
  deadline?: number;
  responsibleUserIds?: string[];
  participantIds?: string[];      // Optional: Contact IDs
  primaryTagIds?: string[];        // Primary Tag IDs (categories)
  secondaryTagIds?: string[];      // Secondary Tag IDs (new two-tier tag system)
  priority?: TaskPriority;
  status?: TaskStatus;
}

export interface TaskQueryParams {
  date?: number;
  startDate?: number;
  endDate?: number;
  responsibleUserIds?: string;
}

/**
 * Get all tasks with optional filtering
 */
export const getAllTasks = async (params?: TaskQueryParams): Promise<ApiResponse<Task[]>> => {
  let url = `${API_ENDPOINTS.tasks}/`;

  if (params) {
    const queryParams = new URLSearchParams();
    if (params.date !== undefined) queryParams.append("date", params.date.toString());
    if (params.startDate !== undefined) queryParams.append("startDate", params.startDate.toString());
    if (params.endDate !== undefined) queryParams.append("endDate", params.endDate.toString());
    if (params.responsibleUserIds) queryParams.append("responsibleUserIds", params.responsibleUserIds);

    const queryString = queryParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }

  return apiRequest<Task[]>(url);
};

/**
 * Create a new task
 */
export const createTask = async (taskData: TaskFormData): Promise<ApiResponse<Task>> => {
  const response = await apiRequest<Task>(`${API_ENDPOINTS.tasks}/`, {
    method: "POST",
    body: JSON.stringify(taskData),
  });

  if (response.success) {
    response.message = "Task created successfully";
  }

  return response;
};

/**
 * Update a task by ID
 */
export const updateTask = async (
  taskId: string,
  taskData: Partial<TaskFormData>
): Promise<ApiResponse<Task>> => {
  const response = await apiRequest<Task>(`${API_ENDPOINTS.tasks}/${taskId}`, {
    method: "PUT",
    body: JSON.stringify(taskData),
  });

  if (response.success) {
    response.message = "Task updated successfully";
  }

  return response;
};

/**
 * Delete a task by ID
 */
export const deleteTask = async (taskId: string): Promise<ApiResponse<null>> => {
  const response = await apiRequest<null>(`${API_ENDPOINTS.tasks}/${taskId}`, {
    method: "DELETE",
  });

  if (response.success) {
    response.message = "Task deleted successfully";
  }

  return response;
};

// ============== Task History ==============

/**
 * Action types for task history
 */
export type TaskHistoryAction = "CREATE" | "UPDATE" | "IN_PROGRESS" | "CLOSE" | "DELETE" | "NOTE" | "ASSIGN";

/**
 * Task history entry from ents_archive
 */
export interface FileMetadata {
  originalName: string;
  storedName: string;
  size: number;
  type: string;
  url: string;
}

export interface TaskHistoryEntry {
  id: string;
  taskId: string;
  action: TaskHistoryAction;
  timestamp: number;
  updatedBy: string;
  changes: Record<string, unknown>;
  oldValues?: Record<string, unknown>;
  note?: string;
  file?: FileMetadata;
  fullTask?: Task;  // Full task data for real-time updates
}

/**
 * Get ALL tasks history (for global fetch at login)
 */
export interface HistoryQueryParams {
  limit?: number;
  before?: number; // Timestamp cursor - load older
  after?: number;  // Timestamp cursor - load newer
}

/**
 * Get ALL tasks history (for global fetch at login) - supports pagination
 */
export const getAllTasksHistory = async (params?: HistoryQueryParams): Promise<ApiResponse<TaskHistoryEntry[]>> => {
  let url = `${API_ENDPOINTS.tasks}/history`;

  if (params) {
    const queryParams = new URLSearchParams();
    if (params.limit !== undefined) queryParams.append("limit", params.limit.toString());
    if (params.before !== undefined) queryParams.append("before", params.before.toString());
    if (params.after !== undefined) queryParams.append("after", params.after.toString());

    const queryString = queryParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }

  return apiRequest<TaskHistoryEntry[]>(url);
};

/**
 * Get the history of a specific task
 */
export const getTaskHistory = async (
  taskId: string
): Promise<ApiResponse<TaskHistoryEntry[]>> => {
  return apiRequest<TaskHistoryEntry[]>(`${API_ENDPOINTS.tasks}/${taskId}/history`);
};

/**
 * Add a note to a task's history
 */
export const addTaskNote = async (
  taskId: string,
  note: string
): Promise<ApiResponse<TaskHistoryEntry>> => {
  return apiRequest<TaskHistoryEntry>(`${API_ENDPOINTS.tasks}/${taskId}/notes`, {
    method: "POST",
    body: JSON.stringify({ note }),
  });
};

/**
 * Upload a file attachment with optional note
 */
export const uploadTaskFile = async (
  taskId: string,
  file: File,
  note?: string
): Promise<ApiResponse<TaskHistoryEntry>> => {
  const formData = new FormData();
  formData.append("file", file);
  if (note) {
    formData.append("note", note);
  }

  // Get auth token
  const token = sessionStorage.getItem("auth_token");

  try {
    const response = await fetch(`${API_ENDPOINTS.uploads}/task/${taskId}`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });

    const data = await response.json();

    if (response.ok) {
      return { success: true, data };
    } else {
      return { success: false, error: data.error || "Upload failed" };
    }
  } catch (error) {
    return { success: false, error: "Network error during upload" };
  }
};
