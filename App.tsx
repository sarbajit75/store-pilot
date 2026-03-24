
import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Missions from './components/Missions';
import Copilot from './components/Copilot';
import DataEditor from './components/DataEditor';
import Analytics from './components/Analytics';
import { GENERATE_REALISTIC_DATASET, transformToViewModel, calculatePeerBenchmarks } from './constants';
import { Mission, StoreData, DetailedStore } from './types';
import { generateMissionsFromData } from './services/geminiService';
import { AlertCircle } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dataset, setDataset] = useState<DetailedStore[]>([]);
  const [activeStoreId, setActiveStoreId] = useState<string>('LDN-101');
  const [currentViewData, setCurrentViewData] = useState<StoreData | null>(null);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [loadingMissions, setLoadingMissions] = useState(false);
  const [apiKeyMissing, setApiKeyMissing] = useState(false);
  const [focusedMissionId, setFocusedMissionId] = useState<string | null>(null);
  const [storeRank, setStoreRank] = useState<number>(0);

  useEffect(() => {
    setApiKeyMissing(!process.env.API_KEY);
    setDataset(GENERATE_REALISTIC_DATASET());
  }, []);

  useEffect(() => {
    if (dataset.length === 0) return;

    // Calculate Rank based on Total Sales across all stores in dataset
    const storeSalesData = dataset.map(s => {
      const peers = dataset.filter(p => p.id !== s.id);
      const vm = transformToViewModel(s, peers);
      return { id: s.id, sales: vm.totalSales };
    }).sort((a, b) => b.sales - a.sales);

    const rank = storeSalesData.findIndex(s => s.id === activeStoreId) + 1;
    setStoreRank(rank);

    const activeStore = dataset.find(s => s.id === activeStoreId) || dataset[0];
    const peers = dataset.filter(s => s.id !== activeStoreId);
    const viewModel = transformToViewModel(activeStore, peers);
    setCurrentViewData(viewModel);
    
    const benchmarks = calculatePeerBenchmarks(peers);
    fetchMissions(viewModel, benchmarks);
  }, [dataset, activeStoreId]);

  const fetchMissions = async (data: StoreData, benchmarks: any) => {
    setLoadingMissions(true);
    try {
      const generatedMissions = await generateMissionsFromData(data, benchmarks);
      setMissions(generatedMissions || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingMissions(false);
    }
  };

  const handleUpdateMission = (updatedMission: Mission) => {
    setMissions(prev => prev.map(m => m.id === updatedMission.id ? updatedMission : m));
  };

  const handleCreateMission = (newMission: Mission) => {
    setMissions(prev => [newMission, ...prev]);
  };

  const handleDatasetUpdate = (newDataset: DetailedStore[]) => {
    setDataset(newDataset);
    setActiveTab('dashboard');
  };

  const handleStoreSwitch = (storeId: string) => {
      setActiveStoreId(storeId);
      setActiveTab('dashboard');
  };

  const handleFocusMission = (missionId: string) => {
    setFocusedMissionId(missionId);
    setActiveTab('missions');
  };

  if (!currentViewData) return <div className="flex h-screen items-center justify-center">Loading...</div>;

  return (
    <div className="flex h-screen bg-slate-50 font-sans">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        missionCount={missions.filter(m => m.status !== 'COMPLETED').length}
      />
      
      <main className="flex-1 overflow-y-auto p-8 relative">
        {apiKeyMissing && (
          <div className="mb-6 bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-xl flex items-center gap-3 shadow-sm">
             <AlertCircle size={20} className="text-amber-500"/>
             <span className="text-sm font-medium">AI features are limited as no API Key was detected. StorePilot is running in manual/rule-based mode.</span>
          </div>
        )}

        <div className="max-w-7xl mx-auto">
          {activeTab === 'dashboard' && (
            <Dashboard 
              data={currentViewData} 
              insights={missions} 
              rank={storeRank}
              onViewMissions={() => setActiveTab('missions')}
              onFocusMission={handleFocusMission}
            />
          )}

          {activeTab === 'analytics' && (
            <Analytics insights={currentViewData.strategicInsights} />
          )}
          
          {activeTab === 'missions' && (
            <Missions 
              missions={missions} 
              isLoading={loadingMissions} 
              onRefresh={() => {
                const peers = dataset.filter(s => s.id !== activeStoreId);
                const benchmarks = calculatePeerBenchmarks(peers);
                fetchMissions(currentViewData, benchmarks);
              }}
              onUpdateMission={handleUpdateMission}
              onCreateMission={handleCreateMission}
              initialFocusedId={focusedMissionId}
              onClearFocus={() => setFocusedMissionId(null)}
            />
          )}

          {activeTab === 'copilot' && <Copilot storeData={currentViewData} missions={missions} />}

          {activeTab === 'data' && (
            <DataEditor 
              dataset={dataset}
              activeStoreId={activeStoreId}
              onSave={handleDatasetUpdate}
              onSwitchStore={handleStoreSwitch}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default App;
