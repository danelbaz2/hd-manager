export type UserRole = 'admin' | 'regular';

export interface UserData {
  id: string;
  fullName: string;
  username: string;
  role: UserRole;
  color: string;
  profileImage: string | null;
  nickname: string | null;
}

export interface UserFormData {
  id?: string | null;
  fullName: string;
  username: string;
  password: string;
  role: UserRole;
  color: string;
  profileImage: string | null;
  nickname?: string | null;
}

export const AVAILABLE_COLORS = [
  "#93C5FD", // Light Blue
  "#86EFAC", // Light Green
  "#FCD34D", // Light Amber
  "#FDA4AF", // Light Rose
  "#C4B5FD", // Light Violet
  "#67E8F9", // Light Cyan
  "#FDBA74", // Light Orange
  "#F9A8D4", // Light Pink
];

export const DEFAULT_FORM_DATA: UserFormData = {
  id: null,
  fullName: "",
  username: "",
  password: "",
  role: "regular",
  color: AVAILABLE_COLORS[0],
  profileImage: null,
  nickname: null,
};
