import { useState, useRef, useCallback } from "react";
import type { ToastAlert } from "../../schemas/alertTypes";

/**
 * Custom hook for managing toast alerts
 * Provides functions to show success, error, and warning alerts
 * and manages the alert state automatically
 */
export const useToast = () => {
  const [alerts, setAlerts] = useState<ToastAlert[]>([]);
  const alertIdRef = useRef(0);

  const showAlert = useCallback(
    (type: "success" | "error" | "warning", title: string, message: string) => {
      const newAlert: ToastAlert = {
        id: ++alertIdRef.current,
        type,
        title,
        message,
      };
      setAlerts((prev) => [...prev, newAlert]);
      return newAlert.id;
    },
    []
  );

  const showSuccess = useCallback(
    (title: string, message: string) => {
      return showAlert("success", title, message);
    },
    [showAlert]
  );

  const showError = useCallback(
    (title: string, message: string) => {
      return showAlert("error", title, message);
    },
    [showAlert]
  );

  const showWarning = useCallback(
    (title: string, message: string) => {
      return showAlert("warning", title, message);
    },
    [showAlert]
  );

  const dismissAlert = useCallback((id: number) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id));
  }, []);

  const clearAllAlerts = useCallback(() => {
    setAlerts([]);
  }, []);

  return {
    alerts,
    showSuccess,
    showError,
    showWarning,
    dismissAlert,
    clearAllAlerts,
  };
};

export default useToast;
