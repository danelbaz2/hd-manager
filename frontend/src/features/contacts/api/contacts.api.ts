// Contacts API - handles all contact-related API requests
import { API_BASE_URL, apiRequest, type ApiResponse } from "@api/apiConfig";

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

const CONTACTS_ENDPOINT = `${API_BASE_URL}/contacts`;

/**
 * Get all contacts
 */
export const getAllContacts = async (): Promise<ApiResponse<Contact[]>> => {
  return apiRequest<Contact[]>(`${CONTACTS_ENDPOINT}/`);
};

/**
 * Create a new contact
 */
export const createContact = async (
  contactData: ContactFormPayload
): Promise<ApiResponse<Contact>> => {
  const response = await apiRequest<Contact>(`${CONTACTS_ENDPOINT}/`, {
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
    `${CONTACTS_ENDPOINT}/${contactId}`,
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
    `${CONTACTS_ENDPOINT}/${contactId}`,
    {
      method: "DELETE",
    }
  );

  if (response.success) {
    response.message = "Contact deleted successfully";
  }

  return response;
};
