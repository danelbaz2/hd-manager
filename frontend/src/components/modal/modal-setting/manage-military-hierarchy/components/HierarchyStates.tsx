import React from "react";
import { Building2, AlertTriangle, Sparkles, Plus } from "lucide-react";

export const HierarchyLoading: React.FC<{ isDarkMode: boolean }> = ({
  isDarkMode,
}) => (
  <div className="flex-1 flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div
        className={`
        w-16 h-16 rounded-2xl flex items-center justify-center animate-pulse
        ${isDarkMode ? "bg-blue-900/30" : "bg-blue-100"}
      `}
      >
        <Building2 className="w-8 h-8 text-blue-500" />
      </div>
      <span
        className={`text-sm font-medium ${
          isDarkMode ? "text-slate-400" : "text-slate-600"
        }`}
      >
        טוען עץ ציוות...
      </span>
    </div>
  </div>
);

export const HierarchyError: React.FC<{
  isDarkMode: boolean;
  message?: string;
}> = ({ isDarkMode, message }) => (
  <div className="flex-1 flex items-center justify-center">
    <div
      className={`
      flex flex-col items-center gap-4 p-8 rounded-2xl border-2 border-dashed
      ${
        isDarkMode
          ? "border-red-700/50 bg-red-900/10"
          : "border-red-300 bg-red-50"
      }
    `}
    >
      <AlertTriangle className="w-12 h-12 text-red-500" />
      <div className="text-center">
        <p
          className={`font-semibold ${
            isDarkMode ? "text-red-400" : "text-red-600"
          }`}
        >
          שגיאה בטעינת העץ ציוות
        </p>
        <p
          className={`text-sm mt-1 ${
            isDarkMode ? "text-slate-400" : "text-slate-600"
          }`}
        >
          {message || "נסה שוב מאוחר יותר"}
        </p>
      </div>
    </div>
  </div>
);

export const HierarchyEmpty: React.FC<{ isDarkMode: boolean }> = ({
  isDarkMode,
}) => (
  <div
    className={`
    text-center py-16 rounded-3xl
    ${isDarkMode ? "bg-slate-800/30" : "bg-slate-50/50"}
  `}
  >
    <Sparkles
      className={`w-12 h-12 mx-auto mb-4 opacity-50 ${
        isDarkMode ? "text-slate-600" : "text-slate-400"
      }`}
    />
    <p
      className={`font-medium text-lg ${
        isDarkMode ? "text-slate-400" : "text-slate-500"
      }`}
    >
      עדיין אין פיקודים במערכת
    </p>
  </div>
);

interface AddPikudButtonProps {
  isDarkMode: boolean;
  onClick: () => void;
}

export const AddPikudButton: React.FC<AddPikudButtonProps> = ({
  isDarkMode,
  onClick,
}) => (
  <button
    onClick={onClick}
    className={`
      group w-full p-6 rounded-2xl border-2 border-dashed 
      transition-all duration-300
      ${
        isDarkMode
          ? "border-slate-700 hover:border-blue-500/50 hover:bg-blue-900/5"
          : "border-slate-300 hover:border-blue-500/50 hover:bg-blue-50/50"
      }
    `}
  >
    <div className="flex items-center justify-center gap-3">
      <div
        className={`
        w-12 h-12 rounded-xl flex items-center justify-center 
        transition-all group-hover:scale-110
        ${
          isDarkMode
            ? "bg-slate-800 group-hover:bg-blue-500/10"
            : "bg-slate-100 group-hover:bg-blue-100"
        }
      `}
      >
        <Plus
          className={`
          w-6 h-6 transition-colors
          ${
            isDarkMode
              ? "text-slate-400 group-hover:text-blue-400"
              : "text-slate-400 group-hover:text-blue-600"
          }
        `}
        />
      </div>
      <div className="text-right">
        <span
          className={`
          block font-bold text-lg transition-colors
          ${
            isDarkMode
              ? "text-slate-300 group-hover:text-blue-400"
              : "text-slate-600 group-hover:text-blue-600"
          }
        `}
        >
          הוסף פיקוד חדש
        </span>
        <span
          className={`block text-xs mt-0.5 ${
            isDarkMode ? "text-slate-500" : "text-slate-400"
          }`}
        >
          צור פיקוד חדש כדי להתחיל לבנות את העץ ציוות
        </span>
      </div>
    </div>
  </button>
);
