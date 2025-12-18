# HD Manager - Software Requirements Specification (Updated)

**Document Version:** 2.0  
**Original Version Date:** (From desk-manager.docx)  
**Updated:** December 18, 2025  
**Status:** Updated to reflect current implementation

---

## 📋 Change Summary

This document has been updated to reflect the actual implementation of the HD Manager system. Below is a summary of the key changes from the original SRS:

### Major Changes Overview

| Area | Original SRS | Current Implementation |
|------|--------------|----------------------|
| **Task - tagId** | Single `tagId` field | Changed to `tagsId[]` (array of tags) |
| **Task - deadline** | Not specified | Added `deadline` field (timestamp) |
| **Task - priority** | Was in original spec | **Removed** from implementation |
| **User - color** | Not specified | Added `color` field (hex color code) |
| **User - profileImage** | Not specified | Added `profileImage` field (optional URL) |
| **Tag - color** | Not specified | Added `color` field (hex color code) |
| **Tag - isActive** | Separate field | Now part of `base.isActive` |
| **Contact - isActive** | Separate field | Now part of `base.isActive` |
| **History/Archive Model** | Per-action records in `history_entries` | Changed to `ents_archive` with o/c/n document structure |
| **Base Entity Meta** | `createdAt`, `updatedAt` only | Added `lut`, `isDeleted`, `isActive`, `entityType` |
| **Database Collections** | 6 separate collections | `ents` collection + `users`, `contacts`, `history_entries` |
| **Validation** | Not specified | Pydantic models with `extra='forbid'` |

---

## 1. מבוא כללי (General Introduction)

### מטרת המערכת (System Purpose)

המערכת מיועדת לרכז ולנהל את המשימות והפעילויות של צוות HD. המערכת מאפשרת ניהול משימות, תקשורת פנימית, וניהול אנשי קשר ותגיות.

---

## 2. מודל נתונים (Data Model)

### 2.1 BaseEntityMeta (חדש - New)

**תיאור:** מטא-דאטא משותף לכל הישויות במערכת.

> ⚠️ **שינוי מהמקור:** זהו רכיב חדש שלא היה במסמך המקורי. מספק ניהול אחיד של מצב הישויות.

| שדה | תיאור | סוג | חובה |
|-----|--------|-----|------|
| `isDeleted` | האם הישות נמחקה (soft delete) | boolean | ✓ (default: false) |
| `isActive` | האם הישות פעילה | boolean | ✓ (default: true) |
| `createdAt` | זמן יצירה (timestamp ms) | int | ✓ |
| `updatedAt` | זמן עדכון אחרון (timestamp ms) | int | ✓ |
| `lut` | Last Update Timestamp (timestamp ms) | int | ✓ |
| `entityType` | סוג הישות (task, user, tag, contact, chat_message) | string | ✓ |

---

### 2.2 Task (משימה)

**תיאור:** משימה מייצגת פעולה כללית או פרטנית שיש לבצע בתאריך מסוים, עם אחראים, משתתפים ותגיות.

#### שדות:

| שדה | תיאור | סוג | חובה | שינויים |
|-----|--------|-----|------|---------|
| `id` | מזהה ייחודי של המשימה | string | ✓ | - |
| `title` | כותרת המשימה (מינימום 3 תווים) | string | ✓ | הוספת validation |
| `description` | תיאור חופשי | string | - | default: "" |
| `status` | סטטוס | enum: open, in_progress, closed | ✓ | הוספת regex validation |
| `responsibleUsersId` | מזהי המשתמשים האחראיים | List[string] | - | - |
| `participantsIds` | רשימת משתמשים מעורבים | List[string] | - | - |
| `tagsId` | רשימת מזהי תגיות | List[string] | - | ⚠️ **שונה מ-`tagId` יחיד למערך** |
| `date` | היום שבו המשימה מיועדת לטיפול (timestamp ms) | int | ✓ | - |
| `deadline` | תאריך יעד לסיום המשימה (timestamp ms) | int | - | ⚡ **חדש** |
| `base` | מטא-דאטא של הישות | BaseEntityMeta | ✓ | ⚡ **חדש** |

> 🗑️ **שדות שהוסרו:**
> - `priority` - הוסר מהמימוש הנוכחי

#### יחסים:
- משימה יכולה להיות משויכת למספר משתמשים אחראיים
- משימה יכולה לכלול מספר משתתפים
- משימה יכולה להיות משויכת למספר תגיות (שונה מהמקור)

