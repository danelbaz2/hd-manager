import React from "react";
import { type TagFormData } from "../../../schemas/tagTypes";
import AddTagForm from "./AddTagForm";
import EditTagForm from "./EditTagForm";

interface TagFormProps {
  isEditing: boolean;
  formData: TagFormData;
  originalData?: TagFormData;
  setFormData: React.Dispatch<React.SetStateAction<TagFormData>>;
  onAdd: () => void;
  onSave: () => void;
  onCancel: () => void;
}

const TagForm: React.FC<TagFormProps> = ({
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
      <EditTagForm
        formData={formData}
        originalData={originalData}
        setFormData={setFormData}
        onSave={onSave}
        onCancel={onCancel}
      />
    );
  }

  return <AddTagForm onAdd={onAdd} />;
};

export default TagForm;

