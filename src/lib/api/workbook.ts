import { API_ROOT, fetchWithRetry } from './config';
import type { ApiResponse, WorkbookResponse, ImportWorkbookResponse } from '../../types/api';
import { createSession, type SessionResponse } from './sessions';

/**
 * Import a workbook by creating a session (file upload)
 * This maps to the sessions endpoint in the backend
 * 
 * @param file - The file to upload (CSV or Excel)
 * @param workbookId - Optional workbook ID (ignored, sessions don't use this - sessions are created fresh)
 * @returns ImportWorkbookResponse with session_id mapped to workbook_id
 */
export async function importWorkbook(file: File, workbookId?: string): Promise<ImportWorkbookResponse> {
  // Use sessions endpoint instead of workbook/import
  const sessionResponse = await createSession(file);
  
  // Map session response to ImportWorkbookResponse format for backward compatibility
  // Sessions work with single DataFrame, so we return a single "Sheet1" entry
  return {
    workbook_id: sessionResponse.session_id, // Map session_id to workbook_id
    sheets: ['Sheet1'], // Sessions have a single data sheet
  };
}

export async function getWorkbook(workbookId: string): Promise<WorkbookResponse> {
  const url = `${API_ROOT}/workbook/${encodeURIComponent(workbookId)}`;
  const response = await fetchWithRetry<ApiResponse<WorkbookResponse>>(url);
  return response.data;
}

export async function createWorkbook(): Promise<{ workbook_id: string }> {
  const url = `${API_ROOT}/workbook/create`;
  const response = await fetchWithRetry<ApiResponse<{ workbook_id: string }>>(url, {
    method: 'POST',
  });
  return response.data;
}
