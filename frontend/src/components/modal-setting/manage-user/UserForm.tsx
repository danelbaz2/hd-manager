import React, { useRef, useState } from "react";
import { Plus, Save, Camera, Loader2 } from "lucide-react";
import { useTheme } from "../../../contexts/ThemeContext";
import {
  type UserFormData,
  AVAILABLE_COLORS,
} from "../../../schemas/userentity";
import defaultProfileImage from "../../../assets/defualt-profile.jpg";
import {
  compressImage,
  getBase64SizeKB,
} from "../../../utils/imageCompression";

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isCompressing, setIsCompressing] = useState(false);

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate that it's an image
      if (!file.type.startsWith("image/")) {
        alert("נא לבחור קובץ תמונה בלבד");
        return;
      }

      try {
        setIsCompressing(true);

        // Compress image to WebP format, 200x200 max, 70% quality
        const compressedBase64 = await compressImage(file, {
          maxWidth: 200,
          maxHeight: 200,
          quality: 0.7,
          format: "webp",
        });

        // Log compression results for debugging
        const originalSizeKB = Math.round(file.size / 1024);
        const compressedSizeKB = getBase64SizeKB(compressedBase64);
        console.log(
          `Image compressed: ${originalSizeKB}KB → ${compressedSizeKB}KB`
        );

        setFormData({ ...formData, profileImage: compressedBase64 });
      } catch (error) {
        console.error("Failed to compress image:", error);
        alert("שגיאה בעיבוד התמונה, נסה שוב");
      } finally {
        setIsCompressing(false);
      }
    }
  };

  const handleAddClick = () => {
    console.log("Adding New User - UserForm Data:", formData);
    onAdd();
  };

  const handleSaveClick = () => {
    console.log("Updating User - UserForm Data:", formData);
    onSave();
  };

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
      <div className="flex items-center justify-end gap-3 mb-4">
        <span
          className={`font-medium ${
            isDarkMode ? "text-slate-200" : "text-slate-700"
          }`}
        >
          {isEditing ? "עריכת עובד" : "הוספת עובד חדש"}
        </span>

        {/* Profile Image Picker */}
        <div className="relative">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
          <button
            type="button"
            onClick={handleImageClick}
            disabled={isCompressing}
            className={`
              relative w-12 h-12 rounded-full overflow-hidden
              border-2 border-dashed transition-all duration-200
              hover:scale-105 hover:border-blue-400
              ${isCompressing ? "cursor-wait" : "cursor-pointer"}
              ${
                isDarkMode
                  ? "border-slate-500 hover:border-blue-400"
                  : "border-slate-300 hover:border-blue-400"
              }
            `}
          >
            <img
              src={formData.profileImage || defaultProfileImage}
              alt="Profile"
              className={`w-full h-full object-cover ${
                isCompressing ? "opacity-50" : ""
              }`}
            />
            {/* Loading overlay */}
            {isCompressing && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <Loader2 size={18} className="text-white animate-spin" />
              </div>
            )}
            {/* Camera overlay on hover */}
            {!isCompressing && (
              <div
                className={`
                  absolute inset-0 flex items-center justify-center
                  bg-black/40 opacity-0 hover:opacity-100
                  transition-opacity duration-200
                `}
              >
                <Camera size={18} className="text-white" />
              </div>
            )}
          </button>
        </div>
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
                    ? "bg-blue-500 text-white"
                    : "bg-white text-blue-500"
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
                    ? "bg-blue-500 text-white"
                    : "bg-white text-blue-500"
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
              onClick={handleSaveClick}
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
            onClick={handleAddClick}
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
