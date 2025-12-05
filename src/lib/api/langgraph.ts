import { API_ROOT, fetchWithRetry } from './config';
import type { ApiResponse } from '../../types/api';

export interface AgentExecutionResponse {
  agent_goal: string;
  execution_status: 'success' | 'failed';
  steps: Array<{
    step_index: number;
    op: string;
    status: 'success' | 'failed';
    version?: number;
    diff?: any;
    error?: string;
  }>;
  final_version: number;
  schema: {
    columns: string[];
    types?: Record<string, string>;
    row_count?: number;
  };
}

/**
 * Execute an agent request on a session
 * The agent processes the natural language request and executes transformations
 */
export async function executeAgent(
  sessionId: string,
  userRequest: string
): Promise<AgentExecutionResponse> {
  const url = `${API_ROOT}/execute/agent/${encodeURIComponent(sessionId)}`;
  const response = await fetchWithRetry<AgentExecutionResponse>(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ request: userRequest }),
  });
  return response;
}
