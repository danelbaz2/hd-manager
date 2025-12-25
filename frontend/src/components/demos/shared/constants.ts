/**
 * Tour Configurations
 * 
 * Define steps for each page's guided tour
 */
import type { PageTourConfig, TourPageId } from "./types";

// Storage key - prefix will be appended with user ID in TourProvider
export const TOUR_STORAGE_PREFIX = "hd_tour_";

// Home Page Tour
const HOME_TOUR: PageTourConfig = {
    pageId: "home",
    storageKey: `${TOUR_STORAGE_PREFIX}home`,
    steps: [
        {
            targetSelector: "body", // General welcome, centered
            title: "ברוכים הבאים למערכת",
            description: "סיור קצר שיעזור לכם להכיר את המערכת והאפשרויות השונות. בואו נתחיל!",
            position: "center",
            // Step 1: Initialize to grid mode + daily view
            onEnter: () => {
                window.dispatchEvent(new CustomEvent('tour:set-display-mode', { detail: 'grid' }));
                window.dispatchEvent(new CustomEvent('tour:set-view-mode', { detail: 'daily' }));
            },
        },
        {
            // Step 2: Display Modes - highlight buttons AND the main content that changes
            targetSelector: "[data-tour='display-modes']",
            secondaryTargets: ["[data-tour='main-content-area']"],
            title: "אפשרויות תצוגה",
            description: "המערכת מציעה 3 תצוגות שונות: כרטיסים, רשימה ותגיות. צפו בהדגמה האוטומטית:",
            position: "bottom",
            simulateClicks: ["[data-tour='toggle-list']", "[data-tour='toggle-tags']", "[data-tour='toggle-grid']"],
            tooltipWidth: 280,
            tooltipOffset: { x: 200, y: 20 },
            // Step 2: Start from grid mode
            onEnter: () => {
                window.dispatchEvent(new CustomEvent('tour:set-display-mode', { detail: 'grid' }));
                window.dispatchEvent(new CustomEvent('tour:set-view-mode', { detail: 'daily' }));
            },
        },
        {
            // Step 3: View Modes - highlight time range buttons AND the list content
            targetSelector: "[data-tour='view-modes']",
            secondaryTargets: ["[data-tour='toggle-list']", "[data-tour='main-content-area']"],
            title: "טווחי זמן ורשימה",
            description: "שימו לב: כפתור הרשימה (מימין) פעיל. במצב זה, הכפתורים משמאל משנים את טווח הזמן. צפו בהדגמה:",
            position: "bottom",
            simulateClicks: ["[data-tour='toggle-list']", "[data-tour='toggle-daily']", "[data-tour='toggle-weekly']", "[data-tour='toggle-monthly']"],
            tooltipWidth: 280,
            tooltipOffset: { x: 300, y: -200 },
            // Step 3: Start from grid + daily, then demo will switch to list
            onEnter: () => {
                window.dispatchEvent(new CustomEvent('tour:set-display-mode', { detail: 'grid' }));
                window.dispatchEvent(new CustomEvent('tour:set-view-mode', { detail: 'daily' }));
            },
        },
        {
            // Step 4: Date Selector - highlight date buttons and main content area (single combined highlight)
            targetSelector: "[data-tour='date-selector']",
            secondaryTargets: ["[data-tour='main-content-area']"],
            title: "בחירת תאריך",
            description: "נווטו בין תאריכים כדי לראות משימות מהעבר או העתיד. צפו בשינוי התאריך:",
            position: "bottom",
            tooltipOffset: { x: 0, y: 20 },
            // Step 4: Ensure grid + daily mode for date selector demo
            onEnter: () => {
                window.dispatchEvent(new CustomEvent('tour:set-display-mode', { detail: 'grid' }));
                window.dispatchEvent(new CustomEvent('tour:set-view-mode', { detail: 'daily' }));
            },
            loop: true,
            simulateClicks: [
                "[data-tour='date-selector'] button:first-of-type",
                "[data-tour='date-selector'] button:first-of-type",
                "[data-tour='date-selector'] button:last-of-type",
                "[data-tour='date-selector'] button:last-of-type"
            ],
        },
        {
            // Step 5: Activity Feed - switch between tasks and team updates
            targetSelector: "[data-tour='activity-feed']",
            title: "עדכוני צוות",
            description: "קבלו עדכונים שוטפים על המשימות והודעות כלליות לצוות. עברו בין הלשוניות לצפייה בסוגי העדכונים השונים.",
            position: "right",
            tooltipOffset: { x: 20, y: 0 },
            // Step 5: Ensure grid mode + tasks tab selected
            onEnter: () => {
                window.dispatchEvent(new CustomEvent('tour:set-display-mode', { detail: 'grid' }));
                window.dispatchEvent(new CustomEvent('tour:set-view-mode', { detail: 'daily' }));
                // Click tasks tab to ensure we start from tasks view
                setTimeout(() => {
                    const tasksTab = document.querySelector("[data-tour='tasks-updates-tab']") as HTMLElement;
                    tasksTab?.click();
                }, 100);
            },
            loop: true,
            simulateClicks: [
                "[data-tour='team-updates-tab']", // Switch to Team
                "[data-tour='team-updates-tab']", // Wait a bit (simulate click delay)
                "[data-tour='tasks-updates-tab']", // Switch back to Tasks
                "[data-tour='tasks-updates-tab']", // Wait a bit
            ],
        },
        {
            // Step 6: My User Card - clickable to navigate to Kanban
            targetSelector: "[data-tour='my-user-card']",
            title: "הכרטיס שלי",
            description: "זהו הכרטיס שלכם! לחצו עליו כעת כדי לעבור ללוח המשימות האישי (קנבן).",
            position: "left",
            tooltipOffset: { x: -30, y: 0 },
            allowInteraction: true,
            // Step 6: Ensure grid mode so user card is visible
            onEnter: () => {
                window.dispatchEvent(new CustomEvent('tour:set-display-mode', { detail: 'grid' }));
                window.dispatchEvent(new CustomEvent('tour:set-view-mode', { detail: 'daily' }));
            },
            // Use the same cursor demonstrator to point at the card
            simulateClicks: ["[data-tour='my-user-card']"],
        },
    ],
    adminOnly: false,
};

