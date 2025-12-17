// Color utility functions for manipulating hex colors

/**
 * Convert hex color to RGB
 */
export const hexToRgb = (hex: string): { r: number; g: number; b: number } | null => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
        ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16),
        }
        : null;
};

/**
 * Convert RGB to hex color
 */
export const rgbToHex = (r: number, g: number, b: number): string => {
    return "#" + [r, g, b].map(x => {
        const hex = Math.max(0, Math.min(255, Math.round(x))).toString(16);
        return hex.length === 1 ? "0" + hex : hex;
    }).join("");
};

/**
 * Darken a hex color by a percentage (0-100)
 */
export const darkenColor = (hex: string, percent: number): string => {
    const rgb = hexToRgb(hex);
    if (!rgb) return hex;

    const factor = 1 - (percent / 100);
    return rgbToHex(
        rgb.r * factor,
        rgb.g * factor,
        rgb.b * factor
    );
};

/**
 * Lighten a hex color by a percentage (0-100)
 */
export const lightenColor = (hex: string, percent: number): string => {
    const rgb = hexToRgb(hex);
    if (!rgb) return hex;

    const factor = percent / 100;
    return rgbToHex(
        rgb.r + (255 - rgb.r) * factor,
        rgb.g + (255 - rgb.g) * factor,
        rgb.b + (255 - rgb.b) * factor
    );
};

/**
 * Get hex color with alpha (returns rgba string)
 */
export const hexWithAlpha = (hex: string, alpha: number): string => {
    const rgb = hexToRgb(hex);
    if (!rgb) return hex;
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
};
