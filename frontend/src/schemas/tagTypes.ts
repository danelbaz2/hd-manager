// Tag types and constants

export interface TagData {
  id: string;
  name: string;
  color: string;
  description?: string;
}

export interface TagFormData {
  id?: string | null;  // Optional - only present when editing
  name: string;
  color: string;
  description?: string;
}

export interface TagColor {
  bg: string;
  text: string;
}

// Clean, light, modern color palette for tags
// Each color has a matching text color for good readability
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

export const getTextColor = (bgColor: string): string => {
  const colorSet = TAG_COLORS.find((c) => c.bg === bgColor);
  return colorSet?.text || "#374151";
};

export const DEFAULT_TAG_FORM: TagFormData = {
  id: null,
  name: "",
  color: TAG_COLORS[0].bg, // Default to Light Blue
  description: "",
};
