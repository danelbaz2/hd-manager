
# Tag System Refactoring & Cleanup

## 1. Cleanup of Legacy Files
Removed the following files that were part of the old single-tier tag system:

### Backend
- `backend/routes/tags.py`: Legacy tag routes
- `backend/models/tag_model.py`: Legacy tag model

### Frontend
- `frontend/src/api/tagsApi.ts`: Legacy API functions
- `frontend/src/components/modal-setting/manage-tags/ManageTags.tsx`: Old monolithic manager
- `frontend/src/components/modal-setting/manage-tags/TagsList.tsx`
- `frontend/src/components/modal-setting/manage-tags/AddTagForm.tsx`
- `frontend/src/components/modal-setting/manage-tags/EditTagForm.tsx`
- `frontend/src/components/modal-setting/manage-tags/TagForm.tsx`
- `frontend/src/components/modal-new-task/components/TagsSelect.tsx`: Old tag selector

## 2. Updated Imports & Registrations
- **Backend (`app.py`)**: Removed `tags` blueprint registration.
- **Frontend API (`api/index.ts`)**: Removed `tagsApi` exports.
- **Frontend Context (`SettingsContext.tsx`)**: Removed `tags` and `refreshTags` (legacy) state; updated to strictly use `primaryTags` and `secondaryTags`.
- **Frontend Modals (`modal-new-task/index.ts`)**: Removed `TagsSelect` export and added `TwoTierTagsSelect`.

## 3. Type System Updates
- **`tagTypes.ts`**: Removed `TagData` and `TagFormData` interfaces. Added optional `color` field to `SecondaryTagData` for UI display purposes.
- **`contactTypes.ts`**: Removed dependency on `TagData`.

## 4. UI Component Updates
Updated components to use the new Two-Tier system (Primary/Secondary tags) instead of the old flat tag system:
- **`HomePage.tsx`**: Switched from `tags` to `secondaryTags`.
- **`TaskListDaily.tsx`**: Updated to accept `SecondaryTagData`.
- **`TaskListItem.tsx`**: Updated to display `SecondaryTagData` and handle optional colors (computed from parent primary tag).
- **`NewTaskModal.tsx`**: Verified usage of `TwoTierTagsSelect`.

## 5. Verification
- partial `tsc` check passed (no errors found).
- Verified `seed.py` uses the new schema.