---

### 2.3 User (משתמש)

**תיאור:** משתמש מערכת (חבר צוות) שנכנס למערכת, רואה נתונים, מטפל במשימות ושולח הודעות צ'אט.

#### שדות:

| שדה | תיאור | סוג | חובה | שינויים |
|-----|--------|-----|------|---------|
| `id` | מזהה ייחודי של המשתמש | string | ✓ | - |
| `fullName` | שם מלא (מינימום 2 תווים) | string | ✓ | הוספת validation |
| `username` | שם משתמש (מינימום 2 תווים) | string | ✓ | הוספת validation |
| `passwordHash` | סיסמה מוצפנת (bcrypt) | string | ✓ | שימוש ב-bcrypt |
| `role` | תפקיד במערכת | enum: regular, admin | ✓ | הוספת regex validation |
| `color` | צבע ייחודי למשתמש (hex) | string | ✓ | ⚡ **חדש** - pattern: #RRGGBB |
| `profileImage` | תמונת פרופיל (URL) | string | - | ⚡ **חדש** |
| `base` | מטא-דאטא של הישות | BaseEntityMeta | ✓ | ⚡ **חדש** |

> 🗑️ **שדות שהוסרו:**
> - `isActive` - כעת חלק מ-`base.isActive`
> - `createdAt` - כעת חלק מ-`base.createdAt`

#### יחסים:
- יכול להיות אחראי/משתתף במשימות
- מופיע כשולח הודעות צ'אט
- מופיע כמבצע פעולה ברישום היסטוריה

---

### 2.4 SystemContact (איש קשר - הנדסת מערכת)

