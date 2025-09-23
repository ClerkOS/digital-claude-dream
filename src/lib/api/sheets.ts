const API_BASE = (import.meta as any).env?.VITE_API_BASE || 'http://localhost:8080/api/v1/langgraph';
const API_ROOT = (import.meta as any).env?.VITE_API_ROOT || API_BASE.replace(/\/langgraph$/, '');

async function handle<T = any>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Request failed ${res.status}: ${text}`);
  }
  return res.json();
}

export async function listSheets(workbookId: string): Promise<string[]> {
  const res = await fetch(`${API_ROOT}/sheet/list/${encodeURIComponent(workbookId)}`);
  const json = await handle<{ data: { sheets: string[] } }>(res);
  return json.data.sheets;
}

export async function getSheet(workbookId: string, sheetName: string): Promise<{ Name: string; Cells: Record<string, { Value: any; Formula?: string }> }> {
  const res = await fetch(`${API_ROOT}/sheet/get/${encodeURIComponent(workbookId)}/${encodeURIComponent(sheetName)}`);
  const json = await handle<{ data: { sheet: { Name: string; Cells: Record<string, { Value: any; Formula?: string }> } } }>(res);
  return json.data.sheet;
}

export async function addSheet(workbookId: string, name: string): Promise<string> {
  const res = await fetch(`${API_ROOT}/sheet/${encodeURIComponent(workbookId)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });
  const json = await handle<{ data: { name: string } }>(res);
  return json.data.name;
}

export async function deleteSheet(workbookId: string, sheetName: string): Promise<void> {
  const res = await fetch(`${API_ROOT}/sheet/${encodeURIComponent(workbookId)}/${encodeURIComponent(sheetName)}`, {
    method: 'DELETE',
  });
  await handle(res);
}


