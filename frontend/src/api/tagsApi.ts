// Tags API - handles all tag-related API requests
import { API_ENDPOINTS, apiRequest, type ApiResponse } from "./apiConfig";

// Tag interfaces
export interface TagBase {
  isDeleted: boolean;
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
  lut: number;
  entityType: string;
}

export interface Tag {
  entityId: string;
  name?: string;
  color?: string;
  description?: string;
  base?: TagBase;
}

export interface TagFormData {
  name?: string;
  color?: string;
  description?: string;
}

/**
 * Get all tags
 */
export const getAllTags = async (): Promise<ApiResponse<Tag[]>> => {
  return apiRequest<Tag[]>(`${API_ENDPOINTS.tags}/`);
};

/**
 * Create a new tag
 */
export const createTag = async (tagData: TagFormData): Promise<ApiResponse<Tag>> => {
  console.log("Creating tag:", tagData);
  const response = await apiRequest<Tag>(`${API_ENDPOINTS.tags}/`, {
    method: "POST",
    body: JSON.stringify(tagData),
  });
  
  if (response.success) {
    console.log("Tag created successfully:", response.data);
    response.message = "Tag created successfully";
  }
  
  return response;
};

/**
 * Update a tag by ID
 */
export const updateTag = async (
  tagId: string,
  tagData: Partial<TagFormData>
): Promise<ApiResponse<Tag>> => {
  const response = await apiRequest<Tag>(`${API_ENDPOINTS.tags}/${tagId}`, {
    method: "PUT",
    body: JSON.stringify(tagData),
  });
  
  if (response.success) {
    response.message = "Tag updated successfully";
  }
  
  return response;
};

/**
 * Delete a tag by ID
 */
export const deleteTag = async (tagId: string): Promise<ApiResponse<null>> => {
  const response = await apiRequest<null>(`${API_ENDPOINTS.tags}/${tagId}`, {
    method: "DELETE",
  });
  
  if (response.success) {
    response.message = "Tag deleted successfully";
  }
  
  return response;
};
