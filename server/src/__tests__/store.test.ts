import { describe, it, expect, vi } from "vitest";
import {
  createSession,
  getSession,
  authenticateSession,
  maybePromoteSession,
} from "../store";

describe("store", () => {
  describe("createSession", () => {
    it("creates a session with PENDING status", () => {
      const session = createSession("8507099805");
      expect(session.status).toBe("PENDING");
      expect(session.ssn).toBe("8507099805");
      expect(session.id).toBeDefined();
      expect(session.createdAt).toBeGreaterThan(0);
    });

    it("stores session retrievable by ID", () => {
      const session = createSession("8507099805");
      const retrieved = getSession(session.id);
      expect(retrieved).toBe(session);
    });
  });

  describe("getSession", () => {
    it("returns undefined for unknown ID", () => {
      expect(getSession("nonexistent")).toBeUndefined();
    });
  });

  describe("authenticateSession", () => {
    it("sets status to AUTHENTICATED and records authAt", () => {
      const session = createSession("8507099805");
      authenticateSession(session);
      expect(session.status).toBe("AUTHENTICATED");
      expect(session.authAt).toBeGreaterThan(0);
    });
  });

  describe("maybePromoteSession", () => {
    it("does not promote if not AUTHENTICATED", () => {
      const session = createSession("8507099805");
      maybePromoteSession(session);
      expect(session.status).toBe("PENDING");
    });

    it("does not promote if less than 1s since auth", () => {
      const session = createSession("8507099805");
      authenticateSession(session);
      maybePromoteSession(session);
      expect(session.status).toBe("AUTHENTICATED");
    });

    it("promotes to COMPLETED after 1s", () => {
      const session = createSession("8507099805");
      authenticateSession(session);
      // Simulate time passage
      session.authAt = Date.now() - 1500;
      maybePromoteSession(session);
      expect(session.status).toBe("COMPLETED");
    });
  });
});
