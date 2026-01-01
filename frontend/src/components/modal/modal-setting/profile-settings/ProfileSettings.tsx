/**
 * ProfileSettings - Profile settings with compact form layout
 * Includes role-appropriate UserCard preview (Admin grid card vs User banner card)
 */
import React from "react";
import { Loader2, Save, User, Shield, Palette, Eye } from "lucide-react";
import { useTheme, useAuth } from "../../../../contexts";
import { useUserPreference } from "../../modal-user-preference/useUserPreference";
import {
  ProfileAvatar,
  ColorPicker,
  PasswordField,
  TextInput,
} from "../../modal-user-preference/parts";
import { ToastContainer, useToast } from "../../../alert-feedback";
import { hexWithAlpha } from "../../../../utils/colorUtils";

interface ProfileSettingsProps {
  onSaveSuccess?: () => void;
}

const ProfileSettings: React.FC<ProfileSettingsProps> = ({ onSaveSuccess }) => {
  const { isDarkMode } = useTheme();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const { alerts, showSuccess, showError, dismissAlert } = useToast();

  const handleSuccess = () => {
    showSuccess("הצלחה", "הפרופיל עודכן בהצלחה");
    onSaveSuccess?.();
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
    <div className="flex-1 flex flex-col p-6 overflow-hidden h-full">
      {/* Toast Notifications */}
      <ToastContainer
        alerts={alerts}
        onDismiss={dismissAlert}
        isDarkMode={isDarkMode}
      />

      {/* Header */}
      <h1
        className={`text-xl font-bold text-center mb-6 ${isDarkMode ? "text-white" : "text-slate-800"
          }`}
      >
        הגדרות פרופיל
      </h1>

      {/* Main Content */}
      <div className="flex-1 flex flex-col gap-6" dir="rtl">

        {/* Top Section - 3 Columns Form */}
        <div className="grid grid-cols-3 gap-5">

          {/* Column 1: Personal Info */}
          <div
            className={`
              flex-1 rounded-2xl border p-4 flex flex-col gap-3
              ${isDarkMode ? "bg-slate-800/50 border-slate-700" : "bg-white border-slate-200"}
              hover:shadow-md transition-shadow duration-300
            `}
          >
            <div className="flex items-center gap-2 pb-1 border-b border-dashed border-slate-200 dark:border-slate-700">
              <User size={16} className="text-blue-500" />
              <h3 className={`text-sm font-semibold ${isDarkMode ? "text-white" : "text-slate-800"}`}>
                פרטים אישיים
              </h3>
            </div>

            <div className="flex-1 flex flex-col justify-center gap-3">
              <TextInput
                label="שם מלא"
                value={formData.fullName}
                onChange={(val) => handleFieldChange("fullName", val)}
                placeholder="הזן שם מלא..."
                maxLength={50}
              />
              <TextInput
                label="כינוי (אופציונלי)"
                value={formData.nickname}
                onChange={(val) => handleFieldChange("nickname", val)}
                placeholder="הזן כינוי..."
                maxLength={30}
              />
            </div>
          </div>

          {/* Column 2: Security */}
          <div
            className={`
              flex-1 rounded-2xl border p-4 flex flex-col gap-3
              ${isDarkMode ? "bg-slate-800/50 border-slate-700" : "bg-white border-slate-200"}
              hover:shadow-md transition-shadow duration-300
            `}
          >
            <div className="flex items-center gap-2 pb-1 border-b border-dashed border-slate-200 dark:border-slate-700">
              <Shield size={16} className="text-green-500" />
              <h3 className={`text-sm font-semibold ${isDarkMode ? "text-white" : "text-slate-800"}`}>
                אבטחה
              </h3>
            </div>

            <div className="flex-1 flex flex-col justify-center gap-3">
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
          </div>

          {/* Column 3: Appearance - Stacked Layout */}
          <div
            className={`
              flex-1 rounded-2xl border p-4 flex flex-col gap-3
              ${isDarkMode ? "bg-slate-800/50 border-slate-700" : "bg-white border-slate-200"}
              hover:shadow-md transition-shadow duration-300
            `}
          >
            <div className="flex items-center gap-2 pb-1 border-b border-dashed border-slate-200 dark:border-slate-700">
              <Palette size={16} className="text-purple-500" />
              <h3 className={`text-sm font-semibold ${isDarkMode ? "text-white" : "text-slate-800"}`}>
                מראה
              </h3>
            </div>

            <div className="flex-1 flex flex-col items-center justify-between py-2">
              {/* Avatar Center Top */}
              <div className="mb-2">
                <ProfileAvatar
                  profileImage={formData.profileImage}
                  color={formData.color}
                  fullName={formData.fullName}
                  onImageChange={(img) => handleFieldChange("profileImage", img)}
                  size="md"
                />
              </div>

              {/* Colors Center Bottom */}
              <div className="w-full flex justify-center">
                <ColorPicker
                  selectedColor={formData.color}
                  onColorChange={(color) => handleFieldChange("color", color)}
                  compact
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section - Preview + Save Button */}
        <div className="flex-1 flex flex-col min-h-0 gap-4">

          {/* Preview Container */}
          <div
            className={`
              flex-1 rounded-2xl border relative overflow-hidden
              ${isDarkMode ? "bg-slate-800/30 border-slate-700" : "bg-slate-50 border-slate-200"}
              flex flex-col items-center justify-center py-6
            `}
          >
            <div className="absolute top-3 right-4 flex items-center gap-2">
              <Eye size={14} className="text-slate-400" />
              <span className={`text-xs font-medium ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
                תצוגה מקדימה
              </span>
            </div>

            {/* The Preview Card - Takes max available space */}
            <div className="w-full h-full flex items-center justify-center p-8">
              {isAdmin ? (
                /* Admin Card Preview - Scaled up */
                <div
                  className="w-48 rounded-xl overflow-hidden flex flex-col shadow-xl transition-all duration-300 transform scale-125"
                  style={{
                    backgroundColor: hexWithAlpha(formData.color, isDarkMode ? 0.15 : 0.08),
                    borderWidth: 2,
                    borderStyle: "solid",
                    borderColor: formData.color,
                  }}
                >
                  <div className="pt-5 pb-3 px-3 flex flex-col items-center gap-2">
                    <div
                      className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold shadow-md"
                      style={{
                        backgroundColor: isDarkMode ? "#334155" : "#f1f5f9",
                        border: `3px solid ${formData.color}`,
                      }}
                    >
                      {formData.profileImage ? (
                        <img src={formData.profileImage} alt="" className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <span className={isDarkMode ? "text-slate-300" : "text-slate-500"}>
                          {formData.fullName?.charAt(0) || "U"}
                        </span>
                      )}
                    </div>
                    <h3 className={`text-sm font-bold truncate w-full text-center ${isDarkMode ? "text-white" : "text-slate-800"}`}>
                      {formData.fullName || "שם"}
                    </h3>
                    <span className={`text-[10px] truncate w-full text-center ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
                      {formData.nickname || "כינוי"}
                    </span>
                  </div>
                  <div className="grid grid-cols-3 w-full border-t border-slate-100/10 mt-auto">
                    <div className={`flex flex-col items-center py-2 ${isDarkMode ? "bg-emerald-500/10" : "bg-emerald-50"}`}>
                      <span className={`text-[11px] font-bold ${isDarkMode ? "text-emerald-400" : "text-emerald-600"}`}>3</span>
                      <span className={`text-[8px] ${isDarkMode ? "text-emerald-400/70" : "text-emerald-600/70"}`}>פתוח</span>
                    </div>
                    <div className={`flex flex-col items-center py-2 ${isDarkMode ? "bg-amber-500/10" : "bg-amber-50"}`}>
                      <span className={`text-[11px] font-bold ${isDarkMode ? "text-amber-400" : "text-amber-600"}`}>2</span>
                      <span className={`text-[8px] ${isDarkMode ? "text-amber-400/70" : "text-amber-600/70"}`}>בטיפול</span>
                    </div>
                    <div className={`flex flex-col items-center py-2 ${isDarkMode ? "bg-slate-600/20" : "bg-slate-100"}`}>
                      <span className={`text-[11px] font-bold ${isDarkMode ? "text-slate-300" : "text-slate-600"}`}>5</span>
                      <span className={`text-[8px] ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>סגור</span>
                    </div>
                  </div>
                </div>
              ) : (
                /* Regular User Card Preview - Scaled up banner */
                <div
                  className="w-full max-w-md rounded-xl overflow-hidden shadow-xl transition-all duration-300 transform scale-110"
                  style={{
                    backgroundColor: hexWithAlpha(formData.color, isDarkMode ? 0.25 : 0.12),
                    borderWidth: 2,
                    borderStyle: "solid",
                    borderColor: hexWithAlpha(formData.color, 0.5),
                  }}
                  dir="rtl"
                >
                  <div className="py-5 px-8 flex items-center gap-6">
                    <div className="relative shrink-0">
                      <div
                        className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold shadow-md"
                        style={{
                          backgroundColor: isDarkMode ? "#334155" : "#f1f5f9",
                          border: `3px solid ${formData.color}`,
                        }}
                      >
                        {formData.profileImage ? (
                          <img src={formData.profileImage} alt="" className="w-full h-full rounded-full object-cover" />
                        ) : (
                          <span className={isDarkMode ? "text-slate-300" : "text-slate-500"}>
                            {formData.fullName?.charAt(0) || "U"}
                          </span>
                        )}
                      </div>
                      {/* Online Dot */}
                      <div className={`absolute bottom-0 right-0 w-4 h-4 rounded-full bg-green-500 border-2 ${isDarkMode ? "border-slate-800" : "border-white"}`} />
                    </div>

                    <div className="flex flex-col min-w-0 flex-1 justify-center">
                      <h3 className={`text-xl font-bold truncate mb-1 ${isDarkMode ? "text-white" : "text-slate-800"}`}>
                        {formData.fullName || "שם מלא"}
                      </h3>
                      <span className={`text-base truncate font-medium ${isDarkMode ? "text-slate-300" : "text-slate-600"}`}>
                        {formData.nickname || "כינוי"}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={onSave}
            disabled={isSaving || !hasChanges}
            className={`
              w-full flex items-center justify-center gap-2 
              px-8 py-3.5 rounded-xl
              font-bold text-base
              transition-all duration-200 shrink-0
              ${hasChanges && !isSaving
                ? "bg-gradient-to-l from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                : isDarkMode
                  ? "bg-slate-700 text-slate-400 cursor-not-allowed"
                  : "bg-slate-200 text-slate-400 cursor-not-allowed"
              }
            `}
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
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;
