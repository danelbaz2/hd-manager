# 🏗️ HD Manager - Architecture Restructuring Proposal

**Date**: January 18, 2026  
**Author**: Senior Software Architect  
**Tech Stack**: React 19 + TypeScript (Frontend) / Flask + Python (Backend) / MongoDB

---

## 📋 Executive Summary

This document proposes a comprehensive restructuring of the HD Manager codebase to align with industry best practices for a React/Python full-stack application. The goal is to improve **modularity**, **scalability**, **maintainability**, and **developer experience**.

---

## 📊 Current State Analysis

### ✅ What's Working Well

| Area                           | Current State                            | Rating  |
| ------------------------------ | ---------------------------------------- | ------- |
| **Barrel Exports**             | Using `index.ts` files for clean imports | ✅ Good |
| **Component Modularity**       | Components have dedicated folders        | ✅ Good |
| **API Layer Separation**       | Separate API files per domain            | ✅ Good |
| **React Query Integration**    | Proper query/mutation setup              | ✅ Good |
| **Backend Route Organization** | Blueprint-based Flask routes             | ✅ Good |
| **Pydantic Models**            | Strict validation with Pydantic v2       | ✅ Good |

### ⚠️ Areas for Improvement

| Area                           | Issue                                                          | Severity |
| ------------------------------ | -------------------------------------------------------------- | -------- |
| **File Naming**                | Inconsistent casing (PascalCase, kebab-case, snake_case mixed) | Medium   |
| **Schema Duplication**         | Types defined in both `schemas/` and `api/` folders            | Medium   |
| **Nested Components**          | Deeply nested modal components (4+ levels)                     | Low      |
| **Context Proliferation**      | 10 separate context files instead of domain-based grouping     | Medium   |
| **Backend Websocket Location** | Websocket code in both `utils/websocket/` and `websocket/`     | High     |
| **Seed Data Structure**        | Prefix underscore `_seed_data` is non-standard                 | Low      |
| **Demo Components**            | `components/demos/` shouldn't be in production code            | Medium   |

---

## 🌲 New Directory Tree

### Frontend Structure

```
frontend/src/
│
├── app/                                    # Application shell
│   ├── App.tsx                             # Root component
│   ├── main.tsx                            # Entry point
│   └── providers/                          # Provider composition
│       └── AppProviders.tsx                # All providers wrapped
│
├── assets/                                 # Static assets
│   ├── images/
│   └── fonts/
│
├── components/                             # Shared UI components
│   ├── ui/                                 # Atomic UI elements
│   │   ├── button/
│   │   ├── input/
│   │   ├── modal/
│   │   ├── tooltip/
│   │   └── loader/
│   ├── layout/                             # Layout components
│   │   ├── header/
│   │   ├── sidebar/
│   │   └── page-layout/
│   ├── feedback/                           # Alerts, toasts, banners
│   │   ├── toast/
│   │   └── alert/
│   └── index.ts                            # Barrel export
│
├── features/                               # Feature modules (domain-driven)
│   ├── tasks/                              # Task feature
│   │   ├── components/                     # Task-specific components
│   │   │   ├── task-card/
│   │   │   ├── task-list/
│   │   │   ├── task-modal/
│   │   │   └── kanban-board/
│   │   ├── hooks/                          # Task-specific hooks
│   │   │   └── use-task-form.ts
│   │   ├── api/                            # Task API calls
│   │   │   ├── tasks.api.ts
│   │   │   └── tasks.queries.ts
│   │   ├── types/                          # Task types
│   │   │   └── task.types.ts
│   │   └── index.ts
│   │
│   ├── users/                              # User feature
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── api/
│   │   ├── types/
│   │   └── index.ts
│   │
│   ├── contacts/                           # Contact feature
│   │   ├── components/
│   │   ├── api/
│   │   ├── types/
│   │   └── index.ts
│   │
│   ├── tags/                               # Tags feature (primary + secondary)
│   │   ├── components/
│   │   ├── api/
│   │   ├── types/
│   │   └── index.ts
│   │
│   ├── chat/                               # Team chat feature
│   │   ├── components/
│   │   ├── api/
│   │   ├── types/
│   │   └── index.ts
│   │
│   └── auth/                               # Authentication feature
│       ├── components/
│       │   └── login-form/
│       ├── api/
│       │   └── auth.api.ts
│       ├── hooks/
│       │   └── use-auth.ts
│       ├── context/
│       │   └── auth.context.tsx
│       └── index.ts
│
├── pages/                                  # Route pages (thin wrappers)
│   ├── home/
│   │   └── home.page.tsx
│   ├── tasks/
│   │   └── tasks.page.tsx
│   ├── archive/
│   │   └── archive.page.tsx
│   ├── login/
│   │   └── login.page.tsx
│   └── index.ts
│
├── lib/                                    # Shared utilities & configuration
│   ├── api/                                # API infrastructure
│   │   ├── api-client.ts                   # Base API client
│   │   ├── query-client.ts                 # React Query client
│   │   └── idempotency.ts                  # Idempotency utilities
│   ├── socket/                             # WebSocket infrastructure
│   │   ├── socket-manager.ts
│   │   ├── socket-provider.tsx
│   │   ├── socket.hooks.ts
│   │   └── socket.types.ts
│   ├── storage/                            # Local storage utilities
│   │   └── user-storage.ts
│   ├── utils/                              # General utilities
│   │   ├── date.utils.ts
│   │   ├── color.utils.ts
│   │   └── validation.utils.ts
│   └── config/                             # Runtime configuration
│       └── runtime-config.ts
│
├── hooks/                                  # Global custom hooks
│   ├── use-debounce.ts
│   ├── use-local-storage.ts
│   └── index.ts
│
├── types/                                  # Global type definitions
│   ├── api.types.ts                        # API response types
│   ├── common.types.ts                     # Shared types
│   └── index.ts
│
├── styles/                                 # Global styles
│   ├── index.css                           # Main CSS entry
│   └── variables.css                       # CSS variables
│
└── __tests__/                              # Test files (mirrors src/)
    └── features/
        └── tasks/
```

