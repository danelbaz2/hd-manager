// Tag types and constants for the two-tier tag system (Primary + Secondary)

// ===== Primary Tags =====
export interface PrimaryTagData {
  id: string;
  name: string;
  color: string;
  description?: string;
}

export interface PrimaryTagFormData {
  id?: string | null;
  name: string;
  color: string;
  description?: string;
}

// ===== Secondary Tags =====
export interface SecondaryTagData {
  id: string;
  name: string;
  primaryTagId: string;
  color?: string;
  description?: string;
}

export interface SecondaryTagFormData {
  id?: string | null;
  name: string;
  primaryTagId: string;
  description?: string;
}

// ===== Tag Colors =====
export interface TagColor {
  bg: string;
  text: string;
}

export const PRIMARY_TAG_COLORS: TagColor[] = [
  { bg: "#3B82F6", text: "#FFFFFF" },
  { bg: "#22C55E", text: "#FFFFFF" },
  { bg: "#F59E0B", text: "#1F2937" },
  { bg: "#F43F5E", text: "#FFFFFF" },
  { bg: "#8B5CF6", text: "#FFFFFF" },
  { bg: "#06B6D4", text: "#FFFFFF" },
  { bg: "#F97316", text: "#FFFFFF" },
  { bg: "#EC4899", text: "#FFFFFF" },
];

export const TAG_COLORS: TagColor[] = [
  { bg: "#93C5FD", text: "#1E40AF" },
  { bg: "#86EFAC", text: "#166534" },
  { bg: "#FCD34D", text: "#92400E" },
  { bg: "#FDA4AF", text: "#9F1239" },
  { bg: "#C4B5FD", text: "#5B21B6" },
  { bg: "#67E8F9", text: "#0E7490" },
  { bg: "#FDBA74", text: "#9A3412" },
  { bg: "#F9A8D4", text: "#9D174D" },
];

// ===== Color Utility Functions =====
export const getTextColor = (bgColor: string): string => {
  const primaryMatch = PRIMARY_TAG_COLORS.find((c) => c.bg === bgColor);
  if (primaryMatch) return primaryMatch.text;

  const lightMatch = TAG_COLORS.find((c) => c.bg === bgColor);
  if (lightMatch) return lightMatch.text;

  return isLightColor(bgColor) ? "#1F2937" : "#FFFFFF";
};

export const getLighterColor = (darkColor: string): string => {
  const colorMap: Record<string, string> = {
    "#3B82F6": "#93C5FD",
    "#22C55E": "#86EFAC",
    "#F59E0B": "#FCD34D",
    "#F43F5E": "#FDA4AF",
    "#8B5CF6": "#C4B5FD",
    "#06B6D4": "#67E8F9",
    "#F97316": "#FDBA74",
    "#EC4899": "#F9A8D4",
  };
  return colorMap[darkColor.toUpperCase()] || lightenHexColor(darkColor, 0.5);
};

export const getDarkerColor = (lightColor: string): string => {
  const colorMap: Record<string, string> = {
    "#93C5FD": "#3B82F6",
    "#86EFAC": "#22C55E",
    "#FCD34D": "#F59E0B",
    "#FDA4AF": "#F43F5E",
    "#C4B5FD": "#8B5CF6",
    "#67E8F9": "#06B6D4",
    "#FDBA74": "#F97316",
    "#F9A8D4": "#EC4899",
  };
  return colorMap[lightColor.toUpperCase()] || darkenHexColor(lightColor, 0.3);
};

const isLightColor = (hexColor: string): boolean => {
  const hex = hexColor.replace("#", "");
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5;
};

const lightenHexColor = (hex: string, percent: number): string => {
  const num = parseInt(hex.replace("#", ""), 16);
  const r = Math.min(255, Math.round((num >> 16) + (255 - (num >> 16)) * percent));
  const g = Math.min(255, Math.round(((num >> 8) & 0x00FF) + (255 - ((num >> 8) & 0x00FF)) * percent));
  const b = Math.min(255, Math.round((num & 0x0000FF) + (255 - (num & 0x0000FF)) * percent));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase()}`;
};

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
