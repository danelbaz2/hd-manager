import React, { useRef, useState } from "react";
import { Save, Camera, Loader2, Eye, EyeOff } from "lucide-react";
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
import { updateUser } from "../../../api/usersApi";
import { ToastContainer, useToast } from "../../alert-feedback";

interface EditUserFormProps {
  formData: UserFormData;
  setFormData: React.Dispatch<React.SetStateAction<UserFormData>>;
  onSave: () => void;
  onCancel: () => void;
}

const EditUserForm: React.FC<EditUserFormProps> = ({
  formData,
  setFormData,
  onSave,
  onCancel,
}) => {
  const { isDarkMode } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { alerts, showSuccess, showError, showWarning, dismissAlert } =
    useToast();

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        showWarning("שגיאת קובץ", "נא לבחור קובץ תמונה בלבד");
        return;
      }

      try {
        setIsCompressing(true);
        const compressedBase64 = await compressImage(file, {
          maxWidth: 200,
          maxHeight: 200,
          quality: 0.7,
          format: "webp",
        });

        const originalSizeKB = Math.round(file.size / 1024);
        const compressedSizeKB = getBase64SizeKB(compressedBase64);
        console.log(
          `Image compressed: ${originalSizeKB}KB → ${compressedSizeKB}KB`
        );

        setFormData({ ...formData, profileImage: compressedBase64 });
      } catch (error) {
        console.error("Failed to compress image:", error);
        showError("שגיאה", "שגיאה בעיבוד התמונה, נסה שוב");
      } finally {
        setIsCompressing(false);
      }
    }
  };

  const validateForm = (): boolean => {
    // Validate id exists (required for update)
    if (!formData.id) {
      showWarning("שגיאה", "מזהה משתמש חסר");
      return false;
    }

    // Validate fullName (min 2 chars)
    if (!formData.fullName || formData.fullName.length < 2) {
      showWarning("שגיאת אימות", "שם מלא חייב להכיל לפחות 2 תווים");
      return false;
    }

    // Validate username (min 2 chars)
    if (!formData.username || formData.username.length < 2) {
      showWarning("שגיאת אימות", "שם משתמש חייב להכיל לפחות 2 תווים");
      return false;
    }

    // Validate role
    if (formData.role !== "admin" && formData.role !== "regular") {
      showWarning("שגיאת אימות", "יש לבחור תפקיד תקין");
      return false;
    }

    // Validate color (hex format)
    const colorRegex = /^#[0-9a-fA-F]{6}$/;
    if (!colorRegex.test(formData.color)) {
      showWarning("שגיאת אימות", "יש לבחור צבע תקין");
      return false;
    }

    return true;
  };

  const handleSaveClick = async () => {
    // Validate form
    if (!validateForm()) {
      return;
    }

    try {
      setIsSaving(true);
      console.log("Updating User - Form Data:", formData);

      // Build update payload for PUT /api/users/:id
      // Only send fields that should be updated (all optional except id in URL)
      const updatePayload: Partial<UserFormData> = {
        fullName: formData.fullName,
        username: formData.username,
        role: formData.role,
        color: formData.color,
      };

      // Only include passwordHash if changed (not empty)
      if (formData.passwordHash && formData.passwordHash.trim() !== "") {
        updatePayload.passwordHash = formData.passwordHash;
      }

      // Only include profileImage if exists
      if (formData.profileImage) {
        updatePayload.profileImage = formData.profileImage;
      }

      // Call PUT /api/users/:id
      const response = await updateUser(formData.id!, updatePayload);

      if (response.success) {
        showSuccess("הצלחה", "המשתמש עודכן בהצלחה");
        console.log("User updated successfully:", response.data);
        // Call onSave after a short delay to show the success message
        setTimeout(() => {
          onSave();
        }, 1000);
      } else {
        showError("שגיאה", response.error || "שגיאה בעדכון המשתמש");
        console.error("Failed to update user:", response.error);
      }
    } catch (error) {
      console.error("Error updating user:", error);
      showError("שגיאה", "אירעה שגיאה בלתי צפויה");
    } finally {
      setIsSaving(false);
    }
  };

  const inputStyles = `
    px-4 py-2.5
    rounded-lg border text-right
    transition-colors
    ${
      isDarkMode
        ? "bg-slate-800 border-slate-600 text-white placeholder-slate-400"
        : "bg-white border-slate-200 text-slate-800 placeholder-slate-400"
    }
    focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500
  `;

  return (
    <div
      className={`
        rounded-xl border p-6 mb-6
        ${
          isDarkMode
            ? "bg-blue-900/20 border-blue-500/50"
            : "bg-blue-50 border-blue-200"
        }
      `}
    >
      {/* Toast Notifications */}
      <ToastContainer
        alerts={alerts}
        onDismiss={dismissAlert}
        isDarkMode={isDarkMode}
      />

      <div className="flex items-center justify-end gap-3 mb-4">
        <span
          className={`font-medium ${
            isDarkMode ? "text-slate-200" : "text-slate-700"
          }`}
        >
          עריכת עובד
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
            disabled={isCompressing || isSaving}
            className={`
              relative w-12 h-12 rounded-full overflow-hidden
              border-2 border-dashed transition-all duration-200
              hover:scale-105 hover:border-blue-400
              ${isCompressing || isSaving ? "cursor-wait" : "cursor-pointer"}
              ${
                isDarkMode
                  ? "border-blue-400 hover:border-blue-300"
                  : "border-blue-300 hover:border-blue-400"
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
            {isCompressing && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <Loader2 size={18} className="text-white animate-spin" />
              </div>
            )}
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

      <div className="space-y-4" dir="rtl">
        {/* Row 1: Name and Username */}
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="שם מלא"
            value={formData.fullName}
            onChange={(e) =>
              setFormData({ ...formData, fullName: e.target.value })
            }
            disabled={isSaving}
            className={`${inputStyles} disabled:opacity-50 disabled:cursor-not-allowed`}
          />
          <input
            type="text"
            placeholder="שם משתמש"
            value={formData.username}
            onChange={(e) =>
              setFormData({ ...formData, username: e.target.value })
            }
            disabled={isSaving}
            className={`${inputStyles} disabled:opacity-50 disabled:cursor-not-allowed`}
          />
        </div>

        {/* Row 2: Password and Role */}
        <div className="grid grid-cols-2 gap-4">
          {/* Password Input */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="סיסמה חדשה (אופציונלי)"
              value={formData.passwordHash}
              onChange={(e) =>
                setFormData({ ...formData, passwordHash: e.target.value })
              }
              disabled={isSaving}
              className={`${inputStyles} w-full pl-10 disabled:opacity-50 disabled:cursor-not-allowed`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isSaving}
              className={`
                absolute left-2 top-1/2 -translate-y-1/2
                p-1 rounded-md transition-colors
                ${
                  isDarkMode
                    ? "text-slate-400 hover:text-slate-200"
                    : "text-slate-500 hover:text-slate-700"
                }
              `}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {/* Role Toggle Switch */}
          <div className="flex items-center justify-end gap-3">
            <div
              className={`
                relative flex items-center p-1 rounded-lg
                ${isDarkMode ? "bg-slate-700" : "bg-slate-100"}
              `}
            >
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: "regular" })}
                disabled={isSaving}
                className={`
                  relative z-10 flex items-center justify-center
                  w-10 h-8 rounded-md
                  transition-all duration-200 ease-in-out
                  ${
                    formData.role === "regular"
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

              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: "admin" })}
                disabled={isSaving}
                className={`
                  relative z-10 flex items-center justify-center
                  w-10 h-8 rounded-md
                  transition-all duration-200 ease-in-out
                  ${
                    formData.role === "admin"
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
        </div>

        {/* Row 3: Color Selection and Action Buttons */}
        <div className="flex items-center justify-between">
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
                disabled={isSaving}
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
          <div className="flex gap-2">
            <button
              onClick={handleSaveClick}
              disabled={isSaving}
              className={`
                flex items-center gap-2
                px-6 py-2.5 rounded-lg
                bg-blue-500 hover:bg-blue-600
                text-white font-medium
                transition-colors
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
            >
              {isSaving ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <Save size={18} />
              )}
              <span>{isSaving ? "שומר..." : "שמור"}</span>
            </button>
            <button
              onClick={onCancel}
              disabled={isSaving}
              className={`
                px-4 py-2.5 rounded-lg
                font-medium transition-colors
                ${
                  isDarkMode
                    ? "bg-slate-600 hover:bg-slate-500 text-slate-200"
                    : "bg-slate-200 hover:bg-slate-300 text-slate-700"
                }
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
            >
              ביטול
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditUserForm;
