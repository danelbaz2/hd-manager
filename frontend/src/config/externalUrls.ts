// Runtime configuration helper
// These values can be overridden at container startup via /config.js

// Define the runtime config interface
interface RuntimeConfig {
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
 * Get a runtime configuration value with fallback to default
 * Priority: runtime config (from /config.js) > default value
 */
function getRuntimeConfig(key: keyof RuntimeConfig, defaultValue: string): string {
    // Check runtime config first (from /config.js)
    if (window.__RUNTIME_CONFIG__?.[key]) {
        return window.__RUNTIME_CONFIG__[key];
    }

    // Fall back to default
    return defaultValue;
}

// External system URLs - configurable at runtime for disconnected deployments
export const EXTERNAL_URLS = {
    /**
     * ServiceNow base URL
     * Configure via docker-compose environment: SERVICENOW_URL
     */
    SERVICENOW: getRuntimeConfig('SERVICENOW_URL', 'https://servicenow.com'),

    /**
     * MARS system base URL
     * Configure via docker-compose environment: MARS_URL
     */
    MARS: getRuntimeConfig('MARS_URL', 'https://mars-system.com'),
} as const;

/**
 * Construct the full ServiceNow incident URL
 * @param incidentNumber - The incident number (e.g., "INC0012345")
 */
export function getServiceNowIncidentUrl(incidentNumber: string): string {
    return `${EXTERNAL_URLS.SERVICENOW}/nav_to.do?uri=incident.do?sysparm_query=number=${incidentNumber}`;
}

/**
 * Construct the full MARS item URL
 * @param itemId - The MARS item ID
 */
export function getMarsItemUrl(itemId: string): string {
    return `${EXTERNAL_URLS.MARS}/item?id=${itemId}`;
}
