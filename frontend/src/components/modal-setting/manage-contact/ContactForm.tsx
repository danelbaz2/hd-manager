import React from "react";
import {
  type ContactFormData,
  DEFAULT_CONTACT_FORM,
} from "../../../schemas/contactTypes";
import AddContactForm from "./AddContactForm";
import EditContactForm from "./EditContactForm";

interface ContactFormProps {
  isEditing: boolean;
  formData: ContactFormData;
  setFormData: React.Dispatch<React.SetStateAction<ContactFormData>>;
  onAdd: () => void;
  onSave: () => void;
  onCancel: () => void;
}

const ContactForm: React.FC<ContactFormProps> = ({
  isEditing,
  formData,
  setFormData,
  onAdd,
  onSave,
  onCancel,
}) => {
  if (isEditing) {
    return (
      <EditContactForm
        formData={formData}
        setFormData={setFormData}
        onSave={onSave}
        onCancel={onCancel}
      />
    );
  }

  return <AddContactForm onAdd={onAdd} />;
};

export default ContactForm;
