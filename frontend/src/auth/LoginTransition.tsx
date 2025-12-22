import React from "react";
import { Check } from "lucide-react";
import { GlobalLoader } from "../components/loaders";

export type LoginState = "idle" | "loading" | "success" | "error";

interface LoginTransitionProps {
  state: LoginState;
  isDarkMode: boolean;
  userName?: string;
}

/**
 * LoginTransition - Displays animated states during login flow
 * Uses GlobalLoader for loading state, shows success animation for welcome
 */
const LoginTransition: React.FC<LoginTransitionProps> = ({
  state,
  isDarkMode,
  userName,
}) => {
  // Don't render anything for idle or error states
  if (state === "idle" || state === "error") return null;

  // Use GlobalLoader for loading state
  if (state === "loading") {
    return <GlobalLoader fullScreen />;
  }

  // Success state - show welcome message with animation
  return (
    <div
      className={`
        fixed inset-0 z-50
        flex items-center justify-center
        transition-opacity duration-300
        opacity-100
        ${isDarkMode ? "bg-slate-900/95" : "bg-white/95"}
        backdrop-blur-sm
      `}
    >
      <div className="flex flex-col items-center gap-6">
        {/* Success Circle with Check */}
        <div className="relative w-24 h-24 flex items-center justify-center rounded-full bg-green-500 scale-100 transition-all duration-500">
          <Check
            size={48}
            className="text-white animate-bounce-in"
            strokeWidth={3}
          />
        </div>

        {/* Welcome Text */}
        <div className="text-center">
          <p
            className={`
              text-xl font-bold mb-2
              ${isDarkMode ? "text-white" : "text-slate-800"}
            `}
          >
            ברוך הבא, {userName || "משתמש"}!
          </p>
          <p
            className={`
              text-sm
              ${isDarkMode ? "text-slate-400" : "text-slate-500"}
            `}
          >
            מעביר אותך לדף הבית...
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-48 h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 rounded-full"
            style={{ animation: "loginProgress 1.5s ease-out forwards" }}
          />
        </div>
      </div>

      {/* Custom Animations */}
      <style>
        {`
          @keyframes bounce-in {
            0% { transform: scale(0); opacity: 0; }
            50% { transform: scale(1.2); }
            100% { transform: scale(1); opacity: 1; }
          }
          
          @keyframes loginProgress {
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
