// Primary Tags API - handles all primary tag-related API requests
import { API_BASE_URL, apiRequest, type ApiResponse } from "./apiConfig";

// Primary Tag response interface
export interface PrimaryTag {
    id: string;
    name: string;
    description: string | null;
    color: string;  // Darker color for primary tags
    relatedContactsIds: string[] | null;
    base?: {
        isDeleted: boolean;
        isActive: boolean;
        createdAt: number;
        updatedAt: number;
        lut: number;
        entityType: string;
    };
}

// Primary Tag form data for create/update
export interface PrimaryTagFormPayload {
    name: string;
    description?: string;
    color: string;
    relatedContactsIds?: string[];
}

const PRIMARY_TAGS_ENDPOINT = `${API_BASE_URL}/primary-tags`;

/**
 * Get all primary tags
 */
export const getAllPrimaryTags = async (): Promise<ApiResponse<PrimaryTag[]>> => {
    return apiRequest<PrimaryTag[]>(`${PRIMARY_TAGS_ENDPOINT}/`);
};

/**
 * Get a single primary tag by ID
 */
export const getPrimaryTag = async (tagId: string): Promise<ApiResponse<PrimaryTag>> => {
    return apiRequest<PrimaryTag>(`${PRIMARY_TAGS_ENDPOINT}/${tagId}`);
};

/**
 * Create a new primary tag
 */
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

/**
 * Update a primary tag by ID
 */
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

/**
 * Delete a primary tag by ID
 */
export const deletePrimaryTag = async (tagId: string): Promise<ApiResponse<null>> => {
    const response = await apiRequest<null>(`${PRIMARY_TAGS_ENDPOINT}/${tagId}`, {
        method: "DELETE",
    });

    if (response.success) {
        response.message = "Primary tag deleted successfully";
    }

    return response;
};
