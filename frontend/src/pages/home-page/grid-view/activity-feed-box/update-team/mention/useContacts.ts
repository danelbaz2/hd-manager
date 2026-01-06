// Custom hook for fetching and managing contacts
// Uses React Query for caching - multiple components share the same cached data
import { useState, useCallback } from "react";
import { useContactsQuery } from "../../../../../../api/queries";
import type { Contact } from "../../../../../../api/contactsApi";
import type { UseContactsReturn } from "../../../../../../schemas/mentionTypes";

export const useContacts = (): UseContactsReturn => {
  // React Query handles fetching and caching - no duplicate requests
  const { data: contacts = [], isLoading, error: queryError } = useContactsQuery();
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  const error = queryError ? "Failed to load contacts" : null;

  // Find contact by name (flexible matching - exact, contains, or trimmed)
  const findContactByName = useCallback(
    (name: string): Contact | undefined => {
      const searchName = name.toLowerCase().trim();

      // Try exact match first
      let contact = contacts.find(
        (c) => c.fullName.toLowerCase().trim() === searchName
      );

      // If no exact match, try contains match
      if (!contact) {
        contact = contacts.find(
          (c) => c.fullName.toLowerCase().includes(searchName) ||
            searchName.includes(c.fullName.toLowerCase())
        );
      }

      return contact;
    },
    [contacts]
  );

  return {
    contacts,
    isLoading,
    error,
    selectedContact,
    setSelectedContact,
    findContactByName,
  };
};
