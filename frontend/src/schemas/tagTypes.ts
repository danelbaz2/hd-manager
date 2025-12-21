// Tag types and constants for the two-tier tag system (Primary + Secondary)

// ===== Primary Tags (Categories/Domains with darker colors) =====
export interface PrimaryTagData {
  id: string;
  name: string;
  color: string;  // Darker color
  description?: string;
}

export interface PrimaryTagFormData {
  id?: string | null;
  name: string;
  color: string;
  description?: string;
}

// ===== Secondary Tags (Actions/Subjects linked to Primary) =====
export interface SecondaryTagData {
  id: string;
  name: string;
  primaryTagId: string;  // Reference to parent Primary Tag
  description?: string;
}

export interface SecondaryTagFormData {
  id?: string | null;
  name: string;
  primaryTagId: string;
  description?: string;
}

// ===== Legacy Tag Types (for backward compatibility during migration) =====
export interface TagData {
  id: string;
  name: string;
  color: string;
  description?: string;
}

export interface TagFormData {
  id?: string | null;
  name: string;
  color: string;
  description?: string;
}

// ===== Tag Colors =====
export interface TagColor {
  bg: string;
  text: string;
}

// Darker colors for Primary Tags (slightly darker than the original palette)
export const PRIMARY_TAG_COLORS: TagColor[] = [
  { bg: "#3B82F6", text: "#FFFFFF" }, // Blue (darker #93C5FD)
  { bg: "#22C55E", text: "#FFFFFF" }, // Green (darker #86EFAC)
  { bg: "#F59E0B", text: "#1F2937" }, // Amber (darker #FCD34D)
  { bg: "#F43F5E", text: "#FFFFFF" }, // Rose (darker #FDA4AF)
  { bg: "#8B5CF6", text: "#FFFFFF" }, // Violet (darker #C4B5FD)
  { bg: "#06B6D4", text: "#FFFFFF" }, // Cyan (darker #67E8F9)
  { bg: "#F97316", text: "#FFFFFF" }, // Orange (darker #FDBA74)
  { bg: "#EC4899", text: "#FFFFFF" }, // Pink (darker #F9A8D4)
];

// Light colors for Secondary tags display (original palette)
export const TAG_COLORS: TagColor[] = [
  { bg: "#93C5FD", text: "#1E40AF" }, // Light Blue
  { bg: "#86EFAC", text: "#166534" }, // Light Green
  { bg: "#FCD34D", text: "#92400E" }, // Light Amber
  { bg: "#FDA4AF", text: "#9F1239" }, // Light Rose
  { bg: "#C4B5FD", text: "#5B21B6" }, // Light Violet
  { bg: "#67E8F9", text: "#0E7490" }, // Light Cyan
  { bg: "#FDBA74", text: "#9A3412" }, // Light Orange
  { bg: "#F9A8D4", text: "#9D174D" }, // Light Pink
];

// ===== Color Utility Functions =====

/**
 * Get text color for a given background color
 * Works for both primary (dark) and secondary (light) tag colors
 */
export const getTextColor = (bgColor: string): string => {
  // Check primary colors first
  const primaryMatch = PRIMARY_TAG_COLORS.find((c) => c.bg === bgColor);
  if (primaryMatch) return primaryMatch.text;

  // Check light colors
  const lightMatch = TAG_COLORS.find((c) => c.bg === bgColor);
  if (lightMatch) return lightMatch.text;

  // Fallback: calculate based on luminance
  return isLightColor(bgColor) ? "#1F2937" : "#FFFFFF";
};

/**
 * Convert a dark primary color to a lighter version for secondary tag display
 */
export const getLighterColor = (darkColor: string): string => {
  const colorMap: Record<string, string> = {
    "#3B82F6": "#93C5FD", // Blue
    "#22C55E": "#86EFAC", // Green
    "#F59E0B": "#FCD34D", // Amber
    "#F43F5E": "#FDA4AF", // Rose
    "#8B5CF6": "#C4B5FD", // Violet
    "#06B6D4": "#67E8F9", // Cyan
    "#F97316": "#FDBA74", // Orange
    "#EC4899": "#F9A8D4", // Pink
  };
  return colorMap[darkColor.toUpperCase()] || lightenHexColor(darkColor, 0.5);
};

/**
 * Convert a light color to a darker version (for reference)
 */
export const getDarkerColor = (lightColor: string): string => {
  const colorMap: Record<string, string> = {
    "#93C5FD": "#3B82F6", // Blue
    "#86EFAC": "#22C55E", // Green
    "#FCD34D": "#F59E0B", // Amber
    "#FDA4AF": "#F43F5E", // Rose
    "#C4B5FD": "#8B5CF6", // Violet
    "#67E8F9": "#06B6D4", // Cyan
    "#FDBA74": "#F97316", // Orange
    "#F9A8D4": "#EC4899", // Pink
  };
  return colorMap[lightColor.toUpperCase()] || darkenHexColor(lightColor, 0.3);
};

/**
 * Check if a hex color is light (for determining text contrast)
 */
const isLightColor = (hexColor: string): boolean => {
  const hex = hexColor.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  // Using relative luminance formula
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5;
};

/**
 * Lighten a hex color by a percentage
 */
const lightenHexColor = (hex: string, percent: number): string => {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.min(255, Math.round((num >> 16) + (255 - (num >> 16)) * percent));
  const g = Math.min(255, Math.round(((num >> 8) & 0x00FF) + (255 - ((num >> 8) & 0x00FF)) * percent));
  const b = Math.min(255, Math.round((num & 0x0000FF) + (255 - (num & 0x0000FF)) * percent));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;
};

/**
 * Darken a hex color by a percentage
 */
const darkenHexColor = (hex: string, percent: number): string => {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.max(0, Math.round((num >> 16) * (1 - percent)));
  const g = Math.max(0, Math.round(((num >> 8) & 0x00FF) * (1 - percent)));
  const b = Math.max(0, Math.round((num & 0x0000FF) * (1 - percent)));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;
};

// ===== Default Form Values =====
export const DEFAULT_PRIMARY_TAG_FORM: PrimaryTagFormData = {
  id: null,
  name: "",
  color: PRIMARY_TAG_COLORS[0].bg,
  description: "",
};

export const DEFAULT_SECONDARY_TAG_FORM: SecondaryTagFormData = {
  id: null,
  name: "",
  primaryTagId: "",
  description: "",
};

// Legacy default (for backward compatibility)
export const DEFAULT_TAG_FORM: TagFormData = {
  id: null,
  name: "",
  color: TAG_COLORS[0].bg,
  description: "",
};
