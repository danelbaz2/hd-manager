// Contact types - imports shared tag types from schemas
import { type TagData, getTextColor, getTagById, AVAILABLE_TAGS } from "./tagTypes";

// Re-export tag utilities for convenience
export { type TagData, getTextColor, getTagById, AVAILABLE_TAGS };

export interface ContactData {
  id: string;
  name: string;
  role: string;
  phone: string;
  tags: string[]; // Array of tag IDs
}

export interface ContactFormData {
  name: string;
  role: string;
  phone: string;
  tags: string[];
}

export const DEFAULT_CONTACT_FORM: ContactFormData = {
  name: "",
  role: "",
  phone: "",
  tags: [],
};
