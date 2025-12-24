import React, { useState } from "react";
import { useTheme } from "../../../../contexts/ThemeContext";
import { useSettings } from "../../../../contexts/SettingsContext";
import {
  type PrimaryTagData,
  type PrimaryTagFormData,
  type SecondaryTagData,
  type SecondaryTagFormData,
  DEFAULT_PRIMARY_TAG_FORM,
  DEFAULT_SECONDARY_TAG_FORM,
} from "../../../../schemas/tagTypes";
import {
  createPrimaryTag,
  updatePrimaryTag,
  deletePrimaryTag,
} from "../../../../api/primaryTagsApi";
import {
  createSecondaryTag,
  updateSecondaryTag,
  deleteSecondaryTag,
} from "../../../../api/secondaryTagsApi";
import { ToastContainer, useToast } from "../../../alert-feedback";
import DelayedLoader from "../../../loaders/DelayedLoader";
import { ConfirmModal } from "../../modal-confirm";

// Sub-components
import ModeToggle, { type TagMode } from "./ModeToggle";
import PrimaryTagForm from "./PrimaryTagForm";
import SecondaryTagForm from "./SecondaryTagForm";
import PrimaryTagsList from "./PrimaryTagsList";
import SecondaryTagsList from "./SecondaryTagsList";

/**
 * ManageTagsTwoTier - Main orchestrator for two-tier tag management
 *
 * This component manages both primary (category) and secondary tags.
 * It coordinates between forms and lists for both tag types.
 */
