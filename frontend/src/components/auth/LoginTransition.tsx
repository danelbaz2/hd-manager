import React from "react";
import { Check, Loader2 } from "lucide-react";

export type LoginState = "idle" | "loading" | "success" | "error";

interface LoginTransitionProps {
  state: LoginState;
  isDarkMode: boolean;
  userName?: string;
}

/**
 * LoginTransition - Displays animated states during login flow
 * Shows loading spinner, success checkmark, or error state
 */
const LoginTransition: React.FC<LoginTransitionProps> = ({
  state,
  isDarkMode,
  userName,
}) => {
  if (state === "idle" || state === "error") return null;

  return (
    <div
      className={`
        fixed inset-0 z-50
        flex items-center justify-center
        transition-opacity duration-300
        ${
          state === "loading" || state === "success"
            ? "opacity-100"
            : "opacity-0 pointer-events-none"
        }
        ${isDarkMode ? "bg-slate-900/95" : "bg-white/95"}
        backdrop-blur-sm
      `}
    >
      <div className="flex flex-col items-center gap-6">
        {/* Animated Circle */}
        <div
          className={`
            relative w-24 h-24
            flex items-center justify-center
            rounded-full
            transition-all duration-500
            ${
              state === "success"
                ? "bg-green-500 scale-100"
                : "bg-blue-500 scale-90"
            }
          `}
        >
          {state === "loading" && (
            <Loader2 size={48} className="text-white animate-spin" />
          )}
          {state === "success" && (
            <Check
              size={48}
              className="text-white animate-bounce-in"
              strokeWidth={3}
            />
          )}
        </div>

        {/* Status Text */}
        <div className="text-center">
          <p
            className={`
              text-xl font-bold mb-2
              transition-all duration-300
              ${isDarkMode ? "text-white" : "text-slate-800"}
            `}
          >
            {state === "loading" && "מתחבר למערכת..."}
            {state === "success" && `ברוך הבא, ${userName || "משתמש"}!`}
          </p>
          <p
            className={`
              text-sm
              ${isDarkMode ? "text-slate-400" : "text-slate-500"}
            `}
          >
            {state === "loading" && "אנא המתן..."}
            {state === "success" && "מעביר אותך לדף הבית..."}
          </p>
        </div>

        {/* Progress Bar for Success */}
        {state === "success" && (
          <div className="w-48 h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full animate-progress"
              style={{ animation: "progress 1.5s ease-out forwards" }}
            />
          </div>
        )}
      </div>

      {/* Custom Animations */}
      <style>
        {`
          @keyframes bounce-in {
            0% { transform: scale(0); opacity: 0; }
            50% { transform: scale(1.2); }
            100% { transform: scale(1); opacity: 1; }
          }
          
          @keyframes progress {
            from { width: 0%; }
            to { width: 100%; }
          }
          
          .animate-bounce-in {
            animation: bounce-in 0.4s ease-out forwards;
          }
        `}
      </style>
    </div>
  );
};

export default LoginTransition;
