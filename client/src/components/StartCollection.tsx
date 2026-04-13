import { useState, useRef } from "react";
import { validatePersonalNumber } from "../utils/validatePersonalNumber";
import { createSession } from "../utils/api";

interface Props {
  onSessionCreated: (sessionId: string) => void;
}

export function StartCollection({ onSessionCreated }: Props) {
  const [ssn, setSsn] = useState("");
  const [error, setError] = useState<string>();
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleSubmit(e: React.SubmitEvent) {
    e.preventDefault();
    setError(undefined);

    const validation = validatePersonalNumber(ssn);
    if (!validation.valid) {
      setError(validation.error);
      inputRef.current?.focus();
      return;
    }

    setLoading(true);
    try {
      const { sessionId } = await createSession(ssn);
      onSessionCreated(sessionId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create session");
      inputRef.current?.focus();
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="start-collection">
      <header>
        <h1>Connect your investments</h1>
        <p className="text-secondary">
          Fetch your investment holdings from Avanza using BankID
        </p>
      </header>

      <form onSubmit={handleSubmit}>
        <fieldset disabled={loading}>
          <label htmlFor="ssn">Swedish personal identity number</label>
          <input
            ref={inputRef}
            id="ssn"
            type="text"
            placeholder="YYYYMMDD-XXXX"
            value={ssn}
            onChange={(e) => { setSsn(e.target.value); setError(undefined); }}
            className={error ? "error" : ""}
            autoComplete="off"
          />
          {error && <p className="error-text">{error}</p>}

          <button type="submit" className="btn-primary" disabled={ssn.length === 0 || loading}>
            {loading ? "Connecting..." : "Connect Avanza and fetch my investments"}
          </button>
        </fieldset>
      </form>
    </section>
  );
}
