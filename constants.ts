
import { StoreData, DetailedStore, Product, WeeklyProductMetric, WeeklyStoreMetric, DepartmentData, StockAlert, PeerBenchmarks, CategoryBenchmark, StrategicInsights } from './types';

const now = new Date();
const CURRENT_WEEK = 42; 
const START_WEEK = 35; 

// Operational Constants for Logic
export const BUDGETED_HOURS_PER_DEPT_PER_WEEK = 160; 
export const PRODUCTIVITY_BENCHMARK_GBP_PER_HOUR = 145;

const formatDate = (date: Date) => date.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' });

const getPeriodString = () => {
    const eightWeeksAgo = new Date(now.getTime() - 56 * 24 * 60 * 60 * 1000);
    return `Weeks ${START_WEEK}-${CURRENT_WEEK} (${formatDate(eightWeeksAgo)} - ${formatDate(now)})`;
};

export const TEAM_MEMBERS = [
    'Store Manager',
    'Sarah (Beauty Lead)',
    'Mike (Pharmacy Mgr)',
    'Jessica (Services Lead)',
    'David (Stockroom)',
    'Emma (Counter)'
];

const STORES_CONFIG = [
    { id: 'LDN-101', name: 'Boots Oxford Street', location: 'London' },
    { id: 'LDN-102', name: 'Boots High St Kensington', location: 'London' },
    { id: 'LDN-103', name: 'Boots Covent Garden', location: 'London' }
];

const PRODUCTS_CONFIG = [
    { id: 'P-001', name: 'Travel Health Consultation', category: 'Travel Health', department: 'Pharmacy Services', price: 45.00 },
    { id: 'P-002', name: 'Flu Vaccination Service', category: 'Vaccinations', department: 'Pharmacy Services', price: 16.99 },
    { id: 'P-012', name: 'NHS Prescription Item', category: 'Prescriptions', department: 'Core Pharmacy', price: 9.65 },
    { id: 'P-020', name: 'Soltan Kids SPF50', category: 'Suncare', department: 'Beauty Hall', price: 6.50 },
    { id: 'P-022', name: 'Piz Buin Tan Intensifier', category: 'Suncare', department: 'Beauty Hall', price: 8.00 },
    { id: 'P-023', name: 'Soltan Face Cream SPF30', category: 'Suncare', department: 'Beauty Hall', price: 5.00 }
];

const getScenarioFactor = (storeId: string, category: string, metric: 'sales' | 'waste' | 'stock' | 'compliance'): number => {
    if (storeId === 'LDN-101') { 
        if (category === 'Suncare' && metric === 'sales') return 0.6; 
        if (category === 'Travel Health' && metric === 'sales') return 0.5; 
        if (metric === 'waste') return 1.4; 
        if (metric === 'compliance') return 0.7; 
    }
    return 1.0;
};

const generateDetailedStore = (config: { id: string, name: string, location: string }): DetailedStore => {
    const products: Product[] = PRODUCTS_CONFIG.map(pConfig => {
        const history: WeeklyProductMetric[] = [];
        for (let w = START_WEEK; w <= CURRENT_WEEK; w++) {
            const baseVol = Math.floor(Math.random() * 50) + 20;
            const targetValue = baseVol * pConfig.price;
            const factor = getScenarioFactor(config.id, pConfig.category, 'sales');
            const actualVol = Math.floor(baseVol * factor * (0.9 + Math.random() * 0.2));
            const salesValue = actualVol * pConfig.price;
            const wasteFactor = getScenarioFactor(config.id, pConfig.category, 'waste');
            const wasteValue = (salesValue * 0.015 * wasteFactor * Math.random());
            
            let stockLevel = Math.floor(Math.random() * 30) + 5;
            if (config.id === 'LDN-101' && w === CURRENT_WEEK) {
                if (pConfig.id === 'P-012') stockLevel = 0;
                if (pConfig.id === 'P-002') stockLevel = 2;
                if (pConfig.category === 'Suncare') stockLevel = Math.floor(Math.random() * 3);
            }

            history.push({
                week: w,
                salesUnits: actualVol,
                salesValue: Number(salesValue.toFixed(2)),
                salesTarget: Number(targetValue.toFixed(2)),
                wasteValue: Number(wasteValue.toFixed(2)),
                stockLevel: stockLevel
            });
        }
        return { ...pConfig, history };
    });

    const operations: WeeklyStoreMetric[] = [];
    for (let w = START_WEEK; w <= CURRENT_WEEK; w++) {
        const compFactor = getScenarioFactor(config.id, 'Operations', 'compliance');
        operations.push({
            week: w,
            laborHours: 800 + Math.floor(Math.random() * 100),
            csat: 80 + Math.floor(Math.random() * 15),
            teamSize: 20,
            campaignCompliance: Math.min(100, Math.floor(95 * compFactor + (Math.random() * 5)))
        });
    }

    return { ...config, products, operations };
};

