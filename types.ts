
export enum InsightType {
  OPPORTUNITY = 'OPPORTUNITY', 
  RISK = 'RISK', 
  INFO = 'INFO' 
}

export interface MetricTrend {
  date: string;
  value: number;
}

export interface DepartmentData {
  name: string;
  sales: number;
  salesTarget: number;
  waste: number; 
  laborHours: number;
  csat: number; 
}

export interface StockAlert {
  id: string;
  productName: string;
  department: string;
  stockLevel: number;
  status: 'OUT_OF_STOCK' | 'LOW_STOCK' | 'OVERSTOCK';
}

export interface StrategicInsights {
  segmentationData: {
    category: string;
    segment: string;
    forecast: number;
    actual: number;
  }[];
  planograms: {
    name: string;
    performanceIndex: number; // 0-100
    status: 'TOP' | 'LOW';
    salesPerMeter: number;
  }[];
  productLeaderboard: {
    top: { name: string; sales: number; growth: number }[];
    bottom: { name: string; sales: number; growth: number }[];
  };
  expenses: {
    category: string;
    value: number;
    percentage: number;
  }[];
  customerPreferences: {
    name: string;
    loyaltyScore: number;
    volume: number;
  }[];
  promotions: {
    name: string;
    uplift: number;
    conversion: number;
  }[];
}

export interface StoreData {
  storeId: string;
  storeName: string;
  location: string;
  period: string; 
  totalSales: number;
  totalSalesTarget: number;
  departments: DepartmentData[];
  categorySales: Record<string, number>;
  categoryTargets: Record<string, number>;
  salesTrend: MetricTrend[];
  stockAlerts: StockAlert[];
  labourProductivity: number;
  labourVariance: number;
  strategicInsights: StrategicInsights; // New field for advanced analytics
}

export interface InsightBenchmark {
  metric: string; 
  storeValue: number;
  peerValue: number;
  leaderValue?: number; 
  unit: string; 
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  impact: string; 
  status: 'NEW' | 'IN_PROGRESS' | 'COMPLETED';
  type: InsightType;
  steps: string[];
  completedStepsIndices?: number[];
  assignee?: string;
  dueDate?: string;
  insightType?: string; 
  insightCategory?: string; 
  kpi?: string; 
  trigger?: string; 
  benchmark?: InsightBenchmark; 
  huddleTip?: string; 
  laborReadiness?: 'OPTIMAL' | 'UNDERSTAFFED' | 'CRITICAL';
  progress?: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  isThinking?: boolean;
}

export interface WeeklyProductMetric {
  week: number;
  salesValue: number;
  salesTarget: number; 
  salesUnits: number;
  wasteValue: number;
  stockLevel: number;
}

export interface WeeklyStoreMetric {
  week: number;
  laborHours: number;
  csat: number;
  teamSize: number;
  campaignCompliance: number; 
}

export interface Product {
  id: string;
  name: string;
  category: string; 
  department: string; 
  history: WeeklyProductMetric[]; 
}

export interface DetailedStore {
  id: string;
  name: string;
  location: string;
  products: Product[];
  operations: WeeklyStoreMetric[]; 
}

export interface CategoryBenchmark {
  sales: number;
  waste: number;
  leaderSales: number;
}

export interface PeerBenchmarks {
  categories: Record<string, CategoryBenchmark>;
  operations: {
    avgLaborHours: number;
    avgCsat: number;
    avgCampaignCompliance: number;
    avgStockErrors: number;
  };
}
