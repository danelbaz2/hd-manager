/**
 * Color utility functions for user selection components
 */

// Helper function to determine if a color is light or dark
export const isLightColor = (hexColor: string): boolean => {
    // Remove # if present
    const hex = hexColor.replace("#", "");

    // Convert to RGB
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    // Calculate luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    return luminance > 0.5;
};

// Get contrasting text color for a background color
export const getContrastTextColor = (bgColor: string): string => {
    return isLightColor(bgColor) ? "#1e293b" : "#ffffff"; // slate-800 or white
};
