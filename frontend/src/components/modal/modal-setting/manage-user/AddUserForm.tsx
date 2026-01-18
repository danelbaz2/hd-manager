import React, { useState, useRef } from "react";
import { Plus, Loader2 } from "lucide-react";
import { useTheme } from "../../../../contexts/ThemeContext";
import {
  type UserFormData,
  AVAILABLE_COLORS,
} from "../../../../schemas/userTypes";
import { darkenColor, hexWithAlpha } from "../../../../utils/colorUtils";
import { createUser } from "../../../../api/usersApi";
import { ToastContainer, useToast } from "../../../alert-feedback";
import { useImageUpload } from "./hooks";
import {
  ProfileImagePicker,
  RoleToggle,
  ColorPicker,
  PasswordInput,
} from "./components";

interface AddUserFormProps {
  formData: UserFormData;
  setFormData: React.Dispatch<React.SetStateAction<UserFormData>>;
  onAdd: () => void;
}

/**
 * AddUserForm - Form for creating new users
 * Refactored to use shared components for image, role, color, and password inputs
 */
const AddUserForm: React.FC<AddUserFormProps> = ({
  formData,
  setFormData,
  onAdd,
}) => {
  const { isDarkMode } = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Ref-based lock to prevent multiple rapid submissions
  const isSubmittingRef = useRef(false);

  const { alerts, showSuccess, showError, showWarning, dismissAlert } =
    useToast();

  const { fileInputRef, isCompressing, handleImageClick, handleImageChange } =
    useImageUpload();

  // Handle image upload with toast notifications
  const onImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleImageChange(
      e,
      (base64) => setFormData({ ...formData, profileImage: base64 }),
      (msg) => showError("שגיאה בתמונה", msg),
      (msg) => showWarning("שגיאה", msg),
    );
  };

  // Validation and submission with ref-based lock to prevent duplicates
  const handleAddClick = async () => {
    // Check ref-based lock first (synchronous, prevents race condition)
    if (isSubmittingRef.current) {
      return;
    }

    const MIN_NAME_LENGTH = 2;
    const MIN_USERNAME_LENGTH = 2;
    const VALID_ROLES = ["regular", "admin"] as const;

    if (!formData.fullName.trim()) {
      showWarning("שדה חסר", "נא להזין שם מלא");
      return;
    }
    if (formData.fullName.trim().length < MIN_NAME_LENGTH) {
      showWarning(
        "שם קצר מדי",
        `שם מלא חייב להכיל לפחות ${MIN_NAME_LENGTH} תווים`,
      );
      return;
    }
    if (!formData.username.trim()) {
      showWarning("שדה חסר", "נא להזין שם משתמש");
      return;
    }
    if (formData.username.trim().length < MIN_USERNAME_LENGTH) {
      showWarning(
        "שם משתמש קצר מדי",
        `שם משתמש חייב להכיל לפחות ${MIN_USERNAME_LENGTH} תווים`,
      );
      return;
    }
    if (!formData.password.trim()) {
      showWarning("שדה חסר", "נא להזין סיסמה");
      return;
    }
    if (!VALID_ROLES.includes(formData.role as (typeof VALID_ROLES)[number])) {
      showWarning("תפקיד לא תקין", "יש לבחור תפקיד: רגיל או מנהל");
      return;
    }

    // Set both ref and state
    isSubmittingRef.current = true;
    setIsSubmitting(true);

    try {
      const response = await createUser(formData);
      if (response.success) {
        showSuccess(
          "המשתמש נוצר בהצלחה! 🎉",
          `העובד ${formData.fullName} נוסף למערכת`,
        );
        // WebSocket will update the users list automatically
        // No need to call refreshUsers() - just reset the form
        setTimeout(() => {
          isSubmittingRef.current = false;
          setIsSubmitting(false);
          onAdd(); // Reset form
        }, 1500);
      } else if (response.aborted) {
        // Request was aborted - silently ignore, WebSocket will handle UI update if user was created
        isSubmittingRef.current = false;
        setIsSubmitting(false);
        // Don't show any message or call onAdd - we don't know if it succeeded
      } else {
        showError(
          "שגיאה ביצירת המשתמש",
          response.error || "אירעה שגיאה, נסה שוב",
        );
        // Reset lock on error to allow retry
        isSubmittingRef.current = false;
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error("Error creating user:", error);
      showError(
        "שגיאה בלתי צפויה",
        "אירעה שגיאה בלתי צפויה, נסה שוב מאוחר יותר",
      );
      // Reset lock on error to allow retry
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <ToastContainer
        alerts={alerts}
        onDismiss={dismissAlert}
        isDarkMode={isDarkMode}
      />

      <div
        className="rounded-xl border mb-6 overflow-hidden transition-colors duration-300"
        style={{
          backgroundColor: hexWithAlpha(
            formData.color,
            isDarkMode ? 0.1 : 0.08,
          ),
          borderColor: hexWithAlpha(formData.color, isDarkMode ? 0.3 : 0.25),
        }}
      >
        {/* Color Banner */}
        <div
          className="h-2 w-full transition-colors duration-300"
          style={{ backgroundColor: darkenColor(formData.color, 20) }}
        />

        <div className="p-6">
          <div className="flex items-center justify-end gap-3 mb-4">
            <span
              className={`font-medium ${
                isDarkMode ? "text-slate-200" : "text-slate-700"
              }`}
            >
              הוספת עובד חדש
            </span>
            <ProfileImagePicker
              profileImage={formData.profileImage}
              isCompressing={isCompressing}
              isDarkMode={isDarkMode}
              fileInputRef={fileInputRef}
              onImageClick={handleImageClick}
              onImageChange={onImageChange}
            />
          </div>

          <div className="flex flex-wrap items-center gap-4" dir="rtl">
            {/* Name Input */}
            <input
              type="text"
              placeholder="שם מלא"
              value={formData.fullName}
              onChange={(e) =>
                setFormData({ ...formData, fullName: e.target.value })
              }
              className={`
                flex-1 min-w-[150px] px-4 py-2.5 rounded-lg border text-right transition-colors
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
              autoComplete="off"
              onChange={(e) =>
                setFormData({ ...formData, username: e.target.value })
              }
              className={`
                flex-1 min-w-[120px] px-4 py-2.5 rounded-lg border text-right transition-colors
                ${
                  isDarkMode
                    ? "bg-slate-800 border-slate-600 text-white placeholder-slate-400"
                    : "bg-white border-slate-200 text-slate-800 placeholder-slate-400"
                }
                focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500
              `}
            />

            {/* Password Input */}
            <PasswordInput
              value={formData.password}
              placeholder="סיסמה"
              showPassword={showPassword}
              isDarkMode={isDarkMode}
              onTogglePassword={() => setShowPassword(!showPassword)}
              onChange={(value) =>
                setFormData({ ...formData, password: value })
              }
            />

            {/* Role Toggle */}
            <RoleToggle
              role={formData.role}
              isDarkMode={isDarkMode}
              onRoleChange={(role) => setFormData({ ...formData, role })}
            />

            {/* Color Selection */}
            <ColorPicker
              colors={AVAILABLE_COLORS}
              selectedColor={formData.color}
              isDarkMode={isDarkMode}
              onColorChange={(color) => setFormData({ ...formData, color })}
            />

            {/* Add Button */}
            <button
              onClick={handleAddClick}
              disabled={isSubmitting}
              className={`
                flex items-center gap-2 px-6 py-2.5 rounded-lg text-white font-medium transition-colors
                ${
                  isSubmitting
                    ? "bg-blue-400 cursor-not-allowed"
                    : "bg-blue-500 hover:bg-blue-600"
                }
              `}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>שומר...</span>
                </>
              ) : (
                <>
                  <Plus size={18} />
                  <span>הוסף</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddUserForm;
