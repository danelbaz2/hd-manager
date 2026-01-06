/**
 * ContactsContext - Manages contacts state
 * Split from SettingsContext for better performance
 */
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from "react";
import { getAllContacts, type Contact } from "../api/contactsApi";
import { type ContactData } from "../schemas/contactTypes";
import { useAuth } from "./AuthContext";

// Helper function to convert API Contact to ContactData
const mapContactToContactData = (contact: Contact): ContactData => ({
  id: contact.id,
  name: contact.fullName,
  role: contact.position || "",
  phone: contact.phoneNumber || "",
  primaryTags: contact.primaryTagIds || [],
});

interface ContactsContextState {
  contacts: ContactData[];
  isLoadingContacts: boolean;
  refreshContacts: (silent?: boolean) => Promise<void>;
}

const defaultValue: ContactsContextState = {
  contacts: [],
  isLoadingContacts: false,
  refreshContacts: async () => { },
};

const ContactsContext = createContext<ContactsContextState>(defaultValue);

interface ContactsProviderProps {
  children: ReactNode;
}

export const ContactsProvider: React.FC<ContactsProviderProps> = ({
  children,
}) => {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const [contacts, setContacts] = useState<ContactData[]>([]);
  const [isLoadingContacts, setIsLoadingContacts] = useState(false);

  const refreshContacts = useCallback(async (silent = false) => {
    if (!silent) setIsLoadingContacts(true);
    try {
      const response = await getAllContacts();
      if (response.success && response.data) {
        setContacts(response.data.map(mapContactToContactData));
      } else {
        console.error("Failed to fetch contacts:", response.error);
      }
    } catch (error) {
      console.error("Error fetching contacts:", error);
    } finally {
      if (!silent) setIsLoadingContacts(false);
    }
  }, []);

  // Initial fetch when authenticated
  useEffect(() => {
    if (isAuthLoading) return;
    if (isAuthenticated) {
      refreshContacts();
    } else {
      const hasStoredToken = sessionStorage.getItem("auth_token");
      if (!hasStoredToken) {
        setContacts([]);
      }
    }
  }, [isAuthenticated, isAuthLoading, refreshContacts]);

  const value: ContactsContextState = {
    contacts,
    isLoadingContacts,
    refreshContacts,
  };

  return (
    <ContactsContext.Provider value={value}>
      {children}
    </ContactsContext.Provider>
  );
};

export const useContacts = (): ContactsContextState => {
  const context = useContext(ContactsContext);
  if (!context) {
    throw new Error("useContacts must be used within a ContactsProvider");
  }
  return context;
};

export default ContactsContext;
