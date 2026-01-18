/**
 * Guided Tour Types
 * 
 * Types for the page-specific guided tour system
 */

// Pages that can have guided tours
export type TourPageId = "home" | "kanban" | "settings" | "archive";

// A single step in a tour
export interface TourStep {
    /** CSS selector to target the element */
    targetSelector: string;
    /** Title of the step (Hebrew) */
    title: string;
    /** Description of what this element does (Hebrew) */
    description: string;
    /** Position of the tooltip relative to the target */
    position?: "top" | "bottom" | "left" | "right" | "center";
    /** Optional: highlight the element on hover/click behavior */
    highlightAction?: string;
    /** Optional: allow interaction with the target element during the step */
    allowInteraction?: boolean;
    /** Optional: wait for the target element to be present in the DOM before proceeding */
    waitForTarget?: boolean; // Wait for target to appear before showing
    /** Optional: selectors to click in sequence for demo */
    simulateClicks?: string[]; // Selectors to click in sequence for demo
    /** Optional: additional selectors to highlight simultaneously */
    secondaryTargets?: string[];
    /** Optional: callback when step starts */
    onEnter?: () => void;
    /** Optional: loop the click sequence? default true */
    /** Optional: loop the click sequence? default true */
    loop?: boolean;
    /** Optional: tooltip width in px. Default 320 */
    tooltipWidth?: number;
    /** Optional: offset for tooltip position {x, y} */
    tooltipOffset?: { x: number; y: number };
    /** Optional: selector for specific tooltip placement anchor */
    placementTargetSelector?: string;
}

// Configuration for a page tour
export interface PageTourConfig {
    pageId: TourPageId;
    /** Storage key for localStorage */
    storageKey: string;
    /** Steps in the tour */
    steps: TourStep[];
    /** Only show to admins? */
    adminOnly?: boolean;
}

// Tour state
export interface TourState {
    isActive: boolean;
    currentPageId: TourPageId | null;
    currentStepIndex: number;
}

// Tour context value
export interface TourContextValue {
    state: TourState;
    startTour: (pageId: TourPageId) => void;
    nextStep: () => void;
    prevStep: () => void;
    skipTour: () => void;
    completeTour: () => void;
    hasSeenTour: (pageId: TourPageId) => boolean;
    isFirstTimeUser: () => boolean; // Check if user hasn't seen the home tour
    checkAndStartTour: (pageId: TourPageId, isAdmin: boolean) => void;
    getCurrentStep: () => TourStep | null;
    getTotalSteps: () => number;
}
