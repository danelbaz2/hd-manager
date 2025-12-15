export interface UserData {
  id: string;
  name: string;
  username: string;
  password: string;
  isAdmin: boolean;
  color: string;
}

export interface UserFormData {
  name: string;
  username: string;
  password: string;
  isAdmin: boolean;
  color: string;
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
  name: "",
  username: "",
  password: "",
  isAdmin: false,
  color: AVAILABLE_COLORS[2],
};
