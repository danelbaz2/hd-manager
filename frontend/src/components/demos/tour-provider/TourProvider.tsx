/**
 * TourProvider - Context provider for guided tour system
 * 
 * Manages:
 * - Current tour state (active, page, step)
 * - localStorage persistence for seen tours
 * - Navigation between steps
 */
import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from "react";
import type { TourContextValue, TourState, TourPageId, TourStep } from "../shared/types";
import { TOUR_CONFIGS } from "../shared/constants";

import { useAuth } from "../../../contexts";

const TourContext = createContext<TourContextValue | null>(null);

interface TourProviderProps {
    children: React.ReactNode;
}

export const TourProvider: React.FC<TourProviderProps> = ({ children }) => {
    const { user } = useAuth();
    const [state, setState] = useState<TourState>({
        isActive: false,
        currentPageId: null,
        currentStepIndex: 0,
    });

    // Helper to get storage key with user ID
    const getStorageKey = useCallback((configKey: string) => {
        if (!user?.id) return configKey;
        return `${configKey}_${user.id}`;
    }, [user?.id]);

    // Check if user has seen a specific tour
    const hasSeenTour = useCallback((pageId: TourPageId): boolean => {
        const config = TOUR_CONFIGS[pageId];
        if (!config) return true;
        const key = getStorageKey(config.storageKey);
        return localStorage.getItem(key) === "true";
    }, [getStorageKey]);

    // Start a tour for a specific page
    const startTour = useCallback((pageId: TourPageId) => {
        const config = TOUR_CONFIGS[pageId];
        if (!config || config.steps.length === 0) return;

        setState({
            isActive: true,
            currentPageId: pageId,
            currentStepIndex: 0,
        });
    }, []);

    // Check if tour should start (first visit) and start it
    const checkAndStartTour = useCallback((pageId: TourPageId, isAdmin: boolean) => {
        const config = TOUR_CONFIGS[pageId];
        if (!config) return;

        // Skip admin-only tours for non-admins
        if (config.adminOnly && !isAdmin) return;

        // Check if already seen
        if (hasSeenTour(pageId)) return;

        // Start the tour after a short delay
        setTimeout(() => startTour(pageId), 500);
    }, [hasSeenTour, startTour]);

    // Go to next step
    const nextStep = useCallback(() => {
        setState((prev) => {
            if (!prev.currentPageId) return prev;

            const config = TOUR_CONFIGS[prev.currentPageId];
            if (!config) return prev;

            const nextIndex = prev.currentStepIndex + 1;

            // If we've completed all steps, mark as complete
            if (nextIndex >= config.steps.length) {
                const key = getStorageKey(config.storageKey);
                localStorage.setItem(key, "true");
                return {
                    isActive: false,
                    currentPageId: null,
                    currentStepIndex: 0,
                };
            }

            return {
                ...prev,
                currentStepIndex: nextIndex,
            };
        });
    }, [getStorageKey]);

    // Go to previous step
    const prevStep = useCallback(() => {
        setState((prev) => ({
            ...prev,
            currentStepIndex: Math.max(0, prev.currentStepIndex - 1),
        }));
    }, []);

    // Skip the tour (mark as seen)
    const skipTour = useCallback(() => {
        setState((prev) => {
            if (prev.currentPageId) {
                const config = TOUR_CONFIGS[prev.currentPageId];
                if (config) {
                    const key = getStorageKey(config.storageKey);
                    localStorage.setItem(key, "true");
                }
            }
            return {
                isActive: false,
                currentPageId: null,
                currentStepIndex: 0,
            };
        });
    }, [getStorageKey]);

    // Complete the tour (same as skip but called on last step)
    const completeTour = useCallback(() => {
        skipTour();
    }, [skipTour]);

    // Get current step
    const getCurrentStep = useCallback((): TourStep | null => {
        if (!state.currentPageId) return null;
        const config = TOUR_CONFIGS[state.currentPageId];
        if (!config) return null;
        return config.steps[state.currentStepIndex] || null;
    }, [state.currentPageId, state.currentStepIndex]);

    // Get total steps for current tour
    const getTotalSteps = useCallback((): number => {
        if (!state.currentPageId) return 0;
        const config = TOUR_CONFIGS[state.currentPageId];
        return config?.steps.length || 0;
    }, [state.currentPageId]);

    // Execute onEnter when step changes
    useEffect(() => {
        if (!state.isActive || !state.currentPageId) return;
        const config = TOUR_CONFIGS[state.currentPageId];
        const step = config?.steps[state.currentStepIndex];
        step?.onEnter?.();
    }, [state.isActive, state.currentPageId, state.currentStepIndex]);

    const value: TourContextValue = useMemo(() => ({
        state,
        startTour,
        nextStep,
        prevStep,
        skipTour,
        completeTour,
        hasSeenTour,
        checkAndStartTour,
        getCurrentStep,
        getTotalSteps,
    }), [state, startTour, nextStep, prevStep, skipTour, completeTour, hasSeenTour, checkAndStartTour, getCurrentStep, getTotalSteps]);

    return (
        <TourContext.Provider value={value}>
            {children}
        </TourContext.Provider>
    );
};

export const useTour = (): TourContextValue => {
    const context = useContext(TourContext);
    if (!context) {
        throw new Error("useTour must be used within a TourProvider");
    }
    return context;
};

export default TourProvider;
