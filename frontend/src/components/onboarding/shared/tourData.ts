import { type Task } from "../../../api/tasksApi";
import { type UserData } from "../../../schemas/userTypes";

// Mock Users for Demo
export const DEMO_USERS: UserData[] = [
    {
        id: "demo-user-1",
        fullName: "ישראל ישראלי",
        username: "israel",
        role: "admin",
        color: "#3B82F6",
        profileImage: null,
        nickname: null,
    },
    {
        id: "demo-user-2",
        fullName: "שרה כהן",
        username: "sara",
        role: "regular",
        color: "#EC4899",
        profileImage: null,
        nickname: null,
    },
    {
        id: "demo-user-3",
        fullName: "דני לוי",
        username: "dani",
        role: "regular",
        color: "#10B981",
        profileImage: null,
        nickname: null,
    },
];

const BASE_META = {
    isDeleted: false,
    entityType: "task",
    createdAt: Date.now(),
    updatedAt: Date.now(),
};

// Mock Tags for Demo
export const DEMO_PRIMARY_TAGS = [
    { id: "demo-tag-1", name: "פיתוח", color: "#3B82F6", isSystem: false },
    { id: "demo-tag-2", name: "עיצוב", color: "#EC4899", isSystem: false },
    { id: "demo-tag-3", name: "שיווק", color: "#F59E0B", isSystem: false },
    { id: "demo-tag-4", name: "ניהול מוצר", color: "#10B981", isSystem: false },
    { id: "demo-tag-5", name: "לקוחות", color: "#8B5CF6", isSystem: false },
];

export const DEMO_SECONDARY_TAGS = [
    { id: "demo-subtag-1", name: "Frontend", primaryTagId: "demo-tag-1" },
    { id: "demo-subtag-2", name: "Backend", primaryTagId: "demo-tag-1" },
    { id: "demo-subtag-3", name: "UI/UX", primaryTagId: "demo-tag-2" },
    { id: "demo-subtag-4", name: "Social Media", primaryTagId: "demo-tag-3" },
    { id: "demo-subtag-5", name: "Roadmap", primaryTagId: "demo-tag-4" },
    { id: "demo-subtag-6", name: "Mobile", primaryTagId: "demo-tag-1" },
    { id: "demo-subtag-7", name: "Branding", primaryTagId: "demo-tag-2" },
    { id: "demo-subtag-8", name: "Bugs", primaryTagId: "demo-tag-4" },
];

// Mock Tasks for Demo
const today = Date.now();
const dayMs = 86400000;

export const DEMO_TASKS: Task[] = [
    // Today's Tasks
    {
        id: "demo-task-1",
        title: "עיצוב דף הבית",
        description: "יצירת מוקאפ ראשוני לדף הבית החדש",
        status: "in_progress",
        priority: "high",
        date: today,
        deadline: today + dayMs * 2,
        responsibleUserIds: ["demo-user-1"],
        primaryTagIds: ["demo-tag-2"],
        secondaryTagIds: ["demo-subtag-3"],
        base: { ...BASE_META },
    },
    {
        id: "demo-task-2",
        title: "פיתוח API למשתמשים",
        description: "הוספת נקודות קצה",
        status: "pending",
        priority: "medium",
        date: today,
        deadline: today + dayMs * 5,
        responsibleUserIds: ["demo-user-2", "demo-user-3"],
        primaryTagIds: ["demo-tag-1"],
        secondaryTagIds: ["demo-subtag-2"],
        base: { ...BASE_META },
    },
    {
        id: "demo-task-9",
        title: "שיחת סטטוס עם לקוח",
        description: "עדכון על התקדמות הפרויקט",
        status: "pending",
        priority: "high",
        date: today,
        responsibleUserIds: ["demo-user-3"],
        primaryTagIds: ["demo-tag-5"],
        secondaryTagIds: [],
        base: { ...BASE_META },
    },

    // Yesterday's Tasks
    {
        id: "demo-task-3",
        title: "תיקון באג בלוגין",
        description: "משתמשים לא מצליחים להתחבר עם גוגל",
        status: "completed",
        priority: "low",
        date: today - dayMs,
        responsibleUserIds: ["demo-user-1", "demo-user-2"],
        primaryTagIds: ["demo-tag-1"],
        secondaryTagIds: ["demo-subtag-8"],
        base: { ...BASE_META, createdAt: today - dayMs * 2 },
    },

    // Tomorrow's Tasks
    {
        id: "demo-task-4",
        title: "ישיבת צוות שבועית",
        description: "סינכרון שבועי",
        status: "pending",
        priority: "high",
        date: today + dayMs,
        responsibleUserIds: ["demo-user-1", "demo-user-2", "demo-user-3"],
        primaryTagIds: ["demo-tag-4"],
        secondaryTagIds: ["demo-subtag-5"],
        base: { ...BASE_META },
    },
    {
        id: "demo-task-7",
        title: "אופטימיזציה ל-DB",
        description: "שיפור ביצועי שאילתות",
        status: "pending",
        priority: "medium",
        date: today + dayMs,
        responsibleUserIds: ["demo-user-2"],
        primaryTagIds: ["demo-tag-1"],
        secondaryTagIds: ["demo-subtag-2"],
        base: { ...BASE_META },
    },

    // Next Week Tasks
    {
        id: "demo-task-5",
        title: "מחקר מתחרים",
        description: "בדיקת פיצ'רים חדשים",
        status: "pending",
        priority: "low",
        date: today + dayMs * 7,
        responsibleUserIds: ["demo-user-3"],
        primaryTagIds: ["demo-tag-3"],
        secondaryTagIds: ["demo-subtag-4"],
        base: { ...BASE_META },
    },
    {
        id: "demo-task-6",
        title: "בדיקת אינטגרציה",
        description: "בדיקות קצה לקצה",
        status: "pending",
        priority: "medium",
        date: today + dayMs * 2,
        responsibleUserIds: ["demo-user-2"],
        primaryTagIds: ["demo-tag-1"],
        secondaryTagIds: ["demo-subtag-1", "demo-subtag-6"],
        base: { ...BASE_META },
    },
    {
        id: "demo-task-8",
        title: "השקת גרסה 2.0",
        description: "העלאה לפרודקשן",
        status: "pending",
        priority: "high",
        date: today + dayMs * 14,
        responsibleUserIds: ["demo-user-1"],
        primaryTagIds: ["demo-tag-4"],
        secondaryTagIds: ["demo-subtag-5"],
        base: { ...BASE_META },
    },
];