const ManageTagsTwoTier: React.FC = () => {
  const { isDarkMode } = useTheme();
  const { primaryTags, secondaryTags, isLoadingTags, refreshTags } =
    useSettings();
  const { alerts, showSuccess, showError, showWarning, dismissAlert } =
    useToast();

  // Mode toggle (Primary or Secondary)
  const [mode, setMode] = useState<TagMode>("primary");

  // Primary tag form state
  const [primaryFormData, setPrimaryFormData] = useState<PrimaryTagFormData>(
    DEFAULT_PRIMARY_TAG_FORM
  );
  const [editingPrimaryId, setEditingPrimaryId] = useState<string | null>(null);
  const [isSavingPrimary, setIsSavingPrimary] = useState(false);

  // Secondary tag form state
  const [secondaryFormData, setSecondaryFormData] =
    useState<SecondaryTagFormData>(DEFAULT_SECONDARY_TAG_FORM);
  const [editingSecondaryId, setEditingSecondaryId] = useState<string | null>(
    null
  );
  const [isSavingSecondary, setIsSavingSecondary] = useState(false);

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<{
    type: TagMode;
    tag: PrimaryTagData | SecondaryTagData;
  } | null>(null);

  // ===== Primary Tag Handlers =====
  const handleSubmitPrimary = async () => {
    if (!primaryFormData.name || primaryFormData.name.length < 1) {
      showWarning("שגיאת אימות", "שם הקטגוריה חייב להכיל לפחות תו אחד");
      return;
    }

    setIsSavingPrimary(true);
    try {
      if (editingPrimaryId) {
        const response = await updatePrimaryTag(editingPrimaryId, {
          name: primaryFormData.name.trim(),
          color: primaryFormData.color,
          description: primaryFormData.description,
        });
        if (response.success) {
          showSuccess("הצלחה", "הקטגוריה עודכנה בהצלחה");
          handleCancelPrimaryEdit();
          refreshTags();
        } else {
          showError("שגיאה", response.error || "שגיאה בעדכון הקטגוריה");
        }
      } else {
        const response = await createPrimaryTag({
          name: primaryFormData.name.trim(),
          color: primaryFormData.color,
          description: primaryFormData.description,
        });
        if (response.success) {
          showSuccess("הצלחה", "הקטגוריה נוספה בהצלחה");
          setPrimaryFormData(DEFAULT_PRIMARY_TAG_FORM);
          refreshTags();
        } else {
          showError("שגיאה", response.error || "שגיאה ביצירת הקטגוריה");
        }
      }
    } catch (error) {
      console.error("Error saving primary tag:", error);
      showError("שגיאה", "אירעה שגיאה בלתי צפויה");
    } finally {
      setIsSavingPrimary(false);
    }
  };

  const handleEditPrimary = (tag: PrimaryTagData) => {
    setPrimaryFormData({
      id: tag.id,
      name: tag.name,
      color: tag.color,
      description: tag.description,
    });
    setEditingPrimaryId(tag.id);
  };

  const handleCancelPrimaryEdit = () => {
    setEditingPrimaryId(null);
    setPrimaryFormData(DEFAULT_PRIMARY_TAG_FORM);
  };

  const handleDeletePrimary = async () => {
    if (!deleteTarget || deleteTarget.type !== "primary") return;
    try {
      const response = await deletePrimaryTag(deleteTarget.tag.id);
      if (response.success) {
        showSuccess("הצלחה", "הקטגוריה נמחקה בהצלחה");
        if (editingPrimaryId === deleteTarget.tag.id) handleCancelPrimaryEdit();
        refreshTags();
      } else {
        showError(
          "שגיאה",
          response.error || "לא ניתן למחוק קטגוריה עם תגיות משניות"
        );
      }
    } catch (error) {
      console.error("Error deleting primary tag:", error);
      showError("שגיאה", "אירעה שגיאה בלתי צפויה");
    }
    setDeleteTarget(null);
  };

  // ===== Secondary Tag Handlers =====
  const handleSubmitSecondary = async () => {
    if (!secondaryFormData.name || secondaryFormData.name.length < 1) {
      showWarning("שגיאת אימות", "שם התגית חייב להכיל לפחות תו אחד");
      return;
    }
    if (!secondaryFormData.primaryTagId) {
      showWarning("שגיאת אימות", "יש לבחור קטגוריה ראשית");
      return;
    }

    setIsSavingSecondary(true);
    try {
      if (editingSecondaryId) {
        const response = await updateSecondaryTag(editingSecondaryId, {
          name: secondaryFormData.name.trim(),
          primaryTagId: secondaryFormData.primaryTagId,
          description: secondaryFormData.description,
        });
        if (response.success) {
          showSuccess("הצלחה", "התגית עודכנה בהצלחה");
          handleCancelSecondaryEdit();
          refreshTags();
        } else {
          showError("שגיאה", response.error || "שגיאה בעדכון התגית");
        }
      } else {
        const response = await createSecondaryTag({
          name: secondaryFormData.name.trim(),
          primaryTagId: secondaryFormData.primaryTagId,
          description: secondaryFormData.description,
        });
        if (response.success) {
          showSuccess("הצלחה", "התגית נוספה בהצלחה");
          setSecondaryFormData(DEFAULT_SECONDARY_TAG_FORM);
          refreshTags();
        } else {
          showError("שגיאה", response.error || "שגיאה ביצירת התגית");
        }
      }
    } catch (error) {
      console.error("Error saving secondary tag:", error);
      showError("שגיאה", "אירעה שגיאה בלתי צפויה");
    } finally {
      setIsSavingSecondary(false);
    }
  };

  const handleEditSecondary = (tag: SecondaryTagData) => {
    setSecondaryFormData({
      id: tag.id,
      name: tag.name,
      primaryTagId: tag.primaryTagId,
      description: tag.description,
    });
    setEditingSecondaryId(tag.id);
  };

  const handleCancelSecondaryEdit = () => {
    setEditingSecondaryId(null);
    setSecondaryFormData(DEFAULT_SECONDARY_TAG_FORM);
  };

  const handleDeleteSecondary = async () => {
    if (!deleteTarget || deleteTarget.type !== "secondary") return;
    try {
      const response = await deleteSecondaryTag(deleteTarget.tag.id);
      if (response.success) {
        showSuccess("הצלחה", "התגית נמחקה בהצלחה");
        if (editingSecondaryId === deleteTarget.tag.id)
          handleCancelSecondaryEdit();
        refreshTags();
      } else {
        showError("שגיאה", response.error || "שגיאה במחיקת התגית");
      }
    } catch (error) {
      console.error("Error deleting secondary tag:", error);
      showError("שגיאה", "אירעה שגיאה בלתי צפויה");
    }
    setDeleteTarget(null);
  };

  // ===== Mode Change Handler =====
  const handleModeChange = (newMode: TagMode) => {
    setMode(newMode);
    if (newMode === "primary") {
      handleCancelSecondaryEdit();
    } else {
      handleCancelPrimaryEdit();
    }
  };

  return (
    <div className="flex-1 flex flex-col p-8 overflow-hidden">
      {/* Toast Notifications */}
      <ToastContainer
        alerts={alerts}
        onDismiss={dismissAlert}
        isDarkMode={isDarkMode}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteTarget !== null}
        title={
          deleteTarget?.type === "primary" ? "מחיקת קטגוריה" : "מחיקת תגית"
        }
        text={
          <>
            האם אתה בטוח שברצונך למחוק את{" "}
            {deleteTarget?.type === "primary" ? "הקטגוריה" : "התגית"}
            <span className="font-semibold"> {deleteTarget?.tag?.name}</span>?
          </>
        }
        isDarkMode={isDarkMode}
        onConfirm={
          deleteTarget?.type === "primary"
            ? handleDeletePrimary
            : handleDeleteSecondary
        }
        onCancel={() => setDeleteTarget(null)}
        variant="danger"
        showIrreversibleWarning
      />

      {/* Header */}
      <h1
        className={`text-2xl font-bold text-center mb-6 ${
          isDarkMode ? "text-white" : "text-slate-800"
        }`}
      >
        ניהול תגיות משימה
      </h1>

      {/* Mode Toggle */}
      <ModeToggle
        mode={mode}
        isDarkMode={isDarkMode}
        onModeChange={handleModeChange}
      />

      {/* Form - switches based on mode */}
      {mode === "primary" ? (
        <PrimaryTagForm
          formData={primaryFormData}
          isEditing={editingPrimaryId !== null}
          isSaving={isSavingPrimary}
          isDarkMode={isDarkMode}
          onFormChange={setPrimaryFormData}
          onSubmit={handleSubmitPrimary}
          onCancel={handleCancelPrimaryEdit}
        />
      ) : (
        <SecondaryTagForm
          formData={secondaryFormData}
          primaryTags={primaryTags}
          isEditing={editingSecondaryId !== null}
          isSaving={isSavingSecondary}
          isDarkMode={isDarkMode}
          onFormChange={setSecondaryFormData}
          onSubmit={handleSubmitSecondary}
          onCancel={handleCancelSecondaryEdit}
        />
      )}

      {/* Tags List - switches based on mode */}
      <DelayedLoader isLoading={isLoadingTags} delay={300}>
        {mode === "primary" ? (
          <PrimaryTagsList
            primaryTags={primaryTags}
            secondaryTags={secondaryTags}
            editingId={editingPrimaryId}
            isDarkMode={isDarkMode}
            onEdit={handleEditPrimary}
            onCancelEdit={handleCancelPrimaryEdit}
            onDeleteRequest={(tag) => setDeleteTarget({ type: "primary", tag })}
          />
        ) : (
          <SecondaryTagsList
            secondaryTags={secondaryTags}
            primaryTags={primaryTags}
            editingId={editingSecondaryId}
            isDarkMode={isDarkMode}
            onEdit={handleEditSecondary}
            onCancelEdit={handleCancelSecondaryEdit}
            onDeleteRequest={(tag) =>
              setDeleteTarget({ type: "secondary", tag })
            }
          />
        )}
      </DelayedLoader>
    </div>
  );
};

export default ManageTagsTwoTier;
