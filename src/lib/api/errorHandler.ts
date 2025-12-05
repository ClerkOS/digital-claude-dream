/**
 * Centralized API Error Handling
 * Provides consistent error handling, retry logic, and user-friendly error messages
 */

import type { ApiError } from '../../types/api';

export interface RetryOptions {
  maxRetries?: number;
  retryDelay?: number;
  retryableStatusCodes?: number[];
  exponentialBackoff?: boolean;
}

const DEFAULT_RETRY_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  retryDelay: 1000, // 1 second
  retryableStatusCodes: [408, 429, 500, 502, 503, 504],
  exponentialBackoff: true,
};

/**
 * Custom error class for API errors
 */
export class ApiErrorException extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code?: string,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'ApiErrorException';
  }
}

/**
 * Parse error response from API
 */
async function parseErrorResponse(response: Response): Promise<ApiError> {
  try {
    const data = await response.json();
    return {
      message: data.message || data.error || `Request failed with status ${response.status}`,
      code: data.code,
      details: data.details,
      statusCode: response.status,
    };
  } catch {
    // If response is not JSON, return generic error
    return {
      message: `Request failed with status ${response.status}`,
      statusCode: response.status,
    };
  }
}

/**
 * Get user-friendly error message
 */
export function getUserFriendlyErrorMessage(error: ApiError | Error): string {
  if (error instanceof ApiErrorException) {
    const { statusCode, message } = error;
    
    // Network errors
    if (statusCode === 0 || message.includes('Failed to fetch')) {
      return 'Unable to connect to the server. Please check your internet connection.';
    }
    
    // Client errors
    if (statusCode >= 400 && statusCode < 500) {
      if (statusCode === 401) {
        return 'You are not authorized to perform this action.';
      }
      if (statusCode === 403) {
        return 'You do not have permission to access this resource.';
      }
      if (statusCode === 404) {
        return 'The requested resource was not found.';
      }
      if (statusCode === 409) {
        return 'This action conflicts with the current state.';
      }
      if (statusCode === 422) {
        return message || 'The request data is invalid.';
      }
      return message || 'Invalid request. Please check your input.';
    }
    
    // Server errors
    if (statusCode >= 500) {
      return 'Server error occurred. Please try again later.';
    }
  }
  
  // Generic error
  return error.message || 'An unexpected error occurred.';
}

/**
 * Check if error is retryable
 */
function isRetryableError(
  statusCode: number,
  retryableStatusCodes: number[]
): boolean {
  return retryableStatusCodes.includes(statusCode);
}

/**
 * Calculate delay for retry with exponential backoff
 */
function calculateRetryDelay(
  attempt: number,
  baseDelay: number,
  exponentialBackoff: boolean
): number {
  if (!exponentialBackoff) {
    return baseDelay;
  }
  return baseDelay * Math.pow(2, attempt);
}

/**
 * Sleep utility
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Handle API response with error parsing
 */
export async function handleApiResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await parseErrorResponse(response);
    throw new ApiErrorException(
      error.message,
      error.statusCode || response.status,
      error.code,
      error.details
    );
  }
  
  try {
    return await response.json();
  } catch {
    // If response is empty or not JSON, return empty object
    return {} as T;
  }
}

/**
 * Fetch with retry logic
 */
export async function fetchWithRetry<T>(
  url: string,
  options: RequestInit = {},
  retryOptions: RetryOptions = {}
): Promise<T> {
  const config = { ...DEFAULT_RETRY_OPTIONS, ...retryOptions };
  let lastError: ApiErrorException | null = null;
  
  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      const response = await fetch(url, options);
      
      // If successful, return parsed response
      if (response.ok) {
        return await handleApiResponse<T>(response);
      }
      
      // Parse error
      const error = await parseErrorResponse(response);
      lastError = new ApiErrorException(
        error.message,
        error.statusCode || response.status,
        error.code,
        error.details
      );
      
      // Check if retryable
      const shouldRetry =
        attempt < config.maxRetries &&
        isRetryableError(
          lastError.statusCode,
          config.retryableStatusCodes
        );
      
      if (!shouldRetry) {
        throw lastError;
      }
      
      // Wait before retrying
      const delay = calculateRetryDelay(
        attempt,
        config.retryDelay,
        config.exponentialBackoff
      );
      await sleep(delay);
      
    } catch (error) {
      // Network errors are always retryable
      if (error instanceof TypeError && error.message.includes('fetch')) {
        if (attempt < config.maxRetries) {
          const delay = calculateRetryDelay(
            attempt,
            config.retryDelay,
            config.exponentialBackoff
          );
          await sleep(delay);
          continue;
        }
      }
      
      // Re-throw if not retryable or max retries reached
      throw error;
    }
  }
  
  // Should never reach here, but TypeScript needs it
  throw lastError || new ApiErrorException('Request failed after retries', 0);
}

/**
 * Check if device is online
 */
export function isOnline(): boolean {
  return typeof navigator !== 'undefined' && navigator.onLine;
}

/**
 * Queue for offline requests (future enhancement)
 */
export class OfflineQueue {
  private queue: Array<() => Promise<void>> = [];
  
  add(request: () => Promise<void>): void {
    this.queue.push(request);
  }
  
  async process(): Promise<void> {
    if (!isOnline()) {
      return;
    }
    
    const requests = [...this.queue];
    this.queue = [];
    
    for (const request of requests) {
      try {
        await request();
      } catch (error) {
        // Re-queue failed requests
        this.queue.push(request);
        throw error;
      }
    }
  }
  
  clear(): void {
    this.queue = [];
  }
  
  get length(): number {
    return this.queue.length;
  }
}

