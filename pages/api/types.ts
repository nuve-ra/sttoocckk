
export interface StockHolding {
    sector: string;
    stockName: string;
    exchange: string;
    symbol: string;
    purchasePrice: number;
    quantity: number;
    cmp?: number;               
    peRatio?: number;           
    latestEarnings?: string;    
  }
  