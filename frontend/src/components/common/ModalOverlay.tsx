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
 * - Modal stack management for nested modals (only topmost modal closes on Escape)
 */
import React, { useEffect, useState, useCallback, useRef } from "react";
import { createPortal } from "react-dom";

// Global modal stack to track which modals are open (LIFO - Last In First Out)
const modalStack: Set<string> = new Set();
let modalIdCounter = 0;

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
  const modalIdRef = useRef<string>(`modal-${++modalIdCounter}`);

  // Register/unregister this modal in the global stack
  useEffect(() => {
    if (isOpen) {
      modalStack.add(modalIdRef.current);
    } else {
      modalStack.delete(modalIdRef.current);
    }
    return () => {
      modalStack.delete(modalIdRef.current);
    };
  }, [isOpen]);

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

  // Focus management - auto-focus modal and first input field
  useEffect(() => {
    if (isOpen && shouldRender && isContentVisible) {
      // Small delay to ensure DOM is ready and animation started
      const focusTimer = setTimeout(() => {
        const container = document.getElementById(`modal-content-${modalIdRef.current}`);
        if (!container) return;

        // Try to find and focus the first focusable input/textarea/select
        const firstInput = container.querySelector<HTMLElement>(
          'input:not([type="hidden"]):not([disabled]), textarea:not([disabled]), select:not([disabled])'
        );

        if (firstInput) {
          // Focus the first input field
          firstInput.focus();
          // If it's a text input/textarea, select all text for easy editing
          if (firstInput instanceof HTMLInputElement || firstInput instanceof HTMLTextAreaElement) {
            firstInput.select();
          }
        } else {
          // No input field found, focus the container for keyboard navigation
          container.focus();
        }
      }, animationDuration + 50); // Wait for animation to complete + small buffer

      return () => clearTimeout(focusTimer);
    }
  }, [isOpen, shouldRender, isContentVisible, animationDuration]);

  // Global Escape key handler (works regardless of focus)
  useEffect(() => {
    if (!isOpen || !closeOnBackdropClick) return;

    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        // Check if this modal is the topmost (last in the stack)
        const stackArray = Array.from(modalStack);
        const isTopmost = stackArray[stackArray.length - 1] === modalIdRef.current;
        
        if (isTopmost) {
          e.preventDefault();
          e.stopImmediatePropagation(); // Prevent other listeners from firing
          onClose();
        }
      }
    };

    // Use capture phase to handle the event before it reaches other listeners
    window.addEventListener("keydown", handleGlobalKeyDown, true);
    return () => {
      window.removeEventListener("keydown", handleGlobalKeyDown, true);
    };
  }, [isOpen, closeOnBackdropClick, onClose]);

  if (!shouldRender) return null;

  const content = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 outline-none transition-all duration-300"
      onClick={handleOverlayClick}
      style={{ paddingLeft: offsetLeft }}
    >
      {/* Backdrop - Animated blur */}
      <div
        className={`absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity duration-300 ${isContentVisible ? "opacity-100" : "opacity-0"}`}
        onClick={handleBackdropClick}
      />

      {/* Content container - animated, with configurable max-width */}
      <div
        id={`modal-content-${modalIdRef.current}`}
        tabIndex={-1}
        className={`
          relative z-10 w-full ${maxWidthClass} transition-all outline-none
          ${isContentVisible ? "scale-100 opacity-100 translate-y-0" : "scale-95 opacity-0 translate-y-4"}
        `}
        style={{
          transitionDuration: `${animationDuration}ms`,
          // Combine custom offset transform with the scale/translate
          transform: offsetLeft > 0 && !isContentVisible ? undefined : undefined 
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
