/**
 * Contacts Query Hooks
 */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAllContacts,
  createContact,
  updateContact,
  deleteContact,
  type Contact,
  type ContactFormPayload,
} from "./contacts.api";
import { queryKeys, queryClient as globalQueryClient } from "@api/queryClient";
import { useAuth } from "@features/auth";

export const useContactsQuery = () => {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: queryKeys.contacts.all,
    queryFn: async () => {
      const response = await getAllContacts();
      if (response.success && response.data) {
        return response.data;
      }
      throw new Error(response.error || "Failed to fetch contacts");
    },
    enabled: !!isAuthenticated,
  });
};

export const useCreateContactMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (contact: ContactFormPayload) => {
      const response = await createContact(contact);
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

export const useUpdateContactMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, contact }: { id: string; contact: Partial<ContactFormPayload> }) => {
      const response = await updateContact(id, contact);
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

/**
 * Invalidate contact queries (for WebSocket updates)
 */
export const invalidateContactQueries = () => {
  globalQueryClient.invalidateQueries({ queryKey: queryKeys.contacts.all });
};

export type { Contact, ContactFormPayload };
