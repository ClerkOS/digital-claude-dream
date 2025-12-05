/**
 * Health Metrics API
 * Handles data health metrics retrieval
 */

import { getApiUrl, handleApiResponse, fetchWithRetry } from './config';
import type {
  HealthMetricsResponse,
  ApiResponse,
} from '../../types/api';

/**
 * Get data health metrics for a workbook
 */
export async function getDataHealth(workbookId: string): Promise<HealthMetricsResponse> {
  const url = getApiUrl(`health/${encodeURIComponent(workbookId)}`);
  const response = await fetchWithRetry<ApiResponse<HealthMetricsResponse>>(url);
  return response.data;
}

