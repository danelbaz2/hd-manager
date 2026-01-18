// Tasks API - handles all task-related API requests
import { API_ENDPOINTS, apiRequest, type ApiResponse } from '@api/apiConfig';
import { safeMutationAuto } from '@api/socketAwareApi';

// Task interfaces
export interface TaskBase {
  isDeleted: boolean;
  createdAt: number;
  updatedAt: number;
  entityType: string;
}

// Valid status values: pending (פתוח), in_progress (בטיפול), pending_approval (ממתין לאישור), completed (סגור)
export type TaskStatus = "pending" | "in_progress" | "pending_approval" | "completed";

// Valid priority values: low, medium, high
export type TaskPriority = "low" | "medium" | "high";

export interface TaskOptionals {
  pikud?: string;
  ugda?: string;
  hativa?: string;
  gdud?: string;
  externalSystem?: string;
  externalId?: string;
}

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
  optionals?: TaskOptionals;       // Optional nested fields
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
  optionals?: TaskOptionals;       // Optional nested fields
  priority?: TaskPriority;
  status?: TaskStatus;
}

export interface TaskQueryParams {
  date?: number;
  startDate?: number;
  endDate?: number;
  responsibleUserIds?: string;
  since?: number;  // Delta sync: fetch only tasks modified after this timestamp
}

/**
 * Get all tasks with optional filtering
 * @param params.since - Delta sync: only fetch tasks modified after this timestamp (ms)
 */
export const getAllTasks = async (params?: TaskQueryParams): Promise<ApiResponse<Task[]>> => {
  let url = `${API_ENDPOINTS.tasks}/`;

  if (params) {
    const queryParams = new URLSearchParams();
    if (params.date !== undefined) queryParams.append("date", params.date.toString());
    if (params.startDate !== undefined) queryParams.append("startDate", params.startDate.toString());
    if (params.endDate !== undefined) queryParams.append("endDate", params.endDate.toString());
    if (params.responsibleUserIds) queryParams.append("responsibleUserIds", params.responsibleUserIds);
    if (params.since !== undefined) queryParams.append("since", params.since.toString());

    const queryString = queryParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }

  return apiRequest<Task[]>(url);
};

/**
 * Get a single task by ID
 */
export const getTaskById = async (taskId: string): Promise<ApiResponse<Task>> => {
  return apiRequest<Task>(`${API_ENDPOINTS.tasks}/${taskId}`);
};

/**
 * Create a new task with idempotency protection
 */
export const createTask = async (taskData: TaskFormData): Promise<ApiResponse<Task>> => {
  return safeMutationAuto('createTask', async () => {
    const response = await apiRequest<Task>(`${API_ENDPOINTS.tasks}/`, {
      method: "POST",
      body: JSON.stringify(taskData),
    });

    if (response.success) {
      response.message = "Task created successfully";
    }

    return response;
  });
};

/**
 * Update a task by ID with idempotency protection
 */
export const updateTask = async (
  taskId: string,
  taskData: Partial<TaskFormData>
): Promise<ApiResponse<Task>> => {
  return safeMutationAuto(`updateTask:${taskId}`, async () => {
    const response = await apiRequest<Task>(`${API_ENDPOINTS.tasks}/${taskId}`, {
      method: "PUT",
      body: JSON.stringify(taskData),
    });

    if (response.success) {
      response.message = "Task updated successfully";
    }

    return response;
  });
};

/**
 * Delete a task by ID with idempotency protection
 */
export const deleteTask = async (taskId: string): Promise<ApiResponse<null>> => {
  return safeMutationAuto(`deleteTask:${taskId}`, async () => {
    const response = await apiRequest<null>(`${API_ENDPOINTS.tasks}/${taskId}`, {
      method: "DELETE",
    });

    if (response.success) {
      response.message = "Task deleted successfully";
    }

    return response;
  });
};

// ============== Task Status Transitions ==============

/**
 * Close a task (move to completed status)
 */
export const closeTask = async (taskId: string): Promise<ApiResponse<Task>> => {
  return updateTask(taskId, { status: 'completed' });
};

/**
 * Reopen a task (move back to pending status)
 */
export const reopenTask = async (taskId: string): Promise<ApiResponse<Task>> => {
  return updateTask(taskId, { status: 'pending' });
};

/**
 * Start task progress (move to in_progress status)
 */
export const startTaskProgress = async (taskId: string): Promise<ApiResponse<Task>> => {
  return updateTask(taskId, { status: 'in_progress' });
};

/**
 * Submit task for approval (move to pending_approval status)
 */
export const submitTaskForApproval = async (taskId: string): Promise<ApiResponse<Task>> => {
  return updateTask(taskId, { status: 'pending_approval' });
};

// ============== Task Approval Workflow ==============

/**
 * Approve a pending_approval task (admin only)
 */
export const approveTask = async (taskId: string): Promise<ApiResponse<Task>> => {
  return safeMutationAuto(`approveTask:${taskId}`, async () => {
    const response = await apiRequest<Task>(`${API_ENDPOINTS.tasks}/${taskId}/approve`, {
      method: "POST",
    });

    if (response.success) {
      response.message = "Task approved and closed successfully";
    }

    return response;
  });
};

/**
 * Reject a pending_approval task (admin only)
 */
export const rejectTask = async (taskId: string): Promise<ApiResponse<Task>> => {
  return safeMutationAuto(`rejectTask:${taskId}`, async () => {
    const response = await apiRequest<Task>(`${API_ENDPOINTS.tasks}/${taskId}/reject`, {
      method: "POST",
    });

    if (response.success) {
      response.message = "Task rejected and returned to in progress";
    }

    return response;
  });
};

// ============== Task History ==============

export type TaskHistoryAction = "CREATE" | "UPDATE" | "IN_PROGRESS" | "CLOSE" | "DELETE" | "NOTE" | "ASSIGN" | "PENDING_APPROVAL" | "APPROVE" | "REJECT" | "UPDATE_OPTIONALS" | "UPDATE_EXTERNAL_SYSTEM";

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
  content?: string;
  file?: FileMetadata;
  fullTask?: Task;
  base?: {
    entityType?: string;
    [key: string]: unknown;
  };
}

export interface HistoryQueryParams {
  limit?: number;
  before?: number;
  after?: number;
}

/**
 * Get ALL tasks history (supports pagination)
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
export const getTaskHistory = async (taskId: string): Promise<ApiResponse<TaskHistoryEntry[]>> => {
  return apiRequest<TaskHistoryEntry[]>(`${API_ENDPOINTS.tasks}/${taskId}/history`);
};

/**
 * Add a note to a task's history
 */
export const addTaskNote = async (taskId: string, content: string): Promise<ApiResponse<TaskHistoryEntry>> => {
  return apiRequest<TaskHistoryEntry>(`${API_ENDPOINTS.tasks}/${taskId}/notes`, {
    method: "POST",
    body: JSON.stringify({ content }),
  });
};

/**
 * Upload a file attachment with optional content
 */
export const uploadTaskFile = async (
  taskId: string,
  file: File,
  content?: string
): Promise<ApiResponse<TaskHistoryEntry>> => {
  const formData = new FormData();
  formData.append("file", file);
  if (content) {
    formData.append("content", content);
  }

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
