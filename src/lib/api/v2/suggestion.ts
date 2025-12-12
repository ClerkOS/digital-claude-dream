import { api } from "./client";
import type { Suggestion } from "../../../types/v2/analysis";

export async function applySuggestion(sessionId: string, suggestion: Suggestion) {
  return api(`/sessions/${sessionId}/apply`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(suggestion),
  });
}