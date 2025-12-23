import { useState, useRef, useCallback, useEffect } from "react";
import type { ToastAlert } from "../../schemas/alertTypes";

/**
 * Custom hook for managing toast alerts
 * Provides functions to show success, error, and warning alerts
 * and manages the alert state automatically
 * 
 * Alerts are automatically cleared when the component unmounts
 */
export const useToast = () => {
  const [alerts, setAlerts] = useState<ToastAlert[]>([]);
  const alertIdRef = useRef(0);
  const isMountedRef = useRef(true);

  // Track mounted state and clear alerts on unmount
  useEffect(() => {
    isMountedRef.current = true;
    // Reset alerts when component mounts (new instance)
    setAlerts([]);
    alertIdRef.current = 0;
    
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const showAlert = useCallback(
    (type: "success" | "error" | "warning", title: string, message: string) => {
      if (!isMountedRef.current) return -1;
      
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
    if (!isMountedRef.current) return;
    setAlerts((prev) => prev.filter((alert) => alert.id !== id));
  }, []);

  const clearAllAlerts = useCallback(() => {
    if (!isMountedRef.current) return;
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
