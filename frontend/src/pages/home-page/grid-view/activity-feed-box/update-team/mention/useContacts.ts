// Custom hook for fetching and managing contacts
import { useState, useEffect, useCallback } from "react";
import { getAllContacts, type Contact } from "../../../../../../api/contactsApi";
import type { UseContactsReturn } from "../../../../../../schemas/mentionTypes";

import { useAuth } from "../../../../../../contexts/AuthContext";

export const useContacts = (): UseContactsReturn => {
  const { isAuthenticated } = useAuth();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  // Fetch contacts on mount or when authenticated
  useEffect(() => {
    if (!isAuthenticated) return;

    const loadContacts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await getAllContacts();
        if (response.success && response.data) {
          setContacts(response.data);
        } else {
          setError("Failed to load contacts");
        }
      } catch (err) {
        setError("Error loading contacts");
      } finally {
        setIsLoading(false);
      }
    };
    loadContacts();
  }, [isAuthenticated]);

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
