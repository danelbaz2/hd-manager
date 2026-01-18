// ==============================================
// Runtime Configuration
// ==============================================
// These values are injected at container startup via /config.js
// They can be configured via docker-compose environment variables
// and will take effect WITHOUT rebuilding the Docker image.
//
// Priority: runtime config (__RUNTIME_CONFIG__) > Vite env > default value

// Define the runtime config interface
interface RuntimeConfig {
    SYSTEM_NAME?: string;
    API_URL?: string;
    API_MAX_RETRIES?: number;
    API_RETRY_DELAY?: number;
    SOCKET_TIMEOUT?: number;
    IDLE_TIMEOUT?: number;
    SERVICENOW_URL?: string;
    MARS_URL?: string;
}

// Extend Window interface to include runtime config
declare global {
    interface Window {
        __RUNTIME_CONFIG__?: RuntimeConfig;
    }
}

/**
 * Get a runtime configuration string value with fallbacks
 * Priority: runtime config (from /config.js) > Vite env > default value
 */
function getRuntimeString(
    key: keyof RuntimeConfig, 
    viteEnvValue: string | undefined, 
    defaultValue: string
): string {
    // Check runtime config first (from /config.js)
    if (window.__RUNTIME_CONFIG__?.[key] !== undefined) {
        return String(window.__RUNTIME_CONFIG__[key]);
    }
    // Fall back to Vite env (build time)
    if (viteEnvValue) {
        return viteEnvValue;
    }
    // Fall back to default
    return defaultValue;
}

/**
 * Get a runtime configuration number value with fallbacks
 * Priority: runtime config (from /config.js) > Vite env > default value
 */
function getRuntimeNumber(
    key: keyof RuntimeConfig, 
    viteEnvValue: string | undefined, 
    defaultValue: number
): number {
    // Check runtime config first (from /config.js)
    if (window.__RUNTIME_CONFIG__?.[key] !== undefined) {
        const value = window.__RUNTIME_CONFIG__[key];
        return typeof value === 'number' ? value : Number(value);
    }
    // Fall back to Vite env (build time)
    if (viteEnvValue) {
        return Number(viteEnvValue);
    }
    // Fall back to default
    return defaultValue;
}

// ==============================================
// Application Configuration
// ==============================================

/**
 * Application name displayed in the UI
 * Configure via: SYSTEM_NAME environment variable
 */
export function getSystemName(): string {
    return getRuntimeString(
        'SYSTEM_NAME',
        import.meta.env.VITE_SYSTEM_NAME,
        'Flow Task'
    );
}

/**
 * Backend API base URL
 * Configure via: API_URL environment variable
 */
export function getApiUrl(): string {
    return getRuntimeString(
        'API_URL',
        import.meta.env.VITE_API_URL,
        '/api'
    );
}

/**
 * Maximum number of API retry attempts
 * Configure via: API_MAX_RETRIES environment variable
 */
export function getApiMaxRetries(): number {
    return getRuntimeNumber(
        'API_MAX_RETRIES',
        import.meta.env.VITE_API_MAX_RETRIES,
        2
    );
}

/**
 * Delay between API retry attempts (ms)
 * Configure via: API_RETRY_DELAY environment variable
 */
export function getApiRetryDelay(): number {
    return getRuntimeNumber(
        'API_RETRY_DELAY',
        import.meta.env.VITE_API_RETRY_DELAY,
        500
    );
}

/**
 * Socket connection timeout (ms)
 * Configure via: SOCKET_TIMEOUT environment variable
 */
export function getSocketTimeout(): number {
    return getRuntimeNumber(
        'SOCKET_TIMEOUT',
        import.meta.env.VITE_SOCKET_TIMEOUT,
        10000
    );
}

/**
 * User inactivity timeout for socket disconnect (ms)
 * Configure via: IDLE_TIMEOUT environment variable
 */
export function getIdleTimeout(): number {
    return getRuntimeNumber(
        'IDLE_TIMEOUT',
        import.meta.env.VITE_IDLE_TIMEOUT,
        300000
    );
}

// ==============================================
// External System URLs
// ==============================================

/**
 * ServiceNow base URL
 * Configure via: SERVICENOW_URL environment variable
 */
export function getServiceNowUrl(): string {
    return getRuntimeString(
        'SERVICENOW_URL',
        undefined,
        'https://servicenow.com'
    );
}

/**
 * MARS system base URL
 * Configure via: MARS_URL environment variable
 */
export function getMarsUrl(): string {
    return getRuntimeString(
        'MARS_URL',
        undefined,
        'https://mars-system.com'
    );
}

/**
 * Construct the full ServiceNow incident URL
 * @param incidentNumber - The incident number (e.g., "INC0012345")
 */
export function getServiceNowIncidentUrl(incidentNumber: string): string {
    return `${getServiceNowUrl()}/nav_to.do?uri=incident.do?sysparm_query=number=${incidentNumber}`;
}

/**
 * Construct the full MARS item URL
 * @param itemId - The MARS item ID
 */
export function getMarsItemUrl(itemId: string): string {
    return `${getMarsUrl()}/item?id=${itemId}`;
}
