// Alert/Toast Types and Interfaces
export interface AlertProps {
  id: number;
  title: string;
  message: string;
  onDismiss: (id: number) => void;
  isDarkMode: boolean;
  duration?: number; // Auto-dismiss duration in ms, default 5000
}

export interface ToastAlert {
  id: number;
  type: "success" | "error" | "warning";
  title: string;
  message: string;
}

export interface ToastContextValue {
  alerts: ToastAlert[];
  showSuccess: (title: string, message: string) => void;
  showError: (title: string, message: string) => void;
  showWarning: (title: string, message: string) => void;
  dismissAlert: (id: number) => void;
}
