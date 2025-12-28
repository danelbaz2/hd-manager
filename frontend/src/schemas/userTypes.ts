export type UserRole = 'admin' | 'regular';

export interface UserData {
  id: string;
  fullName: string;
  username: string;
  role: UserRole;
  color: string;
  profileImage: string | null;
  nickname: string | null;  // Optional display nickname
}

export interface UserFormData {
  id?: string | null; // Optional - only present when editing
  fullName: string;
  username: string;
  password: string;  // User input - will be hashed by backend
  role: UserRole;
  color: string;
  profileImage: string | null;
  nickname?: string | null;  // Optional display nickname
}

// Clean, light, modern color palette
// These colors work well for user avatars, banners, and card backgrounds
export const AVAILABLE_COLORS = [
  "#93C5FD", // Light Blue (sky-300)
  "#86EFAC", // Light Green (green-300)
  "#FCD34D", // Light Amber (amber-300)
  "#FDA4AF", // Light Rose (rose-300)
  "#C4B5FD", // Light Violet (violet-300)
  "#67E8F9", // Light Cyan (cyan-300)
  "#FDBA74", // Light Orange (orange-300)
  "#F9A8D4", // Light Pink (pink-300)
];

export const DEFAULT_FORM_DATA: UserFormData = {
  id: null,
  fullName: "",
  username: "",
  password: "",  // User input - will be hashed by backend
  role: "regular",
  color: AVAILABLE_COLORS[0], // Default to Light Blue
  profileImage: null,
  nickname: null,  // Optional display nickname
};

