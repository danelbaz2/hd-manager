import React from "react";
import { type TagFormData } from "../../../schemas/tagTypes";
import AddTagForm from "./AddTagForm";
import EditTagForm from "./EditTagForm";

interface TagFormProps {
  isEditing: boolean;
  formData: TagFormData;
  setFormData: React.Dispatch<React.SetStateAction<TagFormData>>;
  onAdd: (tag: TagFormData) => void;
  onSave: () => void;
  onCancel: () => void;
}

const TagForm: React.FC<TagFormProps> = ({
  isEditing,
  formData,
  setFormData,
  onAdd,
  onSave,
  onCancel,
}) => {
  if (isEditing) {
    return (
      <EditTagForm
        formData={formData}
        setFormData={setFormData}
        onSave={onSave}
        onCancel={onCancel}
      />
    );
  }

  return <AddTagForm onAdd={onAdd} />;
};

export default TagForm;
