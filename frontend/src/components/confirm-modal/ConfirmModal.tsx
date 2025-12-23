import React from "react";
import type { LucideIcon } from "lucide-react";
import { AlertTriangle, X, Check, Trash2 } from "lucide-react";

export type ConfirmModalVariant = "danger" | "warning" | "info";

interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    text: React.ReactNode;
    onConfirm: () => void;
    onCancel: () => void;
    isDarkMode: boolean;
    variant?: ConfirmModalVariant;
    confirmText?: string;
    cancelText?: string;
    confirmIcon?: LucideIcon;
    headerIcon?: LucideIcon;
    showIrreversibleWarning?: boolean;
}

const VARIANT_CONFIG: Record<ConfirmModalVariant, {
    iconBg: string;
    iconColor: string;
    confirmBg: string;
    confirmHover: string;
    defaultIcon: LucideIcon;
    defaultConfirmIcon: LucideIcon;
    defaultConfirmText: string;
}> = {
    danger: {
        iconBg: "bg-red-100",
        iconColor: "text-red-600",
        confirmBg: "bg-red-500",
        confirmHover: "hover:bg-red-600",
        defaultIcon: AlertTriangle,
        defaultConfirmIcon: Trash2,
        defaultConfirmText: "מחק",
    },
    warning: {
        iconBg: "bg-amber-100",
        iconColor: "text-amber-600",
        confirmBg: "bg-amber-500",
        confirmHover: "hover:bg-amber-600",
        defaultIcon: AlertTriangle,
        defaultConfirmIcon: Check,
        defaultConfirmText: "אישור",
    },
    info: {
        iconBg: "bg-blue-100",
        iconColor: "text-blue-600",
        confirmBg: "bg-blue-500",
        confirmHover: "hover:bg-blue-600",
        defaultIcon: AlertTriangle,
        defaultConfirmIcon: Check,
        defaultConfirmText: "אישור",
    },
};

const ConfirmModal: React.FC<ConfirmModalProps> = ({
    isOpen,
    title,
    text,
    onConfirm,
    onCancel,
    isDarkMode,
    variant = "warning",
    confirmText,
    cancelText = "ביטול",
    confirmIcon,
    headerIcon,
    showIrreversibleWarning = false,
}) => {
    if (!isOpen) return null;

    const config = VARIANT_CONFIG[variant];
    const HeaderIcon = headerIcon || config.defaultIcon;
    const ConfirmIcon = confirmIcon || config.defaultConfirmIcon;
    const finalConfirmText = confirmText || config.defaultConfirmText;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
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
                dir="rtl"
            >
                {/* Header */}
                <div className="flex items-center justify-center gap-3 mb-4">
                    <div className={`p-3 rounded-full ${config.iconBg}`}>
                        <HeaderIcon size={24} className={config.iconColor} />
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
                    {showIrreversibleWarning && (
                        <p
                            className={`text-sm mt-2 ${isDarkMode ? "text-slate-400" : "text-slate-500"
                                }`}
                        >
                            פעולה זו אינה ניתנת לביטול
                        </p>
                    )}
                </div>

                {/* Actions */}
                <div className="flex gap-3 justify-center">
                    <button
                        onClick={onConfirm}
                        className={`
                            px-6 py-2.5 rounded-lg text-white font-medium 
                            transition-colors flex items-center gap-2
                            ${config.confirmBg} ${config.confirmHover}
                        `}
                    >
                        <ConfirmIcon size={18} />
                        {finalConfirmText}
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
                        {cancelText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