### Backend Structure

```
backend/
│
├── app/                                    # Application factory
│   ├── __init__.py                         # Flask app factory
│   ├── config.py                           # Configuration
│   └── extensions.py                       # Flask extensions (CORS, etc.)
│
├── api/                                    # API layer (renamed from routes/)
│   ├── __init__.py                         # Blueprint registration
│   ├── v1/                                 # API versioning
│   │   ├── __init__.py
│   │   ├── tasks.py
│   │   ├── users.py
│   │   ├── contacts.py
│   │   ├── tags/
│   │   │   ├── __init__.py
│   │   │   ├── primary.py
│   │   │   └── secondary.py
│   │   ├── chat.py
│   │   ├── auth.py
│   │   └── uploads.py
│   └── admin/                              # Admin-only endpoints
│       └── __init__.py
│
├── core/                                   # Core business logic
│   ├── __init__.py
│   ├── auth/                               # Authentication core
│   │   ├── jwt.py
│   │   └── decorators.py
│   ├── websocket/                          # WebSocket core
│   │   ├── manager.py
│   │   ├── events.py
│   │   └── broadcaster.py
│   └── history/                            # History/audit core
│       └── tracker.py
│
├── models/                                 # Pydantic models (unchanged)
│   ├── __init__.py
│   ├── base.py                             # BaseEntity
│   ├── task.py
│   ├── user.py
│   ├── contact.py
│   ├── tag.py
│   ├── chat.py
│   └── history.py
│
├── schemas/                                # Request/Response schemas
│   ├── __init__.py
│   └── examples/                           # JSON examples
│
├── db/                                     # Database layer
│   ├── __init__.py
│   ├── connection.py                       # MongoDB connection
│   ├── indexes.py                          # Index definitions
│   └── migrations/                         # Future: migrations
│
├── utils/                                  # Utility functions
│   ├── __init__.py
│   ├── timestamp.py
│   ├── profile_image.py
│   ├── error_handlers.py
│   └── logger.py
│
├── middleware/                             # HTTP middleware
│   ├── __init__.py
│   └── idempotency.py
│
├── scripts/                                # CLI scripts (renamed from seed*)
│   ├── __init__.py
│   ├── seed.py                             # Database seeding
│   ├── seed_data/                          # Seed data files
│   │   ├── users.py
│   │   ├── tasks.py
│   │   └── tags.py
│   └── migrations/                         # Future: migration scripts
│
├── static/                                 # Static files
│   └── swagger/                            # API documentation
│
├── uploads/                                # User uploads
│   └── profiles/
│
├── tests/                                  # Test files
│   ├── unit/
│   ├── integration/
│   └── conftest.py
│
├── requirements.txt
├── requirements-dev.txt
└── pyproject.toml                          # Modern Python config
```

