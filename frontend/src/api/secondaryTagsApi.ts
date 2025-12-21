// Secondary Tags API - handles all secondary tag-related API requests
import { API_BASE_URL, apiRequest, type ApiResponse } from "./apiConfig";

// Secondary Tag response interface
export interface SecondaryTag {
    id: string;
    name: string;
    primaryTagId: string;  // Reference to parent Primary Tag
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

// Secondary Tag form data for create/update
export interface SecondaryTagFormPayload {
    name: string;
    primaryTagId: string;  // Required - reference to parent Primary Tag
    description?: string;
}

// Query params for filtering secondary tags
export interface SecondaryTagQueryParams {
    primaryTagId?: string;  // Filter by parent primary tag
}

const SECONDARY_TAGS_ENDPOINT = `${API_BASE_URL}/secondary-tags`;

/**
 * Get all secondary tags
 * @param params Optional query params to filter by primaryTagId
 */
export const getAllSecondaryTags = async (
    params?: SecondaryTagQueryParams
): Promise<ApiResponse<SecondaryTag[]>> => {
    let url = `${SECONDARY_TAGS_ENDPOINT}/`;

    if (params?.primaryTagId) {
        url += `?primaryTagId=${params.primaryTagId}`;
    }

    return apiRequest<SecondaryTag[]>(url);
};

/**
 * Get secondary tags by primary tag ID
 */
export const getSecondaryTagsByPrimary = async (
    primaryTagId: string
): Promise<ApiResponse<SecondaryTag[]>> => {
    return getAllSecondaryTags({ primaryTagId });
};

/**
 * Get a single secondary tag by ID
 */
export const getSecondaryTag = async (tagId: string): Promise<ApiResponse<SecondaryTag>> => {
    return apiRequest<SecondaryTag>(`${SECONDARY_TAGS_ENDPOINT}/${tagId}`);
};

/**
 * Create a new secondary tag
 */
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

/**
 * Update a secondary tag by ID
 */
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

/**
 * Delete a secondary tag by ID
 */
export const deleteSecondaryTag = async (tagId: string): Promise<ApiResponse<null>> => {
    const response = await apiRequest<null>(`${SECONDARY_TAGS_ENDPOINT}/${tagId}`, {
        method: "DELETE",
    });

    if (response.success) {
        response.message = "Secondary tag deleted successfully";
    }

    return response;
};
