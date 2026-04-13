import { useState, useEffect, useRef } from "react";
import { getSessionStatus } from "../utils/api";
import type { SessionStatus } from "../../../shared/types";

interface PollingState {
  status: SessionStatus | null;
  qrData: string | null;
  error: string | null;
}

export function useSessionPolling(sessionId: string) {
  const [state, setState] = useState<PollingState>({
    status: null,
    qrData: null,
    error: null,
  });
  const intervalRef = useRef<ReturnType<typeof setInterval>>(undefined);

  useEffect(() => {
    let active = true;

    async function poll() {
      try {
        const data = await getSessionStatus(sessionId);
        if (!active) return;

        setState({
          status: data.status,
          qrData: data.qrData ?? null,
          error: null,
        });

        // Stop polling when terminal state reached
        if (data.status === "COMPLETED" || data.status === "FAILED") {
          clearInterval(intervalRef.current);
        }
      } catch (err) {
        if (!active) return;
        setState((prev) => ({
          ...prev,
          error: err instanceof Error ? err.message : "Polling failed",
        }));
      }
    }

    // Initial fetch immediately
    poll();
    intervalRef.current = setInterval(poll, 1500);

    return () => {
      active = false;
      clearInterval(intervalRef.current);
    };
  }, [sessionId]);

  return state;
}
