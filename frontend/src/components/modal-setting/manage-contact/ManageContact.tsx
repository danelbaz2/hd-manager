import React, { useState, useEffect } from "react";
import { useTheme } from "../../../contexts/ThemeContext";
import {
  type ContactData,
  type ContactFormData,
  DEFAULT_CONTACT_FORM,
} from "../../../schemas/contactTypes";
import {
  getAllContacts,
  deleteContact,
  type Contact,
} from "../../../api/contactsApi";
import { ToastContainer, useToast } from "../../alert-feedback";
import AddContactForm from "./AddContactForm";
import EditContactForm from "./EditContactForm";
import ContactsList from "./ContactsList";

// Helper function to convert API Contact to ContactData
const mapContactToContactData = (contact: Contact): ContactData => ({
  id: contact.id,
  name: contact.fullName,
  role: contact.position || "",
  phone: contact.phoneNumber || "",
  tags: contact.tagsIds || [],
});

const ManageContact: React.FC = () => {
  const { isDarkMode } = useTheme();
  const [contacts, setContacts] = useState<ContactData[]>([]);
  const [formData, setFormData] =
    useState<ContactFormData>(DEFAULT_CONTACT_FORM);
  const [editingContactId, setEditingContactId] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { alerts, showSuccess, showError, dismissAlert } = useToast();

  // Trigger a refresh of the contacts list
  const triggerRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  // Fetch contacts from API
  useEffect(() => {
    const fetchContacts = async () => {
      setIsLoading(true);
      try {
        const response = await getAllContacts();
        if (response.success && response.data) {
          const mappedContacts = response.data.map(mapContactToContactData);
          setContacts(mappedContacts);
        } else {
          console.error("Failed to fetch contacts:", response.error);
          setContacts([]);
        }
      } catch (error) {
        console.error("Error fetching contacts:", error);
        setContacts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchContacts();
  }, [refreshTrigger]);

  const handleAddContact = () => {
    // API call is handled by AddContactForm
    // Just refresh the list
    triggerRefresh();
  };

  const handleEditContact = (contact: ContactData) => {
    setEditingContactId(contact.id);
    setFormData({
      id: contact.id,
      name: contact.name,
      role: contact.role,
      phone: contact.phone,
      tags: contact.tags,
    });
  };

  const handleSaveEdit = () => {
    // API call is handled by EditContactForm
    // Just reset state and refresh list
    setEditingContactId(null);
    setFormData(DEFAULT_CONTACT_FORM);
    triggerRefresh();
  };

  const handleCancelEdit = () => {
    setEditingContactId(null);
    setFormData(DEFAULT_CONTACT_FORM);
  };

  const handleDeleteContact = async (id: string) => {
    try {
      const response = await deleteContact(id);

      if (response.success) {
        showSuccess("הצלחה", "איש הקשר נמחק בהצלחה");
        // If we're editing this contact, cancel the edit
        if (editingContactId === id) {
          handleCancelEdit();
        }
        triggerRefresh();
      } else {
        showError("שגיאה", response.error || "שגיאה במחיקת איש הקשר");
      }
    } catch (error) {
      console.error("Error deleting contact:", error);
      showError("שגיאה", "אירעה שגיאה בלתי צפויה");
    }
  };

  const isEditing = editingContactId !== null;

  return (
    <div className="flex-1 flex flex-col p-8 overflow-hidden">
      {/* Toast Notifications */}
      <ToastContainer
        alerts={alerts}
        onDismiss={dismissAlert}
        isDarkMode={isDarkMode}
      />

      {/* Header */}
      <h1
        className={`
          text-2xl font-bold text-center mb-8
          ${isDarkMode ? "text-white" : "text-slate-800"}
        `}
      >
        אנשי קשר מערכתיים
      </h1>

      {/* Add or Edit Contact Form */}
      {isEditing ? (
        <EditContactForm
          formData={formData}
          setFormData={setFormData}
          onSave={handleSaveEdit}
          onCancel={handleCancelEdit}
        />
      ) : (
        <AddContactForm onAdd={handleAddContact} />
      )}

      {/* Contacts List */}
      <ContactsList
        contacts={contacts}
        editingContactId={editingContactId}
        onEdit={handleEditContact}
        onDelete={handleDeleteContact}
        isLoading={isLoading}
      />
    </div>
  );
};

export default ManageContact;
