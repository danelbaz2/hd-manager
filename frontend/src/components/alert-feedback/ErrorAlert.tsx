import React, { useState, useEffect, useCallback } from "react";
import { XCircle, X } from "lucide-react";
import type { AlertProps } from "../../schemas/alertTypes";

const ErrorAlert: React.FC<AlertProps> = ({
  id,
  title,
  message,
  onDismiss,
  isDarkMode,
  duration = 5000,
}) => {
  const [isExiting, setIsExiting] = useState(false);
  const [progress, setProgress] = useState(100);

  const handleDismiss = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => onDismiss(id), 300);
  }, [id, onDismiss]);

  useEffect(() => {
    const interval = 50;
    const step = (interval / duration) * 100;

    const progressTimer = setInterval(() => {
      setProgress((prev) => {
        if (prev <= 0) {
          clearInterval(progressTimer);
          handleDismiss();
          return 0;
        }
        return prev - step;
      });
    }, interval);

    return () => clearInterval(progressTimer);
  }, [duration, handleDismiss]);

  return (
    <div
      className={`
        relative overflow-hidden
        w-full max-w-sm
        rounded-xl shadow-2xl
        transform transition-all duration-300 ease-out
        ${
          isExiting
            ? "translate-x-full opacity-0 scale-95"
            : "translate-x-0 opacity-100 scale-100"
        }
        ${
          isDarkMode
            ? "bg-slate-800 border border-slate-700"
            : "bg-white border border-slate-200"
        }
      `}
      style={{
        animation: isExiting
          ? undefined
          : "alertSlideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      {/* Gradient top border */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-400 via-rose-500 to-pink-500" />

      {/* Content */}
      <div className="flex items-start gap-3 p-4 pt-5">
        {/* Icon */}
        <div
          className={`
            flex-shrink-0 w-10 h-10 rounded-full
            flex items-center justify-center
            ${
              isDarkMode
                ? "bg-red-500/20 text-red-400"
                : "bg-red-100 text-red-600"
            }
          `}
        >
          <XCircle size={22} className="animate-error-shake" />
        </div>

        {/* Text Content */}
        <div className="flex-1 min-w-0 pt-0.5">
          <h4
            className={`
              font-semibold text-sm
              ${isDarkMode ? "text-white" : "text-slate-900"}
            `}
          >
            {title}
          </h4>
          <p
            dir="auto"
            className={`
              mt-1 text-sm leading-relaxed
              ${isDarkMode ? "text-slate-300" : "text-slate-600"}
            `}
          >
            {message}
          </p>
        </div>

        {/* Close Button */}
        <button
          onClick={handleDismiss}
          className={`
            flex-shrink-0 p-1.5 rounded-lg
            transition-all duration-200
            hover:scale-110
            ${
              isDarkMode
                ? "text-slate-400 hover:text-white hover:bg-slate-700"
                : "text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            }
          `}
        >
          <X size={16} />
        </button>
      </div>

      {/* Progress Bar */}
      <div
        className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-red-400 to-rose-500"
        style={{
          width: `${progress}%`,
          transition: "width 50ms linear",
        }}
      />

      {/* Background glow effect */}
      <div className="absolute -z-10 inset-0 opacity-20 blur-xl bg-red-500" />
    </div>
  );
};

export default ErrorAlert;
