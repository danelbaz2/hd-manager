// Two-tier tag management (Primary + Secondary)
export { default as ManageTagsTwoTier } from "./ManageTagsTwoTier";
export { default } from "./ManageTagsTwoTier";

// Shared components
export { default as TagCard } from "./TagCard";
export { default as ModeToggle } from "./ModeToggle";
export { default as TagDeleteConfirmModal } from "./TagDeleteConfirmModal";
export { default as TagFormsSection } from "./TagFormsSection";
export { default as TagListsSection } from "./TagListsSection";

// Primary tags (from subdirectory)
export {
  PrimaryTagForm,
  PrimaryTagsList,
  usePrimaryTagHandlers,
} from "./primary-tags";

// Secondary tags (from subdirectory)
export {
  SecondaryTagForm,
  SecondaryTagsList,
  useSecondaryTagHandlers,
} from "./secondary-tags";

// Re-export types
export type { TagMode } from "./ModeToggle";
export type { TagCardProps } from "./TagCard";
export type { DeleteTarget } from "./TagDeleteConfirmModal";
export type { PrimaryTagFormProps, PrimaryTagsListProps } from "./primary-tags";
export type { SecondaryTagFormProps, SecondaryTagsListProps } from "./secondary-tags";
