import { API_ROOT, handleApiResponse, fetchWithRetry } from './config';
import type { ApiResponse, SheetResponse, SheetsListResponse } from '../../types/api';

export async function listSheets(workbookId: string): Promise<string[]> {
  const url = `${API_ROOT}/sheet/list/${encodeURIComponent(workbookId)}`;
  const response = await fetchWithRetry<ApiResponse<SheetsListResponse>>(url);
  return response.data.sheets;
}

export async function getSheet(workbookId: string, sheetName: string): Promise<SheetResponse> {
  const url = `${API_ROOT}/sheet/get/${encodeURIComponent(workbookId)}/${encodeURIComponent(sheetName)}`;
  const response = await fetchWithRetry<ApiResponse<{ sheet: SheetResponse }>>(url);
  return response.data.sheet;
}

export async function addSheet(workbookId: string, name: string): Promise<string> {
  const url = `${API_ROOT}/sheet/${encodeURIComponent(workbookId)}`;
  const response = await fetchWithRetry<ApiResponse<{ name: string }>>(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });
  return response.data.name;
}

export async function deleteSheet(workbookId: string, sheetName: string): Promise<void> {
  const url = `${API_ROOT}/sheet/${encodeURIComponent(workbookId)}/${encodeURIComponent(sheetName)}`;
  await fetchWithRetry(url, {
    method: 'DELETE',
  });
}

