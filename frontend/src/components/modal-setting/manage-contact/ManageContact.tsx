import React, { useState } from "react";
import { useTheme } from "../../../contexts/ThemeContext";
import { useSettings } from "../../../contexts/SettingsContext";
import {
  type ContactData,
  type ContactFormData,
  DEFAULT_CONTACT_FORM,
} from "../../../schemas/contactTypes";
import { deleteContact } from "../../../api/contactsApi";
import { ToastContainer, useToast } from "../../alert-feedback";
import AddContactForm from "./AddContactForm";
import EditContactForm from "./EditContactForm";
import ContactsList from "./ContactsList";

const ManageContact: React.FC = () => {
  const { isDarkMode } = useTheme();
  const { contacts, tags, isLoadingContacts, refreshContacts } = useSettings();
  const [formData, setFormData] = useState<ContactFormData>(DEFAULT_CONTACT_FORM);
  const [originalData, setOriginalData] = useState<ContactFormData>(DEFAULT_CONTACT_FORM);
  const [editingContactId, setEditingContactId] = useState<string | null>(null);
  const { alerts, showSuccess, showError, dismissAlert } = useToast();

  const handleAddContact = () => {
    // API call is handled by AddContactForm
    // Refresh from context
    refreshContacts();
  };

  const handleEditContact = (contact: ContactData) => {
    const contactData: ContactFormData = {
      id: contact.id,
      name: contact.name,
      role: contact.role,
      phone: contact.phone,
      tags: contact.tags,
    };
    setEditingContactId(contact.id);
    setFormData(contactData);
    setOriginalData(contactData);
  };

  const handleSaveEdit = () => {
    setEditingContactId(null);
    setFormData(DEFAULT_CONTACT_FORM);
    setOriginalData(DEFAULT_CONTACT_FORM);
    refreshContacts();
  };

  const handleCancelEdit = () => {
    setEditingContactId(null);
    setFormData(DEFAULT_CONTACT_FORM);
    setOriginalData(DEFAULT_CONTACT_FORM);
  };

  const handleDeleteContact = async (id: string) => {
    try {
      const response = await deleteContact(id);

      if (response.success) {
        showSuccess("הצלחה", "איש הקשר נמחק בהצלחה");
        if (editingContactId === id) {
          handleCancelEdit();
        }
        refreshContacts();
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
          originalData={originalData}
          setFormData={setFormData}
          onSave={handleSaveEdit}
          onCancel={handleCancelEdit}
        />
      ) : (
        <AddContactForm onAdd={handleAddContact} />
      )}

      {/* Contacts List - uses context data */}
      <ContactsList
        contacts={contacts}
        tags={tags}
        editingContactId={editingContactId}
        onEdit={handleEditContact}
        onCancelEdit={handleCancelEdit}
        onDelete={handleDeleteContact}
        isLoading={isLoadingContacts}
      />
    </div>
  );
};

export default ManageContact;
