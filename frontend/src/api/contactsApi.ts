// Contacts API - handles all contact-related API requests
import { API_ENDPOINTS, apiRequest, type ApiResponse } from "./apiConfig";

// Contact response interface (matches GET /api/contacts response)
export interface Contact {
  id: string;
  fullName: string;
  position: string | null;
  department: string | null;
  phoneNumber: string | null;
  primaryTagIds: string[] | null;  // Link to Primary Tags only
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

// Contact form data for create/update
export interface ContactFormPayload {
  fullName: string;
  position?: string;
  department?: string;
  phoneNumber?: string;
  primaryTagIds?: string[];  // Link to Primary Tags only
}

/**
 * Get all contacts
 */
export const getAllContacts = async (): Promise<ApiResponse<Contact[]>> => {
  return apiRequest<Contact[]>(`${API_ENDPOINTS.contacts}/`);
};

/**
 * Create a new contact
 */
export const createContact = async (
  contactData: ContactFormPayload
): Promise<ApiResponse<Contact>> => {
  const response = await apiRequest<Contact>(`${API_ENDPOINTS.contacts}/`, {
    method: "POST",
    body: JSON.stringify(contactData),
  });

  if (response.success) {
    response.message = "Contact created successfully";
  }

  return response;
};

/**
 * Update a contact by ID
 */
export const updateContact = async (
  contactId: string,
  contactData: Partial<ContactFormPayload>
): Promise<ApiResponse<Contact>> => {
  const response = await apiRequest<Contact>(
    `${API_ENDPOINTS.contacts}/${contactId}`,
    {
      method: "PUT",
      body: JSON.stringify(contactData),
    }
  );

  if (response.success) {
    response.message = "Contact updated successfully";
  }

  return response;
};

/**
 * Delete a contact by ID
 */
export const deleteContact = async (
  contactId: string
): Promise<ApiResponse<null>> => {
  const response = await apiRequest<null>(
    `${API_ENDPOINTS.contacts}/${contactId}`,
    {
      method: "DELETE",
    }
  );

  if (response.success) {
    response.message = "Contact deleted successfully";
  }

  return response;
};
