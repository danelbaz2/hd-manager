import React, { useCallback, type CSSProperties } from "react";
import { HelpCircle } from "lucide-react";
import { useTheme, useAuth } from "../../../contexts";
import { 
    hasCompletedKanbanOnboarding, 
    markKanbanOnboardingComplete,
    resetKanbanOnboarding 
} from "../../../utils/userStorage";
import { DEMO_COLUMNS } from "./constants";
import { useKanbanOnboardingAnimation } from "./useKanbanOnboardingAnimation";
import { KanbanOnboardingCard } from "./KanbanOnboardingCard";
import { KanbanOnboardingColumn } from "./KanbanOnboardingColumn";

interface KanbanOnboardingDemoProps {
    onDismiss?: () => void;
}


const KanbanOnboardingDemo: React.FC<KanbanOnboardingDemoProps> = ({ onDismiss }) => {
    const { isDarkMode } = useTheme();
    const { user } = useAuth();
    const { containerRef, columnPositions, animState } = useKanbanOnboardingAnimation();

    const handleDismiss = useCallback(() => {
        markKanbanOnboardingComplete(user?.id);
        onDismiss?.();
    }, [onDismiss, user?.id]);

    const isDragging = animState.phase === "lifting" || animState.phase === "dragging";
    const showFloatingCard = isDragging || animState.phase === "dropping";
    const showDropTarget = animState.phase === "dragging";

    // Calculate floating card position
    const getFloatingCardStyle = (): CSSProperties => {
        if (!showFloatingCard || columnPositions.length < 2) return { display: 'none' };

        const startX = columnPositions[0].x + 16;
        const endX = columnPositions[1].x + 16;
        const cardWidth = columnPositions[0].width - 32;

        let x = startX;
        let y = 80;
        let scale = 1;
        let rotation = 0;

        if (animState.phase === "lifting") {
            y = 80 - (animState.liftProgress || 0) * 10;
            scale = 1 + (animState.liftProgress || 0) * 0.05;
        } else if (animState.phase === "dragging") {
            x = startX + (endX - startX) * animState.dragProgress;
            y = 70 - Math.sin(animState.dragProgress * Math.PI) * 20;
            scale = 1.05;
            rotation = Math.sin(animState.dragProgress * Math.PI * 2) * 2;
        } else if (animState.phase === "dropping") {
            x = endX;
            y = 80;
        }

        return {
            position: 'absolute',
            left: x,
            top: y,
            width: cardWidth,
            transform: `scale(${scale}) rotate(${rotation}deg)`,
            transition: animState.phase === "dropping" ? 'all 0.3s ease-out' : 'none',
            zIndex: 100,
            boxShadow: '0 20px 40px -10px rgba(0, 0, 0, 0.35)',
        };
    };

    const showCardInFirstColumn = animState.phase !== "complete" && animState.phase !== "dropping";
    const showCardInSecondColumn = animState.phase === "complete";

    return (
        <div className="fixed inset-0 z-[9998] flex items-center justify-center" dir="rtl">
            <div
                className={`absolute inset-0 backdrop-blur-sm ${isDarkMode ? "bg-black/70" : "bg-slate-900/50"}`}
                onClick={handleDismiss}
            />

            <div className={`relative z-10 w-full max-w-3xl mx-4 rounded-2xl overflow-hidden shadow-2xl ${isDarkMode ? "bg-slate-800 border border-slate-700" : "bg-white border border-slate-200"}`}>
                {/* Header */}
                <div className={`px-6 py-4 border-b ${isDarkMode ? "border-slate-700" : "border-slate-200"}`}>
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDarkMode ? "bg-blue-500/20 text-blue-400" : "bg-blue-100 text-blue-600"}`}>
                            <HelpCircle />
                        </div>
                        <div>
                            <h3 className={`font-bold text-lg ${isDarkMode ? "text-white" : "text-slate-800"}`}>איך עובד לוח המשימות?</h3>
                            <p className={`text-sm ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>גרור כרטיסים בין העמודות לשינוי סטטוס</p>
                        </div>
                    </div>
                </div>

                {/* Demo Kanban Board */}
                <div ref={containerRef} className={`p-6 relative ${isDarkMode ? "bg-slate-900" : "bg-slate-50"}`}>
                    <div className="flex gap-4">
                        {DEMO_COLUMNS.map((column, colIndex) => (
                            <KanbanOnboardingColumn
                                key={column.id}
                                column={column}
                                colIndex={colIndex}
                                isDarkMode={isDarkMode}
                                showDropTarget={showDropTarget}
                                showCardInFirstColumn={showCardInFirstColumn}
                                showCardInSecondColumn={showCardInSecondColumn}
                                animState={animState}
                                showFloatingCard={showFloatingCard}
                            />
                        ))}
                    </div>

                    {showFloatingCard && columnPositions.length >= 2 && (
                        <div style={getFloatingCardStyle()}>
                            <KanbanOnboardingCard isDarkMode={isDarkMode} isFloating />
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className={`px-6 py-4 border-t flex items-center justify-between ${isDarkMode ? "border-slate-700 bg-slate-800/50" : "border-slate-100 bg-slate-50"}`}>
                    <p className={`text-sm ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>💡 לחץ על כרטיס לפרטים נוספים</p>
                    <button
                        onClick={handleDismiss}
                        className={`px-6 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 ${isDarkMode ? "bg-blue-600 hover:bg-blue-500 text-white" : "bg-blue-500 hover:bg-blue-600 text-white"}`}
                    >
                        הבנתי!
                    </button>
                </div>
            </div>
        </div>
    );
};

/**
 * Check if kanban onboarding should be shown
 * @param userId - The user's ID (required for user-specific check)
 */
export const shouldShowOnboarding = (userId: string | undefined): boolean => {
    if (typeof window === "undefined") return false;
    return !hasCompletedKanbanOnboarding(userId);
};

/**
 * Reset kanban onboarding for testing/debugging
 * @param userId - The user's ID
 */
export const resetOnboarding = (userId: string | undefined): void => {
    resetKanbanOnboarding(userId);
};

export default KanbanOnboardingDemo;
