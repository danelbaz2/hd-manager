// Tags API - handles all tag-related API requests
import { API_BASE_URL, apiRequest, type ApiResponse } from "@api/apiConfig";

// ===== Primary Tags =====
export interface PrimaryTag {
  id: string;
  name: string;
  description: string | null;
  color: string;
  relatedContactIds: string[] | null;
  base?: {
    isDeleted: boolean;
    isActive: boolean;
    createdAt: number;
    updatedAt: number;
    entityType: string;
    createdBy?: string;
    updatedBy?: string;
  };
}

export interface PrimaryTagFormPayload {
  name: string;
  description?: string;
  color: string;
  relatedContactIds?: string[];
}

const PRIMARY_TAGS_ENDPOINT = `${API_BASE_URL}/primary-tags`;

export const getAllPrimaryTags = async (): Promise<ApiResponse<PrimaryTag[]>> => {
  return apiRequest<PrimaryTag[]>(`${PRIMARY_TAGS_ENDPOINT}/`);
};

export const createPrimaryTag = async (
  tagData: PrimaryTagFormPayload
): Promise<ApiResponse<PrimaryTag>> => {
  const response = await apiRequest<PrimaryTag>(`${PRIMARY_TAGS_ENDPOINT}/`, {
    method: "POST",
    body: JSON.stringify(tagData),
  });

  if (response.success) {
    response.message = "Primary tag created successfully";
  }

  return response;
};

export const updatePrimaryTag = async (
  tagId: string,
  tagData: Partial<PrimaryTagFormPayload>
): Promise<ApiResponse<PrimaryTag>> => {
  const response = await apiRequest<PrimaryTag>(`${PRIMARY_TAGS_ENDPOINT}/${tagId}`, {
    method: "PUT",
    body: JSON.stringify(tagData),
  });

  if (response.success) {
    response.message = "Primary tag updated successfully";
  }

  return response;
};

export const deletePrimaryTag = async (tagId: string): Promise<ApiResponse<null>> => {
  const response = await apiRequest<null>(`${PRIMARY_TAGS_ENDPOINT}/${tagId}`, {
    method: "DELETE",
  });

  if (response.success) {
    response.message = "Primary tag deleted successfully";
  }

  return response;
};

// ===== Secondary Tags =====
export interface SecondaryTag {
  id: string;
  name: string;
  primaryTagId: string;
  description: string | null;
  base?: {
    isDeleted: boolean;
    isActive: boolean;
    createdAt: number;
    updatedAt: number;
    lut: number;
    entityType: string;
  };
}

export interface SecondaryTagFormPayload {
  name: string;
  primaryTagId: string;
  description?: string;
}

export interface SecondaryTagQueryParams {
  primaryTagId?: string;
}

const SECONDARY_TAGS_ENDPOINT = `${API_BASE_URL}/secondary-tags`;

export const getAllSecondaryTags = async (
  params?: SecondaryTagQueryParams
): Promise<ApiResponse<SecondaryTag[]>> => {
  let url = `${SECONDARY_TAGS_ENDPOINT}/`;

  if (params?.primaryTagId) {
    url += `?primaryTagId=${params.primaryTagId}`;
  }

  return apiRequest<SecondaryTag[]>(url);
};

export const createSecondaryTag = async (
  tagData: SecondaryTagFormPayload
): Promise<ApiResponse<SecondaryTag>> => {
  const response = await apiRequest<SecondaryTag>(`${SECONDARY_TAGS_ENDPOINT}/`, {
    method: "POST",
    body: JSON.stringify(tagData),
  });

  if (response.success) {
    response.message = "Secondary tag created successfully";
  }

  return response;
};

export const updateSecondaryTag = async (
  tagId: string,
  tagData: Partial<SecondaryTagFormPayload>
): Promise<ApiResponse<SecondaryTag>> => {
  const response = await apiRequest<SecondaryTag>(`${SECONDARY_TAGS_ENDPOINT}/${tagId}`, {
    method: "PUT",
    body: JSON.stringify(tagData),
  });

  if (response.success) {
    response.message = "Secondary tag updated successfully";
  }

  return response;
};

export const deleteSecondaryTag = async (tagId: string): Promise<ApiResponse<null>> => {
  const response = await apiRequest<null>(`${SECONDARY_TAGS_ENDPOINT}/${tagId}`, {
    method: "DELETE",
  });

  if (response.success) {
    response.message = "Secondary tag deleted successfully";
  }

  return response;
};
