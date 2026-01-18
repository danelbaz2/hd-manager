# 🚀 Production Merge Checklist

**Generated:** January 18, 2026  
**Project:** HD Manager  
**Purpose:** Review items before merging to production

---

## 📋 How to Use This Document

- [ ] **Review each section** and decide which items to implement
- Mark items as:
  - ✅ **Done** - Completed
  - ⏭️ **Skip** - Will not implement (add reason)
  - 🕐 **Later** - Defer to future release

---

## 🔴 CRITICAL - Security Issues

> **These items should be addressed before production!**

### 1. SSL Certificates in Repository

- [ ] **Issue:** SSL certificates (`docker/ca/server.crt`, `docker/ca/server.key`) are in the repository
- [ ] **Impact:** Security risk - private keys should never be in version control
- [ ] **Action:** Add `docker/ca/` to `.gitignore` and remove from git history, or ensure these are self-signed dev certs only

### 2. Environment Files with Secrets

| File            | Contains Secrets                       | In .gitignore  |
| --------------- | -------------------------------------- | -------------- |
| `.env`          | ✅ Yes (SECRET_KEY, JWT_SECRET_KEY)    | ✅ Yes         |
| `backend/.env`  | ✅ Yes (JWT_SECRET_KEY, ADMIN_API_KEY) | ✅ Yes         |
| `frontend/.env` | ⚠️ No secrets                          | ❌ **Missing** |

