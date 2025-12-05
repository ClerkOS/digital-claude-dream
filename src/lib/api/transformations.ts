/**
 * Transformations API
 * Handles rule execution, preview, and undo/redo operations
 */

import { getApiUrl, handleApiResponse, fetchWithRetry } from './config';
import type {
  PreviewRuleRequest,
  TransformationPreviewResponse,
  ExecuteRuleRequest,
  TransformationStatusResponse,
  TransformationHistoryResponse,
  TransformationActionResponse,
  ApiResponse,
} from '../../types/api';

/**
 * Preview a rule transformation before applying
 */
export async function previewRule(
  workbookId: string,
  request: PreviewRuleRequest
): Promise<TransformationPreviewResponse> {
  const url = getApiUrl(`rules/${encodeURIComponent(workbookId)}/preview`);
  const response = await fetchWithRetry<ApiResponse<TransformationPreviewResponse>>(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  return response.data;
}

/**
 * Execute a rule transformation
 */
export async function executeRule(
  workbookId: string,
  ruleId: string,
  request: ExecuteRuleRequest = {}
): Promise<TransformationStatusResponse> {
  const url = getApiUrl(`rules/${encodeURIComponent(workbookId)}/${encodeURIComponent(ruleId)}/execute`);
  const response = await fetchWithRetry<ApiResponse<TransformationStatusResponse>>(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  });
  return response.data;
}

/**
 * Get transformation status
 */
export async function getTransformationStatus(
  workbookId: string,
  transformationId: string
): Promise<TransformationStatusResponse> {
  const url = getApiUrl(`transformations/${encodeURIComponent(workbookId)}/${encodeURIComponent(transformationId)}`);
  const response = await fetchWithRetry<ApiResponse<TransformationStatusResponse>>(url);
  return response.data;
}

/**
 * Get transformation history for a workbook
 */
export async function getTransformationHistory(
  workbookId: string
): Promise<TransformationActionResponse[]> {
  const url = getApiUrl(`transformations/${encodeURIComponent(workbookId)}/history`);
  const response = await fetchWithRetry<ApiResponse<TransformationHistoryResponse>>(url);
  return response.data.actions;
}

/**
 * Undo a transformation
 */
export async function undoTransformation(
  workbookId: string,
  transformationId: string
): Promise<TransformationStatusResponse> {
  const url = getApiUrl(`transformations/${encodeURIComponent(workbookId)}/${encodeURIComponent(transformationId)}/undo`);
  const response = await fetchWithRetry<ApiResponse<TransformationStatusResponse>>(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  return response.data;
}

/**
 * Poll transformation status until completion
 * Useful for long-running transformations
 */
export async function pollTransformationStatus(
  workbookId: string,
  transformationId: string,
  options: {
    interval?: number; // Polling interval in ms (default: 1000)
    timeout?: number; // Timeout in ms (default: 60000)
    onProgress?: (status: TransformationStatusResponse) => void;
  } = {}
): Promise<TransformationStatusResponse> {
  const { interval = 1000, timeout = 60000, onProgress } = options;
  const startTime = Date.now();
  
  while (true) {
    const status = await getTransformationStatus(workbookId, transformationId);
    
    if (onProgress) {
      onProgress(status);
    }
    
    if (status.status === 'completed' || status.status === 'failed') {
      return status;
    }
    
    // Check timeout
    if (Date.now() - startTime > timeout) {
      throw new Error('Transformation polling timeout');
    }
    
    // Wait before next poll
    await new Promise(resolve => setTimeout(resolve, interval));
  }
}

