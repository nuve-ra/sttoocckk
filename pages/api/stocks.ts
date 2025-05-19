import { NextApiRequest, NextApiResponse } from 'next';
import yahooFinance from 'yahoo-finance2';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).end('Method not allowed');
  }

  const { symbols, fetchHistory, days } = req.body;

  if (!Array.isArray(symbols)) {
    return res.status(400).json({ message: 'Symbols must be an array' });
  }

  try {
    const results = await Promise.all(
      symbols.map(async (symbol: string) => {
        try {
          const quote = await yahooFinance.quote(symbol);

          const earningsTimestamp =
            typeof quote?.earningsTimestamp === 'number' ? quote.earningsTimestamp : null;

          let history: {
            date: string;
            open: number;
            close: number;
            high: number;
            low: number;
            volume: number;
          }[] = [];

          if (fetchHistory) {
            const end = new Date();
            const start = new Date();
            start.setDate(end.getDate() - (days || 60));

            const rawHistory = await yahooFinance.historical(symbol, {
              period1: start.toISOString(),
              period2: end.toISOString(),
            });

            history = rawHistory.map((entry) => ({
              date: entry.date.toISOString(),
              open: entry.open,
              close: entry.close,
              high: entry.high,
              low: entry.low,
              volume: entry.volume,
            }));
          }

          return {
            symbol,
            cmp: quote?.regularMarketPrice ?? null,
            peRatio: quote?.trailingPE ?? null,
            earningsTimestamp,
            history,
          };
        } catch (err) {
          console.error(`Failed to fetch data for ${symbol}:`, err);
          return {
            symbol,
            error: true,
            message: `Failed to fetch data`,
          };
        }
      })
    );

    res.status(200).json(results);
  } catch (err) {
    console.error('Unexpected error:', err);
    res.status(500).json({ message: 'Unexpected error fetching stock data' });
  }
}
