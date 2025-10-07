export interface SuccessResponse<T> {
  message: string;
  data: T;
  success: boolean;
}

const BASE = (import.meta as any).env?.VITE_API_BASE || 'http://localhost:8081/api/v1/langgraph';

async function handleJson<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Request failed ${res.status}: ${text}`);
  }
  return res.json();
}

export async function executeAgent(
  workbookId: string,
  userRequest: string,
  sheetName: string = "Sheet1"
): Promise<any> {
  const API_ROOT = BASE.replace(/\/langgraph$/, '');
  const res = await fetch(`${API_ROOT}/agents/execute/${encodeURIComponent(workbookId)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_request: userRequest, sheet_name: sheetName }),
  });
  const json = await handleJson<SuccessResponse<any>>(res);
  return json.data;
}
