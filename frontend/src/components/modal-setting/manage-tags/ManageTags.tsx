import React, { useState } from "react";
import { useTheme } from "../../../contexts/ThemeContext";
import { useSettings } from "../../../contexts/SettingsContext";
import {
  type TagData,
  type TagFormData,
  DEFAULT_TAG_FORM,
} from "../../../schemas/tagTypes";
import { deleteTag } from "../../../api/tagsApi";
import { ToastContainer, useToast } from "../../alert-feedback";
import AddTagForm from "./AddTagForm";
import EditTagForm from "./EditTagForm";
import TagsList from "./TagsList";

const ManageTags: React.FC = () => {
  const { isDarkMode } = useTheme();
  const { tags, isLoadingTags, refreshTags } = useSettings();
  const [formData, setFormData] = useState<TagFormData>(DEFAULT_TAG_FORM);
  const [originalData, setOriginalData] = useState<TagFormData>(DEFAULT_TAG_FORM);
  const [editingTagId, setEditingTagId] = useState<string | null>(null);
  const { alerts, showSuccess, showError, dismissAlert } = useToast();

  const handleAddTag = () => {
    // API call is handled by AddTagForm
    // Refresh from context
    refreshTags();
  };

  const handleEditTag = (tag: TagData) => {
    const tagData: TagFormData = {
      id: tag.id,
      name: tag.name,
      color: tag.color,
      description: tag.description,
    };
    setEditingTagId(tag.id);
    setFormData(tagData);
    setOriginalData(tagData);
  };

  const handleSaveEdit = () => {
    setEditingTagId(null);
    setFormData(DEFAULT_TAG_FORM);
    setOriginalData(DEFAULT_TAG_FORM);
    refreshTags();
  };

  const handleCancelEdit = () => {
    setEditingTagId(null);
    setFormData(DEFAULT_TAG_FORM);
    setOriginalData(DEFAULT_TAG_FORM);
  };

  const handleDeleteTag = async (id: string) => {
    try {
      const response = await deleteTag(id);

      if (response.success) {
        showSuccess("הצלחה", "התגית נמחקה בהצלחה");
        if (editingTagId === id) {
          handleCancelEdit();
        }
        refreshTags();
      } else {
        showError("שגיאה", response.error || "שגיאה במחיקת התגית");
      }
    } catch (error) {
      console.error("Error deleting tag:", error);
      showError("שגיאה", "אירעה שגיאה בלתי צפויה");
    }
  };

  const isEditing = editingTagId !== null;

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
        ניהול תגיות משימה
      </h1>

      {/* Add or Edit Tag Form */}
      {isEditing ? (
        <EditTagForm
          formData={formData}
          originalData={originalData}
          setFormData={setFormData}
          onSave={handleSaveEdit}
          onCancel={handleCancelEdit}
        />
      ) : (
        <AddTagForm onAdd={handleAddTag} />
      )}

      {/* Tags List - uses context data */}
      <TagsList
        tags={tags}
        editingTagId={editingTagId}
        onEdit={handleEditTag}
        onCancelEdit={handleCancelEdit}
        onDelete={handleDeleteTag}
        isLoading={isLoadingTags}
      />
    </div>
  );
};

export default ManageTags;
