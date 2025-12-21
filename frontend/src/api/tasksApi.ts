// Tasks API - handles all task-related API requests
import { API_ENDPOINTS, apiRequest, type ApiResponse } from "./apiConfig";

// Task interfaces
export interface TaskBase {
  isDeleted: boolean;
  createdAt: number;
  updatedAt: number;
  lut: number;
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
  responsibleUsersId?: string[];  // User IDs responsible for the task
  participantsIds?: string[];      // Optional: Contact IDs participating
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
  responsibleUsersId?: string[];
  participantsIds?: string[];      // Optional: Contact IDs
  secondaryTagIds?: string[];      // Secondary Tag IDs (new two-tier tag system)
  priority?: TaskPriority;
  status?: TaskStatus;
}

export interface TaskQueryParams {
  date?: number;
  startDate?: number;
  endDate?: number;
  responsibleUsersId?: string;
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
    if (params.responsibleUsersId) queryParams.append("responsibleUsersId", params.responsibleUsersId);

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
