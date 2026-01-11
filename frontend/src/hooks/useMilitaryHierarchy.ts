/**
 * useMilitaryHierarchy Hook
 * 
 * Provides auto-complete functionality for military unit fields.
 * Fetches hierarchy data from the API and provides handlers for field changes.
 * 
 * Auto-completes parent fields ONLY when user explicitly selects an option
 * (click or Enter), not while typing.
 * 
 * When selecting a higher level, clears all lower levels.
 */
import { useCallback, useMemo } from 'react';
import type { TaskOptionals } from '../schemas/taskTypes';
import { useMilitaryHierarchyQuery } from '../api/queries/militaryHierarchyQueries';
import {
  findByUgda,
  findByHativa,
  findByGdud,
  getAllPikudim,
  getAllUgdot,
  getAllHativot,
  getAllGdudim,
} from '../utils/militaryHierarchyUtils';

interface UseMilitaryHierarchyProps {
  optionals: TaskOptionals;
  setOptionals: (value: TaskOptionals) => void;
}

interface UseMilitaryHierarchyReturn {
  // Input change handlers - just update the field value (no auto-complete)
  handlePikudInputChange: (value: string) => void;
  handleUgdaInputChange: (value: string) => void;
  handleHativaInputChange: (value: string) => void;
  handleGdudInputChange: (value: string) => void;
  
  // Selection handlers - update field AND auto-complete parents
  handlePikudSelect: (value: string) => void;
  handleUgdaSelect: (value: string) => void;
  handleHativaSelect: (value: string) => void;
  handleGdudSelect: (value: string) => void;
  
  /** Options for each field dropdown */
  suggestions: {
    pikud: string[];
    ugda: string[];
    hativa: string[];
    gdud: string[];
  };
  
  /** Loading state from API */
  isLoading: boolean;
}

export function useMilitaryHierarchy({
  optionals,
  setOptionals,
}: UseMilitaryHierarchyProps): UseMilitaryHierarchyReturn {
  

  // Fetch hierarchy from API
  const { data: hierarchy = {}, isLoading } = useMilitaryHierarchyQuery();
  
  // ========================================
  // Input Change Handlers (typing - no auto-complete)
  // ========================================
  
  const handlePikudInputChange = useCallback((value: string) => {
    setOptionals({ ...optionals, pikud: value });
  }, [optionals, setOptionals]);

  const handleUgdaInputChange = useCallback((value: string) => {
    setOptionals({ ...optionals, ugda: value });
  }, [optionals, setOptionals]);

  const handleHativaInputChange = useCallback((value: string) => {
    setOptionals({ ...optionals, hativa: value });
  }, [optionals, setOptionals]);

  const handleGdudInputChange = useCallback((value: string) => {
    setOptionals({ ...optionals, gdud: value });
  }, [optionals, setOptionals]);

  // ========================================
  // Selection Handlers (click/Enter - with auto-complete)
  // When selecting a higher level, clear all lower levels
  // When selecting a lower level, auto-fill all parent levels
  // ========================================
  
  // Pikud select - top level, CLEARS all lower levels
  const handlePikudSelect = useCallback((value: string) => {
    setOptionals({
      ...optionals,
      pikud: value,
      ugda: '',    // Clear lower levels
      hativa: '',
      gdud: '',
    });
  }, [optionals, setOptionals]);

  // Ugda select - auto-fill Pikud, CLEARS Hativa and Gdud
  const handleUgdaSelect = useCallback((value: string) => {
    const result = findByUgda(hierarchy, value);
    if (result) {
      setOptionals({
        ...optionals,
        ugda: value,
        pikud: result.pikud || optionals.pikud,
        hativa: '',  // Clear lower levels
        gdud: '',
      });
    } else {
      setOptionals({
        ...optionals,
        ugda: value,
        hativa: '',  // Clear lower levels even if not found
        gdud: '',
      });
    }
  }, [hierarchy, optionals, setOptionals]);

  // Hativa select - auto-fill Pikud and Ugda, CLEARS Gdud
  const handleHativaSelect = useCallback((value: string) => {
    const result = findByHativa(hierarchy, value);
    if (result) {
      setOptionals({
        ...optionals,
        hativa: value,
        ugda: result.ugda || optionals.ugda,
        pikud: result.pikud || optionals.pikud,
        gdud: '',  // Clear lower level
      });
    } else {
      setOptionals({
        ...optionals,
        hativa: value,
        gdud: '',  // Clear lower level even if not found
      });
    }
  }, [hierarchy, optionals, setOptionals]);

  // Gdud select - auto-fill all parents (lowest level, nothing to clear)
  const handleGdudSelect = useCallback((value: string) => {
    const result = findByGdud(hierarchy, value);
    if (result) {
      setOptionals({
        ...optionals,
        gdud: value,
        hativa: result.hativa || optionals.hativa,
        ugda: result.ugda || optionals.ugda,
        pikud: result.pikud || optionals.pikud,
      });
    } else {
      setOptionals({ ...optionals, gdud: value });
    }
  }, [hierarchy, optionals, setOptionals]);

  // ========================================
  // Suggestions for dropdowns
  // ========================================
  const suggestions = useMemo(() => ({
    pikud: getAllPikudim(hierarchy),
    ugda: getAllUgdot(hierarchy),
    hativa: getAllHativot(hierarchy),
    gdud: getAllGdudim(hierarchy),
  }), [hierarchy]);

  return {
    // Input changes (typing)
    handlePikudInputChange,
    handleUgdaInputChange,
    handleHativaInputChange,
    handleGdudInputChange,
    // Selections (click/Enter)
    handlePikudSelect,
    handleUgdaSelect,
    handleHativaSelect,
    handleGdudSelect,
    // Options
    suggestions,
    // Loading state
    isLoading,
  };
}