---

## 📝 Refactoring Plan

### Frontend: High Priority Changes

| Current Path                           | New Path                                     | Reason                           |
| -------------------------------------- | -------------------------------------------- | -------------------------------- |
| `src/App.tsx`                          | `src/app/App.tsx`                            | Group app shell files            |
| `src/main.tsx`                         | `src/app/main.tsx`                           | Group app shell files            |
| `src/schemas/*.ts`                     | `src/features/{domain}/types/*.ts`           | Co-locate types with features    |
| `src/contexts/*.tsx`                   | `src/features/{domain}/context/*.tsx`        | Co-locate contexts with features |
| `src/api/tasksApi.ts`                  | `src/features/tasks/api/tasks.api.ts`        | Co-locate API with features      |
| `src/api/queries/*.ts`                 | `src/features/{domain}/api/*.queries.ts`     | Co-locate queries with features  |
| `src/components/modal/modal-task/*`    | `src/features/tasks/components/task-modal/*` | Feature-based organization       |
| `src/components/modal/modal-setting/*` | `src/features/settings/components/*`         | Feature-based organization       |
| `src/components/demos/*`               | **DELETE**                                   | Remove demo code from production |
| `src/pages/home-page/*`                | `src/pages/home/*`                           | Simplify naming                  |
| `src/pages/task-page/*`                | `src/pages/tasks/*`                          | Simplify naming                  |
| `src/socket/*`                         | `src/lib/socket/*`                           | Group infrastructure code        |
| `src/utils/*`                          | `src/lib/utils/*`                            | Group under lib                  |
| `src/config/*`                         | `src/lib/config/*`                           | Group under lib                  |

### Frontend: Context Consolidation

| Current Contexts       | New Location                                     | Notes             |
| ---------------------- | ------------------------------------------------ | ----------------- |
| `AuthContext.tsx`      | `features/auth/context/auth.context.tsx`         | Auth feature      |
| `UsersContext.tsx`     | `features/users/context/users.context.tsx`       | Users feature     |
| `TasksContext.tsx`     | `features/tasks/context/tasks.context.tsx`       | Tasks feature     |
| `TagsContext.tsx`      | `features/tags/context/tags.context.tsx`         | Tags feature      |
| `ContactsContext.tsx`  | `features/contacts/context/contacts.context.tsx` | Contacts feature  |
| `ChatContext.tsx`      | `features/chat/context/chat.context.tsx`         | Chat feature      |
| `ThemeContext.tsx`     | `lib/theme/theme.context.tsx`                    | Global theme      |
| `ViewStateContext.tsx` | `lib/view/view-state.context.tsx`                | Global view state |
| `SettingsContext.tsx`  | `features/settings/context/settings.context.tsx` | Settings feature  |
| `HistoryContext.tsx`   | `features/tasks/context/history.context.tsx`     | Part of tasks     |

### Backend: High Priority Changes

| Current Path                 | New Path                          | Reason                      |
| ---------------------------- | --------------------------------- | --------------------------- |
| `app.py`                     | `app/__init__.py`                 | Application factory pattern |
| `database.py`                | `db/connection.py`                | Group DB code               |
| `routes/*.py`                | `api/v1/*.py`                     | API versioning support      |
| `utils/websocket/*`          | `core/websocket/*`                | Core business logic         |
| `websocket/*`                | **MERGE INTO** `core/websocket/*` | Remove duplication          |
| `utils/jwt_utils.py`         | `core/auth/jwt.py`                | Group auth logic            |
| `utils/history.py`           | `core/history/tracker.py`         | Core business logic         |
| `_seed_data/*`               | `scripts/seed_data/*`             | Standard naming             |
| `seed.py`                    | `scripts/seed.py`                 | Group scripts               |
| `seed_military_hierarchy.py` | `scripts/seed_military.py`        | Simplify name               |
| `utils/db_indexes.py`        | `db/indexes.py`                   | Group DB code               |
| `utils/error_handlers.py`    | `utils/error_handlers.py`         | Keep in utils               |

---

## 📚 Naming Convention Guide

### File Naming

