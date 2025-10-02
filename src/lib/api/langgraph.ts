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
  workbookId: string,
  sheetName: string,
  userRequest: string,
  context: string
): Promise<any> {
  const res = await fetch(`${BASE}/workbooks/${encodeURIComponent(workbookId)}/sheets/${encodeURIComponent(sheetName)}/plan`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ user_request: userRequest, context }),
  });
  const json = await handleJson<SuccessResponse<{ plan: any }>>(res);
  return json.data.plan;
}

export async function executeTool(
  workbookId: string,
  toolName: string,
  args: Record<string, any>
): Promise<any> {
  const res = await fetch(`${BASE}/workbooks/${encodeURIComponent(workbookId)}/tools/${encodeURIComponent(toolName)}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(args),
  });
  const json = await handleJson<SuccessResponse<{ result: any }>>(res);
  return json.data.result;
}

export async function executePlan(
  workbookId: string,
  plan: any
): Promise<Array<{ step: any; result: any; success: boolean }>> {
  const results = [];
  
  if (!plan || !plan.steps) {
    throw new Error('Invalid plan: no steps found');
  }

  console.log('Executing plan with steps:', plan.steps);

  for (const step of plan.steps) {
    try {
      console.log(`Executing step ${step.step_id}: ${step.description}`);
      const result = await executeTool(workbookId, step.tool, step.args);
      results.push({ step, result, success: true });
      console.log(`Step ${step.step_id} completed successfully:`, result);
    } catch (error) {
      console.error(`Step ${step.step_id} failed:`, error);
      results.push({ 
        step, 
        result: null, 
        success: false, 
        error: error.message 
      });
      // Continue with other steps even if one fails
    }
  }

  return results;
}



