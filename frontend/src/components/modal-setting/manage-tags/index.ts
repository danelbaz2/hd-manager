// Two-tier tag management (Primary + Secondary)
export { default as ManageTagsTwoTier } from "./ManageTagsTwoTier";
export { default } from "./ManageTagsTwoTier";

// Sub-components (modular architecture)
export { default as TagCard } from "./TagCard";
export { default as ModeToggle } from "./ModeToggle";
export { default as PrimaryTagForm } from "./PrimaryTagForm";
export { default as SecondaryTagForm } from "./SecondaryTagForm";
export { default as PrimaryTagsList } from "./PrimaryTagsList";
export { default as SecondaryTagsList } from "./SecondaryTagsList";

// Re-export types
export type { TagMode } from "./ModeToggle";
export type { TagCardProps } from "./TagCard";
export type { PrimaryTagFormProps } from "./PrimaryTagForm";
export type { SecondaryTagFormProps } from "./SecondaryTagForm";
export type { PrimaryTagsListProps } from "./PrimaryTagsList";
export type { SecondaryTagsListProps } from "./SecondaryTagsList";
