// Session status values
export type SessionStatus = "PENDING" | "AUTHENTICATED" | "COMPLETED" | "FAILED";

// API request/response types

export interface CreateSessionRequest {
  ssn: string;
}

export interface CreateSessionResponse {
  sessionId: string;
}

export interface SessionResponse {
  status: SessionStatus;
  qrData?: string;
}

export interface AuthenticateResponse {
  status: SessionStatus;
}

// Investment data types

export interface Holding {
  name: string;
  type: "Fund" | "Stock" | "Cash" | "ETF";
  value: number;
}

export interface Account {
  accountName: string;
  currency: string;
  totalValue: number;
  holdings: Holding[];
}

export interface InvestmentData {
  accounts: Account[];
}
