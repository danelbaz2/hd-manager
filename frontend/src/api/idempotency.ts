/**
 * Idempotency Utilities - Prevent duplicate API requests.
 * 
 * Generates unique idempotency keys for mutations and tracks
 * in-flight requests to prevent duplicates.
 */

// Track in-flight requests by idempotency key
const inFlightRequests: Map<string, Promise<unknown>> = new Map();

// Track recently completed requests (for deduplication window)
const completedRequests: Map<string, { result: unknown; timestamp: number }> = new Map();

// Deduplication window in milliseconds (5 seconds)
const DEDUP_WINDOW_MS = 5000;

/**
 * Generate a unique idempotency key.
 * Combines a random UUID with timestamp for uniqueness.
 */
export function generateIdempotencyKey(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 15);
  return `${timestamp}-${random}`;
}

/**
 * Generate an idempotency key for a specific action.
 * Useful for creating deterministic keys based on action parameters.
 * 
 * @param action - Action type (e.g., 'createTask', 'updateUser')
 * @param params - Unique parameters for the action
 */
export function generateActionKey(action: string, ...params: (string | number)[]): string {
  const paramsHash = params.join(':');
  const timestamp = Date.now().toString(36);
  return `${action}:${paramsHash}:${timestamp}`;
}

/**
 * Execute a request with idempotency protection.
 * 
 * Features:
 * - Prevents duplicate in-flight requests with same key
 * - Returns cached result if request was recently completed
 * - Automatically cleans up completed request cache
 * 
 * @param key - Idempotency key
 * @param requestFn - The request function to execute
 */
export async function withIdempotency<T>(
  key: string,
  requestFn: () => Promise<T>
): Promise<T> {
  // Check if request is already in flight
  const inFlight = inFlightRequests.get(key);
  if (inFlight) {
    return inFlight as Promise<T>;
  }
  
  // Check if request was recently completed
  const completed = completedRequests.get(key);
  if (completed && Date.now() - completed.timestamp < DEDUP_WINDOW_MS) {
    return completed.result as T;
  }
  
  // Execute the request
  const promise = requestFn();
  inFlightRequests.set(key, promise);
  
  try {
    const result = await promise;
    
    // Cache the result
    completedRequests.set(key, { result, timestamp: Date.now() });
    
    // Schedule cleanup
    setTimeout(() => {
      completedRequests.delete(key);
    }, DEDUP_WINDOW_MS);
    
    return result;
  } finally {
    inFlightRequests.delete(key);
  }
}

/**
 * Check if a request with the given key is currently in flight.
 */
export function isRequestInFlight(key: string): boolean {
  return inFlightRequests.has(key);
}

/**
 * Clear all tracked requests (useful for testing or logout).
 */
export function clearIdempotencyCache(): void {
  inFlightRequests.clear();
  completedRequests.clear();
}