| Type                   | Convention                            | Example                           |
| ---------------------- | ------------------------------------- | --------------------------------- |
| **React Components**   | PascalCase with `.tsx`                | `TaskCard.tsx`, `UserModal.tsx`   |
| **React Hooks**        | kebab-case with `use-` prefix         | `use-task-form.ts`, `use-auth.ts` |
| **API Files**          | kebab-case with `.api.ts` suffix      | `tasks.api.ts`, `users.api.ts`    |
| **Query Files**        | kebab-case with `.queries.ts` suffix  | `tasks.queries.ts`                |
| **Type Files**         | kebab-case with `.types.ts` suffix    | `task.types.ts`                   |
| **Context Files**      | kebab-case with `.context.tsx` suffix | `auth.context.tsx`                |
| **Utility Files**      | kebab-case with `.utils.ts` suffix    | `date.utils.ts`                   |
| **Python Files**       | snake_case                            | `task_model.py`, `jwt_utils.py`   |
| **Folders (Frontend)** | kebab-case                            | `task-card/`, `modal-task/`       |
| **Folders (Backend)**  | snake_case                            | `seed_data/`, `api_v1/`           |

### Component Structure

Each component folder should contain:

```
task-card/
├── TaskCard.tsx          # Main component
├── TaskCard.styles.ts    # Styled components (if applicable)
├── TaskCard.test.tsx     # Tests
├── TaskCard.types.ts     # Component-specific types (if needed)
└── index.ts              # Barrel export
```

### Import Aliases

Configure TypeScript path aliases for cleaner imports:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@components/*": ["./src/components/*"],
      "@features/*": ["./src/features/*"],
      "@lib/*": ["./src/lib/*"],
      "@hooks/*": ["./src/hooks/*"],
      "@types/*": ["./src/types/*"]
    }
  }
}
```

### Python Module Naming

| Type          | Convention         | Example                             |
| ------------- | ------------------ | ----------------------------------- |
| **Modules**   | snake_case         | `task_model.py`                     |
| **Classes**   | PascalCase         | `TaskModel`, `UserService`          |
| **Functions** | snake_case         | `create_task()`, `get_user_by_id()` |
| **Constants** | UPPER_SNAKE_CASE   | `MAX_FILE_SIZE`, `DEFAULT_TIMEOUT`  |
| **Private**   | Leading underscore | `_internal_helper()`                |

---

## 🎯 Implementation Priority

### Phase 1: Quick Wins (Low Risk)

1. ✅ Delete `components/demos/` folder
2. ✅ Rename `_seed_data/` to `scripts/seed_data/`
3. ✅ Move `websocket/` into `core/websocket/` (remove duplication)
4. ✅ Create `src/lib/` folder and move infrastructure code

### Phase 2: Feature Migration (Medium Risk)

1. Create feature folders for top 3 domains (tasks, users, auth)
2. Migrate one feature at a time
3. Update imports using find-and-replace

### Phase 3: Full Restructuring (Higher Risk)

1. Complete feature-based organization
2. Implement API versioning in backend
3. Add path aliases to TypeScript config

---

## ⚠️ Migration Risks & Mitigation

| Risk                 | Mitigation                                          |
| -------------------- | --------------------------------------------------- |
| **Breaking imports** | Use TypeScript path aliases + IDE refactoring tools |
| **Git history loss** | Use `git mv` for moves, maintain original commits   |
| **Runtime errors**   | Comprehensive testing after each phase              |
| **Team confusion**   | Clear documentation, gradual rollout                |

---

## 📋 Decision Required

**Implement now or defer?**

| Option                     | Pros                         | Cons                       |
| -------------------------- | ---------------------------- | -------------------------- |
| **Implement Phase 1 Only** | Low risk, quick improvement  | Limited benefit            |
| **Implement All Phases**   | Full best-practice alignment | Higher risk, more time     |
| **Defer All**              | No disruption                | Technical debt accumulates |

**Recommendation**: Implement **Phase 1** now, schedule **Phase 2** for next sprint.

---

## 📊 Expected Benefits

| Metric                   | Current    | After Restructuring |
| ------------------------ | ---------- | ------------------- |
| **Import depth**         | 4-6 levels | 2-3 levels          |
| **Feature isolation**    | Low        | High                |
| **Code discoverability** | Medium     | High                |
| **Onboarding time**      | ~2 days    | ~1 day              |
| **Test organization**    | Mixed      | Mirror of src/      |

---

**Created by**: Senior Software Architect  
**Status**: 📝 Proposal - Awaiting Approval  
**Next Step**: Review with team and decide on implementation phases
