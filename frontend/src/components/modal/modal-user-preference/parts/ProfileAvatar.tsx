import React from "react";
import { Camera } from "lucide-react";
import { useTheme } from "../../../../contexts";

interface ProfileAvatarProps {
  profileImage: string | null;
  color: string;
  fullName: string;
  onImageChange: (imageUrl: string | null) => void;
}

const ProfileAvatar: React.FC<ProfileAvatarProps> = ({
  profileImage,
  color,
  fullName,
  onImageChange,
}) => {
  const { isDarkMode } = useTheme();

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
    <div className="flex flex-col items-center gap-4">
      {/* Avatar */}
      <div className="relative group">
        <div
          className="w-24 h-24 rounded-full flex items-center justify-center overflow-hidden"
          style={{
            border: `4px solid ${color}`,
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
              className={`text-3xl font-bold ${
                isDarkMode ? "text-slate-400" : "text-slate-500"
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
