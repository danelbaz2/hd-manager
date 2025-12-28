import { useState, useEffect } from "react";
import { useAuth, useSettings } from "../../../contexts";
import { updateUser } from "../../../api/usersApi";

interface ProfileFormData {
  fullName: string;
  username: string;
  nickname: string;
  color: string;
  profileImage: string | null;
  password: string;
}

interface UseUserPreferenceReturn {
  formData: ProfileFormData;
  setFormData: React.Dispatch<React.SetStateAction<ProfileFormData>>;
  isSaving: boolean;
  hasChanges: boolean;
  validationError: string | null;
  handleSave: () => Promise<boolean>;
  handleFieldChange: <K extends keyof ProfileFormData>(
    field: K,
    value: ProfileFormData[K]
  ) => void;
}

// Validation constants (matching AddUserForm)
const MIN_NAME_LENGTH = 2;
const MIN_PASSWORD_LENGTH = 4;

export const useUserPreference = (
  onSuccess?: () => void
): UseUserPreferenceReturn => {
  const { user, refreshUser } = useAuth();
  const { refreshUsers } = useSettings();
  const [isSaving, setIsSaving] = useState(false);
  const [originalData, setOriginalData] = useState<ProfileFormData | null>(null);

  const [formData, setFormData] = useState<ProfileFormData>({
    fullName: "",
    username: "",
    nickname: "",
    color: "#93C5FD",
    profileImage: null,
    password: "",
  });

  // Initialize form with current user data
  useEffect(() => {
    if (user) {
      const data: ProfileFormData = {
        fullName: user.fullName || "",
        username: user.username || "",
        nickname: user.nickname || "",
        color: user.color || "#93C5FD",
        profileImage: user.profileImage || null,
        password: "",
      };
      setFormData(data);
      setOriginalData(data);
    }
  }, [user]);

  // Check if form has changes
  const hasChanges =
    originalData !== null &&
    (formData.fullName !== originalData.fullName ||
      formData.nickname !== originalData.nickname ||
      formData.color !== originalData.color ||
      formData.profileImage !== originalData.profileImage ||
      formData.password.length > 0);

  // Compute validation error
  const validationError: string | null = (() => {
    if (!formData.fullName.trim()) {
      return "נא להזין שם מלא";
    }
    if (formData.fullName.trim().length < MIN_NAME_LENGTH) {
      return `שם מלא חייב להכיל לפחות ${MIN_NAME_LENGTH} תווים`;
    }
    if (formData.password.length > 0 && formData.password.length < MIN_PASSWORD_LENGTH) {
      return `סיסמה חייבת להכיל לפחות ${MIN_PASSWORD_LENGTH} תווים`;
    }
    return null;
  })();

  const handleFieldChange = <K extends keyof ProfileFormData>(
    field: K,
    value: ProfileFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (): Promise<boolean> => {
    if (!user?.id) return false;

    // Validation
    if (!formData.fullName.trim()) {
      return false; // This shouldn't happen with proper UI, but safety check
    }
    if (formData.fullName.trim().length < MIN_NAME_LENGTH) {
      return false;
    }
    if (formData.password.length > 0 && formData.password.length < MIN_PASSWORD_LENGTH) {
      return false;
    }

    setIsSaving(true);
    try {
      const updateData: Record<string, unknown> = {
        fullName: formData.fullName.trim(),
        nickname: formData.nickname?.trim() || null,
        color: formData.color,
        profileImage: formData.profileImage,
      };

      // Only include password if it was changed
      if (formData.password.length > 0) {
        updateData.password = formData.password;
      }

      const response = await updateUser(user.id, updateData);

      if (response.success) {
        // Refresh user data in auth context
        await refreshUser?.();
        // Refresh all users in settings context (for admin view)
        await refreshUsers();
        setFormData((prev) => ({ ...prev, password: "" }));
        setOriginalData({ ...formData, password: "" });
        onSuccess?.();
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error updating profile:", error);
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    formData,
    setFormData,
    isSaving,
    hasChanges,
    validationError,
    handleSave,
    handleFieldChange,
  };
};

export default useUserPreference;
