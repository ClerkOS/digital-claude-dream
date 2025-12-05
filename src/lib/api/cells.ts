import { API_ROOT, fetchWithRetry } from './config';
import type { ApiResponse, CellResponse, BatchSetCellsResponse } from '../../types/api';

export async function getCell(workbookId: string, sheetName: string, address: string): Promise<CellResponse> {
  const url = `${API_ROOT}/cell/${encodeURIComponent(workbookId)}/${encodeURIComponent(sheetName)}/${encodeURIComponent(address)}`;
  const response = await fetchWithRetry<ApiResponse<{ cell: CellResponse }>>(url);
  return response.data.cell;
}

export async function setCell(workbookId: string, sheetName: string, address: string, value?: any, formula?: string): Promise<CellResponse> {
  const url = `${API_ROOT}/cell/${encodeURIComponent(workbookId)}`;
  const response = await fetchWithRetry<ApiResponse<{ cell: CellResponse }>>(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sheet: sheetName, address, value, formula }),
  });
  return response.data.cell;
}

export async function batchSetCells(workbookId: string, sheetName: string, edits: Array<{ address: string; value?: any; formula?: string }>): Promise<CellResponse[]> {
  const url = `${API_ROOT}/cell/batch/${encodeURIComponent(workbookId)}`;
  const response = await fetchWithRetry<ApiResponse<BatchSetCellsResponse>>(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sheet: sheetName, edits }),
  });
  return response.data.edits;
}

