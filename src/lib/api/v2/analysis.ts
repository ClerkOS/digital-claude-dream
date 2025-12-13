import { api } from "./client";
import type { AnalysisResponse, Suggestion } from "../../../types/v2/analysis";

export async function runAnalysis(sessionId: string): Promise<AnalysisResponse> {
  return api(`/sessions/${sessionId}/analyze`, {
    method: "POST",
  });
}

export async function applySuggestion(
  sessionId: string, 
  suggestion: Suggestion
): Promise<{
  status: string;
  steps: any[];
  final_version: number;
  schema: any;
}> {
  return api(`/sessions/${sessionId}/apply`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(suggestion),
  });
}