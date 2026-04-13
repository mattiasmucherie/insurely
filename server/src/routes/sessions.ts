import { Hono } from "hono";
import {
  createSession,
  getSession,
  authenticateSession,
  maybePromoteSession,
} from "../store";
import { generateQrData } from "../qr";
import { getMockInvestments } from "../mockData";
import { validatePersonalNumber } from "../validatePersonalNumber";

const sessions = new Hono();

// Create a new collection session
sessions.post("/", async (c) => {
  const body = await c.req.json().catch(() => null);
  if (!body?.ssn || typeof body.ssn !== "string") {
    return c.json({ error: "Missing or invalid 'ssn' field" }, 400);
  }

  const validation = validatePersonalNumber(body.ssn);
  if (!validation.valid) {
    return c.json({ error: validation.error }, 400);
  }

  const session = createSession(body.ssn);
  return c.json({ sessionId: session.id }, 201);
});

// Get session status + QR data
sessions.get("/:id", (c) => {
  const session = getSession(c.req.param("id"));
  if (!session) {
    return c.json({ error: "Session not found" }, 404);
  }

  maybePromoteSession(session);

  const response: { status: string; qrData?: string } = {
    status: session.status,
  };

  if (session.status === "PENDING") {
    response.qrData = generateQrData(session.id, session.createdAt);
  }

  return c.json(response);
});

// Authenticate (mock BankID login)
sessions.post("/:id/authenticate", (c) => {
  const session = getSession(c.req.param("id"));
  if (!session) {
    return c.json({ error: "Session not found" }, 404);
  }

  if (session.status !== "PENDING") {
    return c.json(
      { error: `Cannot authenticate session in '${session.status}' state` },
      400
    );
  }

  authenticateSession(session);
  return c.json({ status: session.status });
});

// Get investment data (only after COMPLETED)
sessions.get("/:id/investments", (c) => {
  const session = getSession(c.req.param("id"));
  if (!session) {
    return c.json({ error: "Session not found" }, 404);
  }

  if (session.status !== "COMPLETED") {
    return c.json({ error: "Session not yet completed" }, 403);
  }

  return c.json(getMockInvestments());
});

export default sessions;
