import React from "react";
import { KanbanOnboardingCard } from "./KanbanOnboardingCard";
import type { LucideIcon } from "lucide-react";

interface KanbanOnboardingColumnProps {
    column: {
        id: string;
        title: string;
        icon: LucideIcon;
        colorClass: string;
    };
    colIndex: number;
    isDarkMode: boolean;
    showDropTarget: boolean;
    showCardInFirstColumn: boolean;
    showCardInSecondColumn: boolean;
    animState: { phase: string };
    showFloatingCard: boolean; // needed for first col card dragging state
}

export const KanbanOnboardingColumn: React.FC<KanbanOnboardingColumnProps> = ({
    column,
    colIndex,
    isDarkMode,
    showDropTarget,
    showCardInFirstColumn,
    showCardInSecondColumn,
    animState,
    showFloatingCard,
}) => {
    const Icon = column.icon;
    const isDropTarget = showDropTarget && colIndex === 1;

    return (
        <div
            data-demo-column
            className={`
                flex-1 min-w-[180px]
                rounded-2xl p-4
                border transition-all duration-300 ease-out
                ${isDropTarget
                    ? isDarkMode
                        ? "bg-blue-900/20 border-blue-500/60 shadow-lg shadow-blue-500/10"
                        : "bg-blue-50/80 border-blue-400/60 shadow-lg shadow-blue-500/10"
                    : isDarkMode
                        ? "bg-slate-800/50 border-slate-700"
                        : "bg-slate-50 border-slate-200"
                }
            `}
        >
            {/* Column Header */}
            <div
                className={`
                    flex items-center justify-between
                    mb-4 pb-3 border-b
                    ${isDarkMode ? "border-slate-700" : "border-slate-200"}
                `}
            >
                <div className="flex items-center gap-2">
                    <div
                        className={`
                            w-6 h-6 rounded-full flex items-center justify-center
                            transition-colors duration-300
                            ${isDropTarget
                                ? "bg-blue-500 text-white"
                                : isDarkMode
                                    ? "bg-slate-700"
                                    : "bg-slate-200"
                            }
                        `}
                    >
                        <span
                            className={`
                                text-xs font-bold
                                ${isDropTarget
                                    ? "text-white"
                                    : isDarkMode
                                        ? "text-slate-300"
                                        : "text-slate-600"
                                }
                            `}
                        >
                            {colIndex === 0 && showCardInFirstColumn ? 1 :
                                colIndex === 1 && showCardInSecondColumn ? 1 : 0}
                        </span>
                    </div>
                    <h3 className={`font-bold text-lg transition-colors duration-300 ${isDropTarget ? "text-blue-500" : column.colorClass}`}>
                        {column.title}
                    </h3>
                </div>
                <Icon size={18} className={`transition-colors duration-300 ${isDropTarget ? "text-blue-500" : column.colorClass}`} />
            </div>

            {/* Column Content */}
            <div className="min-h-[120px]">
                {/* Card in first column */}
                {colIndex === 0 && showCardInFirstColumn && (
                    <KanbanOnboardingCard
                        isDarkMode={isDarkMode}
                        isDragging={showFloatingCard}
                    />
                )}

                {/* Destination Column Logic (Col 1) */}
                {colIndex === 1 && (
                    <>
                        {(isDropTarget || animState.phase === "dropping") && (
                            <div className="relative w-full">
                                {/* Hidden card to set accurate height */}
                                <div className="opacity-0 pointer-events-none" aria-hidden="true">
                                    <KanbanOnboardingCard isDarkMode={isDarkMode} />
                                </div>

                                {/* Drop Target Overlay */}
                                {isDropTarget && (
                                    <div
                                        className={`
                                            absolute inset-0
                                            rounded-xl border-2 border-dashed
                                            transition-all duration-300
                                            ${isDarkMode
                                                ? "border-blue-500/40 bg-blue-500/10"
                                                : "border-blue-400/50 bg-blue-50"
                                            }
                                            flex items-center justify-center
                                        `}
                                    >
                                        <span className={`text-sm ${isDarkMode ? "text-blue-400" : "text-blue-500"}`}>
                                            שחרר כאן
                                        </span>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Final State: Visible Card */}
                        {showCardInSecondColumn && (
                            <div className="animate-pulse">
                                <KanbanOnboardingCard isDarkMode={isDarkMode} />
                            </div>
                        )}
                    </>
                )}

                {/* Empty state for third column */}
                {colIndex === 2 && (
                    <div
                        className={`
                            flex items-center justify-center h-24
                            text-sm rounded-lg
                            ${isDarkMode ? "text-slate-600" : "text-slate-300"}
                        `}
                    >
                        אין משימות
                    </div>
                )}
            </div>
        </div>
    );
};
