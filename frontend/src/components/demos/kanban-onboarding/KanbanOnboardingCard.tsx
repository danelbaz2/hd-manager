import React from "react";
import { Clock, User } from "lucide-react";

interface KanbanOnboardingCardProps {
    isDarkMode: boolean;
    isFloating?: boolean;
    isDragging?: boolean;
    isPlaceholder?: boolean;
    style?: React.CSSProperties;
}

export const KanbanOnboardingCard: React.FC<KanbanOnboardingCardProps> = ({
    isDarkMode,
    isFloating,
    isDragging,
    isPlaceholder,
    style
}) => {
    if (isPlaceholder) {
        return (
            <div
                className={`
                    p-4 rounded-xl border-2 border-dashed
                    ${isDarkMode
                        ? "border-slate-600 bg-slate-800/30"
                        : "border-slate-300 bg-slate-100/50"
                    }
                    opacity-50
                `}
            >
                <div className="h-16" />
            </div>
        );
    }

    return (
        <div
            className={`
                p-4 rounded-xl border select-none
                ${isDarkMode ? "bg-slate-800 border-slate-700" : "bg-white border-slate-100"}
                ${isFloating ? "shadow-2xl" : "shadow-sm"}
                ${isDragging ? "opacity-30 border-dashed" : ""}
            `}
            style={style}
        >
            {/* Task Title */}
            <div className="flex justify-between items-start mb-2">
                <h4 className={`font-bold text-sm leading-tight ${isDarkMode ? "text-white" : "text-slate-800"}`}>
                    משימה לדוגמה
                </h4>
            </div>

            {/* Task Description */}
            <p className={`text-xs mb-3 line-clamp-2 ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
                תיאור קצר של המשימה
            </p>

            {/* Tags */}
            <div className="flex flex-wrap gap-1 mb-3">
                <span
                    className="px-2 py-0.5 rounded-md text-[10px] font-semibold"
                    style={{ backgroundColor: "#dbeafe", color: "#1e40af" }}
                >
                    תווית
                </span>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between mt-auto">
                <div className={`flex items-center gap-1 text-xs ${isDarkMode ? "text-slate-400" : "text-slate-400"}`}>
                    <Clock size={12} />
                    <span>2025-01-15</span>
                </div>
                <div
                    className="w-6 h-6 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: "#3b82f6" }}
                >
                    <User size={12} className="text-white" />
                </div>
            </div>
        </div>
    );
};
