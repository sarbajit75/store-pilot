import React from 'react';
import { ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string;
  target?: string;
  trend: 'up' | 'down' | 'neutral';
  trendValue: string;
  isInverse?: boolean; // If true, 'down' is good (e.g. waste)
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, target, trend, trendValue, isInverse = false }) => {
  let trendColor = 'text-slate-500';
  let TrendIcon = Minus;
  let bgTrend = 'bg-slate-100';

  if (trend === 'up') {
    TrendIcon = ArrowUpRight;
    trendColor = isInverse ? 'text-red-600' : 'text-emerald-600';
    bgTrend = isInverse ? 'bg-red-50' : 'bg-emerald-50';
  } else if (trend === 'down') {
    TrendIcon = ArrowDownRight;
    trendColor = isInverse ? 'text-emerald-600' : 'text-red-600';
    bgTrend = isInverse ? 'bg-emerald-50' : 'bg-red-50';
  }

  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-slate-500 text-sm font-medium uppercase tracking-wider">{title}</h3>
        <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold ${bgTrend} ${trendColor}`}>
          <TrendIcon size={12} />
          <span>{trendValue}</span>
        </div>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-bold text-slate-900">{value}</span>
        {target && <span className="text-sm text-slate-400">/ {target}</span>}
      </div>
    </div>
  );
};

export default MetricCard;