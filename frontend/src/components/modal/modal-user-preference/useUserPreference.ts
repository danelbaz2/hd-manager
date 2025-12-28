import { useState, useEffect } from "react";
import { useAuth } from "../../../contexts";
import { updateUser } from "../../../api/usersApi";

interface ProfileFormData {
  fullName: string;
  username: string;
  color: string;
  profileImage: string | null;
  password: string;
}

interface UseUserPreferenceReturn {
  formData: ProfileFormData;
  setFormData: React.Dispatch<React.SetStateAction<ProfileFormData>>;
  isSaving: boolean;
  hasChanges: boolean;
  handleSave: () => Promise<boolean>;
  handleFieldChange: <K extends keyof ProfileFormData>(
    field: K,
    value: ProfileFormData[K]
  ) => void;
}

export const useUserPreference = (
  onSuccess?: () => void
): UseUserPreferenceReturn => {
  const { user, refreshUser } = useAuth();
  const [isSaving, setIsSaving] = useState(false);
  const [originalData, setOriginalData] = useState<ProfileFormData | null>(null);

  const [formData, setFormData] = useState<ProfileFormData>({
    fullName: "",
    username: "",
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
      formData.color !== originalData.color ||
      formData.profileImage !== originalData.profileImage ||
      formData.password.length > 0);

  const handleFieldChange = <K extends keyof ProfileFormData>(
    field: K,
    value: ProfileFormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (): Promise<boolean> => {
    if (!user?.id) return false;

    setIsSaving(true);
    try {
      const updateData: Record<string, unknown> = {
        fullName: formData.fullName,
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
    handleSave,
    handleFieldChange,
  };
};

export default useUserPreference;
