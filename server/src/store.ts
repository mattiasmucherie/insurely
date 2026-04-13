export type SessionStatus = "PENDING" | "AUTHENTICATED" | "COMPLETED" | "FAILED";

export interface Session {
  id: string;
  ssn: string;
  status: SessionStatus;
  createdAt: number;
  authAt?: number;
}

const sessions = new Map<string, Session>();

export function createSession(ssn: string): Session {
  const id = crypto.randomUUID();
  const session: Session = {
    id,
    ssn,
    status: "PENDING",
    createdAt: Date.now(),
  };
  sessions.set(id, session);
  return session;
}

export function getSession(id: string): Session | undefined {
  return sessions.get(id);
}

export function authenticateSession(session: Session): void {
  session.status = "AUTHENTICATED";
  session.authAt = Date.now();
}

export function maybePromoteSession(session: Session): void {
  if (
    session.status === "AUTHENTICATED" &&
    session.authAt &&
    Date.now() - session.authAt > 1000
  ) {
    session.status = "COMPLETED";
  }
}
