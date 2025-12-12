import { AgentResponse } from "@/types/v2/agent";
import { api } from "./client";

export async function processAgentRequest(sessionId: string, request: string) {
  return api<AgentResponse>(`/execute/agent/${sessionId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ request }),
  });
}