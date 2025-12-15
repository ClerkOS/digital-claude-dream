import { api } from "./client";
import type { Suggestion } from "../../../types/v2/analysis";
import type { SuggestionResponse } from "../../../types/v2/agent";

export async function applySuggestion(sessionId: string, suggestion: Suggestion): Promise<SuggestionResponse> {
  return api(`/sessions/${sessionId}/apply`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      tool: suggestion.suggested_fix.tool,
      args: suggestion.suggested_fix.args,
    }),
  });
}