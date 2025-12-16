import React, { useRef, useState } from "react";
import { Plus, Camera, Loader2, Eye, EyeOff } from "lucide-react";
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
import { createUser } from "../../../api/usersApi";
import { ToastContainer, useToast } from "../../alert-feedback";

interface AddUserFormProps {
  formData: UserFormData;
  setFormData: React.Dispatch<React.SetStateAction<UserFormData>>;
  onAdd: () => void;
}

const AddUserForm: React.FC<AddUserFormProps> = ({
  formData,
  setFormData,
  onAdd,
}) => {
  const { isDarkMode } = useTheme();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Use the reusable toast hook
  const { alerts, showSuccess, showError, showWarning, dismissAlert } =
    useToast();

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        showWarning("שגיאה", "נא לבחור קובץ תמונה בלבד");
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
        showError("שגיאה בתמונה", "שגיאה בעיבוד התמונה, נסה שוב");
      } finally {
        setIsCompressing(false);
      }
    }
  };

  const handleAddClick = async () => {
    // Validation constants
    const MIN_NAME_LENGTH = 2;
    const MIN_USERNAME_LENGTH = 2;
    const VALID_ROLES = ["regular", "admin"] as const;

    // Validate fullName - required and min 2 characters
    if (!formData.fullName.trim()) {
      showWarning("שדה חסר", "נא להזין שם מלא");
      return;
    }
    if (formData.fullName.trim().length < MIN_NAME_LENGTH) {
      showWarning(
        "שם קצר מדי",
        `שם מלא חייב להכיל לפחות ${MIN_NAME_LENGTH} תווים`
      );
      return;
    }

    // Validate username - required and min 2 characters
    if (!formData.username.trim()) {
      showWarning("שדה חסר", "נא להזין שם משתמש");
      return;
    }
    if (formData.username.trim().length < MIN_USERNAME_LENGTH) {
      showWarning(
        "שם משתמש קצר מדי",
        `שם משתמש חייב להכיל לפחות ${MIN_USERNAME_LENGTH} תווים`
      );
      return;
    }

    // Validate password - required
    if (!formData.passwordHash.trim()) {
      showWarning("שדה חסר", "נא להזין סיסמה");
      return;
    }

    // Validate role - must be 'regular' or 'admin'
    if (!VALID_ROLES.includes(formData.role as (typeof VALID_ROLES)[number])) {
      showWarning("תפקיד לא תקין", "יש לבחור תפקיד: רגיל או מנהל");
      return;
    }

    setIsSubmitting(true);
    console.log("Adding New User - UserForm Data:", formData);

    try {
      const response = await createUser(formData);

      if (response.success) {
        console.log("User created successfully:", response.data);
        showSuccess(
          "המשתמש נוצר בהצלחה! 🎉",
          `העובד ${formData.fullName} נוסף למערכת`
        );
        // Delay the onAdd callback to let the user see the success message
        setTimeout(() => {
          onAdd(); // Call the parent callback to refresh the list/close form
        }, 1500);
      } else {
        console.error("Failed to create user:", response.error);
        showError(
          "שגיאה ביצירת המשתמש",
          response.error || "אירעה שגיאה, נסה שוב"
        );
      }
    } catch (error) {
      console.error("Error creating user:", error);
      showError(
        "שגיאה בלתי צפויה",
        "אירעה שגיאה בלתי צפויה, נסה שוב מאוחר יותר"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Toast Notifications Container */}
      <ToastContainer
        alerts={alerts}
        onDismiss={dismissAlert}
        isDarkMode={isDarkMode}
      />

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
            הוספת עובד חדש
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
            autoComplete="off"
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
          <div className="relative flex-1 min-w-[120px]">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="סיסמה"
              value={formData.passwordHash}
              onChange={(e) =>
                setFormData({ ...formData, passwordHash: e.target.value })
              }
              className={`
              w-full px-4 py-2.5 pl-10
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
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
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
          <div className="flex items-center gap-3" dir="rtl">
            <div
              className={`
              relative flex items-center p-1 rounded-lg
              ${isDarkMode ? "bg-slate-700" : "bg-slate-100"}
            `}
            >
              <button
                type="button"
                onClick={() => setFormData({ ...formData, role: "regular" })}
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

          {/* Add Button */}
          <button
            onClick={handleAddClick}
            disabled={isSubmitting}
            className={`
            flex items-center gap-2
            px-6 py-2.5 rounded-lg
            text-white font-medium
            transition-colors
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
    </>
  );
};

export default AddUserForm;
