export type UserRole = 'admin' | 'regular';

export interface UserData {
  id: string;
  fullName: string;
  username: string;
  passwordHash: string;
  role: UserRole;
  color: string;
  profileImage: string | null;
}

export interface UserFormData {
  id?: string | null; // Optional - only present when editing
  fullName: string;
  username: string;
  passwordHash: string;
  role: UserRole;
  color: string;
  profileImage: string | null;
}

export const AVAILABLE_COLORS = [
  "#FEF3C7", // Yellow
  "#D1FAE5", // Green
  "#DBEAFE", // Blue
  "#E0E7FF", // Indigo
  "#FCE7F3", // Pink
  "#FEE2E2", // Red
  "#F3E8FF", // Purple
  "#ECFEFF", // Cyan
];

export const DEFAULT_FORM_DATA: UserFormData = {
  id: null,
  fullName: "",
  username: "",
  passwordHash: "",
  role: "regular",
  color: AVAILABLE_COLORS[2],
  profileImage: null,
};
