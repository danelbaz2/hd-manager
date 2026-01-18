/**
 * Delta Sync Utility
 * Tracks the last sync timestamp and provides utilities for incremental data sync.
 */

const LAST_SYNC_KEY = 'hd_last_sync_timestamp';

/**
 * Get the last successful sync timestamp
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
 */
export const shouldDoFullSync = (maxAge: number = 60 * 60 * 1000): boolean => {
  const lastSync = getLastSyncTimestamp();
  if (!lastSync) {
    return true;
  }
  
  const age = Date.now() - lastSync;
  return age > maxAge;
};

/**
 * Get params for delta sync API call
 */
export const getDeltaSyncParams = (): { since: number } | undefined => {
  if (shouldDoFullSync()) {
    return undefined;
  }
  
  const lastSync = getLastSyncTimestamp();
  if (lastSync) {
    return { since: lastSync };
  }
  
  return undefined;
};

/**
 * Merge updated items into existing array
 */
export const mergeItems = <T extends { id: string }>(
  existing: T[],
  updates: T[],
  _idField: keyof T = 'id' as keyof T
): T[] => {
  if (!updates.length) {
    return existing;
  }
  
  const updateMap = new Map(updates.map(item => [item.id, item]));
  
  const merged = existing.map(item => {
    const updated = updateMap.get(item.id);
    if (updated) {
      updateMap.delete(item.id);
      return updated;
    }
    return item;
  });
  
  return [...merged, ...updateMap.values()];
};
