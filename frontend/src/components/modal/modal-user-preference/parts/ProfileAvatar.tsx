import React from "react";
import { Camera } from "lucide-react";
import { useTheme } from "../../../../contexts";

interface ProfileAvatarProps {
  profileImage: string | null;
  color: string;
  fullName: string;
  onImageChange: (imageUrl: string | null) => void;
  size?: "sm" | "md" | "lg";
}

// Size configurations
const SIZE_CONFIG = {
  sm: { container: "w-16 h-16", text: "text-xl", border: 3, icon: 16 },
  md: { container: "w-24 h-24", text: "text-3xl", border: 4, icon: 24 },
  lg: { container: "w-32 h-32", text: "text-4xl", border: 5, icon: 28 },
};

const ProfileAvatar: React.FC<ProfileAvatarProps> = ({
  profileImage,
  color,
  fullName,
  onImageChange,
  size = "md",
}) => {
  const { isDarkMode } = useTheme();
  const config = SIZE_CONFIG[size];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onImageChange(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    onImageChange(null);
  };

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Avatar */}
      <div className="relative group">
        <div
          className={`${config.container} rounded-full flex items-center justify-center overflow-hidden`}
          style={{
            border: `${config.border}px solid ${color}`,
            backgroundColor: isDarkMode ? "#334155" : "#f1f5f9",
          }}
        >
          {profileImage ? (
            <img
              src={profileImage}
              alt={fullName}
              className="w-full h-full object-cover"
            />
          ) : (
            <span
              className={`${config.text} font-bold ${isDarkMode ? "text-slate-400" : "text-slate-500"
                }`}
            >
              {fullName.charAt(0)}
            </span>
          )}
        </div>

        {/* Camera overlay */}
        <label
          className={`
            absolute inset-0 rounded-full
            flex items-center justify-center
            bg-black/50 opacity-0 group-hover:opacity-100
            transition-opacity cursor-pointer
          `}
        >
          <Camera size={24} className="text-white" />
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
      </div>

      {/* Remove button */}
      {profileImage && (
        <button
          onClick={handleRemoveImage}
          className="text-sm text-red-500 hover:text-red-600 transition-colors"
        >
          הסר תמונה
        </button>
      )}
    </div>
  );
};

export default ProfileAvatar;
