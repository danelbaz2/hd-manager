import React from "react";

interface RoleToggleProps {
  role: string;
  isDarkMode: boolean;
  isDisabled?: boolean;
  onRoleChange: (role: "regular" | "admin") => void;
}

/**
 * RoleToggle - Toggle switch for user role selection (regular/admin)
 */
const RoleToggle: React.FC<RoleToggleProps> = ({
  role,
  isDarkMode,
  isDisabled = false,
  onRoleChange,
}) => {
  return (
    <div className="flex items-center gap-3" dir="rtl">
      <div
        className={`
          relative flex items-center p-1 rounded-lg
          ${isDarkMode ? "bg-slate-700" : "bg-slate-100"}
        `}
      >
        {/* Regular User Button */}
        <button
          type="button"
          onClick={() => onRoleChange("regular")}
          disabled={isDisabled}
          className={`
            relative z-10 flex items-center justify-center
            w-10 h-8 rounded-md
            transition-all duration-200 ease-in-out
            ${
              role === "regular"
                ? "bg-blue-500 text-white"
                : "bg-white text-blue-500"
            }
          `}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </button>

        {/* Admin Button */}
        <button
          type="button"
          onClick={() => onRoleChange("admin")}
          disabled={isDisabled}
          className={`
            relative z-10 flex items-center justify-center
            w-10 h-8 rounded-md
            transition-all duration-200 ease-in-out
            ${
              role === "admin"
                ? "bg-blue-500 text-white"
                : "bg-white text-blue-500"
            }
          `}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <polyline points="9 12 11 14 15 10" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default RoleToggle;
