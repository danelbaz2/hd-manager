import React from "react";
import Tooltip from "./Tooltip";

interface TagBadgeProps {
  name: string;
  color: string;
  textColor?: string;
  description?: string | null;
  size?: "sm" | "md" | "lg";
  className?: string;
}

/**
 * TagBadge - Reusable tag display component with optional tooltip
 * Shows description on hover if provided
 */
const TagBadge: React.FC<TagBadgeProps> = ({
  name,
  color,
  textColor,
  description,
  size = "sm",
  className = "",
}) => {
  // Size classes
  const sizeClasses = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-xs",
    lg: "px-4 py-1.5 text-sm",
  };

  // Determine text color - use provided or calculate contrast
  const computedTextColor = textColor || color;

  // Compute background color with transparency if no textColor provided
  const bgColor = textColor ? color : `${color}30`;

  const badge = (
    <span
      className={`rounded font-medium ${sizeClasses[size]} ${className}`}
      style={{
        backgroundColor: bgColor,
        color: computedTextColor,
      }}
    >
      {name}
    </span>
  );

  // Wrap with tooltip if description exists
  if (description && description.trim()) {
    return (
      <Tooltip content={description} position="top">
        {badge}
      </Tooltip>
    );
  }

  return badge;
};

export default TagBadge;
