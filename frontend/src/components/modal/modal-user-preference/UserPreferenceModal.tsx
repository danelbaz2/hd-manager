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
    <ModalContainer isOpen={isOpen} onClose={onClose} title="הגדרות פרופיל">
      <ToastContainer
        alerts={alerts}
        onDismiss={dismissAlert}
        isDarkMode={isDarkMode}
      />

      <div className="space-y-6" dir="rtl">
        {/* Avatar Section - Centered */}
        <div className="flex justify-center pb-2">
          <ProfileAvatar
            profileImage={formData.profileImage}
            color={formData.color}
            fullName={formData.fullName}
            onImageChange={(img) => handleFieldChange("profileImage", img)}
          />
        </div>

        {/* Row 1: Full Name + Nickname */}
        <div className="grid grid-cols-2 gap-4">
          <TextInput
            label="שם מלא"
            value={formData.fullName}
            onChange={(val) => handleFieldChange("fullName", val)}
            placeholder="הזן שם מלא (לפחות 2 תווים)..."
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
            onChange={() => {}}
            disabled
          />
          <PasswordField
            password={formData.password}
            onPasswordChange={(pwd) => handleFieldChange("password", pwd)}
          />
        </div>

        {/* Color Picker */}
        <ColorPicker
          selectedColor={formData.color}
          onColorChange={(color) => handleFieldChange("color", color)}
        />

        {/* Save Button */}
        <div className="pt-4">
          <button
            onClick={onSave}
            disabled={isSaving || !hasChanges}
            className={`
              w-full flex items-center justify-center gap-2
              px-6 py-3 rounded-xl font-medium
              transition-all duration-200
              ${
                hasChanges && !isSaving
                  ? "bg-gradient-to-l from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl"
                  : isDarkMode
                  ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                  : "bg-slate-200 text-slate-400 cursor-not-allowed"
              }
            `}
          >
            {isSaving ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>שומר...</span>
              </>
            ) : (
              <>
                <Save size={18} />
                <span>שמור שינויים</span>
              </>
            )}
          </button>
        </div>
      </div>
    </ModalContainer>
  );
};

export default UserPreferenceModal;
