import { useState, useEffect, useCallback, useMemo } from 'react';
import { useMilitaryHierarchyQuery, useApplyHierarchyOperationsMutation } from '../../../../../api/queries/militaryHierarchyQueries';
import type { MilitaryHierarchy } from '../../../../../api/militaryHierarchyApi';
import { useToast } from '../../../../alert-feedback';
import type { UnitType } from '../constants';
import { checkUnitExists } from '../utils';
import { UNIT_LABELS } from '../constants';

interface PendingOperation {
  type: 'create' | 'delete';
  unitType: UnitType;
  name?: string;
  parentKeys: {
    pikudKey?: string;
    ugdaKey?: string;
    hativaKey?: string;
  };
}

export const useManageHierarchy = () => {
  const { data: hierarchy = {}, isLoading, isError, error } = useMilitaryHierarchyQuery();
  const operationsMutation = useApplyHierarchyOperationsMutation();
  const { showSuccess, showError, alerts, dismissAlert } = useToast();

  const [originalHierarchy, setOriginalHierarchy] = useState<MilitaryHierarchy>(hierarchy);
  const [editedHierarchy, setEditedHierarchy] = useState<MilitaryHierarchy>(hierarchy);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [newUnits, setNewUnits] = useState<Set<string>>(new Set());
  const [hasChanges, setHasChanges] = useState(false);
  const [pendingOperations, setPendingOperations] = useState<PendingOperation[]>([]);
  
  // Search State
  const [searchQuery, setSearchQuery] = useState('');

  // Modal States
  const [addModal, setAddModal] = useState<{
    isOpen: boolean;
    type: UnitType;
    pikudKey?: string;
    ugdaKey?: string;
    hativaKey?: string;
  }>({ isOpen: false, type: 'pikud' });

  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    type: UnitType;
    name: string;
    pikudKey: string;
    ugdaKey?: string;
    hativaKey?: string;
    gdudKey?: string;
  }>({ isOpen: false, type: 'pikud', name: '', pikudKey: '' });

  // Sync with fetched data
  useEffect(() => {
    if (!isLoading && hierarchy) {
      setOriginalHierarchy(hierarchy);
      setEditedHierarchy(hierarchy);
    }
  }, [hierarchy, isLoading]);

  // Stats
  const stats = useMemo(() => {
    let ugdot = 0, hativot = 0, gdudim = 0;
    if (editedHierarchy) {
      Object.values(editedHierarchy).forEach(pikud => {
        ugdot += Object.keys(pikud.ugdot).length;
        Object.values(pikud.ugdot).forEach(ugda => {
          hativot += Object.keys(ugda.hativot).length;
          Object.values(ugda.hativot).forEach(hativa => {
            gdudim += Object.keys(hativa.gdudim).length;
          });
        });
      });
    }
    return { pikudim: Object.keys(editedHierarchy || {}).length, ugdot, hativot, gdudim };
  }, [editedHierarchy]);

  // Search Results
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) {
      return { matchingUnits: new Set<string>(), nodesToExpand: new Set<string>(), count: 0 };
    }

    const query = searchQuery.trim().toLowerCase();
    const matchingUnits = new Set<string>();
    const nodesToExpand = new Set<string>();

    const matches = (key: string, prefix: string) => {
      const keyLower = key.toLowerCase();
      const displayText = `${prefix} ${key}`.toLowerCase();
      return keyLower.includes(query) || displayText.includes(query);
    };

    Object.entries(editedHierarchy).forEach(([pikudKey, pikudData]) => {
      const pikudMatches = matches(pikudKey, 'פיקוד');
      let pikudHasMatchingChild = false;

      Object.entries(pikudData.ugdot).forEach(([ugdaKey, ugdaData]) => {
        const ugdaMatches = matches(ugdaKey, 'אוגדה');
        let ugdaHasMatchingChild = false;

        Object.entries(ugdaData.hativot).forEach(([hativaKey, hativaData]) => {
          const hativaMatches = matches(hativaKey, 'חטיבה');
          let hativaHasMatchingChild = false;

          Object.keys(hativaData.gdudim).forEach(gdudKey => {
            const gdudMatches = matches(gdudKey, 'גדוד');
            if (gdudMatches) {
              matchingUnits.add(`gdud-${pikudKey}-${ugdaKey}-${hativaKey}-${gdudKey}`);
              hativaHasMatchingChild = true;
            }
          });

          if (hativaMatches || hativaHasMatchingChild) {
            if (hativaMatches) matchingUnits.add(`hativa-${pikudKey}-${ugdaKey}-${hativaKey}`);
            nodesToExpand.add(`hativa-${pikudKey}-${ugdaKey}-${hativaKey}`);
            ugdaHasMatchingChild = true;
          }
        });

        if (ugdaMatches || ugdaHasMatchingChild) {
          if (ugdaMatches) matchingUnits.add(`ugda-${pikudKey}-${ugdaKey}`);
          nodesToExpand.add(`ugda-${pikudKey}-${ugdaKey}`);
          pikudHasMatchingChild = true;
        }
      });

      if (pikudMatches || pikudHasMatchingChild) {
        if (pikudMatches) matchingUnits.add(`pikud-${pikudKey}`);
        nodesToExpand.add(`pikud-${pikudKey}`);
      }
    });

    return { matchingUnits, nodesToExpand, count: matchingUnits.size };
  }, [editedHierarchy, searchQuery]);

  // Auto-expand when searching
  useEffect(() => {
    if (searchQuery.trim() && searchResults.nodesToExpand.size > 0) {
      setExpandedNodes(searchResults.nodesToExpand);
    }
  }, [searchQuery, searchResults.nodesToExpand]);

  // Calculate total expandable nodes
  const totalExpandableNodes = useMemo(() => {
    let count = 0;
    Object.keys(editedHierarchy).forEach(pikudKey => {
      count++;
      Object.keys(editedHierarchy[pikudKey].ugdot).forEach(ugdaKey => {
        count++;
        Object.keys(editedHierarchy[pikudKey].ugdot[ugdaKey].hativot).forEach(() => {
          count++;
        });
      });
    });
    return count;
  }, [editedHierarchy]);

  // Calculate expand/collapse state
  const isAllExpanded = totalExpandableNodes > 0 && expandedNodes.size === totalExpandableNodes;
  const isAllCollapsed = expandedNodes.size === 0;

  // Helper to calculate all node IDs
  const getAllNodeIds = useCallback(() => {
    const allNodes = new Set<string>();
    Object.keys(editedHierarchy).forEach(pikudKey => {
      allNodes.add(`pikud-${pikudKey}`);
      Object.keys(editedHierarchy[pikudKey].ugdot).forEach(ugdaKey => {
        allNodes.add(`ugda-${pikudKey}-${ugdaKey}`);
        Object.keys(editedHierarchy[pikudKey].ugdot[ugdaKey].hativot).forEach(hativaKey => {
          allNodes.add(`hativa-${pikudKey}-${ugdaKey}-${hativaKey}`);
        });
      });
    });
    return allNodes;
  }, [editedHierarchy]);

  // Expansion Logic
  const toggleNode = useCallback((nodeId: string) => {
    setExpandedNodes(prev => {
      const next = new Set(prev);
      if (next.has(nodeId)) next.delete(nodeId);
      else next.add(nodeId);
      return next;
    });
  }, []);

  const expandAll = useCallback(() => {
    setExpandedNodes(getAllNodeIds());
  }, [getAllNodeIds]);

  const collapseAll = useCallback(() => {
    setExpandedNodes(new Set());
  }, []);

  // Save/Cancel
  const handleSave = async () => {
    try {
      if (pendingOperations.length === 0) {
        showError('שגיאה', 'אין שינויים לשמור');
        return;
      }

      // Execute all pending operations
      for (const operation of pendingOperations) {
        if (operation.type === 'create') {
          await operationsMutation.mutateAsync({
            unitType: operation.unitType,
            action: 'create',
            name: operation.name!,
            parentKeys: operation.parentKeys
          });
        } else if (operation.type === 'delete') {
          await operationsMutation.mutateAsync({
            unitType: operation.unitType,
            action: 'delete',
            name: operation.name!,
            parentKeys: operation.parentKeys
          });
        }
      }

      // Update state after all operations succeed
      setOriginalHierarchy(editedHierarchy);
      setHasChanges(false);
      setNewUnits(new Set());
      setPendingOperations([]);
      showSuccess('נשמר', 'העץ ציוות עודכנה בהצלחה');
    } catch (err) {
      console.error('Error saving:', err);
      showError('שגיאה', 'שגיאה בשמירת העץ ציוות');
    }
  };

  const handleCancel = () => {
    setEditedHierarchy(originalHierarchy);
    setHasChanges(false);
    setNewUnits(new Set());
    setPendingOperations([]);
  };

  // CRUD Handlers
  const handleCreateUnit = (name: string) => {
    const { type, pikudKey, ugdaKey, hativaKey } = addModal;
    
    // Check if unit with this name already exists at the same level
    const exists = checkUnitExists(editedHierarchy, type, name, { pikudKey, ugdaKey, hativaKey });
    if (exists) {
      const unitLabel = UNIT_LABELS[type];
      showError('שגיאה', `${unitLabel} בשם "${name}" כבר קיים`);
      return;
    }
    
    try {
      // Update editedHierarchy optimistically
      const newHierarchy = { ...editedHierarchy };
      
      if (type === 'pikud') {
        newHierarchy[name] = {
          name,
          ugdot: {}
        };
      } else if (type === 'ugda' && pikudKey) {
        newHierarchy[pikudKey].ugdot[name] = {
          name,
          hativot: {}
        };
      } else if (type === 'hativa' && pikudKey && ugdaKey) {
        newHierarchy[pikudKey].ugdot[ugdaKey].hativot[name] = {
          name,
          gdudim: {}
        };
      } else if (type === 'gdud' && pikudKey && ugdaKey && hativaKey) {
        newHierarchy[pikudKey].ugdot[ugdaKey].hativot[hativaKey].gdudim[name] = {
          name
        };
      }
      
      setEditedHierarchy(newHierarchy);

      // Add to pending operations
      setPendingOperations(prev => [...prev, {
        type: 'create',
        unitType: type,
        name,
        parentKeys: { pikudKey, ugdaKey, hativaKey }
      }]);

      // Track this as a new unsaved unit
      let unitId = '';
      if (type === 'pikud') {
        unitId = `pikud-${name}`;
      } else if (type === 'ugda' && pikudKey) {
        unitId = `ugda-${pikudKey}-${name}`;
      } else if (type === 'hativa' && pikudKey && ugdaKey) {
        unitId = `hativa-${pikudKey}-${ugdaKey}-${name}`;
      } else if (type === 'gdud' && pikudKey && ugdaKey && hativaKey) {
        unitId = `gdud-${pikudKey}-${ugdaKey}-${hativaKey}-${name}`;
      }
      if (unitId) {
        setNewUnits(prev => new Set(prev).add(unitId));
      }
      
      // Auto expand parent node
      if (type === 'ugda' && pikudKey) {
        setExpandedNodes(prev => new Set(prev).add(`pikud-${pikudKey}`));
      } else if (type === 'hativa' && pikudKey && ugdaKey) {
        setExpandedNodes(prev => new Set(prev).add(`ugda-${pikudKey}-${ugdaKey}`));
      } else if (type === 'gdud' && pikudKey && ugdaKey && hativaKey) {
        setExpandedNodes(prev => new Set(prev).add(`hativa-${pikudKey}-${ugdaKey}-${hativaKey}`));
      }

      setHasChanges(true);
      setAddModal(prev => ({ ...prev, isOpen: false }));
    } catch (err) {
      console.error('Error creating unit:', err);
      showError('שגיאה', 'שגיאה ביצירת היחידה');
    }
  };

  const handleDeleteUnit = () => {
    const { type, pikudKey, ugdaKey, hativaKey, gdudKey, name } = deleteModal;
    
    try {
      // Update editedHierarchy optimistically
      const newHierarchy = { ...editedHierarchy };
      
      if (type === 'pikud' && pikudKey) {
        delete newHierarchy[pikudKey];
      } else if (type === 'ugda' && pikudKey && ugdaKey) {
        delete newHierarchy[pikudKey].ugdot[ugdaKey];
      } else if (type === 'hativa' && pikudKey && ugdaKey && hativaKey) {
        delete newHierarchy[pikudKey].ugdot[ugdaKey].hativot[hativaKey];
      } else if (type === 'gdud' && pikudKey && ugdaKey && hativaKey && gdudKey) {
        delete newHierarchy[pikudKey].ugdot[ugdaKey].hativot[hativaKey].gdudim[gdudKey];
      }
      
      setEditedHierarchy(newHierarchy);

      // Add to pending operations
      setPendingOperations(prev => [...prev, {
        type: 'delete',
        unitType: type,
        name,
        parentKeys: { pikudKey, ugdaKey, hativaKey }
      }]);

      setHasChanges(true);
      setDeleteModal(prev => ({ ...prev, isOpen: false }));
    } catch (err) {
      console.error('Error deleting unit:', err);
      showError('שגיאה', 'שגיאה במחיקת היחידה');
    }
  };

  return {
    editedHierarchy,
    expandedNodes,
    newUnits,
    hasChanges,
    isLoading,
    isError,
    error,
    stats,
    addModal,
    deleteModal,
    isSaving: operationsMutation.isPending,
    isAllExpanded,
    isAllCollapsed,
    
    // Search
    searchQuery,
    setSearchQuery,
    searchResults,
    
    // Toast
    alerts,
    dismissAlert,

    setAddModal,
    setDeleteModal,
    toggleNode,
    expandAll,
    collapseAll,
    handleSave,
    handleCancel,
    handleCreateUnit,
    handleDeleteUnit
  };
};
