
import React from 'react';
import { StrategicInsights } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, Target, ShoppingBag, PieChart as PieIcon, Tag, Layers, Star } from 'lucide-react';

interface AnalyticsProps {
  insights: StrategicInsights;
}

const Analytics: React.FC<AnalyticsProps> = ({ insights }) => {
  const COLORS = ['#2563eb', '#10b981', '#f59e0b', '#ef4444'];

  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', minimumFractionDigits: 0 }).format(val);

  return (
    <div className="space-y-8 pb-20 animate-fade-in">
      <header>
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Deep Insights Engine</h2>
        <p className="text-slate-500 font-medium">Advanced strategic matrix and high-velocity performance trends.</p>
      </header>

      {/* Product Category vs Customer Segmentation (Forecasted vs Actual) */}
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-3 mb-8">
           <div className="bg-brand-50 p-2 rounded-xl text-brand-600">
              <Layers size={24} />
           </div>
           <div>
              <h3 className="font-black text-slate-800 text-lg">Category & Segment Matrix</h3>
              <p className="text-slate-500 text-xs">Forecasted vs Actual revenue by demographic segment.</p>
           </div>
        </div>
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={insights.segmentationData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="segment" tick={{fontSize: 10, fontWeight: 700}} axisLine={false} tickLine={false} />
              <YAxis tick={{fontSize: 10}} axisLine={false} tickLine={false} tickFormatter={(v) => `£${v/1000}k`} />
              <Tooltip 
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                formatter={(v: number) => formatCurrency(v)}
              />
              <Legend verticalAlign="top" align="right" iconType="circle" wrapperStyle={{ paddingBottom: '20px', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }} />
              <Bar dataKey="forecast" name="Forecasted" fill="#cbd5e1" radius={[4, 4, 0, 0]} barSize={20} />
              <Bar dataKey="actual" name="Actual" fill="#2563eb" radius={[4, 4, 0, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top/Lowest Planograms */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-black text-slate-800 text-lg flex items-center gap-2">
              <Target size={20} className="text-brand-600" /> Planogram Performance
            </h3>
          </div>
          <div className="space-y-4">
            {insights.planograms.map((plano, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-brand-200 transition-all">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs ${plano.status === 'TOP' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                    {plano.performanceIndex}%
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 text-sm">{plano.name}</p>
                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Index Score</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-black text-slate-800 text-sm">£{plano.salesPerMeter}/m</p>
                  <p className="text-[10px] text-slate-400 font-medium">Density</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Operating Expenses */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col">
          <h3 className="font-black text-slate-800 text-lg mb-6 flex items-center gap-2">
            <PieIcon size={20} className="text-brand-600" /> Store Ops Expenses
          </h3>
          <div className="flex-1 flex items-center justify-center gap-8">
             <div className="w-1/2 h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={insights.expenses} dataKey="value" nameKey="category" innerRadius={60} outerRadius={80} paddingAngle={5}>
                      {insights.expenses.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
             </div>
             <div className="w-1/2 space-y-4">
                {insights.expenses.slice(0, 3).map((exp, i) => (
                   <div key={i}>
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
                        <span>{exp.category}</span>
                        <span>{exp.percentage}%</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                         <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${exp.percentage}%`, backgroundColor: COLORS[i % COLORS.length] }} />
                      </div>
                   </div>
                ))}
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Product Leaderboard */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm xl:col-span-1">
          <h3 className="font-black text-slate-800 text-lg mb-6 flex items-center gap-2">
            <ShoppingBag size={20} className="text-brand-600" /> Product Performance
          </h3>
          <div className="space-y-6">
            <section>
              <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-3">Top Leaders</h4>
              {insights.productLeaderboard.top.map((p, i) => (
                <div key={i} className="flex justify-between items-center mb-3 p-3 bg-emerald-50/30 rounded-xl border border-emerald-100">
                  <span className="text-sm font-bold text-slate-800">{p.name}</span>
                  <span className="flex items-center text-xs font-black text-emerald-600 gap-1">
                    <TrendingUp size={12} /> +{p.growth}%
                  </span>
                </div>
              ))}
            </section>
            <section>
              <h4 className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-3">Priority Laggards</h4>
              {insights.productLeaderboard.bottom.map((p, i) => (
                <div key={i} className="flex justify-between items-center mb-3 p-3 bg-red-50/30 rounded-xl border border-red-100">
                  <span className="text-sm font-bold text-slate-800">{p.name}</span>
                  <span className="flex items-center text-xs font-black text-red-600 gap-1">
                    <TrendingDown size={12} /> {p.growth}%
                  </span>
                </div>
              ))}
            </section>
          </div>
        </div>

        {/* Customer Preferred Products */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm xl:col-span-1">
          <h3 className="font-black text-slate-800 text-lg mb-6 flex items-center gap-2">
            <Star size={20} className="text-brand-600" /> Loyalty Preferences
          </h3>
          <div className="space-y-4">
             {insights.customerPreferences.map((pref, i) => (
               <div key={i} className="p-5 bg-slate-50 rounded-2xl border border-slate-100 relative overflow-hidden group hover:border-brand-300 transition-all">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-brand-500/5 rounded-bl-full -mr-12 -mt-12 transition-transform group-hover:scale-150" />
                  <div className="relative z-10">
                     <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-black text-slate-900">{pref.name}</span>
                        <span className="text-[10px] font-black text-brand-600">{pref.loyaltyScore}% Fit</span>
                     </div>
                     <div className="flex items-baseline gap-1">
                        <span className="text-xl font-black text-slate-900">{pref.volume}</span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Repeat Customers</span>
                     </div>
                  </div>
               </div>
             ))}
          </div>
        </div>

        {/* Top Promotions/Offers */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm xl:col-span-1">
          <h3 className="font-black text-slate-800 text-lg mb-6 flex items-center gap-2">
            <Tag size={20} className="text-brand-600" /> Campaign Efficacy
          </h3>
          <div className="space-y-4">
             {insights.promotions.map((promo, i) => (
               <div key={i} className="p-5 border-2 border-brand-50 rounded-2xl bg-gradient-to-br from-brand-50/50 to-white">
                  <p className="text-xs font-black text-brand-600 uppercase tracking-widest mb-3">{promo.name}</p>
                  <div className="grid grid-cols-2 gap-4">
                     <div className="bg-white p-3 rounded-xl border border-brand-100 text-center">
                        <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Revenue Uplift</p>
                        <p className="text-lg font-black text-emerald-600">+{promo.uplift}%</p>
                     </div>
                     <div className="bg-white p-3 rounded-xl border border-brand-100 text-center">
                        <p className="text-[9px] font-black text-slate-400 uppercase mb-1">Conv. Rate</p>
                        <p className="text-lg font-black text-brand-600">{promo.conversion}%</p>
                     </div>
                  </div>
               </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
