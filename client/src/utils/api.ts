import type {
  CreateSessionResponse,
  SessionResponse,
  AuthenticateResponse,
  InvestmentData,
} from "../../../shared/types";

const BASE_URL = "http://localhost:3001/api";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed (${res.status})`);
  }

  return res.json();
}

export function createSession(ssn: string) {
  return request<CreateSessionResponse>("/sessions", {
    method: "POST",
    body: JSON.stringify({ ssn }),
  });
}

export function getSessionStatus(sessionId: string) {
  return request<SessionResponse>(`/sessions/${sessionId}`);
}

export function authenticate(sessionId: string) {
  return request<AuthenticateResponse>(`/sessions/${sessionId}/authenticate`, {
    method: "POST",
  });
}

export function getInvestments(sessionId: string) {
  return request<InvestmentData>(`/sessions/${sessionId}/investments`);
}
