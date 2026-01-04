/**
 * Contact Query Hooks
 * TanStack Query hooks for contact data management
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAllContacts,
  createContact,
  updateContact,
  deleteContact,
  type Contact,
  type ContactFormPayload,
} from "../contactsApi";
import { queryKeys } from "../queryClient";

/**
 * Hook to fetch all contacts
 */
export const useContactsQuery = () => {
  return useQuery({
    queryKey: queryKeys.contacts.all,
    queryFn: async () => {
      const response = await getAllContacts();
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error || "Failed to fetch contacts");
    },
    // Contacts change infrequently
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook for creating a contact
 */
export const useCreateContactMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (contactData: ContactFormPayload) => {
      const response = await createContact(contactData);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error || "Failed to create contact");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.contacts.all });
    },
  });
};

/**
 * Hook for updating a contact
 */
export const useUpdateContactMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, contactData }: { id: string; contactData: Partial<ContactFormPayload> }) => {
      const response = await updateContact(id, contactData);
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error || "Failed to update contact");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.contacts.all });
    },
  });
};

/**
 * Hook for deleting a contact
 */
export const useDeleteContactMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await deleteContact(id);
      if (response.success) {
        return id;
      }
      throw new Error(response.error || "Failed to delete contact");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.contacts.all });
    },
  });
};

// Re-export types
export type { Contact, ContactFormPayload };
