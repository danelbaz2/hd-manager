/**
 * Military Hierarchy Configuration
 * 
 * This file defines the organizational hierarchy for auto-completing
 * military unit fields in the task form.
 * 
 * Hierarchy (top to bottom):
 *   Pikud (פיקוד) → Ugda (אוגדה) → Hativa (חטיבה) → Gdud (גדוד)
 * 
 * When a user enters a lower-level unit, the parent levels are auto-filled.
 * 
 * TODO: Replace this dummy data with real organizational data.
 */

// Type definitions for the hierarchy
export interface GdudData {
  name: string;
  // Future: you can add more fields like description, code, etc.
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

/**
 * ===========================================
 * DUMMY DATA - REPLACE WITH REAL DATA LATER
 * ===========================================
 * 
 * Structure:
 * {
 *   "pikud_key": {
 *     name: "פיקוד Display Name",
 *     ugdot: {
 *       "ugda_key": {
 *         name: "אוגדה Display Name",
 *         hativot: {
 *           "hativa_key": {
 *             name: "חטיבה Display Name",
 *             gdudim: {
 *               "gdud_key": { name: "גדוד Display Name" }
 *             }
 *           }
 *         }
 *       }
 *     }
 *   }
 * }
 */
export const MILITARY_HIERARCHY: MilitaryHierarchy = {
  // Pikud Merkaz (מרכז)
  "מרכז": {
    name: "מרכז",
    ugdot: {
      "98": {
        name: "98",
        hativot: {
          "7": {
            name: "7",
            gdudim: {
              "71": { name: "71" },
              "72": { name: "72" },
              "73": { name: "73" },
            }
          },
          "35": {
            name: "35",
            gdudim: {
              "351": { name: "351" },
              "352": { name: "352" },
            }
          }
        }
      },
      "162": {
        name: "162",
        hativot: {
          "401": {
            name: "401",
            gdudim: {
              "46": { name: "46" },
              "47": { name: "47" },
            }
          }
        }
      }
    }
  },

  // Pikud Tzafon (צפון)
  "צפון": {
    name: "צפון",
    ugdot: {
      "91": {
        name: "91",
        hativot: {
          "1": {
            name: "1",
            gdudim: {
              "12": { name: "12" },
              "13": { name: "13" },
            }
          },
          "188": {
            name: "188",
            gdudim: {
              "53": { name: "53" },
              "54": { name: "54" },
            }
          }
        }
      },
      "36": {
        name: "36",
        hativot: {
          "933": {
            name: "933",
            gdudim: {
              "101": { name: "101" },
              "102": { name: "102" },
            }
          }
        }
      }
    }
  },

  // Pikud Darom (דרום)
  "דרום": {
    name: "דרום",
    ugdot: {
      "80": {
        name: "80",
        hativot: {
          "84": {
            name: "84",
            gdudim: {
              "931": { name: "931" },
              "932": { name: "932" },
            }
          }
        }
      }
    }
  }
};

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
 * Returns the Pikud, Ugda, Hativa, and Gdud that match
 */
export function findByGdud(gdudKey: string): HierarchyLookupResult | null {
  for (const [, pikudData] of Object.entries(MILITARY_HIERARCHY)) {
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
 * Returns the Pikud, Ugda, and Hativa that match
 */
export function findByHativa(hativaKey: string): HierarchyLookupResult | null {
  for (const [, pikudData] of Object.entries(MILITARY_HIERARCHY)) {
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
 * Returns the Pikud and Ugda that match
 */
export function findByUgda(ugdaKey: string): HierarchyLookupResult | null {
  for (const [, pikudData] of Object.entries(MILITARY_HIERARCHY)) {
    if (ugdaKey in pikudData.ugdot) {
      return {
        pikud: pikudData.name,
        ugda: pikudData.ugdot[ugdaKey].name,
      };
    }
  }
  return null;
}

/**
 * Find the Pikud (פיקוד) by key
 */
export function findByPikud(pikudKey: string): HierarchyLookupResult | null {
  if (pikudKey in MILITARY_HIERARCHY) {
    return {
      pikud: MILITARY_HIERARCHY[pikudKey].name,
    };
  }
  return null;
}

// ===========================================
// Get all values for autocomplete suggestions
// ===========================================

/**
 * Get all Pikud options for autocomplete
 */
export function getAllPikudim(): string[] {
  return Object.keys(MILITARY_HIERARCHY);
}

/**
 * Get all Ugda options for autocomplete
 */
export function getAllUgdot(): string[] {
  const ugdot: string[] = [];
  for (const pikudData of Object.values(MILITARY_HIERARCHY)) {
    ugdot.push(...Object.keys(pikudData.ugdot));
  }
  return ugdot;
}

/**
 * Get all Hativa options for autocomplete
 */
export function getAllHativot(): string[] {
  const hativot: string[] = [];
  for (const pikudData of Object.values(MILITARY_HIERARCHY)) {
    for (const ugdaData of Object.values(pikudData.ugdot)) {
      hativot.push(...Object.keys(ugdaData.hativot));
    }
  }
  return hativot;
}

/**
 * Get all Gdud options for autocomplete
 */
export function getAllGdudim(): string[] {
  const gdudim: string[] = [];
  for (const pikudData of Object.values(MILITARY_HIERARCHY)) {
    for (const ugdaData of Object.values(pikudData.ugdot)) {
      for (const hativaData of Object.values(ugdaData.hativot)) {
        gdudim.push(...Object.keys(hativaData.gdudim));
      }
    }
  }
  return gdudim;
}
