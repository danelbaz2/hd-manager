import React from "react";
import { PrimaryTagForm } from "./primary-tags";
import { SecondaryTagForm } from "./secondary-tags";
import type {
  PrimaryTagFormData,
  SecondaryTagFormData,
  PrimaryTagData,
} from "../../../../schemas/tagTypes";
import type { TagMode } from "./ModeToggle";

interface PrimaryFormHandlers {
  formData: PrimaryTagFormData;
  editingId: string | null;
  isSaving: boolean;
  setFormData: React.Dispatch<React.SetStateAction<PrimaryTagFormData>>;
  handleSubmit: () => Promise<void>;
  handleCancelEdit: () => void;
}

interface SecondaryFormHandlers {
  formData: SecondaryTagFormData;
  editingId: string | null;
  isSaving: boolean;
  setFormData: React.Dispatch<React.SetStateAction<SecondaryTagFormData>>;
  handleSubmit: () => Promise<void>;
  handleCancelEdit: () => void;
}

interface TagFormsSectionProps {
  mode: TagMode;
  isDarkMode: boolean;
  primaryTags: PrimaryTagData[];
  primaryHandlers: PrimaryFormHandlers;
  secondaryHandlers: SecondaryFormHandlers;
}

/**
 * TagFormsSection - Renders the appropriate form based on mode
 */
const TagFormsSection: React.FC<TagFormsSectionProps> = ({
  mode,
  isDarkMode,
  primaryTags,
  primaryHandlers,
  secondaryHandlers,
}) => {
  if (mode === "primary") {
    return (
      <PrimaryTagForm
        formData={primaryHandlers.formData}
        isEditing={primaryHandlers.editingId !== null}
        isSaving={primaryHandlers.isSaving}
        isDarkMode={isDarkMode}
        onFormChange={primaryHandlers.setFormData}
        onSubmit={primaryHandlers.handleSubmit}
        onCancel={primaryHandlers.handleCancelEdit}
      />
    );
  }

  return (
    <SecondaryTagForm
      formData={secondaryHandlers.formData}
      primaryTags={primaryTags}
      isEditing={secondaryHandlers.editingId !== null}
      isSaving={secondaryHandlers.isSaving}
      isDarkMode={isDarkMode}
      onFormChange={secondaryHandlers.setFormData}
      onSubmit={secondaryHandlers.handleSubmit}
      onCancel={secondaryHandlers.handleCancelEdit}
    />
  );
};

export default TagFormsSection;
