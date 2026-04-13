import { describe, it, expect } from "vitest";
import { Hono } from "hono";
import sessions from "../routes/sessions";

function createApp() {
  const app = new Hono();
  app.route("/api/sessions", sessions);
  return app;
}

async function json(res: Response) {
  return res.json();
}

describe("POST /api/sessions", () => {
  it("creates session with valid SSN", async () => {
    const app = createApp();
    const res = await app.request("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ssn: "198507099805" }),
    });
    expect(res.status).toBe(201);
    const body = await json(res);
    expect(body.sessionId).toBeDefined();
  });

  it("rejects missing SSN", async () => {
    const app = createApp();
    const res = await app.request("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(400);
    const body = await json(res);
    expect(body.error).toMatch(/ssn/i);
  });

  it("rejects invalid SSN (bad checksum)", async () => {
    const app = createApp();
    const res = await app.request("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ssn: "8507099806" }),
    });
    expect(res.status).toBe(400);
    expect((await json(res)).error).toBe("Invalid identity number");
  });
});

describe("GET /api/sessions/:id", () => {
  it("returns 404 for unknown session", async () => {
    const app = createApp();
    const res = await app.request("/api/sessions/nonexistent");
    expect(res.status).toBe(404);
  });

  it("returns PENDING status with QR data", async () => {
    const app = createApp();
    const createRes = await app.request("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ssn: "198507099805" }),
    });
    const { sessionId } = await json(createRes);

    const res = await app.request(`/api/sessions/${sessionId}`);
    expect(res.status).toBe(200);
    const body = await json(res);
    expect(body.status).toBe("PENDING");
    expect(body.qrData).toMatch(/^[a-f0-9]{32}$/);
  });
});

describe("POST /api/sessions/:id/authenticate", () => {
  it("returns 404 for unknown session", async () => {
    const app = createApp();
    const res = await app.request("/api/sessions/nonexistent/authenticate", {
      method: "POST",
    });
    expect(res.status).toBe(404);
  });

  it("authenticates a PENDING session", async () => {
    const app = createApp();
    const createRes = await app.request("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ssn: "198507099805" }),
    });
    const { sessionId } = await json(createRes);

    const res = await app.request(`/api/sessions/${sessionId}/authenticate`, {
      method: "POST",
    });
    expect(res.status).toBe(200);
    expect((await json(res)).status).toBe("AUTHENTICATED");
  });

  it("rejects double authentication", async () => {
    const app = createApp();
    const createRes = await app.request("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ssn: "198507099805" }),
    });
    const { sessionId } = await json(createRes);

    await app.request(`/api/sessions/${sessionId}/authenticate`, {
      method: "POST",
    });

    const res = await app.request(`/api/sessions/${sessionId}/authenticate`, {
      method: "POST",
    });
    expect(res.status).toBe(400);
  });
});

describe("GET /api/sessions/:id/investments", () => {
  it("returns 404 for unknown session", async () => {
    const app = createApp();
    const res = await app.request("/api/sessions/nonexistent/investments");
    expect(res.status).toBe(404);
  });

  it("returns 403 if session not completed", async () => {
    const app = createApp();
    const createRes = await app.request("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ssn: "198507099805" }),
    });
    const { sessionId } = await json(createRes);

    const res = await app.request(`/api/sessions/${sessionId}/investments`);
    expect(res.status).toBe(403);
  });

  it("returns investment data after completion", async () => {
    const app = createApp();
    const createRes = await app.request("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ssn: "198507099805" }),
    });
    const { sessionId } = await json(createRes);

    // Authenticate
    await app.request(`/api/sessions/${sessionId}/authenticate`, {
      method: "POST",
    });

    // Wait for auto-promotion
    await new Promise((r) => setTimeout(r, 1100));

    // Poll to trigger promotion
    await app.request(`/api/sessions/${sessionId}`);

    const res = await app.request(`/api/sessions/${sessionId}/investments`);
    expect(res.status).toBe(200);
    const body = await json(res);
    expect(body.accounts).toHaveLength(2);
    expect(body.accounts[0].holdings.length).toBeGreaterThan(0);
  });
});
