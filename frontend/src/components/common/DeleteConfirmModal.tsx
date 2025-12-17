import React from "react";
import { AlertTriangle, X } from "lucide-react";

interface DeleteConfirmModalProps {
    isOpen: boolean;
    title: string;
    text: React.ReactNode;
    onConfirm: () => void;
    onCancel: () => void;
    isDarkMode: boolean;
}

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
    isOpen,
    title,
    text,
    onConfirm,
    onCancel,
    isDarkMode,
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={onCancel}
            />

            {/* Modal */}
            <div
                className={`
          relative z-10 w-full max-w-md mx-4 p-6 rounded-xl border shadow-2xl
          ${isDarkMode
                        ? "bg-slate-800 border-slate-600"
                        : "bg-white border-slate-200"
                    }
        `}
            >
                {/* Header */}
                <div className="flex items-center justify-center gap-3 mb-4">
                    <div className="p-3 rounded-full bg-red-100">
                        <AlertTriangle size={24} className="text-red-600" />
                    </div>
                </div>

                {/* Content */}
                <div className="text-center mb-6">
                    <h3
                        className={`text-lg font-bold mb-2 ${isDarkMode ? "text-white" : "text-slate-800"
                            }`}
                    >
                        {title}
                    </h3>
                    <div
                        className={`${isDarkMode ? "text-slate-300" : "text-slate-600"}`}
                    >
                        {text}
                    </div>
                    <p
                        className={`text-sm mt-2 ${isDarkMode ? "text-slate-400" : "text-slate-500"
                            }`}
                    >
                        פעולה זו אינה ניתנת לביטול
                    </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3 justify-center" dir="rtl">
                    <button
                        onClick={onConfirm}
                        className="px-6 py-2.5 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium transition-colors"
                    >
                        מחק
                    </button>
                    <button
                        onClick={onCancel}
                        className={`
              px-6 py-2.5 rounded-lg font-medium transition-colors flex items-center gap-2
              ${isDarkMode
                                ? "bg-slate-600 hover:bg-slate-500 text-white"
                                : "bg-slate-200 hover:bg-slate-300 text-slate-700"
                            }
            `}
                    >
                        <X size={18} />
                        ביטול
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DeleteConfirmModal;
