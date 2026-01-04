/**
 * ModalOverlay - Reusable modal backdrop with blur effect and highest z-index.
 * Ensures modals are above all other content and prevents interaction with background.
 *
 * Features:
 * - INSTANT blur effect (backdrop always visible, no fade)
 * - Highest z-index (z-[9999])
 * - Click-to-close on backdrop
 * - Smooth content animation only
 * - Prevents scroll on body when open
 */
import React, { useEffect, useState, useCallback } from "react";
import { createPortal } from "react-dom";

export interface ModalOverlayProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback when backdrop is clicked */
  onClose: () => void;
  /** Content to render inside the modal */
  children: React.ReactNode;
  /** Animation duration in ms for content (default: 200) */
  animationDuration?: number;
  /** Whether to close on backdrop click (default: true) */
  closeOnBackdropClick?: boolean;
  /** Custom max-width class for the content container (default: "max-w-2xl lg:max-w-3xl") */
  maxWidthClass?: string;
  /** Offset from left in pixels when a side panel is open (default: 0) */
  offsetLeft?: number;
}

export const ModalOverlay: React.FC<ModalOverlayProps> = ({
  isOpen,
  onClose,
  children,
  animationDuration = 200,
  closeOnBackdropClick = true,
  maxWidthClass = "max-w-2xl lg:max-w-3xl",
  offsetLeft = 0,
}) => {
  const [shouldRender, setShouldRender] = useState(false);
  const [isContentVisible, setIsContentVisible] = useState(false);

  // Handle open/close lifecycle
  useEffect(() => {
    if (isOpen) {
      // Start rendering immediately with blur
      setShouldRender(true);
      // Animate content on next frame
      requestAnimationFrame(() => {
        setIsContentVisible(true);
      });
      // Prevent body scroll
      document.body.style.overflow = "hidden";
    } else {
      // Start closing animation for content
      setIsContentVisible(false);
      // Wait for animation to complete before unmounting
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, animationDuration);
      // Restore body scroll
      document.body.style.overflow = "";
      return () => clearTimeout(timer);
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen, animationDuration]);

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      // Only close if clicking directly on backdrop, not children
      if (e.target === e.currentTarget && closeOnBackdropClick) {
        onClose();
      }
    },
    [closeOnBackdropClick, onClose]
  );

  // Stop all events from propagating through the overlay
  const handleOverlayClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
  }, []);

  // Focus management and Escape key handling
  useEffect(() => {
    if (isOpen && shouldRender) {
      // Find the container element
      const container = document.getElementById("modal-content-container");
      if (container) {
        container.focus();
      }
    }
  }, [isOpen, shouldRender]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape" && closeOnBackdropClick) {
        e.stopPropagation(); // Prevent bubbling to parent modals
        onClose();
      }
    },
    [closeOnBackdropClick, onClose]
  );

  if (!shouldRender) return null;

  const content = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 outline-none transition-all duration-300"
      onClick={handleOverlayClick}
      onMouseDown={handleOverlayClick}
      style={{ paddingLeft: offsetLeft }}
    >
      {/* Backdrop - INSTANT blur, no animation */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
        onClick={handleBackdropClick}
      />

      {/* Content container - animated, with configurable max-width */}
      <div
        id="modal-content-container"
        tabIndex={-1}
        onKeyDown={handleKeyDown}
        className={`
          relative z-10 w-full ${maxWidthClass} transition-all outline-none
          ${isContentVisible ? "scale-100 opacity-100" : "scale-95 opacity-0"}
        `}
        style={{
          transitionDuration: `${animationDuration}ms`,
          transform:
            offsetLeft > 0
              ? `translateX(${offsetLeft / 2}px) ${
                  isContentVisible ? "scale(1)" : "scale(0.95)"
                }`
              : undefined,
        }}
      >
        {children}
      </div>
    </div>
  );

  // Use portal to render at document body level - above everything
  return createPortal(content, document.body);
};

export default ModalOverlay;
