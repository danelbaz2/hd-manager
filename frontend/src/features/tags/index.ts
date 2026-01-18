/**
 * Tags Feature - Domain module for primary and secondary tags
 */

// Context
export { TagsProvider, useTags } from './context/tags.context';

// Types
export type {
  PrimaryTagData,
  PrimaryTagFormData,
  SecondaryTagData,
  SecondaryTagFormData,
  TagColor,
} from './types/tag.types';

export {
  PRIMARY_TAG_COLORS,
  TAG_COLORS,
  getTextColor,
  getLighterColor,
  getDarkerColor,
  DEFAULT_PRIMARY_TAG_FORM,
  DEFAULT_SECONDARY_TAG_FORM,
} from './types/tag.types';

// API
export {
  getAllPrimaryTags,
  createPrimaryTag,
  updatePrimaryTag,
  deletePrimaryTag,
  getAllSecondaryTags,
  createSecondaryTag,
  updateSecondaryTag,
  deleteSecondaryTag,
} from './api/tags.api';

export type { PrimaryTag, SecondaryTag } from './api/tags.api';

// Queries
export {
  usePrimaryTagsQuery,
  useCreatePrimaryTagMutation,
  useUpdatePrimaryTagMutation,
  useDeletePrimaryTagMutation,
  useSecondaryTagsQuery,
  useCreateSecondaryTagMutation,
  useUpdateSecondaryTagMutation,
  useDeleteSecondaryTagMutation,
  invalidateTagQueries,
} from './api/tags.queries';
