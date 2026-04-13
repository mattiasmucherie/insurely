import { useState, useEffect, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { useSessionPolling } from "../hooks/useSessionPolling";
import { authenticate } from "../utils/api";

interface Props {
  sessionId: string;
  onComplete: () => void;
  onError: () => void;
}

export function BankIdLogin({ sessionId, onComplete, onError }: Props) {
  const { status, qrData, error } = useSessionPolling(sessionId);
  const [authenticating, setAuthenticating] = useState(false);
  const completedRef = useRef(false);

  useEffect(() => {
    if (status === "COMPLETED" && !completedRef.current) {
      completedRef.current = true;
      onComplete();
    }
  }, [status, onComplete]);

  async function handleMockLogin() {
    setAuthenticating(true);
    try {
      await authenticate(sessionId);
    } catch (err) {
      setAuthenticating(false);
      console.error("Auth failed:", err);
    }
  }

  if (error) {
    return (
      <section className="bankid-screen">
        <h1>Something went wrong</h1>
        <p className="error-text">{error}</p>
        <button className="btn-secondary" onClick={onError}>
          Try again
        </button>
      </section>
    );
  }

  return (
    <section className="bankid-screen">
      <header>
        <h1>Sign in with BankID</h1>
        <p className="text-secondary">
          Scan the QR code with your BankID app
        </p>
      </header>

      {qrData && status === "PENDING" && (
        <div className="qr-container">
          <QRCodeSVG value={qrData} size={200} level="M" />
        </div>
      )}

      <p className="status-text">
        {status === "PENDING" && "Waiting for BankID..."}
        {status === "AUTHENTICATED" && "Authenticating..."}
      </p>

      {status === "PENDING" && (
        <button
          className="btn-primary"
          onClick={handleMockLogin}
          disabled={authenticating}
        >
          {authenticating ? "Signing in..." : "Mock successful login"}
        </button>
      )}

      {status === "AUTHENTICATED" && (
        <p className="text-secondary">Collecting your investment data...</p>
      )}
    </section>
  );
}
