/**
 * ToastContainer - Container for toast notifications.
 * Uses portal to render at document body level for consistent positioning.
 */
import React from "react";
import { createPortal } from "react-dom";
import SuccessAlert from "./SuccessAlert";
import ErrorAlert from "./ErrorAlert";
import WarningAlert from "./WarningAlert";
import type { ToastAlert } from "../../schemas/alertTypes";

interface ToastContainerProps {
  alerts: ToastAlert[];
  onDismiss: (id: number) => void;
  isDarkMode: boolean;
}

const ToastContainer: React.FC<ToastContainerProps> = ({
  alerts,
  onDismiss,
  isDarkMode,
}) => {
  if (alerts.length === 0) return null;

  const content = (
    <div
      className="fixed top-4 left-4 z-[10000] flex flex-col gap-3"
      style={{ direction: "ltr" }}
    >
      {/* Global Animation Styles */}
      <style>
        {`
          @keyframes alertSlideIn {
            from {
              transform: translateX(-100%) scale(0.95);
              opacity: 0;
            }
            to {
              transform: translateX(0) scale(1);
              opacity: 1;
            }
          }
          
          @keyframes success-bounce {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.2); }
          }
          
          @keyframes error-shake {
            0%, 100% { transform: translateX(0); }
            25% { transform: translateX(-3px); }
            75% { transform: translateX(3px); }
          }
          
          @keyframes warning-pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.6; }
          }
          
          .animate-success-bounce {
            animation: success-bounce 0.4s ease-out;
          }
          
          .animate-error-shake {
            animation: error-shake 0.4s ease-out;
          }
          
          .animate-warning-pulse {
            animation: warning-pulse 1s ease-in-out infinite;
          }
        `}
      </style>

      {alerts.map((alert) => {
        switch (alert.type) {
          case "success":
            return (
              <SuccessAlert
                key={alert.id}
                id={alert.id}
                title={alert.title}
                message={alert.message}
                onDismiss={onDismiss}
                isDarkMode={isDarkMode}
              />
            );
          case "error":
            return (
              <ErrorAlert
                key={alert.id}
                id={alert.id}
                title={alert.title}
                message={alert.message}
                onDismiss={onDismiss}
                isDarkMode={isDarkMode}
              />
            );
          case "warning":
            return (
              <WarningAlert
                key={alert.id}
                id={alert.id}
                title={alert.title}
                message={alert.message}
                onDismiss={onDismiss}
                isDarkMode={isDarkMode}
              />
            );
          default:
            return null;
        }
      })}
    </div>
  );

  // Use portal to render at document body level - above all modals
  return createPortal(content, document.body);
};

export default ToastContainer;
