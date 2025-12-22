import React, { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";

interface DelayedLoaderProps {
  /**
   * Whether loading is in progress
   */
  isLoading: boolean;

  /**
   * Delay in milliseconds before showing the loader (default: 300ms)
   */
  delay?: number;

  /**
   * Size of the loader icon (default: 32)
   */
  size?: number;

  /**
   * Custom class name for the container
   */
  className?: string;

  /**
   * Children to render (shown when not loading)
   */
  children: React.ReactNode;
}

/**
 * DelayedLoader - Shows a loader only if loading takes longer than the specified delay.
 * This prevents flash of loading state for fast operations.
 */
const DelayedLoader: React.FC<DelayedLoaderProps> = ({
  isLoading,
  delay = 300,
  size = 32,
  className = "",
  children,
}) => {
  const { isDarkMode } = useTheme();
  const [showLoader, setShowLoader] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;

    if (isLoading) {
      // Only show loader after delay
      timer = setTimeout(() => {
        setShowLoader(true);
      }, delay);
    } else {
      setShowLoader(false);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isLoading, delay]);

  // If not loading, render children
  if (!isLoading) {
    return <>{children}</>;
  }

  // If loading but delay hasn't passed, render nothing (or could render children faded)
  if (!showLoader) {
    return null;
  }

  // Show loader after delay
  return (
    <div
      className={`flex-1 flex items-center justify-center py-12 ${className}`}
    >
      <Loader2
        size={size}
        className={`animate-spin ${
          isDarkMode ? "text-blue-400" : "text-blue-500"
        }`}
      />
    </div>
  );
};

export default DelayedLoader;
