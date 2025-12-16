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

export const TAG_COLORS: TagColor[] = [
  { bg: "#DBEAFE", text: "#1D4ED8" }, // Blue
  { bg: "#D1FAE5", text: "#047857" }, // Green
  { bg: "#FEF3C7", text: "#B45309" }, // Yellow
  { bg: "#FCE7F3", text: "#BE185D" }, // Pink
  { bg: "#E0E7FF", text: "#4338CA" }, // Indigo
  { bg: "#FEE2E2", text: "#DC2626" }, // Red
  { bg: "#F3E8FF", text: "#7C3AED" }, // Purple
  { bg: "#ECFEFF", text: "#0891B2" }, // Cyan
  { bg: "#FED7AA", text: "#C2410C" }, // Orange
];

export const getTextColor = (bgColor: string): string => {
  const colorSet = TAG_COLORS.find((c) => c.bg === bgColor);
  return colorSet?.text || "#374151";
};

export const DEFAULT_TAG_FORM: TagFormData = {
  id: null,
  name: "",
  color: TAG_COLORS[0].bg,
  description: "",
};

// Sample tags - will be replaced by API data
export const AVAILABLE_TAGS: TagData[] = [
  { id: "1", name: "פיתוח", color: "#DBEAFE" },
  { id: "2", name: "עיצוב", color: "#FEF3C7" },
  { id: "3", name: "שרתים", color: "#E0E7FF" },
  { id: "4", name: "בדיקות", color: "#FEE2E2" },
  { id: "5", name: "דחיפות גבוהה", color: "#FCE7F3" },
  { id: "6", name: "ניהול", color: "#DBEAFE" },
  { id: "7", name: "תשתיות", color: "#D1FAE5" },
  { id: "8", name: "תמיכה", color: "#FED7AA" },
];

export const getTagById = (tagId: string): TagData | undefined => {
  return AVAILABLE_TAGS.find((tag) => tag.id === tagId);
};
