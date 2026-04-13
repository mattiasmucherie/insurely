import { describe, it, expect } from "vitest";
import { generateQrData } from "../qr";

describe("generateQrData", () => {
  it("returns a 32-char hex string", () => {
    const qr = generateQrData("test-id", Date.now());
    expect(qr).toMatch(/^[a-f0-9]{32}$/);
  });

  it("returns same value within the same second", () => {
    const now = Date.now();
    const qr1 = generateQrData("test-id", now);
    const qr2 = generateQrData("test-id", now);
    expect(qr1).toBe(qr2);
  });

  it("returns different value for different sessions", () => {
    const now = Date.now();
    const qr1 = generateQrData("session-a", now);
    const qr2 = generateQrData("session-b", now);
    expect(qr1).not.toBe(qr2);
  });

  it("returns different value after 1 second", () => {
    const now = Date.now();
    const qr1 = generateQrData("test-id", now);
    // createdAt 2 seconds ago → different timeslot
    const qr2 = generateQrData("test-id", now - 2000);
    expect(qr1).not.toBe(qr2);
  });
});
