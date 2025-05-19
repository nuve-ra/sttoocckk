// types.ts

export interface StockHolding {
    stockName: string;
    exchange: string;
    symbol: string;
    purchasePrice: number;
    quantity: number;
    sector: string;
  }
  
  export interface PortfolioTableProps {
    stockData: { [symbol: string]: { cmp: number; peRatio: number | null; latestEarnings: string } };
    portfolioData: StockHolding[];
  }
  export interface HistoricalPrice {
  timestamp: string;  
  value: number;      
}

export interface HistoricalData {
  [symbol: string]: HistoricalPrice[];
}