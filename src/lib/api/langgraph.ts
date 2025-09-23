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

export async function getSheetContext(
  workbookId: string,
  sheetName: string,
  prompt?: string
): Promise<any> {
  const res = await fetch(`${BASE}/workbooks/${encodeURIComponent(workbookId)}/sheets/${encodeURIComponent(sheetName)}/context`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: prompt ? JSON.stringify({ prompt }) : '{}',
  });
  const json = await handleJson<SuccessResponse<{ context: any }>>(res);
  return json.data.context;
}

export async function createAgentPlan(
  userRequest: string,
  context: string
): Promise<any> {
  const res = await fetch(`${BASE}/plan/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_request: userRequest, context }),
  });
  const json = await handleJson<SuccessResponse<{ plan: any }>>(res);
  return json.data.plan;
}

export async function executeTool(
  workbookId: string,
  sheetName: string,
  toolName: string,
  args: Record<string, unknown>
): Promise<any> {
  const res = await fetch(`${BASE}/workbooks/${encodeURIComponent(workbookId)}/sheets/${encodeURIComponent(sheetName)}/tools/${encodeURIComponent(toolName)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(args || {}),
  });
  const json = await handleJson<SuccessResponse<{ result: any }>>(res);
  return json.data.result;
}


