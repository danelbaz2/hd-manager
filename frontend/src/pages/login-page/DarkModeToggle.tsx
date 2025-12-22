import React from "react";
import { Moon, Sun } from "lucide-react";

interface DarkModeToggleProps {
  isDarkMode: boolean;
  onToggle: () => void;
}

const DarkModeToggle: React.FC<DarkModeToggleProps> = ({
  isDarkMode,
  onToggle,
}) => {
  return (
    <button
      onClick={onToggle}
      className={`
        fixed bottom-6 left-6
        p-3.5 rounded-full
        shadow-lg border-2
        transition-all duration-300
        hover:scale-110 hover:rotate-12
        ${
          isDarkMode
            ? "bg-slate-800 border-slate-700 hover:bg-slate-700 hover:border-slate-600"
            : "bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300"
        }
      `}
      aria-label="Toggle dark mode"
    >
      {isDarkMode ? (
        <Sun size={22} className="text-yellow-400" />
      ) : (
        <Moon size={22} className="text-slate-600" />
      )}
    </button>
  );
};

export default DarkModeToggle;
