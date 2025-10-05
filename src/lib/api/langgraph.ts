export interface SuccessResponse<T> {
  message: string;
  data: T;
  success: boolean;
}

const BASE = (import.meta as any).env?.VITE_API_BASE || 'http://localhost:8080/api/v1/langgraph';

async function handleJson<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Request failed ${res.status}: ${text}`);
  }
  return res.json();
}

export async function createAgentPlan(
  workbookId: string,
  sheetName: string,
  userRequest: string,
  context: string = ""
): Promise<any> {
  const res = await fetch(`${BASE}/workbooks/${encodeURIComponent(workbookId)}/sheets/${encodeURIComponent(sheetName)}/plan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_request: userRequest, context }),
  });
  const json = await handleJson<SuccessResponse<any>>(res);
  return json.data;
}
