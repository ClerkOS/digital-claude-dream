import { api } from "./client";
import type { SessionResponse } from "../../../types/v2/session";

export async function createSession(file: File): Promise<SessionResponse> {
  const form = new FormData();
  form.append("file", file);

  return api<SessionResponse>("/sessions", {
    method: "POST",
    body: form,
  });
}

export async function getSession(sessionId: string) {
  return api<SessionResponse>(`/sessions/${sessionId}`, { method: "GET" });
}