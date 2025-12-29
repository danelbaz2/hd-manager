import React from "react";

/**
 * Shared utility functions for task list components
 */

/**
 * Status badge styling - returns background, text color and Hebrew label
 */
export const getStatusStyle = (
  status?: string
): { bg: string; text: string; label: string } => {
  switch (status) {
    case "pending":
      return { bg: "bg-green-100", text: "text-green-700", label: "פתוח" };
    case "in_progress":
      return { bg: "bg-orange-100", text: "text-orange-700", label: "בטיפול" };
    case "completed":
      return { bg: "bg-slate-100", text: "text-slate-600", label: "סגור" };
    default:
      return { bg: "bg-slate-100", text: "text-slate-600", label: "לא ידוע" };
  }
};

/**
 * Generate gradient for multiple user colors
 */
export const getGradientStyle = (colors: string[]): React.CSSProperties => {
  if (colors.length === 0) {
    return { backgroundColor: "#94A3B8" };
  }
  if (colors.length === 1) {
    return { backgroundColor: colors[0] };
  }
  const gradientStops = colors
    .map((color, index) => {
      const percentage = (index / (colors.length - 1)) * 100;
      return `${color} ${percentage}%`;
    })
    .join(", ");
  return { background: `linear-gradient(to bottom, ${gradientStops})` };
};

/**
 * Calculate days remaining until deadline
 */
export const getDaysRemaining = (
  timestamp?: number
): { text: string; color: string } => {
  if (!timestamp) return { text: "---", color: "text-slate-400" };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const targetDate = new Date(timestamp);
  targetDate.setHours(0, 0, 0, 0);

  const diffTime = targetDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { text: `באיחור ${Math.abs(diffDays)} ימים`, color: "text-red-500" };
  } else if (diffDays === 0) {
    return { text: "היום!", color: "text-red-500" };
  } else if (diffDays === 1) {
    return { text: "מחר", color: "text-orange-500" };
  } else if (diffDays <= 3) {
    return { text: `עוד ${diffDays} ימים`, color: "text-orange-500" };
  } else if (diffDays <= 7) {
    return { text: `עוד ${diffDays} ימים`, color: "text-blue-500" };
  } else {
    return { text: `עוד ${diffDays} ימים`, color: "text-slate-500" };
  }
};

/**
 * Get status color for weekly view
 */
export const getStatusColor = (status?: string): string => {
  switch (status) {
    case "pending":
      return "#22c55e"; // green-500
    case "in_progress":
      return "#f97316"; // orange-500
    case "completed":
      return "#64748b"; // slate-500
    default:
      return "#94a3b8"; // slate-400
  }
};
