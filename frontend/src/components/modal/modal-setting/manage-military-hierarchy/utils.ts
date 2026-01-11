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
