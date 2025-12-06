/**
 * Shared API configuration
 * Centralizes API base URLs and configuration for all API modules
 */

// Backend API base URL (FastAPI runs on port 8000 by default)
// Can be overridden via VITE_API_ROOT environment variable
export const API_ROOT = import.meta.env.VITE_API_ROOT || 'http://localhost:8000';
export const API_BASE = import.meta.env.VITE_API_BASE || `${API_ROOT}/langgraph`;

/**
 * Get the full API URL for a given endpoint
 * @param endpoint - API endpoint path (e.g., '/rules/{workbookId}')
 * @returns Full URL
 */
export function getApiUrl(endpoint: string): string {
  // Remove leading slash if present
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${API_ROOT}/${cleanEndpoint}`;
}

/**
 * Get the LangGraph API URL for a given endpoint
 * @param endpoint - LangGraph endpoint path
 * @returns Full URL
 */
export function getLangGraphUrl(endpoint: string): string {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
  return `${API_BASE}/${cleanEndpoint}`;
}

// Re-export error handling utilities for convenience
export { handleApiResponse, fetchWithRetry } from './errorHandler';

