import { useState } from "react";
import {
  type SecondaryTagData,
  type SecondaryTagFormData,
  DEFAULT_SECONDARY_TAG_FORM,
} from "../../../../../schemas/tagTypes";
import {
  createSecondaryTag,
  updateSecondaryTag,
  deleteSecondaryTag,
} from "../../../../../api/secondaryTagsApi";

interface UseSecondaryTagHandlersProps {
  showSuccess: (title: string, message: string) => void;
  showError: (title: string, message: string) => void;
  showWarning: (title: string, message: string) => void;
  refreshTags: () => void;
}

interface UseSecondaryTagHandlersReturn {
  formData: SecondaryTagFormData;
  setFormData: React.Dispatch<React.SetStateAction<SecondaryTagFormData>>;
  editingId: string | null;
  isSaving: boolean;
  handleSubmit: () => Promise<void>;
  handleEdit: (tag: SecondaryTagData) => void;
  handleCancelEdit: () => void;
  handleDelete: (tagId: string) => Promise<boolean>;
}

/**
 * Custom hook for managing secondary tag CRUD operations
 */
export const useSecondaryTagHandlers = ({
  showSuccess,
  showError,
  showWarning,
  refreshTags,
}: UseSecondaryTagHandlersProps): UseSecondaryTagHandlersReturn => {
  const [formData, setFormData] = useState<SecondaryTagFormData>(
    DEFAULT_SECONDARY_TAG_FORM
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData(DEFAULT_SECONDARY_TAG_FORM);
  };

  const handleSubmit = async () => {
    if (!formData.name || formData.name.length < 1) {
      showWarning("שגיאת אימות", "שם התגית חייב להכיל לפחות תו אחד");
      return;
    }
    if (!formData.primaryTagId) {
      showWarning("שגיאת אימות", "יש לבחור קטגוריה ראשית");
      return;
    }

    setIsSaving(true);
    try {
      if (editingId) {
        const response = await updateSecondaryTag(editingId, {
          name: formData.name.trim(),
          primaryTagId: formData.primaryTagId,
          description: formData.description,
        });
        if (response.success) {
          showSuccess("הצלחה", "התגית עודכנה בהצלחה");
          handleCancelEdit();
          refreshTags();
        } else {
          showError("שגיאה", response.error || "שגיאה בעדכון התגית");
        }
      } else {
        const response = await createSecondaryTag({
          name: formData.name.trim(),
          primaryTagId: formData.primaryTagId,
          description: formData.description,
        });
        if (response.success) {
          showSuccess("הצלחה", "התגית נוספה בהצלחה");
          setFormData(DEFAULT_SECONDARY_TAG_FORM);
          refreshTags();
        } else {
          showError("שגיאה", response.error || "שגיאה ביצירת התגית");
        }
      }
    } catch (error) {
      console.error("Error saving secondary tag:", error);
      showError("שגיאה", "אירעה שגיאה בלתי צפויה");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (tag: SecondaryTagData) => {
    setFormData({
      id: tag.id,
      name: tag.name,
      primaryTagId: tag.primaryTagId,
      description: tag.description,
    });
    setEditingId(tag.id);
  };

  const handleDelete = async (tagId: string): Promise<boolean> => {
    try {
      const response = await deleteSecondaryTag(tagId);
      if (response.success) {
        showSuccess("הצלחה", "התגית נמחקה בהצלחה");
        if (editingId === tagId) handleCancelEdit();
        refreshTags();
        return true;
      } else {
        showError("שגיאה", response.error || "שגיאה במחיקת התגית");
        return false;
      }
    } catch (error) {
      console.error("Error deleting secondary tag:", error);
      showError("שגיאה", "אירעה שגיאה בלתי צפויה");
      return false;
    }
  };

  return {
    formData,
    setFormData,
    editingId,
    isSaving,
    handleSubmit,
    handleEdit,
    handleCancelEdit,
    handleDelete,
  };
};

export default useSecondaryTagHandlers;
