/**
 * Sessions API
 * Handles session creation (file upload) and retrieval
 * Sessions are the backend abstraction for workbooks/data processing
 */

import { API_ROOT, fetchWithRetry } from './config';
import type { ApiResponse } from '../types/api';

export interface CreateSessionRequest {
  file: File;
}

export interface SessionResponse {
  session_id: string;
  schema: {
    columns: Array<{
      name: string;
      dtype: string;
    }>;
    row_count: number;
  };
  version: number;
  auto_analysis?: {
    issues_found: number;
    issues: Array<{
      type: string;
      severity: string;
      description: string;
      [key: string]: any;
    }>;
    recommended_rules: Array<{
      op: string;
      params: any;
      reason: string;
      priority: number;
    }>;
    rules_applied: number;
    applied_transformations: Array<any>;
  };
}

export interface GetSessionResponse extends SessionResponse {
  history: Array<{
    step: any;
    before: any;
    after: any;
    diff: any;
  }>;
}

/**
 * Create a new session by uploading a file (CSV or Excel)
 */
export async function createSession(
  file: File,
  autoApplyRules: boolean = false
): Promise<SessionResponse> {
  const form = new FormData();
  form.append('file', file);

  const url = `${API_ROOT}/sessions/?auto_apply_rules=${autoApplyRules}`;
  const response = await fetchWithRetry<SessionResponse>(url, {
    method: 'POST',
    body: form,
    // Don't set Content-Type header, browser will set it with boundary for FormData
  });
  
  return response;
}

/**
 * Get session information including schema and history
 */
export async function getSession(sessionId: string): Promise<GetSessionResponse> {
  const url = `${API_ROOT}/sessions/${encodeURIComponent(sessionId)}`;
  const response = await fetchWithRetry<GetSessionResponse>(url);
  
  // Handle error response from backend
  if ('error' in response) {
    throw new Error((response as any).error || 'Session not found');
  }
  
  return response;
}

