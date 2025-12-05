/**
 * Rules API
 * Handles all CRUD operations for rules
 */

import { getApiUrl, handleApiResponse, fetchWithRetry } from './config';
import type {
  CreateRuleRequest,
  UpdateRuleRequest,
  RuleResponse,
  RulesListResponse,
  ApiResponse,
} from '../../types/api';

/**
 * Get all rules for a workbook
 */
export async function getRules(workbookId: string): Promise<RuleResponse[]> {
  const url = getApiUrl(`rules/${encodeURIComponent(workbookId)}`);
  const response = await fetchWithRetry<ApiResponse<RulesListResponse>>(url);
  return response.data.rules;
}

/**
 * Create a new rule
 */
export async function createRule(
  workbookId: string,
  rule: CreateRuleRequest
): Promise<RuleResponse> {
  const url = getApiUrl(`rules/${encodeURIComponent(workbookId)}`);
  const response = await fetchWithRetry<ApiResponse<RuleResponse>>(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(rule),
  });
  return response.data;
}

/**
 * Update an existing rule
 */
export async function updateRule(
  workbookId: string,
  ruleId: string,
  updates: UpdateRuleRequest
): Promise<RuleResponse> {
  const url = getApiUrl(`rules/${encodeURIComponent(workbookId)}/${encodeURIComponent(ruleId)}`);
  const response = await fetchWithRetry<ApiResponse<RuleResponse>>(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  });
  return response.data;
}

/**
 * Delete a rule
 */
export async function deleteRule(
  workbookId: string,
  ruleId: string
): Promise<void> {
  const url = getApiUrl(`rules/${encodeURIComponent(workbookId)}/${encodeURIComponent(ruleId)}`);
  await fetchWithRetry(url, {
    method: 'DELETE',
  });
}

/**
 * Toggle rule active status
 */
export async function toggleRuleActive(
  workbookId: string,
  ruleId: string,
  isActive: boolean
): Promise<RuleResponse> {
  const url = getApiUrl(`rules/${encodeURIComponent(workbookId)}/${encodeURIComponent(ruleId)}/active`);
  const response = await fetchWithRetry<ApiResponse<RuleResponse>>(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ isActive }),
  });
  return response.data;
}

