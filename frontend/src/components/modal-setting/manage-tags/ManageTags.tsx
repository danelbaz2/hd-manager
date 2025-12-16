import React, { useState, useEffect } from "react";
import { useTheme } from "../../../contexts/ThemeContext";
import {
  type TagData,
  type TagFormData,
  DEFAULT_TAG_FORM,
} from "../../../schemas/tagTypes";
import { getAllTags, deleteTag, type Tag } from "../../../api/tagsApi";
import { ToastContainer, useToast } from "../../alert-feedback";
import AddTagForm from "./AddTagForm";
import EditTagForm from "./EditTagForm";
import TagsList from "./TagsList";

// Helper function to convert API Tag to TagData
const mapTagToTagData = (tag: Tag): TagData => ({
  id: tag.id,
  name: tag.name,
  color: tag.color,
  description: tag.description || undefined,
});

const ManageTags: React.FC = () => {
  const { isDarkMode } = useTheme();
  const [tags, setTags] = useState<TagData[]>([]);
  const [formData, setFormData] = useState<TagFormData>(DEFAULT_TAG_FORM);
  const [editingTagId, setEditingTagId] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { alerts, showSuccess, showError, dismissAlert } = useToast();

  // Trigger a refresh of the tags list
  const triggerRefresh = () => {
    setRefreshTrigger((prev) => prev + 1);
  };

  // Fetch tags from API
  useEffect(() => {
    const fetchTags = async () => {
      setIsLoading(true);
      try {
        const response = await getAllTags();
        if (response.success && response.data) {
          const mappedTags = response.data.map(mapTagToTagData);
          setTags(mappedTags);
        } else {
          console.error("Failed to fetch tags:", response.error);
          setTags([]);
        }
      } catch (error) {
        console.error("Error fetching tags:", error);
        setTags([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTags();
  }, [refreshTrigger]);

  const handleAddTag = () => {
    // API call is handled by AddTagForm
    // Just refresh the list
    triggerRefresh();
  };

  const handleEditTag = (tag: TagData) => {
    setEditingTagId(tag.id);
    setFormData({
      id: tag.id,
      name: tag.name,
      color: tag.color,
      description: tag.description,
    });
  };

  const handleSaveEdit = () => {
    // API call is handled by EditTagForm
    // Just reset state and refresh list
    setEditingTagId(null);
    setFormData(DEFAULT_TAG_FORM);
    triggerRefresh();
  };

  const handleCancelEdit = () => {
    setEditingTagId(null);
    setFormData(DEFAULT_TAG_FORM);
  };

  const handleDeleteTag = async (id: string) => {
    try {
      const response = await deleteTag(id);

      if (response.success) {
        showSuccess("הצלחה", "התגית נמחקה בהצלחה");
        // If we're editing this tag, cancel the edit
        if (editingTagId === id) {
          handleCancelEdit();
        }
        triggerRefresh();
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
          setFormData={setFormData}
          onSave={handleSaveEdit}
          onCancel={handleCancelEdit}
        />
      ) : (
        <AddTagForm onAdd={handleAddTag} />
      )}

      {/* Tags List */}
      <TagsList
        tags={tags}
        editingTagId={editingTagId}
        onEdit={handleEditTag}
        onDelete={handleDeleteTag}
        isLoading={isLoading}
      />
    </div>
  );
};

export default ManageTags;