- [ ] **Action:** Add `frontend/.env` to `.gitignore` (it may contain test values you don't want in prod)

### 3. Weak Seed User Passwords

- [ ] **Issue:** Seed data in `backend/_seed_data/users_data.py` contains `passwordHash: "123456"`
- [ ] **Impact:** If seed data runs in production, creates users with weak passwords
- [ ] **Action:** Ensure seed scripts are NOT run in production, or use properly hashed passwords

### 4. Docker Compose Hardcoded Default Secrets

- [ ] **Issue:** `docker-compose.prod.yml` contains placeholder secrets:
  ```yaml
  SECRET_KEY=CHANGE_ME_generate_with_python_secrets_token_hex_32
  JWT_SECRET_KEY=CHANGE_ME_generate_with_python_secrets_token_hex_32
  ```
- [ ] **Action:** Document in deployment guide that these MUST be changed before deployment

---

## 🟠 HIGH PRIORITY - Configuration Issues

### 5. ⏭️ SKIP - MongoDB Version Mismatch

> Skipped - will be handled during deployment

### 6. ⏭️ SKIP - Test Values in Development Files

> Skipped - development files don't affect production

### 7. ⏭️ SKIP - Debug Mode in Development Files

> Skipped - production uses `DEBUG=False` ✅

---

## 🟡 MEDIUM PRIORITY - Code Cleanup

### 8. ✅ DONE - Console.log Statements (34 → 0 removed)

> Removed all unnecessary debug logging from production code

**Files cleaned:**

- ✅ `socketManager.ts` - Removed 12 debug logs (connection status, reconnection)
- ✅ `TasksContext.tsx` - Removed 2 debug logs (delta sync)
- ✅ `AuthContext.tsx` - Removed 3 debug logs (retry attempts, auth status)
- ✅ `KanbanBoard.tsx` - Removed 1 debug log (drop handler)
- ✅ `userStorage.ts` - Removed 1 debug log (migration)
- ✅ `useImageUpload.ts` - Removed 1 debug log (compression stats)
- ✅ `AddUserForm.tsx` - Removed 2 debug logs (submission)
- ✅ `useTaskForm.ts` - Removed 3 debug logs (task creation)
- ✅ `idempotency.ts` - Removed 2 debug logs (request tracking)
- ✅ `socketAwareApi.ts` - Removed 1 debug log (connection status)
- ✅ `tasksApi.ts` - Removed 1 debug log (task creation)
- ✅ `apiConfig.ts` - Removed 2 debug logs (retry/abort)

**Preserved:** All `console.error` and `console.warn` statements for error tracking

### 9. ✅ DONE - Debug onClick Handlers

- ✅ `UserCard.tsx` - Removed `onClick={() => console.log(user)}`
- ✅ `ContactCard.tsx` - Removed `onClick={() => console.log(contact)}`

### 10. ✅ DONE (Partial) - TODO Comments (Incomplete Work)

- ⏭️ `frontend/src/config/militaryHierarchy.ts:12` - **SKIPPED** (per user request)
  > `TODO: Replace this dummy data with real organizational data.`
- ✅ `frontend/src/components/layout/menu-bar/MenuBar.tsx:22` - **IMPLEMENTED**
  > Added proper logout logic using `useAuth()` hook from AuthContext

---

## 🟢 LOW PRIORITY - Code Quality

### 11. Type Safety (`any` usage - 24 instances)

> Consider fixing for better maintainability

- [ ] Review and fix `any` types (see `2026-01-13-code-review.md` for full list)

### 12. ✅ DONE - Duplicate Code (Backend)

> `get_timestamp()` function extracted to centralized utility

- ✅ **Created** `backend/utils/timestamp.py` with `get_timestamp_ms()` function
- ✅ **Updated** 7 route files to use the new utility:
  - `tasks.py` (6 occurrences)
  - `users.py` (3 occurrences)
  - `contacts.py` (3 occurrences)
  - `primary_tags.py` (3 occurrences)
  - `secondary_tags.py` (3 occurrences)
  - `chat_messages.py` (1 occurrence)
  - `uploads.py` (1 occurrence)
- ✅ **Total:** 20 instances of duplicate code consolidated

### 13. ✅ DONE - Unused Files

- ✅ **Deleted** `backend/seed_military_hierarchy_standalone.py` - Duplicate of `seed_military_hierarchy.py`
- [ ] Consider cleanup of `backend/uploads/profiles/` (orphaned profile images) - _deferred_

### 14. Pattern Inconsistencies (Backend)

> Request user access pattern varies across files

| Pattern                                        | Used In                          |
| ---------------------------------------------- | -------------------------------- |
| `request.user_full_name`                       | tasks.py, contacts.py            |
| `getattr(request, 'user_full_name', 'system')` | users.py, tags, chat_messages.py |

- [ ] Standardize to one pattern across all route files

---

## 📝 Documentation Updates

### 15. Update Production URLs

- [ ] `docker-compose.prod.yml`: Update `CORS_ORIGINS` with actual production server IP
- [ ] `docker-compose.prod.yml`: Update `SERVICENOW_URL` and `MARS_URL` with real values

### 16. Verify Deployment Guide

- [ ] `docker/DEPLOYMENT_GUIDE.md` - Ensure instructions are current
- [ ] `docker/ENVIRONMENT_VARIABLES_GUIDE.md` - Verify all env vars documented

---

## ✅ Items Already Correct

The following items are properly configured:

1. ✅ **SECRET_KEY/JWT_SECRET_KEY required** - App raises `RuntimeError` if not set
2. ✅ **Production DEBUG=False** - Correctly set in `docker-compose.prod.yml`
3. ✅ **API Key optional** - Disabled if not set
4. ✅ **External volumes** - Data persists across container restarts
5. ✅ **HTTPS configured** - Nginx uses SSL (port 443)
6. ✅ **CORS configured** - Origins specified for production
7. ✅ **Documentation well-organized** - Good folder structure

---

## 📊 Summary

| Priority                | Count | Status         |
| ----------------------- | ----- | -------------- |
| 🔴 Critical (Security)  | 4     | ⬜ To Review   |
| 🟠 High (Configuration) | 3     | ⏭️ All Skipped |
| 🟡 Medium (Cleanup)     | 3     | ✅ All Done    |
| 🟢 Low (Quality)        | 4     | ✅ 2 Done      |
| 📝 Documentation        | 2     | ⬜ To Review   |

---

## 🎯 Recommended Order of Implementation

1. **Security** - Fix critical security issues first
2. ~~**Configuration** - Align MongoDB versions, fix test values~~ ⏭️ Skipped
3. ~~**Console.logs** - Remove before production~~ ✅ Done
4. **Documentation** - Update deployment guides
5. **Code Quality** - Address in future sprints

---

**Reviewed by:** **\*\*\*\***\_**\*\*\*\***  
**Date:** **\*\*\*\***\_**\*\*\*\***  
**Approved for Merge:** ☐ Yes ☐ No ☐ With Conditions
