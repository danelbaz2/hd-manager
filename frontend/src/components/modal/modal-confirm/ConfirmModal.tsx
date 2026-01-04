/**
 * ConfirmModal - Reusable confirmation modal with variant styling.
 * Uses ModalOverlay for consistent backdrop and z-index behavior.
 */
import React from "react";
import type { LucideIcon } from "lucide-react";
import { AlertTriangle, X, Check, Trash2 } from "lucide-react";
import { ModalOverlay } from "../../common/ModalOverlay";

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

// Variant configuration
const VARIANT_CONFIG: Record<ConfirmModalVariant, {
  iconBg: { light: string; dark: string };
  iconColor: { light: string; dark: string };
  confirmBg: string;
  confirmHover: string;
  defaultIcon: LucideIcon;
  defaultConfirmIcon: LucideIcon;
  defaultConfirmText: string;
}> = {
  danger: {
    iconBg: { light: "bg-red-100", dark: "bg-red-500/20" },
    iconColor: { light: "text-red-600", dark: "text-red-400" },
    confirmBg: "bg-red-500",
    confirmHover: "hover:bg-red-600",
    defaultIcon: AlertTriangle,
    defaultConfirmIcon: Trash2,
    defaultConfirmText: "מחק",
  },
  warning: {
    iconBg: { light: "bg-amber-100", dark: "bg-amber-500/20" },
    iconColor: { light: "text-amber-600", dark: "text-amber-400" },
    confirmBg: "bg-amber-500",
    confirmHover: "hover:bg-amber-600",
    defaultIcon: AlertTriangle,
    defaultConfirmIcon: Check,
    defaultConfirmText: "אישור",
  },
  info: {
    iconBg: { light: "bg-blue-100", dark: "bg-blue-500/20" },
    iconColor: { light: "text-blue-600", dark: "text-blue-400" },
    confirmBg: "bg-blue-500",
    confirmHover: "hover:bg-blue-600",
    defaultIcon: AlertTriangle,
    defaultConfirmIcon: Check,
    defaultConfirmText: "אישור",
  },
};

// Helper to keep content visible during exit animation
const useCachedContent = <T,>(content: T, isOpen: boolean): T => {
  const [cached, setCached] = React.useState(content);

  React.useEffect(() => {
    if (isOpen) {
      setCached(content);
    }
  }, [isOpen, content]);

  return isOpen ? content : cached;
};

const ConfirmModal: React.FC<ConfirmModalProps> = (props) => {
  const {
    isOpen,
    onConfirm,
    onCancel,
    isDarkMode,
  } = props;

  // Cache display props so they persist during close animation
  // (Even if parent clears data like 'text' happens to be null)
  const displayProps = useCachedContent({
    title: props.title,
    text: props.text,
    variant: props.variant || "warning",
    confirmText: props.confirmText,
    cancelText: props.cancelText || "ביטול",
    showIrreversibleWarning: props.showIrreversibleWarning || false,
    headerIcon: props.headerIcon,
    confirmIcon: props.confirmIcon
  }, isOpen);

  // Destructure from cached props
  const {
    title, text, variant, confirmText,
    cancelText, showIrreversibleWarning, headerIcon, confirmIcon
  } = displayProps;

  const config = VARIANT_CONFIG[variant];
  const HeaderIcon = headerIcon || config.defaultIcon;
  const ConfirmIcon = confirmIcon || config.defaultConfirmIcon;
  const finalConfirmText = confirmText || config.defaultConfirmText;

  // We explicitly use isOpen for the Overlay to trigger animation
  return (
    <ModalOverlay isOpen={isOpen} onClose={onCancel} maxWidthClass="max-w-md">
      <div
        className={`
          w-full p-6 rounded-xl border shadow-2xl
          ${isDarkMode ? "bg-slate-800 border-slate-600" : "bg-white border-slate-200"}
        `}
        dir="rtl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className={`p-3 rounded-full ${isDarkMode ? config.iconBg.dark : config.iconBg.light}`}>
            <HeaderIcon
              size={24}
              className={isDarkMode ? config.iconColor.dark : config.iconColor.light}
            />
          </div>
        </div>

        {/* Content */}
        <div className="text-center mb-6">
          <h3 className={`text-lg font-bold mb-2 ${isDarkMode ? "text-white" : "text-slate-800"}`}>
            {title}
          </h3>
          <div className={isDarkMode ? "text-slate-300" : "text-slate-600"}>
            {text}
          </div>
          {showIrreversibleWarning && (
            <p className={`text-sm mt-2 ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
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
    </ModalOverlay>
  );
};

export default ConfirmModal;