export const GENERATE_REALISTIC_DATASET = (): DetailedStore[] => STORES_CONFIG.map(generateDetailedStore);

export const transformToViewModel = (store: DetailedStore, peers: DetailedStore[]): StoreData => {
    const deptMap = new Map<string, DepartmentData>();
    const categorySales: Record<string, number> = {};
    const categoryTargets: Record<string, number> = {};
    const trendMap = new Map<number, number>();
    const stockAlerts: StockAlert[] = [];

    let totalStoreSales = 0;
    let totalStoreTarget = 0;
    let totalWasteValue = 0;

    store.products.forEach(p => {
        const latestHistory = p.history[p.history.length - 1];
        const pSales = p.history.reduce((sum, h) => sum + h.salesValue, 0);
        const pTarget = p.history.reduce((sum, h) => sum + h.salesTarget, 0);
        const pWaste = p.history.reduce((sum, h) => sum + h.wasteValue, 0);
        
        totalStoreSales += pSales;
        totalStoreTarget += pTarget;
        totalWasteValue += pWaste;

        categorySales[p.category] = (categorySales[p.category] || 0) + pSales;
        categoryTargets[p.category] = (categoryTargets[p.category] || 0) + pTarget;

        p.history.forEach(h => {
            trendMap.set(h.week, (trendMap.get(h.week) || 0) + h.salesValue);
        });

        if (latestHistory.stockLevel === 0) {
            stockAlerts.push({
                id: `oos-${p.id}`,
                productName: p.name,
                department: p.department,
                stockLevel: 0,
                status: 'OUT_OF_STOCK'
            });
        } else if (latestHistory.stockLevel < 5) {
            stockAlerts.push({
                id: `low-${p.id}`,
                productName: p.name,
                department: p.department,
                stockLevel: latestHistory.stockLevel,
                status: 'LOW_STOCK'
            });
        }

        if (!deptMap.has(p.department)) {
            deptMap.set(p.department, { name: p.department, sales: 0, salesTarget: 0, waste: 0, laborHours: 0, csat: 0 });
        }
        const d = deptMap.get(p.department)!;
        d.sales += pSales;
        d.salesTarget += pTarget;
        d.waste += pWaste;
    });

    const totalActualLabor = store.operations.reduce((s, op) => s + op.laborHours, 0);
    const avgCsat = store.operations.reduce((s, op) => s + op.csat, 0) / store.operations.length;
    const numWeeks = store.operations.length;
    const numDepts = deptMap.size;

    const departments = Array.from(deptMap.values()).map(d => ({
        ...d,
        waste: (d.waste / d.sales) * 100,
        laborHours: Math.floor(totalActualLabor / numDepts),
        csat: avgCsat
    }));

    const salesTrend = Array.from(trendMap.entries()).sort((a,b) => a[0]-b[0]).map(([w,v]) => ({ date: `Week ${w}`, value: Math.floor(v) }));

    const laborProductivity = totalStoreSales / totalActualLabor;
    
    // Logic: Budget = (Num Depts) * (Budgeted Hours/Week) * (Num Weeks)
    const budgetedLabor = numDepts * BUDGETED_HOURS_PER_DEPT_PER_WEEK * numWeeks;
    const laborVariance = totalActualLabor - budgetedLabor;

    // Strategic Insights Generation
    const strategicInsights: StrategicInsights = {
      segmentationData: [
        { category: 'Pharmacy', segment: 'Seniors', forecast: 45000, actual: 48200 },
        { category: 'Pharmacy', segment: 'Families', forecast: 32000, actual: 29500 },
        { category: 'Beauty', segment: 'Gen Z', forecast: 28000, actual: 34500 },
        { category: 'Beauty', segment: 'Professionals', forecast: 22000, actual: 21800 },
        { category: 'Suncare', segment: 'Families', forecast: 15000, actual: 12400 },
      ],
      planograms: [
        { name: 'Pharmacy Main Counter', performanceIndex: 92, status: 'TOP', salesPerMeter: 450 },
        { name: 'Suncare Gondola End', performanceIndex: 88, status: 'TOP', salesPerMeter: 380 },
        { name: 'Gifts Side Wing', performanceIndex: 32, status: 'LOW', salesPerMeter: 95 },
        { name: 'Beauty Aisle 4', performanceIndex: 45, status: 'LOW', salesPerMeter: 120 },
      ],
      productLeaderboard: {
        top: [
          { name: 'Soltan Kids SPF50', sales: 12400, growth: 12.5 },
          { name: 'Flu Jab Service', sales: 8500, growth: 4.2 },
          { name: 'Travel Kit Bundle', sales: 6200, growth: 8.9 },
        ],
        bottom: [
          { name: 'Old Suncare Stock', sales: 150, growth: -45.0 },
          { name: 'Dated Vitamin Range', sales: 420, growth: -12.4 },
        ]
      },
      expenses: [
        { category: 'Store Labor', value: 24500, percentage: 65 },
        { category: 'Utilities', value: 6500, percentage: 18 },
        { category: 'Maintenance', value: 4200, percentage: 12 },
        { category: 'Miscellaneous', value: 1800, percentage: 5 },
      ],
      customerPreferences: [
        { name: 'Boots Advantage Card Exclusive', loyaltyScore: 98, volume: 15400 },
        { name: 'Soltan Family Pack', loyaltyScore: 85, volume: 8200 },
        { name: 'Pharmacy Repeat Prescription', loyaltyScore: 94, volume: 12000 },
      ],
      promotions: [
        { name: '3-for-2 Suncare', uplift: 22.4, conversion: 15.5 },
        { name: 'Advantage Card Double Points', uplift: 14.8, conversion: 12.2 },
        { name: 'Pharmacy Consultation Voucher', uplift: 8.5, conversion: 4.2 },
      ]
    };

    return {
        storeId: store.id,
        storeName: store.name,
        location: store.location,
        period: getPeriodString(),
        totalSales: totalStoreSales,
        totalSalesTarget: totalStoreTarget,
        categorySales,
        categoryTargets,
        departments,
        salesTrend,
        stockAlerts: stockAlerts.sort((a,b) => (a.status === 'OUT_OF_STOCK' ? -1 : 1)),
        labourProductivity: laborProductivity,
        labourVariance: laborVariance,
        strategicInsights: strategicInsights
    };
};