// Mock History for Demo
export const DEMO_HISTORY: any[] = [
    {
        id: "demo-hist-1",
        taskId: "demo-task-1",
        action: "CREATE",
        timestamp: today - 3600000, // 1 hour ago
        updatedBy: "ישראל ישראלי",
        changes: { status: "pending", title: "עיצוב מחדש של דף הבית" },
        oldValues: {}
    },
    {
        id: "demo-hist-2",
        taskId: "demo-task-1",
        action: "UPDATE",
        timestamp: today - 1800000, // 30 mins ago
        updatedBy: "שרה כהן",
        changes: { status: "in_progress" },
        oldValues: { status: "pending" }
    },
    {
        id: "demo-hist-3",
        taskId: "demo-task-2",
        action: "NOTE",
        timestamp: today - 900000, // 15 mins ago
        updatedBy: "דני לוי",
        content: "בדקתי את הלוגים, נראה כמו בעיית הרשאות",
        changes: {},
        oldValues: {}
    },
    {
        id: "demo-hist-7",
        taskId: "demo-task-3",
        action: "UPDATE",
        timestamp: today - 500000,
        updatedBy: "שרה כהן",
        changes: { status: "completed" },
        oldValues: { status: "in_progress" }
    },
    {
        id: "demo-hist-8",
        taskId: "demo-task-9",
        action: "CREATE",
        timestamp: today - 100000,
        updatedBy: "דני לוי",
        changes: { title: "שיחת סטטוס עם לקוח" },
        oldValues: {}
    },
    {
        id: "demo-hist-9",
        taskId: "demo-task-1",
        action: "NOTE",
        timestamp: today - 45000,
        updatedBy: "ישראל ישראלי",
        content: "להוסיף אנימציות בכניסה",
        changes: {},
        oldValues: {}
    },
    {
        id: "demo-hist-10",
        taskId: "demo-task-2",
        action: "UPDATE",
        timestamp: today - 20000,
        updatedBy: "מערכת",
        changes: { priority: "high" },
        oldValues: { priority: "medium" }
    },
    // Future history items (for demo purposes when switching dates)
    {
        id: "demo-hist-4",
        taskId: "demo-task-4",
        action: "CREATE",
        timestamp: today + dayMs + 3600000, // Tomorrow + 1h
        updatedBy: "ישראל ישראלי",
        changes: { status: "pending", title: "סקירת קוד שבועית" },
        oldValues: {}
    },
    {
        id: "demo-hist-5",
        taskId: "demo-task-4",
        action: "NOTE",
        timestamp: today + dayMs + 7200000, // Tomorrow + 2h
        updatedBy: "מערכת",
        content: "תזכורת אוטומטית: להכין סביבת בדיקות",
        changes: {},
        oldValues: {}
    },
    {
        id: "demo-hist-6",
        taskId: "demo-task-6",
        action: "CREATE",
        timestamp: today + (dayMs * 2) + 3600000, // +2 Days + 1h
        updatedBy: "שרה כהן",
        changes: { status: "pending", title: "בדיקת אינטגרציה" },
        oldValues: {}
    }
];

// Mock Team Updates for Demo
export const DEMO_TEAM_UPDATES = [
    {
        id: "update-1",
        senderId: "demo-user-1",
        role: "admin",
        message: "בוקר טוב לכולם! מזכיר שישיבת הצוות היום תתקיים ב-14:00.",
        timestamp: Date.now() - 3600000 * 2,
        type: "announcement"
    },
    {
        id: "update-2",
        senderId: "demo-user-3",
        role: "regular",
        message: "סיימתי את המוקאפ הראשוני למובייל, אשמח לפידבק.",
        timestamp: Date.now() - 3600000 * 4,
        type: "update"
    },
    {
        id: "update-3",
        senderId: "system", // System messages might need special handling or a system user
        role: "system",
        message: "🎉 ברכות לשרה על סגירת 5 משימות השבוע!",
        timestamp: Date.now() - 86400000,
        type: "celebration"
    },
    {
        id: "update-4",
        senderId: "demo-user-2",
        role: "regular",
        message: "מישהו יכול לעבור על ה-PR שלי? דחוף!",
        timestamp: Date.now() - 3600000 * 5,
        type: "update"
    },
    {
        id: "update-5",
        senderId: "demo-user-3",
        role: "regular",
        message: "יש עוגות במטבח! 🍰",
        timestamp: Date.now() - 3600000 * 6,
        type: "celebration"
    }
];
