const API_BASE = (import.meta as any).env?.VITE_API_BASE || 'http://localhost:8080/api/v1/langgraph';
const API_ROOT = (import.meta as any).env?.VITE_API_ROOT || API_BASE.replace(/\/langgraph$/, '');

async function handle(res: Response) {
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Request failed ${res.status}: ${text}`);
  }
  return res.json();
}

export async function importWorkbook(file: File, workbookId?: string): Promise<{ workbook_id: string; sheets: string[] }> {
  const form = new FormData();
  form.append('file', file);
  if (workbookId) form.append('workbook_id', workbookId);

  const res = await fetch(`${API_ROOT}/workbook/import`, {
    method: 'POST',
    body: form,
  });
  const json = await handle(res);
  return json.data;
}

export async function getWorkbook(workbookId: string): Promise<{ workbook_id: string; sheets: Array<{ Name: string; Cells: Record<string, { Value: any; Formula?: string }> }> }> {
  const res = await fetch(`${API_ROOT}/workbook/${encodeURIComponent(workbookId)}`);
  const json = await handle(res);
  return json.data;
}