export const calculatePeerBenchmarks = (peers: DetailedStore[]): PeerBenchmarks => {
    const peerCount = peers.length || 1;
    const catData: Record<string, { sales: number[]; waste: number[] }> = {};
    let totalLabor = 0, totalCsat = 0, totalCompliance = 0, totalStockErrors = 0;

    peers.forEach(peer => {
        peer.products.forEach(p => {
            const s = p.history.reduce((sum, h) => sum + h.salesValue, 0);
            const w = p.history.reduce((sum, h) => sum + h.wasteValue, 0);
            if (!catData[p.category]) catData[p.category] = { sales: [], waste: [] };
            catData[p.category].sales.push(s);
            catData[p.category].waste.push(w / s * 100);
            if (p.history[p.history.length-1].stockLevel < 2) totalStockErrors++;
        });
        totalLabor += peer.operations.reduce((s, op) => s + op.laborHours, 0);
        totalCsat += peer.operations.reduce((s, op) => s + op.csat, 0) / peer.operations.length;
        totalCompliance += peer.operations.reduce((s, op) => s + op.campaignCompliance, 0) / peer.operations.length;
    });

    const categories: Record<string, CategoryBenchmark> = {};
    Object.keys(catData).forEach(cat => {
        const sales = catData[cat].sales;
        const waste = catData[cat].waste;
        categories[cat] = {
            sales: Math.floor(sales.reduce((a, b) => a + b, 0) / sales.length),
            leaderSales: Math.max(...sales),
            waste: Number((waste.reduce((a, b) => a + b, 0) / waste.length).toFixed(2))
        };
    });

    return {
        categories,
        operations: {
            avgLaborHours: Math.floor(totalLabor / peerCount),
            avgCsat: Math.floor(totalCsat / peerCount),
            avgCampaignCompliance: Math.floor(totalCompliance / peerCount),
            avgStockErrors: Math.floor(totalStockErrors / peerCount)
        }
    };
};

export const MOCK_STORE_DATA: StoreData = {
    storeId: '', storeName: '', location: '', period: '', totalSales: 0, totalSalesTarget: 0, departments: [], categorySales: {}, categoryTargets: {}, salesTrend: [], stockAlerts: [], labourProductivity: 0, labourVariance: 0, strategicInsights: { segmentationData: [], planograms: [], productLeaderboard: { top: [], bottom: [] }, expenses: [], customerPreferences: [], promotions: [] }
};
