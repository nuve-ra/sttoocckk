import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { StockHolding } from '.././pages/api/types'
import { format } from 'date-fns';
import {portfolioData} from "../pages/api/portfolioData"

type LiveStock = {
  symbol: string;
  cmp: number;
  peRatio: number | null;
  earningsTimestamp: number | null;
  
};

type CombinedStock = typeof portfolioData[0] & {
  cmp: number | null;
  value: number | null;
  gainLoss: number | null;
};

//type LiveStockAPIResponse = LiveStock[];

//
//type HistoricalDataMap = {
//  [symbol: string]: Array<{
//    date: string;
//    open: number;
//    close: number;
//    high: number;
//    low: number;
//    volume: number;
//  }>;
//};

type LiveStockData = {
  [symbol: string]: {
    cmp: number;
    peRatio: number | null;
    latestEarnings: string | null;
  };
};


interface PortfolioTableProps {
  portfolioData: StockHolding[];
  stockData: Record<string, unknown>;
}


const PortfolioTable: React.FC<PortfolioTableProps> = ({ portfolioData }) => {
  const [liveData, setLiveData] = useState<LiveStockData>({});
  //const [historicalData, setHistoricalData] = useState<HistoricalDataMap>({});
  const [selectedSector, setSelectedSector] = useState<string>('All Sectors');
  const [combinedData, setCombinedData] = useState<CombinedStock[]>([]);
useEffect(() => {
  const fetchLiveStockAPIResponse = async () => {
    try {
      const symbols = portfolioData.map((stock) => stock.symbol);
      const response = await axios.post('/api/realTimePrice', { symbols });

      const mappedData: LiveStockData = {};
      response.data.forEach((stock: LiveStock) => {
        mappedData[stock.symbol] = {
          cmp: stock.cmp ?? 0,
         peRatio: stock.peRatio ?? null,
latestEarnings: typeof stock.earningsTimestamp === 'number'
  ? format(new Date(stock.earningsTimestamp * 1000), 'MMM dd yyyy')
  : null,
        };
      });

      setLiveData(mappedData);

      const combined = portfolioData.map((stock) => {
        const live = response.data.find((item: LiveStock) => item.symbol === stock.symbol);
        const cmp = live?.cmp ?? null;
        const value = cmp !== null ? cmp * stock.quantity : null;
        const gainLoss = cmp !== null ? value! - stock.purchasePrice * stock.quantity : null;
        return {
          ...stock,
          cmp,
          value,
          gainLoss,
        };
      });
      setCombinedData(combined);

    } catch (err) {
      console.error('Error fetching live stock data:', err);
    }
  };

  // const fetchHistoricalData = async () => {
  //   try {
  //     const res = await axios.get('/api/historicalPrices');
  //     setHistoricalData(res.data);
  //   } catch (err) {
  //     console.error('Failed to fetch historical data:', err);
  //   }
  // };

  fetchLiveStockAPIResponse();
  //fetchHistoricalData();

  const interval = setInterval(fetchLiveStockAPIResponse, 6000);
  return () => clearInterval(interval);

}, [portfolioData]);

  const sectors = Array.from(new Set(portfolioData.map(stock => stock.sector))).sort();

  const filteredPortfolioData =
    selectedSector === 'All Sectors'
      ? portfolioData
      : portfolioData.filter(stock => stock.sector === selectedSector);

  const totalInvestment = filteredPortfolioData.reduce(
    (acc, stock) => acc + stock.purchasePrice * stock.quantity,
    0
  );

  return (
    <div className="max-w-screen-xl mx-auto p-4">
      <nav className="bg-gradient-to-r from-indigo-700 via-purple-600 to-pink-500 text-white px-6 py-4 rounded-xl shadow-md flex justify-between items-center">
        <h1 className="text-xl font-bold">📊 My Portfolio Dashboard</h1>
        <ul className="flex space-x-6 text-sm">
          <li className="hover:underline cursor-pointer">Home</li>
          <li className="hover:underline cursor-pointer">Add Stock</li>
          <li className="hover:underline cursor-pointer">Settings</li>
        </ul>
      </nav>

      <div className="mt-6">
        <label htmlFor="sector-select" className="font-medium text-gray-700 mr-3">
          Filter by Sector:
        </label>
        <select
          id="sector-select"
          value={selectedSector}
          onChange={(e) => setSelectedSector(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2 shadow-sm text-black dark:text-black bg-white dark:bg-white"
        >
          <option value="All Sectors">All Sectors</option>
          {sectors.map((sector) => (
            <option key={sector} value={sector}>
              {sector}
            </option>
          ))}
        </select>
      </div>

      <div className="hidden md:block mt-6">
        <h2 className="text-2xl font-semibold text-blue-600 mb-4">📈 Stock Portfolio</h2>
        <div className="overflow-x-auto rounded-lg shadow-md border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-100 text-gray-600 uppercase text-xs tracking-wider">
              <tr >
                <th className="px-4 py-3 text-left">Stock</th>
                <th className="px-4 py-3">Price</th>
                <th className="px-4 py-3">Qty</th>
                <th className="px-4 py-3">Investment</th>
                <th className="px-4 py-3">% of Total</th>
                <th className="px-4 py-3">Exchange</th>
                <th className="px-4 py-3">CMP</th>
                <th className="px-4 py-3">Value</th>
                <th className="px-4 py-3">Gain/Loss</th>
                <th className="px-4 py-3">P/E</th>
                <th className="px-4 py-3">Earnings</th>
                <th className="px-4 py-3">History</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {filteredPortfolioData.map((stock) => {
                const investment = stock.purchasePrice * stock.quantity;
                const portfolioPercent = ((investment / totalInvestment) * 100).toFixed(2);
                const cmp = liveData[stock.symbol]?.cmp ?? 0;
                const peRatio = liveData[stock.symbol]?.peRatio ?? '-';
                const latestEarnings = liveData[stock.symbol]?.latestEarnings ?? '-';
                const presentValue = cmp * stock.quantity;
                const gainLoss = presentValue - investment;
                const gainClass = gainLoss >= 0 ? 'text-green-600' : 'text-red-600';
                //const historicalPoints = historicalData[stock.symbol]?.length ?? 0;

                return (
                  <tr
                    key={stock.symbol}
                    className="hover:bg-yellow-50"
                  >
                    <td className="border border-gray-300 rounded px-3 py-2 shadow-sm text-black dark:text-black bg-white dark:bg-white">{stock.stockName}</td>
                    <td className="border border-gray-300 rounded px-3 py-2 shadow-sm text-black dark:text-black bg-white dark:bg-white">{stock.purchasePrice}</td>
                    <td className="border border-gray-300 rounded px-3 py-2 shadow-sm text-black dark:text-black bg-white dark:bg-white">{stock.quantity}</td>
                    <td className="border border-gray-300 rounded px-3 py-2 shadow-sm text-black dark:text-black bg-white dark:bg-white">{investment.toFixed(2)}</td>
                    <td className="border border-gray-300 rounded px-3 py-2 shadow-sm text-black dark:text-black bg-white dark:bg-white">{portfolioPercent}%</td>
                    <td className="border border-gray-300 rounded px-3 py-2 shadow-sm text-black dark:text-black bg-white dark:bg-white">{stock.exchange}</td>
                    <td className="border border-gray-300 rounded px-3 py-2 shadow-sm text-black dark:text-black bg-white dark:bg-white">{cmp.toFixed(2)}</td>
                    <td className="border border-gray-300 rounded px-3 py-2 shadow-sm text-black dark:text-black bg-white dark:bg-white">{presentValue.toFixed(2)}</td>
                    <td className={`px-4 py-3 text-center font-semibold ${gainClass}`}>
                      {gainLoss.toFixed(2)}
                    </td>
                    <td className="border border-gray-300 rounded px-3 py-2 shadow-sm text-black dark:text-black bg-white dark:bg-white">{peRatio}</td>
                    <td className="border border-gray-300 rounded px-3 py-2 shadow-sm text-black dark:text-black bg-white dark:bg-white">{latestEarnings}</td>
                    
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-6 space-y-4 md:hidden">
        {filteredPortfolioData.map((stock) => {
          const investment = stock.purchasePrice * stock.quantity;
          const portfolioPercent = ((investment / totalInvestment) * 100).toFixed(2);
          const cmp = liveData[stock.symbol]?.cmp ?? 0;
          const peRatio = liveData[stock.symbol]?.peRatio ?? '-';
          const latestEarnings = liveData[stock.symbol]?.latestEarnings ?? '-';
          const presentValue = cmp * stock.quantity;
          const gainLoss = presentValue - investment;
          const gainClass = gainLoss >= 0 ? 'text-green-600' : 'text-red-600';
         // const historicalPoints = historicalData[stock.symbol]?.length ?? 0;

          return (
            <div
              key={stock.symbol}
              className="border rounded-xl shadow-lg p-4 bg-white"
            >
              <h3 className="font-semibold text-lg text-blue-600 mb-3">{stock.stockName}</h3>
              <p><strong>Price:</strong> {stock.purchasePrice}</p>
                      <p><strong>Quantity:</strong> {stock.quantity}</p>
                      <p><strong>Investment:</strong> {investment.toFixed(2)}</p>
                      <p><strong>% of Total:</strong> {portfolioPercent}%</p>
                      <p><strong>Exchange:</strong> {stock.exchange}</p>
                      <p><strong>CMP:</strong> {cmp.toFixed(2)}</p>
                      <p><strong>Value:</strong> {presentValue.toFixed(2)}</p>
                      <p className={gainClass}><strong>Gain/Loss:</strong> {gainLoss.toFixed(2)}</p>
                      <p><strong>P/E:</strong> {peRatio}</p>
                      <p><strong>Earnings:</strong> {latestEarnings}</p>
                    
                      </div>
                      );
                      })}
                      </div>
                      </div>
                      );
                      };

                      export default PortfolioTable;