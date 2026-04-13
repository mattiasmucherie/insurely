import { createHash } from "node:crypto";

export function generateQrData(sessionId: string, createdAt: number): string {
  const timeslot = Math.floor((Date.now() - createdAt) / 1000);
  return createHash("sha256")
    .update(`${sessionId}.${timeslot}`)
    .digest("hex")
    .slice(0, 32);
}
