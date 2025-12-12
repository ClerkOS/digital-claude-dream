import { api } from "./client";
import type { AnalysisResponse } from "../../../types/v2/analysis";

export async function runAnalysis(sessionId: string): Promise<AnalysisResponse> {
  return api(`/sessions/${sessionId}/analyze`, {
    method: "POST",
  });
}