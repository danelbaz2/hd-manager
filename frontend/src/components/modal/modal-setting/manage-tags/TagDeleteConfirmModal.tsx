import React from "react";
import { ConfirmModal } from "../../modal-confirm";
import type {
  PrimaryTagData,
  SecondaryTagData,
} from "../../../../schemas/tagTypes";
import type { TagMode } from "./ModeToggle";

export interface DeleteTarget {
  type: TagMode;
  tag: PrimaryTagData | SecondaryTagData;
}

interface TagDeleteConfirmModalProps {
  deleteTarget: DeleteTarget | null;
  isDarkMode: boolean;
  onConfirmPrimary: () => Promise<void>;
  onConfirmSecondary: () => Promise<void>;
  onCancel: () => void;
}

/**
 * TagDeleteConfirmModal - Confirmation modal for deleting tags
 * Handles both primary and secondary tag deletion confirmation
 */
const TagDeleteConfirmModal: React.FC<TagDeleteConfirmModalProps> = ({
  deleteTarget,
  isDarkMode,
  onConfirmPrimary,
  onConfirmSecondary,
  onCancel,
}) => {
  return (
    <ConfirmModal
      isOpen={deleteTarget !== null}
      title={deleteTarget?.type === "primary" ? "מחיקת קטגוריה" : "מחיקת תגית"}
      text={
        <>
          האם אתה בטוח שברצונך למחוק את{" "}
          {deleteTarget?.type === "primary" ? "הקטגוריה" : "התגית"}
          <span className="font-semibold"> {deleteTarget?.tag?.name}</span>?
        </>
      }
      isDarkMode={isDarkMode}
      onConfirm={
        deleteTarget?.type === "primary" ? onConfirmPrimary : onConfirmSecondary
      }
      onCancel={onCancel}
      variant="danger"
      showIrreversibleWarning
    />
  );
};

export default TagDeleteConfirmModal;