**תיאור:** איש קשר מקצועי (מהנדס מערכת, מומחה תחום וכו') המשויך לתגיות, אך אינו משתמש מערכת רגיל.

#### שדות:

| שדה | תיאור | סוג | חובה | שינויים |
|-----|--------|-----|------|---------|
| `id` | מזהה ייחודי | string | ✓ | - |
| `fullName` | שם מלא (מינימום 2 תווים) | string | ✓ | הוספת validation |
| `position` | תפקיד / תחום מומחיות | string | - | - |
| `department` | מחלקה / יחידה | string | - | - |
| `phoneNumber` | טלפון ליצירת קשר (מינימום 1 תו) | string | ✓ | הוספת validation |
| `tagsIds` | רשימת תגיות שאיש הקשר רלוונטי אליהן | List[string] | - | - |
| `base` | מטא-דאטא של הישות | BaseEntityMeta | ✓ | ⚡ **חדש** |

> 🗑️ **שדות שהוסרו:**
> - `isActive` - כעת חלק מ-`base.isActive`
> - `createdAt` - כעת חלק מ-`base.createdAt`

#### יחסים:
- משויך לתגיות
- בעקיפין רלוונטי למשימות דרך התגית

---

### 2.5 Tag (תגית)

**תיאור:** תגית מסווגת משימות לפי תחום/סוג, ומשמשת כגשר לאנשי קשר רלוונטיים.

#### שדות:

| שדה | תיאור | סוג | חובה | שינויים |
|-----|--------|-----|------|---------|
| `id` | מזהה ייחודי של התגית | string | ✓ | - |
| `name` | שם תגית (מינימום 1 תו) | string | ✓ | הוספת validation |
| `description` | תיאור קצר | string | - | - |
| `relatedContactsIds` | רשימת אנשי קשר מקושרים לתגית | List[string] | - | - |
| `color` | צבע התגית (hex) | string | ✓ | ⚡ **חדש** - pattern: #RRGGBB |
| `base` | מטא-דאטא של הישות | BaseEntityMeta | ✓ | ⚡ **חדש** |

> 🗑️ **שדות שהוסרו:**
> - `isActive` - כעת חלק מ-`base.isActive`
> - `createdAt` - כעת חלק מ-`base.createdAt`

#### התנהגות מיוחדת:
- **Restore Logic:** אם נוצרת תגית עם שם שכבר קיים אך נמחק (`base.isDeleted: true`), התגית תשוחזר במקום ליצור חדשה.

---

### 2.6 Archive Entry (רישום ארכיון)

**תיאור:** רישום של פעולות שבוצעו על ישויות, לטובת Trace מלא.

> ⚠️ **שינוי משמעותי:** המודל שונה לחלוטין:
> - אוסף `history_entries` → `ents_archive`
> - מבנה `entries[]` array → **מסמך נפרד לכל שינוי**
> - מבנה חדש: `{ o, c, n }` (Old, Change, New)

#### Archive Document Structure:

כל שינוי יוצר מסמך חדש באוסף `ents_archive`:

| שדה | תיאור | סוג |
|-----|--------|-----|
| `o` | **Old** - הישות לפני השינוי | Dict (full entity) |
| `c` | **Change** - מידע על השינוי | Dict (see below) |
| `n` | **New** - הישות אחרי השינוי | Dict (full entity) |

#### Change Object (`c`) Structure:

| שדה | תיאור | סוג |
|-----|--------|-----|
| `action` | סוג הפעולה | enum: CREATE, UPDATE, DELETE |
| `timestamp` | זמן ביצוע הפעולה (ms) | int |
| `updatedBy` | מזהה המשתמש שביצע (או 'system') | string |
| `...changedFields` | השדות שהשתנו בפועל (nested structure) | varies |

#### דוגמה:

```json
{
  "o": { "id": "123", "title": "Old Title", "status": "open", ... },
  "c": {
    "action": "UPDATE",
    "timestamp": 1734512345000,
    "updatedBy": "user123",
    "title": "New Title",
    "base": { "updatedAt": 1734512345000 }
  },
  "n": { "id": "123", "title": "New Title", "status": "open", ... }
}
```

> 🗑️ **שינויים מהמקור:**
> - `entityType` field → now part of `o.base.entityType` and `n.base.entityType`
> - `entityId` field → now `o.id` / `n.id`
> - `entries[]` array → **Removed** - each change is a separate document

---

### 2.7 ChatMessage (הודעת צ'אט)

**תיאור:** הודעת עדכון פנימית של אחד מחברי הצוות. הצ'אט הוא זרם הודעות רציף, לא תלוי ביום הנבחר.

#### שדות:

| שדה | תיאור | סוג | חובה |
|-----|--------|-----|------|
| `id` | מזהה ייחודי | string | ✓ |
| `senderUserId` | מזהה השולח | string | ✓ |
| `message` | תוכן ההודעה (טקסט) | string | ✓ |
| `base` | מטא-דאטא של הישות | BaseEntityMeta | ✓ |

> ⚠️ **שינוי:** `createdAt` כעת חלק מ-`base.createdAt`

---

### 2.8 SelectedDate (תאריך הנבחר)

**תיאור:** אינו חלק מה-DB ואינו נשמר בשרת אלא מצב Frontend בלבד.

מייצג את היום שעל פיו מסננים את המשימות.

#### שימושים:
- מסך המשימות מציג משימות לפי `date = selectedDate`
- מסכי תצוגה נוספים יכולים להשתמש באותו תאריך
- הצ'אט לא תלוי ב-SelectedDate

---

## 3. סקירת ארכיטקטורה (Architecture Overview)

המערכת בנויה במבנה Client-Server ומתוכננת לפעול ברשת פנימית מנותקת אינטרנט.

### 3.1 Frontend – React SPA

**טכנולוגיות:**
- React + TypeScript (Vite)
- TailwindCSS
- Material-UI components

**מאפיינים מרכזיים:**
- Single Page Application
- ניהול מצב גלובלי עבור:
  - משתמש מחובר
  - תפקיד משתמש (regular / admin)
  - היום הנבחר (selectedDate)
- ניווט בין מסכים ללא טעינת דף מחודשת
- תקשורת מול הBackend באמצעות HTTP/JSON

**מסכים מרכזיים:**
- מסך התחברות – הזנת שם משתמש וסיסמא
- מסך ראשי – תצוגת משימות ו/או הקצאות לפי עובדים
- מסך ניהול משימות פרטני
- מסך צ'אט פנימי
- מסך ניהול תגיות ואנשי קשר (עבור משתמש-על)

### 3.2 Backend – Flask REST API

**טכנולוגיה:** Python + Flask

**אחריות Backend:**
- טיפול בכל הלוגיקה העסקית
- בדיקת הרשאות (User מול Admin)
- חשיפה של REST endpoints לFrontend
- שמירה ושליפה של נתונים מהDB
- **Validation** באמצעות Pydantic models עם `extra='forbid'`

### 3.3 Database – MongoDB

**טכנולוגיה:** MongoDB Server

> ⚠️ **שינוי מהמקור:** במקום 6 אוספים נפרדים, המבנה הנוכחי:

| אוסף | תיאור | שינוי |
|------|--------|-------|
| `ents` | אוסף מאוחד לרוב הישויות (tasks, tags, chat_messages) | ⚡ **חדש** - מבדיל לפי `base.entityType` |
| `users` | משתמשי המערכת | - |
| `contacts` | אנשי קשר מקצועיים | - |
| `ents_archive` | ארכיון שינויים (o/c/n structure) | ⚠️ **שונה מ-`history_entries`** |

---

## 4. REST API Endpoints

### 4.1 Auth API

| Method | Endpoint | תיאור |
|--------|----------|--------|
| POST | `/api/auth/login` | התחברות למערכת |
| GET | `/api/auth/me` | קבלת פרטי המשתמש המחובר (via X-User-Id header) |
| POST | `/api/auth/logout` | יציאה מהמערכת |

### 4.2 Tasks API

| Method | Endpoint | תיאור | פרמטרים |
|--------|----------|--------|---------|
| GET | `/api/tasks/` | קבלת רשימת משימות | `date`, `startDate`, `endDate`, `responsibleUsersId` |
| POST | `/api/tasks/` | יצירת משימה חדשה | body: TaskModel |
| PUT | `/api/tasks/<id>` | עדכון משימה | body: TaskUpdateModel |
| DELETE | `/api/tasks/<id>` | מחיקה רכה של משימה | - |

> ⚡ **חדש:** תמיכה בסינון לפי טווח תאריכים (`startDate`, `endDate`)

### 4.3 Users API

| Method | Endpoint | תיאור |
|--------|----------|--------|
| GET | `/api/users/` | קבלת רשימת משתמשים |
| POST | `/api/users/` | יצירת משתמש חדש |
| PUT | `/api/users/<id>` | עדכון משתמש |
| DELETE | `/api/users/<id>` | מחיקה רכה של משתמש |

### 4.4 Tags API

| Method | Endpoint | תיאור |
|--------|----------|--------|
| GET | `/api/tags/` | קבלת רשימת תגיות |
| POST | `/api/tags/` | יצירת תגית (או שחזור אם נמחקה) |
| PUT | `/api/tags/<id>` | עדכון תגית |
| DELETE | `/api/tags/<id>` | מחיקה רכה של תגית |

### 4.5 Contacts API

| Method | Endpoint | תיאור |
|--------|----------|--------|
| GET | `/api/contacts/` | קבלת רשימת אנשי קשר |
| POST | `/api/contacts/` | יצירת איש קשר חדש |
| PUT | `/api/contacts/<id>` | עדכון איש קשר |
| DELETE | `/api/contacts/<id>` | מחיקה רכה של איש קשר |

### 4.6 Chat API

| Method | Endpoint | תיאור |
|--------|----------|--------|
| GET | `/api/chat/` | קבלת הודעות צ'אט (ממוינות כרונולוגית) |
| POST | `/api/chat/` | שליחת הודעה חדשה |

### 4.7 Archive/History API

| Method | Endpoint | תיאור | פרמטרים |
|--------|----------|--------|---------|
| GET | `/api/history/` | קבלת רישומי ארכיון | `entityId` (optional filter) |
| POST | `/api/history/` | יצירת רישום ארכיון חדש | body: Archive document |

> ⚠️ **Note:** History is primarily created automatically via `log_history()` utility when entities are modified. The API is for retrieval and manual entries if needed.

---

## 5. דרישות לא פונקציונליות (Non-Functional Requirements)

### 5.1 ביצועים (Performance)
- המערכת תתמוך בכ-5–20 משתמשים פעילים במקביל
- זמני תגובה צפויים: עד שנייה לפעולות רגילות
- ייבוא אנשי קשר באופן מדורג למניעת עומס

### 5.2 זמינות ואמינות
- המערכת תפעל ברשת פנימית מנותקת אינטרנט
- המערכת תהיה זמינה במהלך שעות הפעילות התקינות
- במקרה של כשל צד-שרת, המשתמש יקבל הודעת שגיאה ברורה

### 5.3 אבטחה (בסיסית)
- גישה למערכת באמצעות שם משתמש וסיסמה
- סיסמאות מוצפנות באמצעות bcrypt
- משתמשים מאובחנים לפי סוגם (regular / admin)
- סיסמאות לא מוחזרות בתגובות API

### 5.4 שימושיות
- ממשק פשוט וברור לצוות
- כל המסכים תומכים בקונספט של יום נבחר (SelectedDate)
- ממשק ברור, קריא ומותאם לדפדפנים מודרניים

### 5.5 תחזוקה והרחבה
- קוד מודולרי המאפשר הוספת פיצ'רים
- **Validation** קפדני עם Pydantic (`extra='forbid'`)
- API ו-DB מתוכננים להרחבה עתידית

---

## 6. מבנה פרויקט נוכחי (Current Project Structure)

```
hd-manager/
├── backend/
│   ├── app.py                 # Flask application entry point
│   ├── database.py            # MongoDB connection
│   ├── seed.py               # Database seeding script
│   ├── requirements.txt      # Python dependencies
│   ├── models/               # Pydantic data models
│   │   ├── task_model.py
│   │   ├── user_model.py
│   │   ├── contact_model.py
│   │   ├── tag_model.py
│   │   ├── chat_message_model.py
│   │   ├── history_entry_model.py
│   │   ├── base_entity.py
│   │   └── auth_model.py
│   ├── routes/               # API route handlers
│   │   ├── auth.py
│   │   ├── tasks.py
│   │   ├── users.py
│   │   ├── tags.py
│   │   ├── contacts.py
│   │   ├── chat_messages.py
│   │   └── history_entries.py
│   ├── schemas/              # JSON Schema files (for reference)
│   └── utils/
│       └── history.py        # History logging utility
│
└── frontend/
    └── src/
        ├── App.tsx           # Main application component
        ├── main.tsx          # Entry point
        ├── api/              # API client modules
        │   ├── tasksApi.ts
        │   ├── usersApi.ts
        │   ├── tagsApi.ts
        │   ├── contactsApi.ts
        │   ├── chatApi.ts
        │   └── historyApi.ts
        ├── components/       # Reusable UI components
        ├── contexts/         # React contexts (auth, etc.)
        ├── pages/            # Page components
        │   ├── login-page/
        │   ├── home-page/
        │   ├── task-page/
        │   ├── chat-page/
        │   └── setting-page/
        └── schemas/          # TypeScript type definitions
```

---

## 7. סיכום שינויים עיקריים (Summary of Key Changes)

### 7.1 שדות חדשים שנוספו
1. **Task.tagsId[]** - תמיכה במספר תגיות למשימה (במקום אחת)
2. **Task.deadline** - תאריך יעד לסיום משימה
3. **User.color** - צבע ייחודי למשתמש (להצגה ב-UI)
4. **User.profileImage** - תמונת פרופיל
5. **Tag.color** - צבע לתגית (להצגה ב-UI)
6. **BaseEntityMeta** - מטא-דאטא אחיד לכל הישויות

### 7.2 שדות שהוסרו
1. **Task.priority** - הוסר מהמימוש

### 7.3 שינויי מבנה
1. **Archive Model** - שונה מ-`history_entries` ל-`ents_archive` עם מבנה o/c/n
2. **Database Collections** - שימוש באוסף `ents` מאוחד עם `entityType`
3. **Timestamps** - כל הזמנים ב-milliseconds (Unix timestamp * 1000)

### 7.4 תוספות טכניות
1. **Pydantic Validation** - כל המודלים משתמשים ב-`extra='forbid'`
2. **Soft Delete** - מחיקה רכה באמצעות `base.isDeleted`
3. **bcrypt** - הצפנת סיסמאות
4. **Tag Restore** - שחזור אוטומטי של תגיות שנמחקו

---

## 8. הערות לפיתוח עתידי

1. **JWT Authentication** - כרגע משתמשים ב-X-User-Id header, מומלץ לעבור ל-JWT
2. **Real-time Chat** - שיפור עם WebSocket לעדכונים בזמן אמת
3. **Dashboard** - הוספת מסך סיכום/דשבורד
4. **Incidents** - הרחבה לניהול תקלות (כפי שנרמז במסמך המקורי)
5. **Knowledge Base** - קישור למשאבי ידע לפי תגית

---

*מסמך זה מעודכן ליום 18 בדצמבר 2024 ומשקף את המצב הנוכחי של המערכת.*
