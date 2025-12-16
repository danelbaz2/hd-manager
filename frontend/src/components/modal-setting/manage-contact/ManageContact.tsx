import React, { useState } from "react";
import { useTheme } from "../../../contexts/ThemeContext";
import {
  type ContactData,
  type ContactFormData,
  DEFAULT_CONTACT_FORM,
} from "../../../schemas/contactTypes";
import AddContactForm from "./AddContactForm";
import EditContactForm from "./EditContactForm";
import ContactsList from "./ContactsList";

const ManageContact: React.FC = () => {
  const { isDarkMode } = useTheme();
  const [contacts, setContacts] = useState<ContactData[]>([
    {
      id: "1",
      name: "תמיכה טכנית",
      role: "חיצוני",
      phone: "050-0000000",
      tags: ["8", "3"],
    },
    {
      id: "2",
      name: "ספק שרתים",
      role: "תשתיות",
      phone: "052-1111111",
      tags: ["7", "3"],
    },
  ]);

  const [formData, setFormData] =
    useState<ContactFormData>(DEFAULT_CONTACT_FORM);
  const [editingContactId, setEditingContactId] = useState<string | null>(null);

  const handleAddContact = (newContactData: ContactFormData) => {
    const contact: ContactData = {
      id: Date.now().toString(),
      name: newContactData.name,
      role: newContactData.role,
      phone: newContactData.phone,
      tags: newContactData.tags,
    };
    setContacts([...contacts, contact]);
  };

  const handleEditContact = (contact: ContactData) => {
    setEditingContactId(contact.id);
    setFormData({
      name: contact.name,
      role: contact.role,
      phone: contact.phone,
      tags: contact.tags,
    });
  };

  const handleSaveEdit = () => {
    if (editingContactId) {
      setContacts(
        contacts.map((contact) =>
          contact.id === editingContactId
            ? { ...contact, ...formData }
            : contact
        )
      );
    }
    setEditingContactId(null);
    setFormData(DEFAULT_CONTACT_FORM);
  };

  const handleCancelEdit = () => {
    setEditingContactId(null);
    setFormData(DEFAULT_CONTACT_FORM);
  };

  const handleDeleteContact = (id: string) => {
    setContacts(contacts.filter((contact) => contact.id !== id));
    if (editingContactId === id) {
      handleCancelEdit();
    }
  };

  const isEditing = editingContactId !== null;

  return (
    <div className="flex-1 flex flex-col p-8 overflow-hidden">
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
      />
    </div>
  );
};

export default ManageContact;
