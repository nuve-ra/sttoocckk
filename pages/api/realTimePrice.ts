import yahooFinance from 'yahoo-finance2';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { symbols } = req.body;

    // Use default symbols if none are provided
    const finalSymbols = Array.isArray(symbols) && symbols.length > 0
      ? symbols
      : ['INFY.NS', 'TCS.NS', 'RELIANCE.NS', 'SBIN.NS', 'HDFCBANK.NS'];

    const results = await Promise.all(
      finalSymbols.map(async (symbol: string) => {
        try {
          const data = await yahooFinance.quote(symbol);
          return {
            symbol,
            cmp: data.regularMarketPrice ?? null,
            peRatio: data.trailingPE ?? null,
            earningsTimestamp: data.earningsTimestamp ?? null,
          };
        } catch (err) {
          console.error(`Error fetching ${symbol}:`, err);
          return { symbol, error: 'Failed to fetch' };
        }
      })
    );

    res.status(200).json(results);
  } catch (error) {
    console.error('Error fetching stock data:', error);
    res.status(500).json({ error: 'Failed to fetch stock data' });
  }
}
