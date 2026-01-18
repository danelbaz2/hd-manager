/**
 * Contact Types
 */

// Contact data interface (for display)
export interface ContactData {
  id: string;
  name: string;        // maps to fullName in API
  role: string;        // maps to position in API
  phone: string;       // maps to phoneNumber in API
  primaryTags: string[]; // maps to primaryTagIds in API (Primary Tags only)
}

// Contact form data interface (for forms)
export interface ContactFormData {
  id?: string | null;  // Optional - only present when editing
  name: string;
  role: string;
  phone: string;
  primaryTags: string[];  // Primary Tag IDs
}

export const DEFAULT_CONTACT_FORM: ContactFormData = {
  id: null,
  name: "",
  role: "",
  phone: "",
  primaryTags: [],
};
