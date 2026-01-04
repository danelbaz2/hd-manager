import React from "react";
import { MoveLeft } from "lucide-react";
import { KANBAN_COLUMNS } from "../../../pages/task-page/parts/KanbanColumn";

interface StatusChangeContentProps {
    taskTitle: string;
    fromStatus: string;
    toStatus: string;
    isDarkMode: boolean;
}

export const StatusChangeContent: React.FC<StatusChangeContentProps> = ({
    taskTitle,
    fromStatus,
    toStatus,
    isDarkMode,
}) => {
    const getStatusLabel = (status: string): string => {
        const column = KANBAN_COLUMNS.find((c) => c.status === status);
        return column?.title || status;
    };

    return (
        <div className="space-y-3">
            <p>
                האם להעביר את המשימה{" "}
                <strong
                    className={`inline-block max-w-[250px] truncate align-text-bottom ${isDarkMode ? "text-white" : "text-slate-800"
                        }`}
                >
                    "{taskTitle}"
                </strong>
                ?
            </p>
            {/* Status change visualization */}
            <div
                className={`flex items-center justify-center gap-3 py-3 px-4 rounded-xl ${isDarkMode ? "bg-slate-700/50" : "bg-slate-100/80"
                    }`}
                dir="rtl"
            >
                <span
                    className={`px-3 py-1.5 rounded-lg text-sm font-semibold shadow-sm ${isDarkMode
                        ? "bg-slate-600 text-slate-200"
                        : "bg-white text-slate-700 border border-slate-200"
                        }`}
                >
                    {getStatusLabel(fromStatus)}
                </span>
                <div
                    className={`flex items-center justify-center w-8 h-8 rounded-full ${isDarkMode ? "bg-blue-500/20" : "bg-blue-100"
                        }`}
                >
                    <MoveLeft size={16} className="text-blue-500" />
                </div>
                <span
                    className={`px-3 py-1.5 rounded-lg text-sm font-semibold shadow-sm ${isDarkMode
                        ? "bg-blue-500/30 text-blue-300"
                        : "bg-blue-500 text-white"
                        }`}
                >
                    {getStatusLabel(toStatus)}
                </span>
            </div>
        </div>
    );
};
