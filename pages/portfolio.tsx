import PortfolioTable from '../components/PortofolioTable';
import { portfolioData } from '../pages/api/portfolioData';

const stockData = {}; 

export default function PortfolioPage() {
  return (
    <PortfolioTable
      portfolioData={portfolioData}
      stockData={stockData}
    />
  );
}
