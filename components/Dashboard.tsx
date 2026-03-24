
import React, { useState } from 'react';
import { StoreData, Mission, InsightType } from '../types';
import MetricCard from './MetricCard';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell, ComposedChart, Line } from 'recharts';
import { AlertCircle, TrendingUp, Sparkles, ArrowRight, Zap, Award, Users, ClipboardList, X, CheckCircle2, ChevronRight, PackageSearch, AlertTriangle } from 'lucide-react';
import { PRODUCTIVITY_BENCHMARK_GBP_PER_HOUR } from '../constants';

interface DashboardProps {
  data: StoreData;
  insights?: Mission[];
  rank?: number;
  onViewMissions?: () => void;
  onFocusMission?: (id: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ data, insights = [], rank = 1, onViewMissions, onFocusMission }) => {
  const [showHuddle, setShowHuddle] = useState(false);
  
  const salesVsTarget = (data.totalSales / data.totalSalesTarget) * 100;
  const avgCsat = data.departments.reduce((acc, dep) => acc + dep.csat, 0) / data.departments.length;
  
  const totalWasteValue = data.departments.reduce((acc, dep) => acc + (dep.waste / 100 * dep.sales), 0);

  const categoryPerfData = Object.keys(data.categorySales).map(cat => ({
    name: cat,
    actual: data.categorySales[cat],
    target: data.categoryTargets[cat],
    percent: (data.categorySales[cat] / data.categoryTargets[cat]) * 100,
  })).sort((a, b) => a.percent - b.percent);

  const activeMissions = insights.filter(m => m.status !== 'COMPLETED');
  const topPriorities = activeMissions
    .sort((a, b) => (a.type === InsightType.RISK ? -1 : 1))
    .slice(0, 3);

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val);

  // Dynamic Gap Calculation
  const salesGap = data.totalSalesTarget - data.totalSales;
  const gapPrefix = salesGap > 0 ? '-' : '+';
  const gapColor = salesGap > 0 ? 'text-red-500' : 'text-emerald-500';
  const gapLabel = salesGap > 0 ? 'Behind Plan' : 'Ahead of Plan';

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const { actual, target, percent } = payload[0].payload;
      return (
        <div className="bg-white p-4 border border-slate-200 shadow-2xl rounded-2xl min-w-[200px]">
          <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 border-b border-slate-50 pb-2">{label}</p>
          <div className="space-y-2">
            <div className="flex justify-between items-center gap-4">
              <span className="text-xs font-medium text-slate-500">Actual:</span>
              <span className="text-xs font-black text-slate-900">{formatCurrency(actual)}</span>
            </div>
            <div className="flex justify-between items-center gap-4">
              <span className="text-xs font-medium text-slate-500">Target:</span>
              <span className="text-xs font-black text-slate-900">{formatCurrency(target)}</span>
            </div>
            <div className="flex justify-between items-center gap-4 pt-1 border-t border-slate-50 mt-1">
              <span className="text-xs font-black text-brand-600">Achievement:</span>
              <span className={`text-xs font-black ${percent >= 100 ? 'text-emerald-600' : 'text-brand-600'}`}>
                {percent.toFixed(2)}%
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      {/* Huddle Modal */}
      {showHuddle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="bg-brand-600 p-8 text-white relative">
              <button onClick={() => setShowHuddle(false)} className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-full transition-colors">
                <X size={24} />
              </button>
              <div className="flex items-center gap-3 mb-4">
                <Zap fill="currentColor" size={24} />
                <span className="text-xs font-black uppercase tracking-widest opacity-80">Store Manager Briefing</span>
              </div>
              <h2 className="text-3xl font-black tracking-tight mb-2">Daily Execution Plan</h2>
              <p className="text-brand-100 font-medium opacity-90">Maximize store profitability for {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
            </div>
            <div className="p-8 space-y-8">
              <section>
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <Sparkles size={14} className="text-brand-500" /> Morning Huddle Insight
                </h4>
                <div className="bg-slate-50 border border-slate-100 p-6 rounded-2xl italic text-slate-700 text-lg leading-relaxed font-medium">
                  "Good morning team. Today's primary target is <strong>{topPriorities[0]?.insightCategory || 'Service'} Recovery</strong>. We have an opportunity to gain {formatCurrency(Math.abs(data.totalSalesTarget - data.totalSales) / 7)} in revenue by focusing on availability."
                </div>
              </section>

              <section>
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Priority Operations</h4>
                <div className="space-y-3">
                  {topPriorities.map((mission, idx) => (
                    <button 
                      key={mission.id}
                      onClick={() => { setShowHuddle(false); onFocusMission?.(mission.id); }}
                      className="w-full flex items-center gap-4 p-4 rounded-xl border border-slate-100 hover:border-brand-200 hover:bg-brand-50/30 transition-all text-left group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-white shadow-sm border border-slate-100 flex items-center justify-center font-black text-xs text-brand-600">
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-slate-800 text-sm">{mission.title}</p>
                        <p className="text-[10px] text-slate-500 font-medium">Impact: {mission.impact}</p>
                      </div>
                      <ChevronRight size={16} className="text-slate-300 group-hover:text-brand-600 transition-colors" />
                    </button>
                  ))}
                </div>
              </section>

              <div className="flex justify-end pt-4">
                <button 
                  onClick={() => setShowHuddle(false)}
                  className="bg-brand-600 text-white px-8 py-3 rounded-xl font-black text-sm shadow-lg shadow-brand-200"
                >
                  Confirm Execution Plan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            {data.storeName}
            <span className="bg-emerald-500 text-white text-[10px] px-3 py-1 rounded-full uppercase font-black tracking-widest shadow-sm">
              Rank #{rank}
            </span>
          </h2>
          <p className="text-slate-500 flex items-center gap-2 text-sm">
             <span className="bg-slate-200 px-2 py-0.5 rounded text-[10px] font-bold text-slate-600 uppercase tracking-tighter">LOC</span>
             <span>{data.location}</span> • <span>Week Performance Analysis</span>
          </p>
        </div>
        <div className="flex items-center gap-4">
           <div className="hidden lg:flex flex-col items-end px-4 border-r border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{gapLabel}</span>
              <span className={`text-sm font-black ${gapColor}`}>
                {gapPrefix}{formatCurrency(Math.abs(salesGap / 1000)).replace('£', '')}k
              </span>
           </div>
           <button 
             onClick={() => setShowHuddle(true)}
             className="bg-brand-600 hover:bg-brand-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-brand-500/20 flex items-center gap-2"
           >
              <Zap size={16} fill="currentColor" /> Daily Execution Plan
           </button>
        </div>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-5 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
             <h3 className="font-black text-slate-800 text-xs uppercase tracking-widest flex items-center gap-2">
                <Users size={16} className="text-brand-600" /> Daily Team Huddle
             </h3>
             <button onClick={() => setShowHuddle(true)} className="text-[10px] font-bold text-brand-600 uppercase hover:underline">Full Brief</button>
          </div>
          <div className="p-6 flex-1 space-y-5">
             <div className="bg-brand-50 border border-brand-100 p-4 rounded-2xl relative">
                <Sparkles size={16} className="absolute top-4 right-4 text-brand-400" />
                <p className="text-sm font-bold text-brand-900 leading-relaxed">
                  "Morning team. Our top goal today is <strong>{topPriorities[0]?.insightCategory || 'Service'} recovery</strong>. 
                  Focus on closing the {Math.floor(100 - (categoryPerfData[0]?.percent || 0))}% gap to target."
                </p>
             </div>

             <div className="space-y-3">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Next Best Actions</h4>
                {topPriorities.length > 0 ? topPriorities.map((mission) => (
                  <button 
                    key={mission.id} 
                    onClick={() => onFocusMission?.(mission.id)}
                    className="w-full flex items-center group cursor-pointer p-1 rounded-xl hover:bg-slate-50 transition-colors text-left"
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 flex-shrink-0 ${
                      mission.type === InsightType.RISK ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-500'
                    }`}>
                      {mission.type === InsightType.RISK ? <AlertCircle size={14} /> : <TrendingUp size={14} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-bold text-slate-800 truncate">{mission.title}</span>
                        <ChevronRight size={14} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-all" />
                      </div>
                    </div>
                  </button>
                )) : (
                  <p className="text-xs text-slate-400 italic">No active missions found.</p>
                )}
             </div>
          </div>
        </div>

        <div className="xl:col-span-7 bg-white rounded-3xl border border-slate-200 shadow-sm p-6 flex flex-col">
          <div className="flex justify-between items-start mb-6">
             <div>
               <h3 className="font-bold text-slate-900 text-lg">Target vs Achievement Matrix</h3>
               <p className="text-slate-500 text-xs">Internal targets vs achievement with 2-decimal precision.</p>
             </div>
          </div>
          <div className="flex-1 min-h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={categoryPerfData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 700, fill: '#64748b'}} />
                <YAxis axisLine={false} tickLine={false} hide />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  content={<CustomTooltip />}
                />
                <Bar dataKey="percent" barSize={40} radius={[8, 8, 0, 0]}>
                  {categoryPerfData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.percent >= 100 ? '#10b981' : entry.percent >= 85 ? '#3b82f6' : '#f43f5e'} />
                  ))}
                </Bar>
                <Line type="monotone" dataKey="target" stroke="#cbd5e1" strokeWidth={2} strokeDasharray="5 5" dot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Sales Trend"
          value={`£${(data.totalSales / 1000).toFixed(1)}k`}
          target={`£${(data.totalSalesTarget / 1000).toFixed(1)}k`}
          trend={salesVsTarget >= 100 ? 'up' : 'down'}
          trendValue={`${salesVsTarget.toFixed(2)}% Achieved`}
        />
        <MetricCard
          title="Labour Variance"
          value={`${data.labourVariance > 0 ? '+' : ''}${data.labourVariance.toFixed(0)}h`}
          target="0h Target"
          trend={data.labourVariance > 20 ? 'up' : 'down'}
          trendValue={data.labourVariance > 0 ? 'Overspent' : 'Under'}
          isInverse={true}
        />
        <MetricCard
          title="Productivity"
          value={`£${data.labourProductivity.toFixed(2)}/h`}
          target={`£${PRODUCTIVITY_BENCHMARK_GBP_PER_HOUR}`}
          trend={data.labourProductivity >= PRODUCTIVITY_BENCHMARK_GBP_PER_HOUR ? 'up' : 'down'}
          trendValue={`${((data.labourProductivity/PRODUCTIVITY_BENCHMARK_GBP_PER_HOUR)*100).toFixed(0)}% Peer`}
        />
        <MetricCard
          title="CSAT Index"
          value={avgCsat.toFixed(1)}
          target="85"
          trend={avgCsat >= 85 ? 'up' : 'down'}
          trendValue="Customer"
        />
      </div>

      {/* Inventory Risk Monitor */}
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
         <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
               <div className="bg-amber-50 p-2 rounded-xl text-amber-600">
                  <PackageSearch size={24} />
               </div>
               <div>
                  <h3 className="font-black text-slate-800 text-lg">Inventory Risk Monitor</h3>
                  <p className="text-slate-500 text-xs font-medium">Replenishment needed for high-velocity and critical lines.</p>
               </div>
            </div>
            <div className="flex items-center gap-2">
                <span className="flex items-center gap-1.5 text-[10px] font-black text-red-600 bg-red-50 px-3 py-1.5 rounded-lg border border-red-100 shadow-sm animate-pulse">
                   <AlertTriangle size={12} /> {data.stockAlerts.filter(s => s.status === 'OUT_OF_STOCK').length} CRITICAL OOS
                </span>
            </div>
         </div>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {data.stockAlerts.length > 0 ? data.stockAlerts.slice(0, 8).map((alert) => (
              <div key={alert.id} className={`group p-6 rounded-2xl border transition-all duration-300 hover:shadow-lg ${
                alert.status === 'OUT_OF_STOCK' 
                  ? 'bg-red-50 border-red-200 ring-1 ring-red-200 shadow-sm' 
                  : 'bg-slate-50 border-slate-100 hover:bg-white hover:border-brand-200'
              }`}>
                <div className="flex justify-between items-center mb-4">
                  <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md shadow-sm border ${
                    alert.status === 'OUT_OF_STOCK' 
                      ? 'bg-red-600 text-white border-red-700' 
                      : 'bg-amber-500 text-white border-amber-600'
                  }`}>
                    {alert.status.replace('_', ' ')}
                  </span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{alert.department}</span>
                </div>
                
                <h4 className="font-black text-slate-900 text-sm mb-4 line-clamp-1 group-hover:text-brand-600 transition-colors">
                  {alert.productName}
                </h4>

                <div className="flex justify-between items-end border-t border-slate-100 pt-4">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">On Hand</span>
                    <span className={`text-2xl font-black leading-none ${alert.status === 'OUT_OF_STOCK' ? 'text-red-600 underline decoration-2' : 'text-slate-900'}`}>
                      {alert.stockLevel}
                    </span>
                  </div>
                  <button className={`text-[10px] font-black px-3 py-2 rounded-xl border transition-all ${
                    alert.status === 'OUT_OF_STOCK'
                      ? 'bg-white border-red-200 text-red-600 hover:bg-red-600 hover:text-white hover:border-red-600'
                      : 'bg-white border-slate-200 text-brand-600 hover:border-brand-600 hover:bg-brand-50'
                  }`}>
                    REPLENISH
                  </button>
                </div>
              </div>
            )) : (
              <div className="col-span-full py-10 text-center text-slate-400 italic text-sm">
                No critical stock alerts. Inventory health is optimal.
              </div>
            )}
         </div>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
         <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
               <div className="bg-brand-50 p-2 rounded-xl text-brand-600">
                  <ClipboardList size={24} />
               </div>
               <div>
                  <h3 className="font-black text-slate-800 text-lg">Operational Opportunities</h3>
                  <p className="text-slate-500 text-xs font-medium">Prioritized by revenue impact and strategic importance.</p>
               </div>
            </div>
            <button 
              onClick={onViewMissions}
              className="group flex items-center gap-2 bg-slate-50 hover:bg-brand-50 px-4 py-2 rounded-xl border border-slate-200 hover:border-brand-200 transition-all"
            >
               <span className="text-xs font-black text-slate-600 group-hover:text-brand-600 uppercase">Go to Missions</span>
               <ArrowRight size={14} className="text-slate-400 group-hover:text-brand-600" />
            </button>
         </div>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeMissions.length > 0 ? activeMissions.slice(0, 6).map((insight) => (
              <div 
                key={insight.id} 
                onClick={() => onFocusMission?.(insight.id)}
                className="cursor-pointer p-6 rounded-3xl border border-slate-100 hover:border-brand-300 bg-slate-50/30 hover:bg-white transition-all shadow-sm hover:shadow-xl group flex flex-col h-full"
              >
                 <div className="flex justify-between items-center mb-4">
                    <span className="text-[10px] font-black uppercase tracking-widest text-brand-600 bg-brand-50 px-2.5 py-1 rounded-lg border border-brand-100">
                      {insight.insightCategory || 'Operations'}
                    </span>
                    <div className="text-right">
                       <span className="block text-xs font-black text-emerald-600">{insight.impact}</span>
                       <span className="block text-[8px] font-bold text-slate-400 uppercase tracking-tighter">Impact</span>
                    </div>
                 </div>
                 <h4 className="font-black text-slate-900 text-base mb-2 group-hover:text-brand-600 transition-colors leading-tight">
                    {insight.title}
                 </h4>
                 <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4 flex-1">
                    {insight.description}
                 </p>
                 
                 {insight.benchmark && (
                   <div className="pt-4 border-t border-slate-100 mt-auto">
                      <div className="flex justify-between items-center mb-1.5">
                         <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Efficiency Gap</span>
                         <span className="text-[10px] font-black text-slate-700">
                           {formatCurrency(insight.benchmark.storeValue)} vs {formatCurrency(insight.benchmark.leaderValue || insight.benchmark.peerValue || 0)}
                         </span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden shadow-inner p-0.5">
                         <div 
                           className="h-full bg-brand-500 rounded-full transition-all duration-1000" 
                           style={{ width: `${Math.min((insight.benchmark.storeValue / (insight.benchmark.leaderValue || insight.benchmark.peerValue || 1)) * 100, 100)}%` }}
                         />
                      </div>
                   </div>
                 )}
              </div>
            )) : (
              <div className="col-span-full py-16 text-center border border-dashed border-slate-200 rounded-3xl">
                 <ClipboardList className="mx-auto text-slate-200 mb-4" size={48} />
                 <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">No active operational insights at this time.</p>
              </div>
            )}
         </div>
      </div>
    </div>
  );
};

export default Dashboard;
