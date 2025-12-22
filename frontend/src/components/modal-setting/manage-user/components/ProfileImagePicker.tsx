import React from "react";
import { Camera, Loader2 } from "lucide-react";
import defaultProfileImage from "../../../../assets/default-profile.jpg";

interface ProfileImagePickerProps {
  profileImage?: string;
  isCompressing: boolean;
  isDisabled?: boolean;
  isDarkMode: boolean;
  isEditMode?: boolean;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  onImageClick: () => void;
  onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

/**
 * ProfileImagePicker - Reusable profile image upload component
 */
const ProfileImagePicker: React.FC<ProfileImagePickerProps> = ({
  profileImage,
  isCompressing,
  isDisabled = false,
  isDarkMode,
  isEditMode = false,
  fileInputRef,
  onImageClick,
  onImageChange,
}) => {
  return (
    <div className="relative">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={onImageChange}
        className="hidden"
      />
      <button
        type="button"
        onClick={onImageClick}
        disabled={isCompressing || isDisabled}
        className={`
          relative w-12 h-12 rounded-full overflow-hidden
          border-2 border-dashed transition-all duration-200
          hover:scale-105 hover:border-blue-400
          ${isCompressing || isDisabled ? "cursor-wait" : "cursor-pointer"}
          ${
            isEditMode
              ? isDarkMode
                ? "border-blue-400 hover:border-blue-300"
                : "border-blue-300 hover:border-blue-400"
              : isDarkMode
              ? "border-slate-500 hover:border-blue-400"
              : "border-slate-300 hover:border-blue-400"
          }
        `}
      >
        <img
          src={profileImage || defaultProfileImage}
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
  );
};

export default ProfileImagePicker;
