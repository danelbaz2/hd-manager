// Tags API - handles all tag-related API requests
import { API_ENDPOINTS, apiRequest, type ApiResponse } from "./apiConfig";

// Tag response interface (matches GET /api/tags response from Tags-API.md)
export interface Tag {
  id: string;
  name: string;
  description: string | null;
  relatedContactsIds: string[] | null;
  color: string;
  base?: {
    isDeleted: boolean;
    isActive: boolean;
    createdAt: number;
    updatedAt: number;
    lut: number;
    entityType: string;
  };
}

// Tag form data for create/update
export interface TagFormPayload {
  name: string;
  description?: string;
  relatedContactsIds?: string[];
  color: string;
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
export const createTag = async (
  tagData: TagFormPayload
): Promise<ApiResponse<Tag>> => {
  const response = await apiRequest<Tag>(`${API_ENDPOINTS.tags}/`, {
    method: "POST",
    body: JSON.stringify(tagData),
  });

  if (response.success) {
    response.message = "Tag created successfully";
  }

  return response;
};

/**
 * Update a tag by ID
 */
export const updateTag = async (
  tagId: string,
  tagData: Partial<TagFormPayload>
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
