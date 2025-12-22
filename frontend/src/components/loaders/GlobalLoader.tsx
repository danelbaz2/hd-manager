import React from "react";
import { useTheme } from "../../contexts/ThemeContext";

interface GlobalLoaderProps {
  /**
   * Loading text to display (optional)
   */
  text?: string;

  /**
   * Subtext for additional context (optional)
   */
  subtext?: string;

  /**
   * Whether to show as full screen overlay
   */
  fullScreen?: boolean;

  /**
   * Optional className for additional styling
   */
  className?: string;
}

/**
 * GlobalLoader - A beautiful, modern loading component with animated dots and gradient effects.
 * Used as the unified loader across the application for initial data fetching.
 */
const GlobalLoader: React.FC<GlobalLoaderProps> = ({
  text = "טוען...",
  subtext,
  fullScreen = true,
  className = "",
}) => {
  const { isDarkMode } = useTheme();

  const containerClasses = fullScreen
    ? "min-h-screen fixed inset-0 z-50"
    : "flex-1 min-h-[400px]";

  return (
    <div
      className={`
        ${containerClasses}
        flex flex-col items-center justify-center
        ${
          isDarkMode
            ? "bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"
            : "bg-gradient-to-br from-slate-50 via-white to-slate-100"
        }
        ${className}
      `}
      dir="rtl"
    >
      {/* Animated background orbs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className={`
            absolute top-1/4 left-1/4 w-64 h-64 rounded-full blur-3xl opacity-20
            ${isDarkMode ? "bg-blue-500" : "bg-blue-300"}
            animate-pulse
          `}
          style={{ animationDuration: "3s" }}
        />
        <div
          className={`
            absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full blur-3xl opacity-20
            ${isDarkMode ? "bg-purple-500" : "bg-purple-300"}
            animate-pulse
          `}
          style={{ animationDuration: "4s", animationDelay: "1s" }}
        />
        <div
          className={`
            absolute top-1/2 right-1/3 w-32 h-32 rounded-full blur-2xl opacity-15
            ${isDarkMode ? "bg-cyan-400" : "bg-cyan-300"}
            animate-pulse
          `}
          style={{ animationDuration: "2.5s", animationDelay: "0.5s" }}
        />
      </div>

      {/* Main loader content */}
      <div className="relative z-10 flex flex-col items-center gap-8">
        {/* Logo/Icon area with glow effect */}
        <div className="relative">
          <div
            className={`
              absolute inset-0 rounded-full blur-xl opacity-40
              ${isDarkMode ? "bg-blue-400" : "bg-blue-500"}
              animate-pulse
            `}
            style={{ animationDuration: "2s" }}
          />
          <div
            className={`
              relative w-20 h-20 rounded-2xl
              flex items-center justify-center
              ${
                isDarkMode
                  ? "bg-gradient-to-br from-slate-700 to-slate-800 shadow-2xl shadow-blue-500/20"
                  : "bg-gradient-to-br from-white to-slate-100 shadow-xl shadow-blue-500/30"
              }
              border
              ${isDarkMode ? "border-slate-600/50" : "border-white/80"}
            `}
          >
            {/* Animated logo/spinner */}
            <div className="relative">
              <div
                className={`
                  w-10 h-10 rounded-lg
                  ${
                    isDarkMode
                      ? "bg-gradient-to-br from-blue-400 to-purple-500"
                      : "bg-gradient-to-br from-blue-500 to-purple-600"
                  }
                `}
                style={{
                  animation: "globalLoaderSpin 2s linear infinite",
                }}
              />
              <div
                className={`
                  absolute inset-1 rounded
                  ${isDarkMode ? "bg-slate-800" : "bg-white"}
                `}
              />
              <div
                className={`
                  absolute inset-2 rounded-sm
                  ${
                    isDarkMode
                      ? "bg-gradient-to-br from-blue-400 to-purple-500"
                      : "bg-gradient-to-br from-blue-500 to-purple-600"
                  }
                `}
              />
            </div>
          </div>
        </div>

        {/* Animated bouncing dots */}
        <div className="flex items-center gap-3">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={`
                w-3 h-3 rounded-full
                ${
                  isDarkMode
                    ? "bg-gradient-to-br from-blue-400 to-blue-500"
                    : "bg-gradient-to-br from-blue-500 to-blue-600"
                }
                shadow-lg
                ${isDarkMode ? "shadow-blue-400/30" : "shadow-blue-500/40"}
              `}
              style={{
                animation: "globalLoaderBounce 1.4s ease-in-out infinite",
                animationDelay: `${i * 0.16}s`,
              }}
            />
          ))}
        </div>

        {/* Loading text with gradient */}
        <div className="flex flex-col items-center gap-2 text-center">
          <h2
            className={`
              text-xl font-semibold
              bg-clip-text text-transparent
              ${
                isDarkMode
                  ? "bg-gradient-to-r from-slate-200 via-blue-200 to-slate-200"
                  : "bg-gradient-to-r from-slate-700 via-blue-600 to-slate-700"
              }
            `}
          >
            {text}
          </h2>
          {subtext && (
            <p
              className={`
                  text-sm font-medium
                  ${isDarkMode ? "text-slate-500" : "text-slate-400"}
                `}
            >
              {subtext}
            </p>
          )}
        </div>

        {/* Progress bar with shimmer effect */}
        <div
          className={`
            w-48 h-1.5 rounded-full overflow-hidden
            ${isDarkMode ? "bg-slate-700" : "bg-slate-200"}
          `}
        >
          <div
            className={`
              h-full rounded-full
              ${
                isDarkMode
                  ? "bg-gradient-to-r from-blue-500 via-purple-500 to-blue-500"
                  : "bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400"
              }
            `}
            style={{
              width: "40%",
              animation: "globalLoaderProgress 1.5s ease-in-out infinite",
            }}
          />
        </div>
      </div>

      {/* CSS Keyframes */}
      <style>{`
        @keyframes globalLoaderSpin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        
        @keyframes globalLoaderBounce {
          0%, 80%, 100% {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
          40% {
            transform: translateY(-12px) scale(1.1);
            opacity: 0.8;
          }
        }
        
        @keyframes globalLoaderProgress {
          0% {
            transform: translateX(-150%);
          }
          100% {
            transform: translateX(400%);
          }
        }
      `}</style>
    </div>
  );
};

export default GlobalLoader;
