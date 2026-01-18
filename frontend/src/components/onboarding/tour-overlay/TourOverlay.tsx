/**
 * TourOverlay - Visual overlay for guided tour
 * 
 * Features:
 * - Spotlight effect on target element
 * - Arrow pointing to target
 * - Tooltip with title and description
 * - Next/Skip buttons
 * - Step counter
 */
import React, { useEffect, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useTheme } from "../../../contexts";
import { useTour } from "../tour-provider";
import { CursorDemonstrator } from "./CursorDemonstrator";

interface TargetRect {
    top: number;
    left: number;
    width: number;
    height: number;
}

const TourOverlay: React.FC = () => {
    const { isDarkMode } = useTheme();
    const {
        state,
        getCurrentStep,
        getTotalSteps,
        nextStep,
        prevStep,
        skipTour
    } = useTour();

    const [targetRects, setTargetRects] = useState<TargetRect[]>([]);
    const [placementRect, setPlacementRect] = useState<TargetRect | null>(null);
    const [isAnimating, setIsAnimating] = useState(false);
    const currentStep = getCurrentStep();
    const totalSteps = getTotalSteps();

    // Trigger entrance animation when tour starts
    useEffect(() => {
        if (state.isActive && state.currentStepIndex === 0) {
            setIsAnimating(false);
            // Small delay then trigger animation
            const timer = setTimeout(() => setIsAnimating(true), 50);
            return () => clearTimeout(timer);
        }
    }, [state.isActive, state.currentStepIndex]);

    // Find and measure target elements
    const updateTargetRects = useCallback(() => {
        if (!currentStep) {
            setTargetRects([]);
            setPlacementRect(null);
            return;
        }

        const targets: TargetRect[] = [];
        const selectors = [currentStep.targetSelector, ...(currentStep.secondaryTargets || [])];

        selectors.forEach(selector => {
            const element = document.querySelector(selector);
            if (element) {
                const rect = element.getBoundingClientRect();

                // Calculate adjusted dimensions to ensure spotlight border is visible
                let height = rect.height;
                const visualPadding = 8; // The padding added in render (top/bottom)
                const safeMargin = 4; // Space from window edge
                const maxVisualBottom = window.innerHeight - safeMargin;

                // The visual bottom is rect.top + height + visualPadding
                // We want: rect.top + height + visualPadding <= maxVisualBottom
                // So: height <= maxVisualBottom - visualPadding - rect.top
                if (rect.top + height + visualPadding > maxVisualBottom) {
                    height = maxVisualBottom - visualPadding - rect.top;
                }

                // Horizontal clamping
                let left = rect.left;
                let width = rect.width;
                const maxVisualRight = window.innerWidth - safeMargin;

                // Clamp Left
                if (left < safeMargin + visualPadding) {
                    const diff = (safeMargin + visualPadding) - left;
                    left += diff;
                    width -= diff;
                }

                // Clamp Right
                if (left + width + visualPadding > maxVisualRight) {
                    width = maxVisualRight - visualPadding - left;
                }

                targets.push({
                    top: rect.top,
                    left: left,
                    width: Math.max(0, width),
                    height: Math.max(0, height), // Ensure non-negative
                });
            }
        });

        setTargetRects(targets);

        // Handle placement target
        if (currentStep.placementTargetSelector) {
            const placementEl = document.querySelector(currentStep.placementTargetSelector);
            if (placementEl) {
                const rect = placementEl.getBoundingClientRect();
                setPlacementRect({
                    top: rect.top,
                    left: rect.left,
                    width: rect.width,
                    height: rect.height,
                });
            } else {
                setPlacementRect(null);
            }
        } else {
            setPlacementRect(null);
        }
    }, [currentStep]);

    // Update position on mount and resize
    useEffect(() => {
        if (!state.isActive) return;
        updateTargetRects();
        window.addEventListener("resize", updateTargetRects);
        window.addEventListener("scroll", updateTargetRects);
        return () => {
            window.removeEventListener("resize", updateTargetRects);
            window.removeEventListener("scroll", updateTargetRects);
        };
    }, [state.isActive, state.currentStepIndex, updateTargetRects]);

    // Poll for target element if waitForTarget is true
    // Watch for DOM mutations to update rects immediately
    useEffect(() => {
        if (!state.isActive) return;

        const observer = new MutationObserver(() => {
            requestAnimationFrame(updateTargetRects);
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            characterData: true
        });

        return () => observer.disconnect();
    }, [state.isActive, updateTargetRects]);

    if (!state.isActive || !currentStep) return null;

    // Use placementRect if available, otherwise primary target
    const primaryRect = targetRects[0];
    const anchorRect = placementRect || primaryRect;

    // Calculate tooltip position relative to primary target
    const getTooltipStyle = (): React.CSSProperties => {
        const padding = 16;
        const tooltipWidth = currentStep.tooltipWidth || 320;
        const tooltipHeight = 150;
        const offsetX = currentStep.tooltipOffset?.x || 0;
        const offsetY = currentStep.tooltipOffset?.y || 0;

        if (currentStep.position === "center" || !anchorRect) {
            return {
                position: "fixed",
                top: `calc(50% + ${offsetY}px)`,
                left: `calc(50% + ${offsetX}px)`,
                transform: "translate(-50%, -50%)",
                width: tooltipWidth,
                zIndex: 10002,
                transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
            };
        }

        let top = 0;
        let left = 0;

        switch (currentStep.position) {
            case "top":
                top = anchorRect.top - tooltipHeight - padding;
                left = anchorRect.left + anchorRect.width / 2 - tooltipWidth / 2;
                break;
            case "bottom":
                top = anchorRect.top + anchorRect.height + padding;
                left = anchorRect.left + anchorRect.width / 2 - tooltipWidth / 2;
                break;
            case "left":
                top = anchorRect.top + anchorRect.height / 2 - tooltipHeight / 2;
                left = anchorRect.left - tooltipWidth - padding;
                break;
            case "right":
                top = anchorRect.top + anchorRect.height / 2 - tooltipHeight / 2;
                left = anchorRect.left + anchorRect.width + padding;
                break;
        }

        // Apply offsets
        left += offsetX;
        top += offsetY;

        left = Math.max(16, Math.min(left, window.innerWidth - tooltipWidth - 16));
        top = Math.max(16, Math.min(top, window.innerHeight - tooltipHeight - 16));

        return {
            position: "fixed",
            top,
            left,
            width: tooltipWidth,
            zIndex: 10002,
            transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        };
    };

    const isFirstStep = state.currentStepIndex === 0;
    const isLastStep = state.currentStepIndex === totalSteps - 1;

    return (
        <>
            {currentStep.simulateClicks && (
                <CursorDemonstrator
                    sequence={currentStep.simulateClicks}
                    loop={currentStep.loop}
                />
            )}

            {/* Visual Overlay + Blocker Mechanism */}
            {currentStep.position === "center" ? (
                <>
                    {/* For centered tooltips (like welcome modal), show solid dark background */}
                    <div
                        className="fixed inset-0 z-[10000] pointer-events-none transition-all duration-300"
                        style={{
                            backgroundColor: isDarkMode ? "rgba(0,0,0,0.6)" : "rgba(0,0,0,0.6)",
                        }}
                    />
                    {/* Interaction blocker for center position */}
                    <div
                        className="fixed inset-0 z-[10001]"
                        onClick={(e) => e.stopPropagation()}
                    />
                </>
            ) : (
                <>
                    {/* 1. Define SVG Mask for visual cutout */}
                    <div className="fixed inset-0 z-[10000] pointer-events-none">
                        <svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0 }}>
                            <defs>
                                <mask id="tour-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="100%" height="100%">
                                    <rect x="0" y="0" width="100%" height="100%" fill="white" />
                                    {targetRects.map((rect, i) => (
                                        <rect
                                            key={i}
                                            x={rect.left - 8}
                                            y={rect.top - 8}
                                            width={rect.width + 16}
                                            height={rect.height + 16}
                                            rx="12"
                                            fill="black"
                                        />
                                    ))}
                                </mask>
                            </defs>
                        </svg>
                    </div>

                    {/* 2. Visual Dark Background - Darkens non-relevant components */}
                    <div
                        className="fixed inset-0 z-[10000] pointer-events-none transition-all duration-300"
                        style={{
                            backgroundColor: isDarkMode ? "rgba(0,0,0,0.6)" : "rgba(0,0,0,0.6)",
                            mask: "url(#tour-mask)",
                            WebkitMask: "url(#tour-mask)"
                        }}
                    />

                    {/* 3. Interaction Blocker - When allowInteraction is true, let clicks through to target */}
                    {!currentStep.allowInteraction && (
                        <div
                            className="fixed inset-0 z-[10001]"
                            onClick={(e) => e.stopPropagation()}
                        />
                    )}

                    {/* 4. Spotlight Rings - Only primary target gets the animated ring */}
                    {targetRects.map((rect, i) => (
                        <div
                            key={i}
                            className="fixed z-[10002] rounded-xl pointer-events-none"
                            style={{
                                top: rect.top - 8,
                                left: rect.left - 8,
                                width: rect.width + 16,
                                height: rect.height + 16,
                                // Primary target (i=0) gets full ring animation, secondary targets get simple border
                                border: i === 0
                                    ? "3px solid rgba(59, 130, 246, 0.9)"
                                    : "2px solid rgba(59, 130, 246, 0.5)",
                                boxShadow: i === 0
                                    ? `0 0 0 4px rgba(59, 130, 246, 0.4), 0 0 20px rgba(59, 130, 246, 0.6), inset 0 0 15px rgba(59, 130, 246, 0.1)`
                                    : "none",
                                animation: i === 0 ? "pulse 2s ease-in-out infinite" : "none",
                            }}
                        />
                    ))}
                </>
            )}

            {/* Tooltip / Welcome Modal */}
            {currentStep.position === "center" ? (
                /* Special Welcome Modal - Beautiful and prominent with entrance animation */
                <div
                    style={{
                        position: "fixed",
                        top: "50%",
                        left: "50%",
                        transform: isAnimating
                            ? "translate(-50%, -50%) scale(1)"
                            : "translate(-50%, -50%) scale(0.8)",
                        width: 450,
                        zIndex: 10002,
                        opacity: isAnimating ? 1 : 0,
                        transition: "all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
                    }}
                    className={`
                        rounded-3xl shadow-2xl overflow-hidden
                        ${isDarkMode ? "bg-slate-800" : "bg-white"}
                    `}
                    dir="rtl"
                >
                    {/* Floating Sparkles Background */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        {[...Array(12)].map((_, i) => (
                            <div
                                key={i}
                                className="absolute w-2 h-2 rounded-full opacity-60"
                                style={{
                                    background: `linear-gradient(135deg, ${['#60a5fa', '#a78bfa', '#f472b6', '#fbbf24'][i % 4]} 0%, transparent 100%)`,
                                    left: `${10 + (i * 7)}%`,
                                    top: `${15 + (i % 3) * 25}%`,
                                    animation: `float ${3 + (i % 3)}s ease-in-out infinite`,
                                    animationDelay: `${i * 0.2}s`,
                                }}
                            />
                        ))}
                    </div>

                    {/* Gradient Header with shimmer */}
                    <div
                        className="p-6 text-center relative overflow-hidden"
                        style={{
                            background: isDarkMode
                                ? "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 50%, #ec4899 100%)"
                                : "linear-gradient(135deg, #60a5fa 0%, #a78bfa 50%, #f472b6 100%)",
                        }}
                    >
                        {/* Shimmer effect */}
                        <div
                            className="absolute inset-0 opacity-30"
                            style={{
                                background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)",
                                animation: isAnimating ? "shimmer 2s ease-in-out infinite" : "none",
                            }}
                        />

                        {/* Welcome Icon with bounce */}
                        <div
                            className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm mb-4 relative"
                            style={{
                                transform: isAnimating ? "scale(1) rotate(0deg)" : "scale(0) rotate(-180deg)",
                                transition: "all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1) 0.2s",
                            }}
                        >
                            <svg
                                className="w-8 h-8 text-white"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                                />
                            </svg>
                        </div>
                        <h2
                            className="text-2xl font-bold text-white mb-2"
                            style={{
                                opacity: isAnimating ? 1 : 0,
                                transform: isAnimating ? "translateY(0)" : "translateY(20px)",
                                transition: "all 0.5s ease-out 0.3s",
                            }}
                        >
                            {currentStep.title}
                        </h2>
                        <p
                            className="text-white/90 text-sm"
                            style={{
                                opacity: isAnimating ? 1 : 0,
                                transform: isAnimating ? "translateY(0)" : "translateY(20px)",
                                transition: "all 0.5s ease-out 0.4s",
                            }}
                        >
                            סיור אינטראקטיבי במערכת
                        </p>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                        <p
                            className={`text-base mb-6 text-center leading-relaxed ${isDarkMode ? "text-slate-300" : "text-slate-600"}`}
                            style={{
                                opacity: isAnimating ? 1 : 0,
                                transform: isAnimating ? "translateY(0)" : "translateY(15px)",
                                transition: "all 0.5s ease-out 0.5s",
                            }}
                        >
                            {currentStep.description}
                        </p>

                        {/* Features Preview with staggered animation */}
                        <div className={`grid grid-cols-3 gap-3 mb-6 ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
                            {[
                                { icon: "M4 6h16M4 10h16M4 14h16M4 18h16", label: "תצוגות" },
                                { icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z", label: "תאריכים" },
                                { icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z", label: "צוות" },
                            ].map((item, idx) => (
                                <div
                                    key={idx}
                                    className="flex flex-col items-center gap-1 text-center"
                                    style={{
                                        opacity: isAnimating ? 1 : 0,
                                        transform: isAnimating ? "translateY(0) scale(1)" : "translateY(20px) scale(0.8)",
                                        transition: `all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) ${0.6 + idx * 0.1}s`,
                                    }}
                                >
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDarkMode ? "bg-slate-700" : "bg-slate-100"}`}>
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                                        </svg>
                                    </div>
                                    <span className="text-xs">{item.label}</span>
                                </div>
                            ))}
                        </div>

                        {/* Buttons with delayed animation */}
                        <div
                            className="flex items-center justify-between"
                            style={{
                                opacity: isAnimating ? 1 : 0,
                                transform: isAnimating ? "translateY(0)" : "translateY(15px)",
                                transition: "all 0.5s ease-out 0.9s",
                            }}
                        >
                            <button
                                onClick={skipTour}
                                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors
                                    ${isDarkMode ? "text-slate-400 hover:text-slate-300 hover:bg-slate-700" : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"}
                                `}
                            >
                                דלג על הסיור
                            </button>
                            <button
                                onClick={nextStep}
                                className="px-6 py-3 rounded-xl text-sm font-bold text-white transition-all hover:scale-105 active:scale-95"
                                style={{
                                    background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
                                    boxShadow: "0 4px 15px rgba(59, 130, 246, 0.4)",
                                }}
                            >
                                בואו נתחיל! →
                            </button>
                        </div>
                    </div>

                    {/* CSS Keyframes for animations */}
                    <style>{`
                        @keyframes float {
                            0%, 100% { transform: translateY(0) rotate(0deg); }
                            50% { transform: translateY(-10px) rotate(180deg); }
                        }
                        @keyframes shimmer {
                            0% { transform: translateX(-100%); }
                            100% { transform: translateX(100%); }
                        }
                    `}</style>
                </div>
            ) : (
                /* Regular Tooltip for other steps */
                <div
                    style={getTooltipStyle()}
                    className={`
                        rounded-2xl shadow-2xl overflow-hidden
                        ${isDarkMode ? "bg-slate-800 border border-slate-700" : "bg-white border border-slate-200"}
                    `}
                    dir="rtl"
                >
                    <div className="p-4">
                        <div className="flex items-start justify-between mb-2">
                            <h3 className={`font-bold text-lg ${isDarkMode ? "text-white" : "text-slate-800"}`}>
                                {currentStep.title}
                            </h3>
                            <button
                                onClick={skipTour}
                                className={`p-1 rounded-lg -mt-1 -ml-1 ${isDarkMode ? "hover:bg-slate-700 text-slate-400" : "hover:bg-slate-100 text-slate-400"}`}
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <p className={`text-sm mb-4 ${isDarkMode ? "text-slate-300" : "text-slate-600"}`}>
                            {currentStep.description}
                        </p>

                        <div className="flex items-center justify-between">
                            <span className={`text-xs ${isDarkMode ? "text-slate-500" : "text-slate-400"}`}>
                                {state.currentStepIndex + 1} / {totalSteps}
                            </span>

                            <div className="flex items-center gap-2">
                                {!isFirstStep && (
                                    <button
                                        onClick={prevStep}
                                        className={`
                                            flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium
                                            ${isDarkMode ? "text-slate-300 hover:bg-slate-700" : "text-slate-600 hover:bg-slate-100"}
                                        `}
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                        הקודם
                                    </button>
                                )}
                                <button
                                    onClick={isLastStep ? skipTour : nextStep}
                                    className={`
                                        flex items-center gap-1 px-4 py-1.5 rounded-lg text-sm font-medium
                                        ${isDarkMode ? "bg-blue-600 hover:bg-blue-500 text-white" : "bg-blue-500 hover:bg-blue-600 text-white"}
                                    `}
                                >
                                    {isLastStep ? "סיום" : "הבא"}
                                    {!isLastStep && <ChevronLeft className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default TourOverlay;
