/**
 * Issues API
 * Handles issue detection and resolution
 */

import { getApiUrl, handleApiResponse, fetchWithRetry } from './config';
import type {
  IssueResponse,
  IssueDetailsResponse,
  IssuesListResponse,
  ApiResponse,
} from '../../types/api';

/**
 * Get all issues for a workbook
 */
export async function getIssues(workbookId: string): Promise<IssueResponse[]> {
  const url = getApiUrl(`issues/${encodeURIComponent(workbookId)}`);
  const response = await fetchWithRetry<ApiResponse<IssuesListResponse>>(url);
  return response.data.issues;
}

/**
 * Get details for a specific issue
 */
export async function getIssueDetails(
  workbookId: string,
  issueId: string
): Promise<IssueDetailsResponse> {
  const url = getApiUrl(`issues/${encodeURIComponent(workbookId)}/${encodeURIComponent(issueId)}`);
  const response = await fetchWithRetry<ApiResponse<IssueDetailsResponse>>(url);
  return response.data;
}

/**
 * Resolve an issue
 */
export async function resolveIssue(
  workbookId: string,
  issueId: string
): Promise<IssueResponse> {
  const url = getApiUrl(`issues/${encodeURIComponent(workbookId)}/${encodeURIComponent(issueId)}/resolve`);
  const response = await fetchWithRetry<ApiResponse<IssueResponse>>(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  return response.data;
}

