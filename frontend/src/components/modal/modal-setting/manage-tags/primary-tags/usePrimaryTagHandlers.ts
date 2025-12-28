import { useState } from "react";
import {
  type PrimaryTagData,
  type PrimaryTagFormData,
  DEFAULT_PRIMARY_TAG_FORM,
} from "../../../../../schemas/tagTypes";
import {
  createPrimaryTag,
  updatePrimaryTag,
  deletePrimaryTag,
} from "../../../../../api/primaryTagsApi";

interface UsePrimaryTagHandlersProps {
  showSuccess: (title: string, message: string) => void;
  showError: (title: string, message: string) => void;
  showWarning: (title: string, message: string) => void;
  refreshTags: () => void;
}

interface UsePrimaryTagHandlersReturn {
  formData: PrimaryTagFormData;
  setFormData: React.Dispatch<React.SetStateAction<PrimaryTagFormData>>;
  editingId: string | null;
  isSaving: boolean;
  handleSubmit: () => Promise<void>;
  handleEdit: (tag: PrimaryTagData) => void;
  handleCancelEdit: () => void;
  handleDelete: (tagId: string) => Promise<boolean>;
}

/**
 * Custom hook for managing primary tag CRUD operations
 */
export const usePrimaryTagHandlers = ({
  showSuccess,
  showError,
  showWarning,
  refreshTags,
}: UsePrimaryTagHandlersProps): UsePrimaryTagHandlersReturn => {
  const [formData, setFormData] = useState<PrimaryTagFormData>(
    DEFAULT_PRIMARY_TAG_FORM
  );
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData(DEFAULT_PRIMARY_TAG_FORM);
  };

  const handleSubmit = async () => {
    if (!formData.name || formData.name.length < 1) {
      showWarning("שגיאת אימות", "שם הקטגוריה חייב להכיל לפחות תו אחד");
      return;
    }

    setIsSaving(true);
    try {
      if (editingId) {
        const response = await updatePrimaryTag(editingId, {
          name: formData.name.trim(),
          color: formData.color,
          description: formData.description,
        });
        if (response.success) {
          showSuccess("הצלחה", "הקטגוריה עודכנה בהצלחה");
          handleCancelEdit();
          refreshTags();
        } else {
          showError("שגיאה", response.error || "שגיאה בעדכון הקטגוריה");
        }
      } else {
        const response = await createPrimaryTag({
          name: formData.name.trim(),
          color: formData.color,
          description: formData.description,
        });
        if (response.success) {
          showSuccess("הצלחה", "הקטגוריה נוספה בהצלחה");
          setFormData(DEFAULT_PRIMARY_TAG_FORM);
          refreshTags();
        } else {
          showError("שגיאה", response.error || "שגיאה ביצירת הקטגוריה");
        }
      }
    } catch (error) {
      console.error("Error saving primary tag:", error);
      showError("שגיאה", "אירעה שגיאה בלתי צפויה");
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (tag: PrimaryTagData) => {
    setFormData({
      id: tag.id,
      name: tag.name,
      color: tag.color,
      description: tag.description,
    });
    setEditingId(tag.id);
  };

  const handleDelete = async (tagId: string): Promise<boolean> => {
    try {
      const response = await deletePrimaryTag(tagId);
      if (response.success) {
        showSuccess("הצלחה", "הקטגוריה נמחקה בהצלחה");
        if (editingId === tagId) handleCancelEdit();
        refreshTags();
        return true;
      } else {
        showError(
          "שגיאה",
          response.error || "לא ניתן למחוק קטגוריה עם תגיות משניות"
        );
        return false;
      }
    } catch (error) {
      console.error("Error deleting primary tag:", error);
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

export default usePrimaryTagHandlers;
