/**
 * UserAvatar - Shared avatar component for displaying user profile images
 * Used across the application for consistent avatar rendering
 */

import React from "react";
import { getProfileImageUrl, getInitials } from "../../utils/profileImage";

export interface UserAvatarProps {
  /** Profile image URL or relative path */
  profileImage?: string | null;
  /** User's full name (used for alt text and fallback initials) */
  name: string;
  /** User's color for border/fallback background */
  color?: string;
  /** Size variant */
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  /** Optional border width (overrides default for size) */
  borderWidth?: number;
  /** Whether to show border */
  showBorder?: boolean;
  /** Additional className */
  className?: string;
  /** onClick handler */
  onClick?: () => void;
}

// Size configurations
const SIZE_CONFIG = {
  xs: { container: "w-6 h-6", text: "text-xs", defaultBorder: 1 },
  sm: { container: "w-8 h-8", text: "text-sm", defaultBorder: 2 },
  md: { container: "w-10 h-10", text: "text-base", defaultBorder: 2 },
  lg: { container: "w-16 h-16", text: "text-xl", defaultBorder: 3 },
  xl: { container: "w-24 h-24", text: "text-3xl", defaultBorder: 4 },
};

const UserAvatar: React.FC<UserAvatarProps> = ({
  profileImage,
  name,
  color = "#6366f1",
  size = "md",
  borderWidth,
  showBorder = true,
  className = "",
  onClick,
}) => {
  const config = SIZE_CONFIG[size];
  const imageUrl = getProfileImageUrl(profileImage);
  const initials = getInitials(name);
  const border = borderWidth ?? config.defaultBorder;

  const containerClasses = `
    ${config.container}
    rounded-full
    flex items-center justify-center
    overflow-hidden
    ${onClick ? "cursor-pointer hover:opacity-90 transition-opacity" : ""}
    ${className}
  `.trim();

  const borderStyle = showBorder
    ? {
        borderWidth: `${border}px`,
        borderColor: color,
        borderStyle: "solid" as const,
      }
    : {};

  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={name}
        onClick={onClick}
        className={containerClasses}
        style={{
          ...borderStyle,
          objectFit: "cover",
        }}
        onError={(e) => {
          // Fallback to initials if image fails to load
          const target = e.target as HTMLImageElement;
          target.style.display = "none";
          target.parentElement?.classList.add("fallback-initials");
        }}
      />
    );
  }

  // Fallback: Show initials with colored background
  return (
    <div
      onClick={onClick}
      className={containerClasses}
      style={{
        backgroundColor: color,
        ...borderStyle,
      }}
    >
      <span className={`${config.text} font-bold text-white`}>{initials}</span>
    </div>
  );
};

export default UserAvatar;
