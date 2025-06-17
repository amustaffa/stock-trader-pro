import { PortfolioItem } from "./PortfolioItem";

export interface Portfolio {
  id: string;
  userId: string;
  name: string;
  createdDate: Date;
  lastUpdated: Date;
  totalValue: number;
  totalGainLoss: number;
  totalGainLossPercent: number;
  items: PortfolioItem[];
}
