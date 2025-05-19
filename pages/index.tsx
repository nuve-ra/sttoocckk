import { useEffect, useState } from 'react';
import axios from 'axios';
import PortfolioTable from '../components/PortofolioTable';
import { portfolioData } from './api/portfolioData';
import { format } from 'date-fns';

interface LiveStock {
  symbol: string;
  regularMarketPrice: number;
  trailingPE: number | null;
  earningsTimestamp: number | null;
}

interface LiveStockDataMap {
  [symbol: string]: {
    cmp: number;
    peRatio: number | null;
    latestEarnings: string;
  };
}

export default function Home() {
  const [stockData, setStockData] = useState<LiveStockDataMap>({});

  useEffect(() => {
    const fetchData = async () => {
      const symbols = portfolioData.map((s) => s.symbol);
      const res = await axios.post<LiveStock[]>('/api/stocks', { symbols });

      const mapped: LiveStockDataMap = {};
      res.data.forEach((stock) => {
        mapped[stock.symbol] = {
          cmp: stock.regularMarketPrice,
          peRatio: stock.trailingPE,
          latestEarnings: stock.earningsTimestamp != null
            ? format(new Date(stock.earningsTimestamp * 1000), 'MMM dd yyyy')
            : '-',
        };
      });

      setStockData(mapped);
    };

    fetchData();
  }, []);

  return <PortfolioTable stockData={stockData} portfolioData={portfolioData} />;
}
