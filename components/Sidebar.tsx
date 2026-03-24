
import React from 'react';
import { LayoutDashboard, CheckSquare, MessageSquareText, Settings, LogOut, Store, Database, BarChart3 } from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  missionCount?: number;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, missionCount = 0 }) => {
  const navItems = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'analytics', label: 'Deep Insights', icon: BarChart3 },
    { id: 'missions', label: 'Missions', icon: CheckSquare },
    { id: 'copilot', label: 'AI Co-Pilot', icon: MessageSquareText },
    { id: 'data', label: 'Data Source', icon: Database },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col h-full border-r border-slate-800">
      <div className="p-6 flex items-center gap-3 text-white">
        <div className="bg-brand-600 p-2 rounded-lg">
          <Store size={24} />
        </div>
        <div>
          <h1 className="font-bold text-lg tracking-tight">StorePilot</h1>
          <p className="text-xs text-slate-500">Retail OS v2.0</p>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'bg-brand-600 text-white shadow-lg shadow-brand-900/20'
                  : 'hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon size={20} />
              <span className="font-medium">{item.label}</span>
              {item.id === 'missions' && missionCount > 0 && (
                <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {missionCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button className="flex items-center gap-3 px-4 py-3 text-sm hover:text-white transition-colors w-full">
          <Settings size={18} />
          <span>Settings</span>
        </button>
        <button className="flex items-center gap-3 px-4 py-3 text-sm hover:text-white transition-colors w-full text-red-400 hover:bg-red-900/20 rounded-lg mt-2">
          <LogOut size={18} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
