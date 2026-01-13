import type { MilitaryHierarchy } from '../../../../api/militaryHierarchyApi';
import type { UnitType } from './constants';

export const addUnitToHierarchy = (
  hierarchy: MilitaryHierarchy,
  type: UnitType,
  name: string,
  keys: { pikudKey?: string; ugdaKey?: string; hativaKey?: string }
): MilitaryHierarchy => {
  const newHierarchy = { ...hierarchy };
  const { pikudKey, ugdaKey, hativaKey } = keys;

  if (type === 'pikud') {
    newHierarchy[name] = { name, ugdot: {} };
  } else if (type === 'ugda' && pikudKey) {
    newHierarchy[pikudKey] = {
      ...newHierarchy[pikudKey],
      ugdot: {
        ...newHierarchy[pikudKey].ugdot,
        [name]: { name, hativot: {} },
      },
    };
  } else if (type === 'hativa' && pikudKey && ugdaKey) {
    newHierarchy[pikudKey] = {
      ...newHierarchy[pikudKey],
      ugdot: {
        ...newHierarchy[pikudKey].ugdot,
        [ugdaKey]: {
          ...newHierarchy[pikudKey].ugdot[ugdaKey],
          hativot: {
            ...newHierarchy[pikudKey].ugdot[ugdaKey].hativot,
            [name]: { name, gdudim: {} },
          },
        },
      },
    };
  } else if (type === 'gdud' && pikudKey && ugdaKey && hativaKey) {
    newHierarchy[pikudKey] = {
      ...newHierarchy[pikudKey],
      ugdot: {
        ...newHierarchy[pikudKey].ugdot,
        [ugdaKey]: {
          ...newHierarchy[pikudKey].ugdot[ugdaKey],
          hativot: {
            ...newHierarchy[pikudKey].ugdot[ugdaKey].hativot,
            [hativaKey]: {
              ...newHierarchy[pikudKey].ugdot[ugdaKey].hativot[hativaKey],
              gdudim: {
                ...newHierarchy[pikudKey].ugdot[ugdaKey].hativot[hativaKey].gdudim,
                [name]: { name },
              },
            },
          },
        },
      },
    };
  }
  return newHierarchy;
};

export const deleteUnitFromHierarchy = (
  hierarchy: MilitaryHierarchy,
  type: UnitType,
  keys: { pikudKey: string; ugdaKey?: string; hativaKey?: string; gdudKey?: string }
): MilitaryHierarchy => {
  const newHierarchy = { ...hierarchy };
  const { pikudKey, ugdaKey, hativaKey, gdudKey } = keys;

  if (type === 'pikud') {
    delete newHierarchy[pikudKey];
  } else if (type === 'ugda' && ugdaKey) {
    const newUgdot = { ...newHierarchy[pikudKey].ugdot };
    delete newUgdot[ugdaKey];
    newHierarchy[pikudKey] = { ...newHierarchy[pikudKey], ugdot: newUgdot };
  } else if (type === 'hativa' && ugdaKey && hativaKey) {
    const newHativot = { ...newHierarchy[pikudKey].ugdot[ugdaKey].hativot };
    delete newHativot[hativaKey];
    newHierarchy[pikudKey] = {
      ...newHierarchy[pikudKey],
      ugdot: {
        ...newHierarchy[pikudKey].ugdot,
        [ugdaKey]: { ...newHierarchy[pikudKey].ugdot[ugdaKey], hativot: newHativot },
      },
    };
  } else if (type === 'gdud' && ugdaKey && hativaKey && gdudKey) {
    const newGdudim = { ...newHierarchy[pikudKey].ugdot[ugdaKey].hativot[hativaKey].gdudim };
    delete newGdudim[gdudKey];
    newHierarchy[pikudKey] = {
      ...newHierarchy[pikudKey],
      ugdot: {
        ...newHierarchy[pikudKey].ugdot,
        [ugdaKey]: {
          ...newHierarchy[pikudKey].ugdot[ugdaKey],
          hativot: {
            ...newHierarchy[pikudKey].ugdot[ugdaKey].hativot,
            [hativaKey]: { ...newHierarchy[pikudKey].ugdot[ugdaKey].hativot[hativaKey], gdudim: newGdudim },
          },
        },
      },
    };
  }
  return newHierarchy;
};

/**
 * Check if a unit with the given name already exists at the specified level.
 * Each level is checked independently (e.g., ugda "98" can exist even if hativa "98" exists).
 */
export const checkUnitExists = (
  hierarchy: MilitaryHierarchy,
  type: UnitType,
  name: string,
  keys: { pikudKey?: string; ugdaKey?: string; hativaKey?: string }
): boolean => {
  const { pikudKey, ugdaKey, hativaKey } = keys;

  if (type === 'pikud') {
    // Check if pikud with this name already exists
    return name in hierarchy;
  } else if (type === 'ugda' && pikudKey && hierarchy[pikudKey]) {
    // Check if ugda with this name exists under the specific pikud
    return name in hierarchy[pikudKey].ugdot;
  } else if (type === 'hativa' && pikudKey && ugdaKey && hierarchy[pikudKey]?.ugdot[ugdaKey]) {
    // Check if hativa with this name exists under the specific ugda
    return name in hierarchy[pikudKey].ugdot[ugdaKey].hativot;
  } else if (type === 'gdud' && pikudKey && ugdaKey && hativaKey && hierarchy[pikudKey]?.ugdot[ugdaKey]?.hativot[hativaKey]) {
    // Check if gdud with this name exists under the specific hativa
    return name in hierarchy[pikudKey].ugdot[ugdaKey].hativot[hativaKey].gdudim;
  }

  return false;
};
