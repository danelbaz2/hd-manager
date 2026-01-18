// API infrastructure - main exports
// Re-export everything with proper naming for path aliases

// API client and configuration
export {
  API_BASE_URL,
  API_ENDPOINTS,
  getApiBaseUrl,
  getApiEndpoints,
  apiRequest,
  type ApiResponse,
} from '@api/apiConfig';

// Idempotency utilities
export {
  generateIdempotencyKey,
  clearIdempotencyKey,
} from '@api/idempotency';

// Socket-aware API utilities  
export {
  safeMutation,
  safeMutationAuto,
} from '@api/socketAwareApi';

// Query client and keys
export {
  queryClient,
  queryKeys,
} from '@api/queryClient';
