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

export interface Task {
  entityId: string;
  title?: string;
  description?: string;
  date?: number;
  responsibleUsersId?: string[];
  priority?: string;
  status?: string;
  tags?: string[];
  base?: TaskBase;
}

export interface TaskFormData {
  title?: string;
  description?: string;
  date?: number;
  responsibleUsersId?: string[];
  priority?: string;
  status?: string;
  tags?: string[];
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
  console.log("Creating task:", taskData);
  const response = await apiRequest<Task>(`${API_ENDPOINTS.tasks}/`, {
    method: "POST",
    body: JSON.stringify(taskData),
  });
  
  if (response.success) {
    console.log("Task created successfully:", response.data);
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
