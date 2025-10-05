const API_BASE = (import.meta as any).env?.VITE_API_BASE || 'http://localhost:8080/api/v1/langgraph';
const API_ROOT = (import.meta as any).env?.VITE_API_ROOT || API_BASE.replace(/\/langgraph$/, '');

async function handle<T = any>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Request failed ${res.status}: ${text}`);
  }
  return res.json();
}

export async function getCell(workbookId: string, sheetName: string, address: string): Promise<{ Address: string; Value: any; Formula?: string }> {
  const res = await fetch(`${API_ROOT}/cell/${encodeURIComponent(workbookId)}/${encodeURIComponent(sheetName)}/${encodeURIComponent(address)}`);
  const json = await handle<{ data: { cell: { Address: string; Value: any; Formula?: string } } }>(res);
  return json.data.cell;
}

export async function setCell(workbookId: string, sheetName: string, address: string, value?: any, formula?: string): Promise<{ Address: string; Value: any; Formula?: string }> {
  const res = await fetch(`${API_ROOT}/cell/${encodeURIComponent(workbookId)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sheet: sheetName, address, value, formula }),
  });
  const json = await handle<{ data: { cell: { Address: string; Value: any; Formula?: string } } }>(res);
  return json.data.cell;
}

export async function batchSetCells(workbookId: string, sheetName: string, edits: Array<{ address: string; value?: any; formula?: string }>): Promise<Array<{ Address: string; Value: any; Formula?: string }>> {
  const res = await fetch(`${API_ROOT}/cell/batch/${encodeURIComponent(workbookId)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sheet: sheetName, edits }),
  });
  const json = await handle<{ data: { edits: Array<{ Address: string; Value: any; Formula?: string }> } }>(res);
  return json.data.edits;
}

