# History Logging Fix - Implementation Summary

## 📋 Overview

Fixed all UPDATE operations across the codebase to log only changed fields to `ents_archive`, ensuring consistent history tracking. Also added UPDATE functionality for military hierarchy units.

## ✅ Files Modified

### Backend Routes (5 files)

#### 1. **`backend/routes/users.py`**

- **Lines Modified**: 118-177
- **Change**: Calculate `changes` dict by comparing old vs new document
- **Impact**: User updates now log only changed fields (e.g., only `username` if username changed)
- **Pattern**:

  ```python
  changes = {}
  for key, value in data.items():
      if old_doc.get(key) != value:
          changes[key] = value

  history_changes = changes.copy()
  history_changes['base'] = {'updatedAt': now, 'updatedBy': user}
  log_history('user', id, 'UPDATE', user, old_doc, updated, history_changes)
  ```

#### 2. **`backend/routes/primary_tags.py`**

- **Lines Modified**: 129-159
- **Change**: Same pattern - calculate only changed fields
- **Impact**: Tag name/color updates log only what changed

#### 3. **`backend/routes/secondary_tags.py`**

- **Lines Modified**: 161-191
- **Change**: Same pattern - calculate only changed fields
- **Impact**: Secondary tag updates log only changed fields

#### 4. **`backend/routes/contacts.py`**

- **Lines Modified**: 80-110
- **Change**: Same pattern - calculate only changed fields
- **Impact**: Contact updates log only changed fields

#### 5. **`backend/routes/military_hierarchy.py`**

- **Lines Modified**: 271-430 (added ~140 lines)
- **Changes**:
  1. Fixed DELETE endpoint to log only specific change metadata (not entire hierarchy)
  2. **Added NEW UPDATE endpoint** (`PUT /units/<type>`) for renaming units
- **Impact**:
  - DELETE logs: `{action: "DELETE", type: "gdud", name: "12", pikudKey: "צפון", ...}`
  - UPDATE logs: `{action: "UPDATE", type: "gdud", oldName: "12", newName: "13", ...}`

### Frontend API (2 files)

#### 6. **`frontend/src/api/militaryHierarchyApi.ts`**

- **Lines Added**: 80-98
- **Change**: Added `updateMilitaryUnit()` function
- **Signature**:
  ```typescript
  updateMilitaryUnit(
    unitType: 'pikud' | 'ugda' | 'hativa' | 'gdud',
    oldName: string,
    newName: string,
    parentKeys?: { pikudKey?: string; ugdaKey?: string; hativaKey?: string }
  )
  ```

#### 7. **`frontend/src/api/queries/militaryHierarchyQueries.ts`**

- **Lines Modified**: 1-82
- **Changes**:
  1. Imported `updateMilitaryUnit`
  2. Updated `useApplyHierarchyOperationsMutation` to handle `'update'` action
  3. Added `oldName` and `newName` parameters
- **Impact**: Frontend can now rename military units

---

## 🔍 Before vs After

### ❌ **Before** (Incorrect)

```python
# User updates username from "john" to "jane"
data = {"username": "jane", "email": "john@example.com", "role": "user"}
log_history('user', id, 'UPDATE', user, old_doc, updated, data)
# ❌ Logs ALL fields even though only username changed
```

### ✅ **After** (Correct)

```python
# User updates username from "john" to "jane"
changes = {"username": "jane"}  # Only changed field
history_changes = {
    "username": "jane",
    "base": {"updatedAt": now, "updatedBy": user}
}
log_history('user', id, 'UPDATE', user, old_doc, updated, history_changes)
# ✅ Logs ONLY changed field
```

---

## 📊 Impact on `ents_archive`

### Before

```json
{
  "o": { "username": "john", "email": "john@example.com", "role": "user" },
  "c": {
    "username": "jane",
    "email": "john@example.com", // ❌ Unchanged but logged
    "role": "user", // ❌ Unchanged but logged
    "base": { "updatedAt": 123, "updatedBy": "Admin" }
  },
  "n": { "username": "jane", "email": "john@example.com", "role": "user" }
}
```

### After

```json
{
  "o": { "username": "john", "email": "john@example.com", "role": "user" },
  "c": {
    "username": "jane", // ✅ Only changed field
    "base": { "updatedAt": 123, "updatedBy": "Admin" }
  },
  "n": { "username": "jane", "email": "john@example.com", "role": "user" }
}
```

---

## 🎯 Benefits

1. **Cleaner History**: Archive entries show only what actually changed
2. **Smaller Database**: Less redundant data in `ents_archive`
3. **Better UX**: History UI can clearly show "Username changed from X to Y" without noise
4. **Consistency**: All UPDATE operations now follow the same pattern
5. **New Feature**: Military units can now be renamed via UI

---

## 🧪 Testing Checklist

- [ ] Test user update (change username only)
- [ ] Test primary tag update (change name only)
- [ ] Test secondary tag update (change name only)
- [ ] Test contact update (change phone only)
- [ ] Test military hierarchy rename (rename a gdud)
- [ ] Verify `ents_archive` entries show only changed fields
- [ ] Verify history UI displays changes correctly

---

## 📝 Next Steps (Frontend UI)

To complete the military hierarchy UPDATE feature, you need to add UI components:

1. **Edit buttons** on each unit card (Pikud, Ugda, Hativa, Gdud)
2. **Edit modal** to enter new name
3. **Hook integration** in `useManageHierarchy.ts`:
   - Add `updateModal` state
   - Add `handleUpdateUnit(oldName, newName)` function
   - Track `'update'` in pending operations

Would you like me to implement the frontend UI components next?
