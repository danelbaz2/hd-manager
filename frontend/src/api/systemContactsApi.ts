// System Contacts API - handles all system contact-related API requests
import { API_ENDPOINTS, apiRequest, type ApiResponse } from "./apiConfig";

// System Contact interfaces
export interface SystemContactBase {
  isDeleted: boolean;
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
  lut: number;
  entityType: string;
}

export interface SystemContact {
  entityId: string;
  name?: string;
  phone?: string;
  email?: string;
  role?: string;
  notes?: string;
  base?: SystemContactBase;
}

export interface SystemContactFormData {
  name?: string;
  phone?: string;
  email?: string;
  role?: string;
  notes?: string;
}

/**
 * Get all system contacts
 */
export const getAllSystemContacts = async (): Promise<ApiResponse<SystemContact[]>> => {
  return apiRequest<SystemContact[]>(`${API_ENDPOINTS.systemContacts}/`);
};

/**
 * Create a new system contact
 */
export const createSystemContact = async (
  contactData: SystemContactFormData
): Promise<ApiResponse<SystemContact>> => {
  console.log("Creating system contact:", contactData);
  const response = await apiRequest<SystemContact>(`${API_ENDPOINTS.systemContacts}/`, {
    method: "POST",
    body: JSON.stringify(contactData),
  });
  
  if (response.success) {
    console.log("System contact created successfully:", response.data);
    response.message = "System contact created successfully";
  }
  
  return response;
};

/**
 * Update a system contact by ID
 */
export const updateSystemContact = async (
  contactId: string,
  contactData: Partial<SystemContactFormData>
): Promise<ApiResponse<SystemContact>> => {
  const response = await apiRequest<SystemContact>(`${API_ENDPOINTS.systemContacts}/${contactId}`, {
    method: "PUT",
    body: JSON.stringify(contactData),
  });
  
  if (response.success) {
    response.message = "System contact updated successfully";
  }
  
  return response;
};

/**
 * Delete a system contact by ID
 */
export const deleteSystemContact = async (contactId: string): Promise<ApiResponse<null>> => {
  const response = await apiRequest<null>(`${API_ENDPOINTS.systemContacts}/${contactId}`, {
    method: "DELETE",
  });
  
  if (response.success) {
    response.message = "System contact deleted successfully";
  }
  
  return response;
};
