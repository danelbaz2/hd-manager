import React from "react";
import { User, Plus, Save } from "lucide-react";
import { useTheme } from "../../../contexts/ThemeContext";
import {
  type UserFormData,
  AVAILABLE_COLORS,
} from "../../../schemas/userentity";

interface UserFormProps {
  formData: UserFormData;
  setFormData: React.Dispatch<React.SetStateAction<UserFormData>>;
  isEditing: boolean;
  onAdd: () => void;
  onSave: () => void;
  onCancel: () => void;
}

const UserForm: React.FC<UserFormProps> = ({
  formData,
  setFormData,
  isEditing,
  onAdd,
  onSave,
  onCancel,
}) => {
  const { isDarkMode } = useTheme();

  return (
    <div
      className={`
        rounded-xl border p-6 mb-6
        ${
          isDarkMode
            ? "bg-slate-700/50 border-slate-600"
            : "bg-slate-50 border-slate-200"
        }
      `}
    >
      <div className="flex items-center justify-end gap-2 mb-4">
        <span
          className={`font-medium ${
            isDarkMode ? "text-slate-200" : "text-slate-700"
          }`}
        >
          {isEditing ? "עריכת עובד" : "הוספת עובד חדש"}
        </span>
        <User size={18} className="text-slate-400" />
      </div>

      <div className="flex flex-wrap items-center gap-4" dir="rtl">
        {/* Name Input */}
        <input
          type="text"
          placeholder="שם מלא"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className={`
            flex-1 min-w-[150px] px-4 py-2.5
            rounded-lg border text-right
            transition-colors
            ${
              isDarkMode
                ? "bg-slate-800 border-slate-600 text-white placeholder-slate-400"
                : "bg-white border-slate-200 text-slate-800 placeholder-slate-400"
            }
            focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500
          `}
        />

        {/* Username Input */}
        <input
          type="text"
          placeholder="שם משתמש"
          value={formData.username}
          onChange={(e) =>
            setFormData({ ...formData, username: e.target.value })
          }
          className={`
            flex-1 min-w-[120px] px-4 py-2.5
            rounded-lg border text-right
            transition-colors
            ${
              isDarkMode
                ? "bg-slate-800 border-slate-600 text-white placeholder-slate-400"
                : "bg-white border-slate-200 text-slate-800 placeholder-slate-400"
            }
            focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500
          `}
        />

        {/* Password Input */}
        <input
          type="password"
          placeholder="סיסמה"
          value={formData.password}
          onChange={(e) =>
            setFormData({ ...formData, password: e.target.value })
          }
          className={`
            flex-1 min-w-[120px] px-4 py-2.5
            rounded-lg border text-right
            transition-colors
            ${
              isDarkMode
                ? "bg-slate-800 border-slate-600 text-white placeholder-slate-400"
                : "bg-white border-slate-200 text-slate-800 placeholder-slate-400"
            }
            focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500
          `}
        />

        {/* Role Toggle Switch - Segmented Control */}
        <div className="flex items-center gap-3" dir="rtl">
          <div
            className={`
              relative flex items-center p-1 rounded-lg
              ${isDarkMode ? "bg-slate-700" : "bg-slate-100"}
            `}
          >
            {/* User Option */}
            <button
              type="button"
              onClick={() => setFormData({ ...formData, isAdmin: false })}
              className={`
                relative z-10 flex items-center justify-center
                w-10 h-8 rounded-md
                transition-all duration-200 ease-in-out
                ${
                  !formData.isAdmin
                    ? "text-blue-500"
                    : isDarkMode
                    ? "text-slate-400 hover:text-slate-300"
                    : "text-slate-400 hover:text-slate-500"
                }
              `}
            >
              {/* User Icon - Single Person */}
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

            {/* Admin Option */}
            <button
              type="button"
              onClick={() => setFormData({ ...formData, isAdmin: true })}
              className={`
                relative z-10 flex items-center justify-center
                w-10 h-8 rounded-md
                transition-all duration-200 ease-in-out
                ${
                  formData.isAdmin
                    ? "text-blue-500"
                    : isDarkMode
                    ? "text-slate-400 hover:text-slate-300"
                    : "text-slate-400 hover:text-slate-500"
                }
              `}
            >
              {/* Admin Icon - Shield with checkmark */}
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

            {/* Sliding Indicator */}
            <div
              className={`
                absolute top-1 w-10 h-8 rounded-md
                bg-white shadow-sm
                transition-all duration-200 ease-in-out
                ${formData.isAdmin ? "right-1" : "right-[calc(50%+2px)]"}
              `}
            />
          </div>
        </div>

        {/* Color Selection */}
        <div className="flex items-center gap-1">
          <span
            className={`text-sm mr-2 ${
              isDarkMode ? "text-slate-400" : "text-slate-500"
            }`}
          >
            צבע
          </span>
          {AVAILABLE_COLORS.map((color) => (
            <button
              key={color}
              onClick={() => setFormData({ ...formData, color })}
              className={`
                w-6 h-6 rounded-full transition-transform
                ${
                  formData.color === color
                    ? "ring-2 ring-blue-500 ring-offset-2 scale-110"
                    : ""
                }
                ${
                  isDarkMode && formData.color === color
                    ? "ring-offset-slate-700"
                    : ""
                }
              `}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>

        {/* Action Buttons */}
        {isEditing ? (
          <div className="flex gap-2">
            <button
              onClick={onSave}
              className="
                flex items-center gap-2
                px-6 py-2.5 rounded-lg
                bg-blue-500 hover:bg-blue-600
                text-white font-medium
                transition-colors
              "
            >
              <Save size={18} />
              <span>שמור</span>
            </button>
            <button
              onClick={onCancel}
              className={`
                px-4 py-2.5 rounded-lg
                font-medium transition-colors
                ${
                  isDarkMode
                    ? "bg-slate-600 hover:bg-slate-500 text-slate-200"
                    : "bg-slate-200 hover:bg-slate-300 text-slate-700"
                }
              `}
            >
              ביטול
            </button>
          </div>
        ) : (
          <button
            onClick={onAdd}
            className="
              flex items-center gap-2
              px-6 py-2.5 rounded-lg
              bg-blue-500 hover:bg-blue-600
              text-white font-medium
              transition-colors
            "
          >
            <Plus size={18} />
            <span>הוסף</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default UserForm;
