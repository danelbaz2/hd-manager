/**
 * Contacts Feature Module
 * Exports all contacts-related functionality
 */

// Types
export type { ContactData, ContactFormData } from "./types/contact.types";
export { DEFAULT_CONTACT_FORM } from "./types/contact.types";

// API
export {
  getAllContacts,
  createContact,
  updateContact,
  deleteContact,
  type Contact,
  type ContactFormPayload,
} from "./api/contacts.api";

// Query hooks
export {
  useContactsQuery,
  useCreateContactMutation,
  useUpdateContactMutation,
  useDeleteContactMutation,
  invalidateContactQueries,
} from "./api/contacts.queries";

// Context
export { ContactsProvider, useContacts } from "./context/contacts.context";
