/**
 * Military Hierarchy Utilities
 * 
 * Utility functions for working with military hierarchy data.
 * These work with data from any source (static or API).
 */

import type { MilitaryHierarchy } from '../api/militaryHierarchyApi';

// ===========================================
// Lookup Utilities - Find parent in hierarchy
// ===========================================

interface HierarchyLookupResult {
  pikud?: string;
  ugda?: string;
  hativa?: string;
  gdud?: string;
}

/**
 * Find the full hierarchy path for a given Gdud (גדוד)
 */
export function findByGdud(hierarchy: MilitaryHierarchy, gdudKey: string): HierarchyLookupResult | null {
  for (const [, pikudData] of Object.entries(hierarchy)) {
    for (const [, ugdaData] of Object.entries(pikudData.ugdot)) {
      for (const [, hativaData] of Object.entries(ugdaData.hativot)) {
        if (gdudKey in hativaData.gdudim) {
          return {
            pikud: pikudData.name,
            ugda: ugdaData.name,
            hativa: hativaData.name,
            gdud: hativaData.gdudim[gdudKey].name,
          };
        }
      }
    }
  }
  return null;
}

/**
 * Find the full hierarchy path for a given Hativa (חטיבה)
 */
export function findByHativa(hierarchy: MilitaryHierarchy, hativaKey: string): HierarchyLookupResult | null {
  for (const [, pikudData] of Object.entries(hierarchy)) {
    for (const [, ugdaData] of Object.entries(pikudData.ugdot)) {
      if (hativaKey in ugdaData.hativot) {
        return {
          pikud: pikudData.name,
          ugda: ugdaData.name,
          hativa: ugdaData.hativot[hativaKey].name,
        };
      }
    }
  }
  return null;
}

/**
 * Find the full hierarchy path for a given Ugda (אוגדה)
 */
export function findByUgda(hierarchy: MilitaryHierarchy, ugdaKey: string): HierarchyLookupResult | null {
  for (const [, pikudData] of Object.entries(hierarchy)) {
    if (ugdaKey in pikudData.ugdot) {
      return {
        pikud: pikudData.name,
        ugda: pikudData.ugdot[ugdaKey].name,
      };
    }
  }
  return null;
}

// ===========================================
// Get all values for autocomplete suggestions
// ===========================================

/**
 * Get all Pikud options for autocomplete
 */
export function getAllPikudim(hierarchy: MilitaryHierarchy): string[] {
  return Object.keys(hierarchy);
}

/**
 * Get all Ugda options for autocomplete
 */
export function getAllUgdot(hierarchy: MilitaryHierarchy): string[] {
  const ugdot: string[] = [];
  for (const pikudData of Object.values(hierarchy)) {
    ugdot.push(...Object.keys(pikudData.ugdot));
  }
  return ugdot;
}

/**
 * Get all Hativa options for autocomplete
 */
export function getAllHativot(hierarchy: MilitaryHierarchy): string[] {
  const hativot: string[] = [];
  for (const pikudData of Object.values(hierarchy)) {
    for (const ugdaData of Object.values(pikudData.ugdot)) {
      hativot.push(...Object.keys(ugdaData.hativot));
    }
  }
  return hativot;
}

/**
 * Get all Gdud options for autocomplete
 */
export function getAllGdudim(hierarchy: MilitaryHierarchy): string[] {
  const gdudim: string[] = [];
  for (const pikudData of Object.values(hierarchy)) {
    for (const ugdaData of Object.values(pikudData.ugdot)) {
      for (const hativaData of Object.values(ugdaData.hativot)) {
        gdudim.push(...Object.keys(hativaData.gdudim));
      }
    }
  }
  return gdudim;
}
