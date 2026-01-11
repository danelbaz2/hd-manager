/**
 * Military Hierarchy API
 * 
 * Provides functions to fetch and update the military organizational hierarchy.
 */
import { API_BASE_URL, apiRequest, type ApiResponse } from './apiConfig';

export interface GdudData {
  name: string;
}

export interface HativaData {
  name: string;
  gdudim: Record<string, GdudData>;
}

export interface UgdaData {
  name: string;
  hativot: Record<string, HativaData>;
}

export interface PikudData {
  name: string;
  ugdot: Record<string, UgdaData>;
}

export type MilitaryHierarchy = Record<string, PikudData>;

export interface MilitaryHierarchyResponse {
  hierarchy: MilitaryHierarchy;
}

/**
 * Fetch the military hierarchy from the server
 */
export async function getMilitaryHierarchy(): Promise<ApiResponse<MilitaryHierarchyResponse>> {
  return apiRequest<MilitaryHierarchyResponse>(`${API_BASE_URL}/military-hierarchy`);
}

/**
 * Update the military hierarchy (Admin only)
 */
export async function updateMilitaryHierarchy(
  hierarchy: MilitaryHierarchy
): Promise<ApiResponse<MilitaryHierarchyResponse>> {
  return apiRequest<MilitaryHierarchyResponse>(`${API_BASE_URL}/military-hierarchy`, {
    method: 'PUT',
    body: JSON.stringify({ hierarchy }),
  });
}
