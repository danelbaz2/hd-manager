// Contact types - imports shared tag types from schemas
import { type TagData, getTextColor } from "./tagTypes";

// Re-export tag utilities for convenience
export { type TagData, getTextColor };

// Contact data interface (for display)
export interface ContactData {
  id: string;
  name: string;      // maps to fullName in API
  role: string;      // maps to position in API
  phone: string;     // maps to phoneNumber in API
  tags: string[];    // maps to tagsIds in API
}

// Contact form data interface (for forms)
export interface ContactFormData {
  id?: string | null;  // Optional - only present when editing
  name: string;
  role: string;
  phone: string;
  tags: string[];
}

export const DEFAULT_CONTACT_FORM: ContactFormData = {
  id: null,
  name: "",
  role: "",
  phone: "",
  tags: [],
};
