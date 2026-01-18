/**
 * Shared Components Library
 * Re-exports common UI components from components/common directory
 */

// Common components that exist
export { default as ModalOverlay } from "@components/common/ModalOverlay";
export { default as ScrollToLatestButton } from "@components/common/ScrollToLatestButton";
export { default as UserAvatar } from "@components/common/UserAvatar";

// Re-export all from common index
export * from "@components/common";

// Note: Add more component re-exports as needed
// This file serves as a convenience re-export layer for @lib/components alias
