/**
 * Profile Image Utilities
 * Handles profile image URL resolution and compression for upload
 */

import { API_BASE_URL } from "../api/apiConfig";

/**
 * Get the full URL for a profile image.
 * Handles various formats: relative paths, full URLs, base64 data URIs
 * 
 * @param profileImage - The profile image path/URL from the API
 * @returns Full URL to the image or null if no image
 */
export const getProfileImageUrl = (profileImage: string | null | undefined): string | null => {
  if (!profileImage) return null;
  
  // Already a full URL (http/https)
  if (profileImage.startsWith('http://') || profileImage.startsWith('https://')) {
    return profileImage;
  }
  
  // Base64 data URI - return as-is
  if (profileImage.startsWith('data:image/')) {
    return profileImage;
  }
  
  // Already has /api/uploads/ prefix (from backend serialization)
  if (profileImage.startsWith('/api/uploads/')) {
    // Extract base URL without /api suffix and append the path
    const baseUrl = API_BASE_URL.replace(/\/api$/, '');
    return `${baseUrl}${profileImage}`;
  }
  
  // Relative path like "profiles/eden.png" - construct full URL
  // API_BASE_URL is like "http://localhost:5000/api", so we add "/uploads/"
  return `${API_BASE_URL}/uploads/${profileImage}`;
};

/**
 * Check if a string is a base64 encoded image
 */
export const isBase64Image = (value: string | null | undefined): boolean => {
  if (!value) return false;
  return value.startsWith('data:image/');
};

/**
 * Get initials from a name (first letter)
 */
export const getInitials = (name: string): string => {
  if (!name) return '?';
  return name.charAt(0).toUpperCase();
};
