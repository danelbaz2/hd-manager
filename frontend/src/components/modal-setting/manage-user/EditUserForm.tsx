import React, { useState } from "react";
import { Save, Loader2, X } from "lucide-react";
import { useTheme } from "../../../contexts/ThemeContext";
import {
  type UserFormData,
  AVAILABLE_COLORS,
} from "../../../schemas/userTypes";
import { darkenColor, hexWithAlpha } from "../../../utils/colorUtils";
import { updateUser } from "../../../api/usersApi";
import { ToastContainer, useToast } from "../../alert-feedback";
import { useImageUpload } from "./hooks";
import {
  ProfileImagePicker,
  RoleToggle,
  ColorPicker,
  PasswordInput,
} from "./components";

interface EditUserFormProps {
  formData: UserFormData;
  originalData: UserFormData;
  setFormData: React.Dispatch<React.SetStateAction<UserFormData>>;
  onSave: () => void;
  onCancel: () => void;
}

/**
 * EditUserForm - Form for editing existing users
 * Refactored to use shared components for image, role, color, and password inputs
 */
const EditUserForm: React.FC<EditUserFormProps> = ({
  formData,
  originalData,
  setFormData,
  onSave,
  onCancel,
}) => {
  const { isDarkMode } = useTheme();
  const [isSaving, setIsSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { alerts, showSuccess, showError, showWarning, dismissAlert } =
    useToast();

  const { fileInputRef, isCompressing, handleImageClick, handleImageChange } =
    useImageUpload();

  // Handle image upload
  const onImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleImageChange(
      e,
      (base64) => setFormData({ ...formData, profileImage: base64 }),
      (msg) => showError("שגיאה", msg),
      (msg) => showWarning("שגיאת קובץ", msg)
    );
  };

  // Validation
  const validateForm = (): boolean => {
    if (!formData.id) {
      showWarning("שגיאה", "מזהה משתמש חסר");
      return false;
    }
    if (!formData.fullName || formData.fullName.length < 2) {
      showWarning("שגיאת אימות", "שם מלא חייב להכיל לפחות 2 תווים");
      return false;
    }
    if (!formData.username || formData.username.length < 2) {
      showWarning("שגיאת אימות", "שם משתמש חייב להכיל לפחות 2 תווים");
      return false;
    }
    if (formData.role !== "admin" && formData.role !== "regular") {
      showWarning("שגיאת אימות", "יש לבחור תפקיד תקין");
      return false;
    }
    const colorRegex = /^#[0-9a-fA-F]{6}$/;
    if (!colorRegex.test(formData.color)) {
      showWarning("שגיאת אימות", "יש לבחור צבע תקין");
      return false;
    }
    return true;
  };

  // Build changed payload
  const buildChangedPayload = (): Partial<UserFormData> => {
    const payload: Partial<UserFormData> = {};
    if (formData.fullName !== originalData.fullName)
      payload.fullName = formData.fullName;
    if (formData.username !== originalData.username)
      payload.username = formData.username;
    if (formData.role !== originalData.role) payload.role = formData.role;
    if (formData.color !== originalData.color) payload.color = formData.color;
    if (formData.profileImage !== originalData.profileImage)
      payload.profileImage = formData.profileImage;
    if (formData.password && formData.password.trim() !== "")
      payload.password = formData.password;
    return payload;
  };

  // Handle save
  const handleSaveClick = async () => {
    if (!validateForm()) return;

    try {
      setIsSaving(true);
      const updatePayload = buildChangedPayload();

      if (Object.keys(updatePayload).length === 0) {
        showWarning("אין שינויים", "לא בוצעו שינויים במשתמש");
        setIsSaving(false);
        return;
      }

      const response = await updateUser(formData.id!, updatePayload);

      if (response.success) {
        showSuccess("הצלחה", "המשתמש עודכן בהצלחה");
        onSave();
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
            isDarkMode ? 0.1 : 0.08
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
              עריכת עובד
            </span>
            <ProfileImagePicker
              profileImage={formData.profileImage ?? undefined}
              isCompressing={isCompressing}
              isDisabled={isSaving}
              isDarkMode={isDarkMode}
              isEditMode={true}
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
              disabled={isSaving}
              className={`
                flex-1 min-w-[150px] px-4 py-2.5 rounded-lg border text-right transition-colors
                ${
                  isDarkMode
                    ? "bg-slate-800 border-slate-600 text-white placeholder-slate-400"
                    : "bg-white border-slate-200 text-slate-800 placeholder-slate-400"
                }
                focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500
                disabled:opacity-50 disabled:cursor-not-allowed
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
              disabled={isSaving}
              className={`
                flex-1 min-w-[120px] px-4 py-2.5 rounded-lg border text-right transition-colors
                ${
                  isDarkMode
                    ? "bg-slate-800 border-slate-600 text-white placeholder-slate-400"
                    : "bg-white border-slate-200 text-slate-800 placeholder-slate-400"
                }
                focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
            />

            {/* Password Input */}
            <PasswordInput
              value={formData.password}
              placeholder="סיסמה חדשה"
              showPassword={showPassword}
              isDarkMode={isDarkMode}
              isDisabled={isSaving}
              onTogglePassword={() => setShowPassword(!showPassword)}
              onChange={(value) =>
                setFormData({ ...formData, password: value })
              }
            />

            {/* Role Toggle */}
            <RoleToggle
              role={formData.role}
              isDarkMode={isDarkMode}
              isDisabled={isSaving}
              onRoleChange={(role) => setFormData({ ...formData, role })}
            />

            {/* Color Selection */}
            <ColorPicker
              colors={AVAILABLE_COLORS}
              selectedColor={formData.color}
              isDarkMode={isDarkMode}
              isDisabled={isSaving}
              onColorChange={(color) => setFormData({ ...formData, color })}
            />

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={handleSaveClick}
                disabled={isSaving}
                className={`
                  flex items-center gap-2 px-6 py-2.5 rounded-lg
                  bg-blue-500 hover:bg-blue-600 text-white font-medium
                  transition-colors disabled:opacity-50 disabled:cursor-not-allowed
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
                  flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-colors
                  ${
                    isDarkMode
                      ? "bg-slate-600 hover:bg-slate-500 text-slate-200"
                      : "bg-slate-200 hover:bg-slate-300 text-slate-700"
                  }
                  disabled:opacity-50 disabled:cursor-not-allowed
                `}
              >
                <X size={18} />
                <span>ביטול</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default EditUserForm;
