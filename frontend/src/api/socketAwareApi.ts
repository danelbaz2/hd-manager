/**
 * Socket-Aware API - Ensures socket is connected before mutations.
 * 
 * This module wraps API calls that need real-time updates to work
 * correctly. It ensures the socket is connected before making
 * mutations so that the user receives the broadcast update.
 */

import { socketManager } from '../socket/socketManager';
import { withIdempotency, generateIdempotencyKey } from './idempotency';

/**
 * Executes a mutation with non-blocking socket reconnection.
 * 
 * The mutation executes immediately via HTTP - it doesn't wait for socket.
 * If disconnected, the socket reconnects in the background so subsequent
 * real-time broadcasts will work.
 * 
 * This approach ensures:
 * - User actions are instant (no perceived delay)
 * - HTTP mutations always work (don't depend on socket)
 * - Socket catches up for future real-time updates
 * 
 * @param mutationFn - The mutation function to execute
 * @returns The result of the mutation
 */
export async function withSocketConnection<T>(
  mutationFn: () => Promise<T>
): Promise<T> {
  // Start socket reconnection in background (non-blocking)
  if (!socketManager.isConnected) {
    // Fire-and-forget: reconnect without waiting
    socketManager.connect();
    console.debug('[API] Socket reconnecting in background');
  }
  
  // Execute mutation immediately - HTTP doesn't need socket
  return mutationFn();
}

/**
 * Wraps a mutation with both idempotency protection and socket connection.
 * This is the recommended way to execute mutations that should:
 * 1. Not be duplicated
 * 2. Trigger real-time updates
 * 
 * @param idempotencyKey - Unique key for this request
 * @param mutationFn - The mutation function to execute
 */
export async function safeMutation<T>(
  idempotencyKey: string,
  mutationFn: () => Promise<T>
): Promise<T> {
  return withIdempotency(idempotencyKey, async () => {
    return withSocketConnection(mutationFn);
  });
}

/**
 * Creates a safe mutation wrapper with auto-generated idempotency key.
 * 
 * @param action - Action name for key generation
 * @param mutationFn - The mutation function to execute
 */
export async function safeMutationAuto<T>(
  action: string,
  mutationFn: () => Promise<T>
): Promise<T> {
  const key = `${action}:${generateIdempotencyKey()}`;
  return safeMutation(key, mutationFn);
}
