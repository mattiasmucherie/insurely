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

export function getMockInvestments(): { accounts: Account[] } {
  return {
    accounts: [
      {
        accountName: "Avanza ISK",
        currency: "SEK",
        totalValue: 187500,
        holdings: [
          { name: "Avanza Zero", type: "Fund", value: 45000 },
          { name: "Investor B", type: "Stock", value: 35000 },
          { name: "XACT OMXS30", type: "ETF", value: 27500 },
          { name: "Länsförsäkringar Global Index", type: "Fund", value: 35000 },
          { name: "Cash", type: "Cash", value: 45000 },
        ],
      },
      {
        accountName: "Avanza KF",
        currency: "SEK",
        totalValue: 62000,
        holdings: [
          { name: "SEB Sverigefond", type: "Fund", value: 28000 },
          { name: "Handelsbanken Hållbar Energi", type: "Fund", value: 22000 },
          { name: "Cash", type: "Cash", value: 12000 },
        ],
      },
    ],
  };
}
