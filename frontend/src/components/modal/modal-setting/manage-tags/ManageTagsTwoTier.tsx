import React, { useState, useMemo } from "react";
import { useTheme } from "../../../../contexts/ThemeContext";
import {
  usePrimaryTagsQuery,
  useSecondaryTagsQuery,
  invalidateTagQueries,
} from "../../../../api/queries";
import { mapPrimaryTagsToData, mapSecondaryTagsToData } from "../../../../api/typeMappers";
import { ToastContainer, useToast } from "../../../alert-feedback";

// Sub-components
import ModeToggle, { type TagMode } from "./ModeToggle";
import TagDeleteConfirmModal, {
  type DeleteTarget,
} from "./TagDeleteConfirmModal";
import TagFormsSection from "./TagFormsSection";
import TagListsSection from "./TagListsSection";

// Custom hooks from subdirectories
import { usePrimaryTagHandlers } from "./primary-tags";
import { useSecondaryTagHandlers } from "./secondary-tags";

/**
 * ManageTagsTwoTier - Main orchestrator for two-tier tag management
 *
 * This component manages both primary (category) and secondary tags.
 * It coordinates between forms and lists for both tag types.
 */
const ManageTagsTwoTier: React.FC = () => {
  const { isDarkMode } = useTheme();

  // React Query - Tags (cached, deduplicated)
  const { data: primaryTagsData = [], isLoading: isLoadingTags } = usePrimaryTagsQuery();
  const { data: secondaryTagsData = [] } = useSecondaryTagsQuery();
  const primaryTags = useMemo(() => mapPrimaryTagsToData(primaryTagsData), [primaryTagsData]);
  const secondaryTags = useMemo(() => mapSecondaryTagsToData(secondaryTagsData), [secondaryTagsData]);

  const { alerts, showSuccess, showError, showWarning, dismissAlert } =
    useToast();

  // Mode toggle (Primary or Secondary)
  const [mode, setMode] = useState<TagMode>("primary");

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);

  // Primary tag handlers
  const primaryHandlers = usePrimaryTagHandlers({
    showSuccess,
    showError,
    showWarning,
    refreshTags: invalidateTagQueries,
  });

  // Secondary tag handlers
  const secondaryHandlers = useSecondaryTagHandlers({
    showSuccess,
    showError,
    showWarning,
    refreshTags: invalidateTagQueries,
  });

  // Mode change handler
  const handleModeChange = (newMode: TagMode) => {
    setMode(newMode);
    if (newMode === "primary") {
      secondaryHandlers.handleCancelEdit();
    } else {
      primaryHandlers.handleCancelEdit();
    }
  };

  // Delete handlers
  const handleDeletePrimary = async () => {
    if (!deleteTarget || deleteTarget.type !== "primary") return;
    await primaryHandlers.handleDelete(deleteTarget.tag.id);
    setDeleteTarget(null);
  };

  const handleDeleteSecondary = async () => {
    if (!deleteTarget || deleteTarget.type !== "secondary") return;
    await secondaryHandlers.handleDelete(deleteTarget.tag.id);
    setDeleteTarget(null);
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
      <TagDeleteConfirmModal
        deleteTarget={deleteTarget}
        isDarkMode={isDarkMode}
        onConfirmPrimary={handleDeletePrimary}
        onConfirmSecondary={handleDeleteSecondary}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Header */}
      <h1
        className={`text-2xl font-bold text-center mb-6 ${isDarkMode ? "text-white" : "text-slate-800"
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

      {/* Forms Section */}
      <TagFormsSection
        mode={mode}
        isDarkMode={isDarkMode}
        primaryTags={primaryTags}
        primaryHandlers={primaryHandlers}
        secondaryHandlers={secondaryHandlers}
      />

      {/* Lists Section */}
      <TagListsSection
        mode={mode}
        isDarkMode={isDarkMode}
        isLoading={isLoadingTags}
        primaryTags={primaryTags}
        secondaryTags={secondaryTags}
        primaryHandlers={primaryHandlers}
        secondaryHandlers={secondaryHandlers}
        onDeleteRequest={setDeleteTarget}
      />
    </div>
  );
};

export default ManageTagsTwoTier;
