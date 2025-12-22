import React from "react";
import { Tag, Layers } from "lucide-react";

export type TagMode = "primary" | "secondary";

export interface ModeToggleProps {
    mode: TagMode;
    isDarkMode: boolean;
    onModeChange: (mode: TagMode) => void;
}

/**
 * ModeToggle - Toggle between Primary and Secondary tag modes
 */
const ModeToggle: React.FC<ModeToggleProps> = ({
    mode,
    isDarkMode,
    onModeChange,
}) => {
    return (
        <div className="flex justify-center gap-2 mb-6" dir="rtl">
            <button
                onClick={() => onModeChange("primary")}
                className={`
                    flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm transition-all
                    ${mode === "primary"
                        ? "bg-blue-500 text-white shadow-lg"
                        : isDarkMode
                            ? "bg-slate-700/50 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-600"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200"
                    }
                `}
            >
                <Tag size={16} />
                קטגוריות ראשיות
            </button>
            <button
                onClick={() => onModeChange("secondary")}
                className={`
                    flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-sm transition-all
                    ${mode === "secondary"
                        ? "bg-blue-500 text-white shadow-lg"
                        : isDarkMode
                            ? "bg-slate-700/50 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-600"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200 border border-slate-200"
                    }
                `}
            >
                <Layers size={16} />
                תגיות משניות
            </button>
        </div>
    );
};

export default ModeToggle;
