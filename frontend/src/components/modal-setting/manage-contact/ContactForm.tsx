import React from "react";
import { type ContactFormData } from "../../../schemas/contactTypes";
import AddContactForm from "./AddContactForm";
import EditContactForm from "./EditContactForm";

interface ContactFormProps {
  isEditing: boolean;
  formData: ContactFormData;
  originalData?: ContactFormData;
  setFormData: React.Dispatch<React.SetStateAction<ContactFormData>>;
  onAdd: () => void;
  onSave: () => void;
  onCancel: () => void;
}

const ContactForm: React.FC<ContactFormProps> = ({
  isEditing,
  formData,
  originalData,
  setFormData,
  onAdd,
  onSave,
  onCancel,
}) => {
  if (isEditing && originalData) {
    return (
      <EditContactForm
        formData={formData}
        originalData={originalData}
        setFormData={setFormData}
        onSave={onSave}
        onCancel={onCancel}
      />
    );
  }

  return <AddContactForm onAdd={onAdd} />;
};

export default ContactForm;