// Kanban Page Tour - DISABLED (to be continued in future)
const KANBAN_TOUR: PageTourConfig = {
    pageId: "kanban",
    storageKey: `${TOUR_STORAGE_PREFIX}kanban`,
    steps: [], // Empty steps = tour disabled
    adminOnly: false,
};

// Settings Page Tour (Admin only)
const SETTINGS_TOUR: PageTourConfig = {
    pageId: "settings",
    storageKey: `${TOUR_STORAGE_PREFIX}settings`,
    steps: [
        {
            targetSelector: "[data-tour='settings-users']",
            title: "ניהול משתמשים",
            description: "הוספה, עריכה ומחיקה של משתמשים במערכת",
            position: "right",
        },
        {
            targetSelector: "[data-tour='settings-tags']",
            title: "ניהול תגיות",
            description: "ניהול קטגוריות ותגיות לסינון וארגון משימות",
            position: "right",
        },
    ],
    adminOnly: true,
};

// Archive Page Tour
const ARCHIVE_TOUR: PageTourConfig = {
    pageId: "archive",
    storageKey: `${TOUR_STORAGE_PREFIX}archive`,
    steps: [
        {
            targetSelector: "[data-tour='archive-filters']",
            title: "חיפוש בארכיון",
            description: "איתור משימות שהושלמו או בוטלו בעבר לפי מגוון חתכים",
            position: "bottom",
        },
    ],
    adminOnly: false,
};

// All tour configs
export const TOUR_CONFIGS: Record<TourPageId, PageTourConfig> = {
    home: HOME_TOUR,
    kanban: KANBAN_TOUR,
    settings: SETTINGS_TOUR,
    archive: ARCHIVE_TOUR,
};
