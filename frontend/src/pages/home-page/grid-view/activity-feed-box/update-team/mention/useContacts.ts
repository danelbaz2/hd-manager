// Custom hook for fetching and managing contacts
import { useState, useEffect, useCallback } from "react";
import { getAllContacts, type Contact } from "../../../../../../api/contactsApi";

export interface UseContactsReturn {
  contacts: Contact[];
  isLoading: boolean;
  error: string | null;
  selectedContact: Contact | null;
  setSelectedContact: (contact: Contact | null) => void;
  findContactByName: (name: string) => Contact | undefined;
}

export const useContacts = (): UseContactsReturn => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);

  // Fetch contacts on mount
  useEffect(() => {
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
  }, []);

  // Find contact by name (case-insensitive)
  const findContactByName = useCallback(
    (name: string): Contact | undefined => {
      return contacts.find(
        (c) => c.fullName.toLowerCase() === name.toLowerCase()
      );
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
