import React from "react";
import { useTheme } from "../../../../contexts/ThemeContext";
import { ToastContainer } from "../../../alert-feedback";
import { useManageHierarchy } from "./hooks/useManageHierarchy";
import {
  HierarchyToolbar,
  SaveCancelBar,
  HierarchyStats,
  HierarchySearch,
  HierarchyLoading,
  HierarchyError,
  HierarchyEmpty,
  AddPikudButton,
  PikudCard,
} from "./components";
import { AddUnitModal } from "./modals/AddUnitModal";
import { DeleteUnitModal } from "./modals/DeleteUnitModal";

const ManageMilitaryHierarchy: React.FC = () => {
  const { isDarkMode } = useTheme();
  const {
    editedHierarchy,
    expandedNodes,
    hasChanges,
    isLoading,
    isError,
    error,
    stats,
    addModal,
    deleteModal,
    isSaving,
    isAllExpanded,
    isAllCollapsed,
    searchQuery,
    setSearchQuery,
    searchResults,
    alerts,
    dismissAlert,
    setAddModal,
    setDeleteModal,
    toggleNode,
    expandAll,
    collapseAll,
    handleSave,
    handleCancel,
    handleCreateUnit,
    handleDeleteUnit,
  } = useManageHierarchy();

  // Loading state
  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col p-8 overflow-hidden">
        <HierarchyLoading isDarkMode={isDarkMode} />
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="flex-1 flex flex-col p-8 overflow-hidden">
        <HierarchyError
          isDarkMode={isDarkMode}
          message={(error as Error)?.message}
        />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col p-8 overflow-hidden" dir="rtl">
      <ToastContainer
        alerts={alerts}
        onDismiss={dismissAlert}
        isDarkMode={isDarkMode}
      />

      {/* Header - Centered title matching other tabs */}
      <h1
        className={`text-2xl font-bold text-center mb-6 ${
          isDarkMode ? "text-white" : "text-slate-800"
        }`}
      >
        ניהול עץ ציוות{" "}
      </h1>

      {/* Stats Row */}
      <HierarchyStats isDarkMode={isDarkMode} stats={stats} />

      {/* Search & Toolbar Row - Combined on same line */}
      <div className="flex items-center justify-between gap-4 mb-6">
        {/* Search Bar - Right side (RTL) */}
        <HierarchySearch
          isDarkMode={isDarkMode}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          resultsCount={searchResults.count}
        />

        {/* Expand/Collapse Toggle - Left side (RTL) */}
        <HierarchyToolbar
          isDarkMode={isDarkMode}
          isAllExpanded={isAllExpanded}
          isAllCollapsed={isAllCollapsed}
          onExpandAll={expandAll}
          onCollapseAll={collapseAll}
        />
      </div>

      {/* Content - Scrollable Tree with proper spacing for scrollbar */}
      <div
        className={`flex-1 overflow-y-auto overflow-x-visible pl-4 -mr-2 pr-2 ${
          isDarkMode ? "dark-scrollbar" : "light-scrollbar"
        }`}
      >
        <div className="space-y-4 pb-4 p-1">
          {/* Add Pikud Button */}
          <AddPikudButton
            isDarkMode={isDarkMode}
            onClick={() => setAddModal({ isOpen: true, type: "pikud" })}
          />

          {/* Empty State */}
          {Object.keys(editedHierarchy).length === 0 && (
            <HierarchyEmpty isDarkMode={isDarkMode} />
          )}

          {/* Pikudim Tree */}
          {Object.entries(editedHierarchy).map(([pikudKey, pikudData]) => (
            <PikudCard
              key={pikudKey}
              pikudKey={pikudKey}
              pikudData={pikudData}
              isDarkMode={isDarkMode}
              expanded={expandedNodes.has(`pikud-${pikudKey}`)}
              expandedNodes={expandedNodes}
              highlightedUnits={searchResults.matchingUnits}
              onToggle={() => toggleNode(`pikud-${pikudKey}`)}
              onToggleNode={toggleNode}
              onDelete={() =>
                setDeleteModal({
                  isOpen: true,
                  type: "pikud",
                  name: pikudKey,
                  pikudKey,
                })
              }
              onAddUgda={() =>
                setAddModal({ isOpen: true, type: "ugda", pikudKey })
              }
              onDeleteUgda={(ugdaKey) =>
                setDeleteModal({
                  isOpen: true,
                  type: "ugda",
                  name: ugdaKey,
                  pikudKey,
                  ugdaKey,
                })
              }
              onAddHativa={(ugdaKey) =>
                setAddModal({ isOpen: true, type: "hativa", pikudKey, ugdaKey })
              }
              onDeleteHativa={(ugdaKey, hativaKey) =>
                setDeleteModal({
                  isOpen: true,
                  type: "hativa",
                  name: hativaKey,
                  pikudKey,
                  ugdaKey,
                  hativaKey,
                })
              }
              onAddGdud={(ugdaKey, hativaKey) =>
                setAddModal({
                  isOpen: true,
                  type: "gdud",
                  pikudKey,
                  ugdaKey,
                  hativaKey,
                })
              }
              onDeleteGdud={(ugdaKey, hativaKey, gdudKey) =>
                setDeleteModal({
                  isOpen: true,
                  type: "gdud",
                  name: gdudKey,
                  pikudKey,
                  ugdaKey,
                  hativaKey,
                  gdudKey,
                })
              }
            />
          ))}

          {/* Save/Cancel Bar - Shows only when changes exist */}
          <SaveCancelBar
            isDarkMode={isDarkMode}
            hasChanges={hasChanges}
            isSaving={isSaving}
            onSave={handleSave}
            onCancel={handleCancel}
          />
        </div>
      </div>

      {/* Modals */}
      <AddUnitModal
        isOpen={addModal.isOpen}
        onClose={() => setAddModal({ ...addModal, isOpen: false })}
        onConfirm={handleCreateUnit}
        type={addModal.type}
        parentName={
          addModal.type === "ugda"
            ? `לפיקוד ${addModal.pikudKey}`
            : addModal.type === "hativa"
            ? `לאוגדה ${addModal.ugdaKey}`
            : addModal.type === "gdud"
            ? `לחטיבה ${addModal.hativaKey}`
            : undefined
        }
        isDarkMode={isDarkMode}
      />

      <DeleteUnitModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
        onConfirm={handleDeleteUnit}
        type={deleteModal.type}
        name={deleteModal.name}
        isDarkMode={isDarkMode}
      />
    </div>
  );
};

export default ManageMilitaryHierarchy;
