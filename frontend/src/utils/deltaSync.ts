/**
 * Delta Sync Utility
 * Tracks the last sync timestamp and provides utilities for incremental data sync.
 * 
 * Instead of fetching ALL data on WebSocket reconnect, delta sync only fetches
 * data that has changed since the last successful sync.
 */

// Storage key for persisting last sync timestamp across page reloads
const LAST_SYNC_KEY = 'hd_last_sync_timestamp';

/**
 * Get the last successful sync timestamp
 * @returns The timestamp in milliseconds, or null if never synced
 */
export const getLastSyncTimestamp = (): number | null => {
  const stored = sessionStorage.getItem(LAST_SYNC_KEY);
  if (stored) {
    const timestamp = parseInt(stored, 10);
    if (!isNaN(timestamp)) {
      return timestamp;
    }
  }
  return null;
};

/**
 * Update the last sync timestamp to now
 */
export const updateLastSyncTimestamp = (): void => {
  const now = Date.now();
  sessionStorage.setItem(LAST_SYNC_KEY, now.toString());
};

/**
 * Clear the last sync timestamp (forces full refresh)
 */
export const clearLastSyncTimestamp = (): void => {
  sessionStorage.removeItem(LAST_SYNC_KEY);
};

/**
 * Check if we should do a full sync (first time or too old)
 * @param maxAge Maximum age in milliseconds before forcing full sync (default: 1 hour)
 * @returns true if full sync is needed, false if delta sync is sufficient
 */
export const shouldDoFullSync = (maxAge: number = 60 * 60 * 1000): boolean => {
  const lastSync = getLastSyncTimestamp();
  if (!lastSync) {
    return true; // Never synced, need full sync
  }
  
  const age = Date.now() - lastSync;
  return age > maxAge; // Too old, need full sync
};

/**
 * Get params for delta sync API call
 * @returns { since: number } if delta sync is possible, or undefined for full sync
 */
export const getDeltaSyncParams = (): { since: number } | undefined => {
  if (shouldDoFullSync()) {
    return undefined; // Full sync
  }
  
  const lastSync = getLastSyncTimestamp();
  if (lastSync) {
    return { since: lastSync };
  }
  
  return undefined;
};

/**
 * Merge updated items into existing array
 * Items with matching IDs are replaced, new items are appended
 * 
 * @param existing The existing array of items
 * @param updates The updated/new items from delta sync
 * @param idField The field name to use as unique identifier (default: 'id')
 * @returns The merged array
 */
export const mergeItems = <T extends { id: string }>(
  existing: T[],
  updates: T[],
  _idField: keyof T = 'id' as keyof T
): T[] => {
  if (!updates.length) {
    return existing;
  }
  
  // Create a map for efficient lookup using 'id' field
  const updateMap = new Map(updates.map(item => [item.id, item]));
  
  // Update existing items
  const merged = existing.map(item => {
    const updated = updateMap.get(item.id);
    if (updated) {
      updateMap.delete(item.id); // Remove from map to track new items
      return updated;
    }
    return item;
  });
  
  // Append any new items
  return [...merged, ...updateMap.values()];
};

export default {
  getLastSyncTimestamp,
  updateLastSyncTimestamp,
  clearLastSyncTimestamp,
  shouldDoFullSync,
  getDeltaSyncParams,
  mergeItems,
};
