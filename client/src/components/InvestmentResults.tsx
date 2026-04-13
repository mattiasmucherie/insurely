import { useState, useEffect } from "react";
import { getInvestments } from "../utils/api";
import type { InvestmentData, Holding } from "../../../shared/types";

const formatSEK = (value: number) =>
  new Intl.NumberFormat("sv-SE", {
    style: "currency",
    currency: "SEK",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);

const TYPE_COLORS: Record<Holding["type"], string> = {
  Fund: "#3b82f6",
  Stock: "#22c55e",
  ETF: "#a855f7",
  Cash: "#9ca3af",
};

function TypeBadge({ type }: { type: Holding["type"] }) {
  return (
    <span className={`type-badge ${type.toLowerCase()}`}>
      {type}
    </span>
  );
}

function AllocationBar({ holdings, total }: { holdings: Holding[]; total: number }) {
  const grouped = Object.entries(
    holdings.reduce<Record<string, number>>((acc, h) => {
      acc[h.type] = (acc[h.type] || 0) + h.value;
      return acc;
    }, {})
  );

  return (
    <div className="allocation-bar" role="img" aria-label="Portfolio allocation">
      {grouped.map(([type, value]) => (
        <div
          key={type}
          className="allocation-segment"
          style={{
            width: `${(value / total) * 100}%`,
            backgroundColor: TYPE_COLORS[type as Holding["type"]],
          }}
          title={`${type}: ${((value / total) * 100).toFixed(1)}%`}
        />
      ))}
    </div>
  );
}

interface Props {
  sessionId: string;
  onReset: () => void;
}

export function InvestmentResults({ sessionId, onReset }: Props) {
  const [data, setData] = useState<InvestmentData | null>(null);
  const [error, setError] = useState<string>();

  useEffect(() => {
    getInvestments(sessionId)
      .then(setData)
      .catch((err) =>
        setError(err instanceof Error ? err.message : "Failed to load data")
      );
  }, [sessionId]);

  if (error) {
    return (
      <section className="results">
        <h1>Error loading investments</h1>
        <p className="error-text">{error}</p>
        <button className="btn-secondary" onClick={onReset}>
          Start over
        </button>
      </section>
    );
  }

  if (!data) {
    return (
      <section className="results">
        <p className="text-secondary">Loading investments...</p>
      </section>
    );
  }

  const grandTotal = data.accounts.reduce((sum, a) => sum + a.totalValue, 0);

  return (
    <section className="results">
      <header>
        <h1>Your investments</h1>
        <p className="text-secondary">
          Successfully collected from Avanza
        </p>
      </header>

      {data.accounts.map((account) => (
        <article key={account.accountName} className="account-card">
          <div className="account-header">
            <h2>{account.accountName}</h2>
            <span className="total-value">
              {formatSEK(account.totalValue)}
            </span>
          </div>

          <AllocationBar holdings={account.holdings} total={account.totalValue} />

          <table className="holdings-table">
            <thead>
              <tr>
                <th>Holding</th>
                <th>Type</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              {account.holdings.map((holding) => (
                <tr key={holding.name}>
                  <td>{holding.name}</td>
                  <td><TypeBadge type={holding.type} /></td>
                  <td className="value-cell">{formatSEK(holding.value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </article>
      ))}

      <div className="grand-total">
        <span className="label">Total portfolio value</span>
        <span className="value">{formatSEK(grandTotal)}</span>
      </div>

      <button className="btn-secondary" onClick={onReset}>
        Start new collection
      </button>
    </section>
  );
}
