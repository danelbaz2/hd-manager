import React from "react";
import { Loader2, Save } from "lucide-react";
import { useTheme } from "../../../contexts";
import { useUserPreference } from "./useUserPreference";
import {
  ModalContainer,
  ProfileAvatar,
  ColorPicker,
  PasswordField,
  TextInput,
} from "./parts";
import { ToastContainer, useToast } from "../../alert-feedback";

interface UserPreferenceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const UserPreferenceModal: React.FC<UserPreferenceModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { isDarkMode } = useTheme();
  const { alerts, showSuccess, showError, dismissAlert } = useToast();

  const handleSuccess = () => {
    showSuccess("הצלחה", "הפרופיל עודכן בהצלחה");
    setTimeout(onClose, 1500);
  };

  const {
    formData,
    isSaving,
    hasChanges,
    validationError,
    handleSave,
    handleFieldChange,
  } = useUserPreference(handleSuccess);

  const onSave = async () => {
    if (validationError) {
      showError("שגיאה בנתונים", validationError);
      return;
    }
    const success = await handleSave();
    if (!success) {
      showError("שגיאה", "אירעה שגיאה בעדכון הפרופיל");
    }
  };

  return (
    <ModalContainer
      isOpen={isOpen}
      onClose={onClose}
      title="הגדרות פרופיל"
      color={formData.color}
    >
      <ToastContainer
        alerts={alerts}
        onDismiss={dismissAlert}
        isDarkMode={isDarkMode}
      />

      <div className="p-6" dir="rtl">
        {/* Avatar Section - Centered */}
        <div className="flex flex-col items-center mb-8">
          <ProfileAvatar
            profileImage={formData.profileImage}
            color={formData.color}
            fullName={formData.fullName}
            onImageChange={(img) => handleFieldChange("profileImage", img)}
          />
        </div>

        {/* Form Fields */}
        <div className="space-y-5">
          {/* Row 1: Full Name + Nickname */}
          <div className="grid grid-cols-2 gap-4">
            <TextInput
              label="שם מלא"
              value={formData.fullName}
              onChange={(val) => handleFieldChange("fullName", val)}
              placeholder="הזן שם מלא..."
            />
            <TextInput
              label="כינוי (אופציונלי)"
              value={formData.nickname}
              onChange={(val) => handleFieldChange("nickname", val)}
              placeholder="הזן כינוי..."
            />
          </div>

          {/* Row 2: Username (disabled) + Password */}
          <div className="grid grid-cols-2 gap-4">
            <TextInput
              label="שם משתמש"
              value={formData.username}
              onChange={() => { }}
              disabled
            />
            <PasswordField
              password={formData.password}
              onPasswordChange={(pwd) => handleFieldChange("password", pwd)}
            />
          </div>

          {/* Color Picker */}
          <div className="pt-2">
            <ColorPicker
              selectedColor={formData.color}
              onColorChange={(color) => handleFieldChange("color", color)}
            />
          </div>
        </div>
      </div>

      {/* Save Button - Full width at bottom */}
      <button
        onClick={onSave}
        disabled={isSaving || !hasChanges}
        className={`w-full flex items-center justify-center gap-2 px-6 py-4 font-medium text-lg transition-all duration-200 ${hasChanges && !isSaving
            ? "bg-gradient-to-l from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
            : isDarkMode
              ? "bg-slate-700 text-slate-400 cursor-not-allowed"
              : "bg-slate-300 text-slate-500 cursor-not-allowed"
          }`}
      >
        {isSaving ? (
          <>
            <Loader2 size={20} className="animate-spin" />
            <span>שומר שינויים...</span>
          </>
        ) : (
          <>
            <Save size={20} />
            <span>שמור שינויים</span>
          </>
        )}
      </button>
    </ModalContainer>
  );
};

export default UserPreferenceModal;
