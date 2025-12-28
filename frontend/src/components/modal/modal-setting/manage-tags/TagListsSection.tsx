import React from "react";
import { PrimaryTagsList } from "./primary-tags";
import { SecondaryTagsList } from "./secondary-tags";
import DelayedLoader from "../../../loaders/DelayedLoader";
import type {
  PrimaryTagData,
  SecondaryTagData,
} from "../../../../schemas/tagTypes";
import type { TagMode } from "./ModeToggle";
import type { DeleteTarget } from "./TagDeleteConfirmModal";

interface PrimaryListHandlers {
  editingId: string | null;
  handleEdit: (tag: PrimaryTagData) => void;
  handleCancelEdit: () => void;
}

interface SecondaryListHandlers {
  editingId: string | null;
  handleEdit: (tag: SecondaryTagData) => void;
  handleCancelEdit: () => void;
}

interface TagListsSectionProps {
  mode: TagMode;
  isDarkMode: boolean;
  isLoading: boolean;
  primaryTags: PrimaryTagData[];
  secondaryTags: SecondaryTagData[];
  primaryHandlers: PrimaryListHandlers;
  secondaryHandlers: SecondaryListHandlers;
  onDeleteRequest: (target: DeleteTarget) => void;
}

/**
 * TagListsSection - Renders the appropriate tag list based on mode
 */
const TagListsSection: React.FC<TagListsSectionProps> = ({
  mode,
  isDarkMode,
  isLoading,
  primaryTags,
  secondaryTags,
  primaryHandlers,
  secondaryHandlers,
  onDeleteRequest,
}) => {
  return (
    <DelayedLoader isLoading={isLoading} delay={300}>
      {mode === "primary" ? (
        <PrimaryTagsList
          primaryTags={primaryTags}
          secondaryTags={secondaryTags}
          editingId={primaryHandlers.editingId}
          isDarkMode={isDarkMode}
          onEdit={primaryHandlers.handleEdit}
          onCancelEdit={primaryHandlers.handleCancelEdit}
          onDeleteRequest={(tag) => onDeleteRequest({ type: "primary", tag })}
        />
      ) : (
        <SecondaryTagsList
          secondaryTags={secondaryTags}
          primaryTags={primaryTags}
          editingId={secondaryHandlers.editingId}
          isDarkMode={isDarkMode}
          onEdit={secondaryHandlers.handleEdit}
          onCancelEdit={secondaryHandlers.handleCancelEdit}
          onDeleteRequest={(tag) => onDeleteRequest({ type: "secondary", tag })}
        />
      )}
    </DelayedLoader>
  );
};

export default TagListsSection;
