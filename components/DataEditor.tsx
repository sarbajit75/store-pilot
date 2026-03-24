
import React, { useState, useEffect } from 'react';
import { DetailedStore } from '../types';
import { Save, RotateCcw, FileJson, Store, AlertCircle } from 'lucide-react';

interface DataEditorProps {
  dataset: DetailedStore[];
  activeStoreId: string;
  onSave: (data: DetailedStore[]) => void;
  onSwitchStore: (id: string) => void;
}

const DataEditor: React.FC<DataEditorProps> = ({ dataset, activeStoreId, onSave, onSwitchStore }) => {
  const [jsonString, setJsonString] = useState<string>('');
  const [jsonError, setJsonError] = useState<string | null>(null);

  useEffect(() => {
    setJsonString(JSON.stringify(dataset, null, 2));
  }, [dataset]);

  const handleJsonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setJsonString(e.target.value);
    try {
      JSON.parse(e.target.value);
      setJsonError(null);
    } catch (err) {
      setJsonError("Invalid JSON format");
    }
  };

  const handleSave = () => {
    try {
      const parsed = JSON.parse(jsonString);
      onSave(parsed);
    } catch (e) {
      setJsonError("Cannot save invalid JSON");
    }
  };

  const activeStore = dataset.find(s => s.id === activeStoreId);

  return (
    <div className="space-y-6 pb-20">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Store Dataset Manager</h2>
          <p className="text-slate-500">Manage granular weekly data for all stores. Switching stores here simulates different locations.</p>
        </div>
      </div>

      {/* Store Selector */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="bg-brand-100 p-2 rounded-lg text-brand-600">
             <Store size={20} />
          </div>
          <div className="flex-1">
             <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Simulate Store View</label>
             <select 
               value={activeStoreId}
               onChange={(e) => onSwitchStore(e.target.value)}
               className="w-full md:w-auto min-w-[300px] p-2 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-800 outline-none focus:ring-2 focus:ring-brand-500"
             >
                {dataset.map(store => (
                    <option key={store.id} value={store.id}>{store.name} ({store.location})</option>
                ))}
             </select>
          </div>
          <div className="text-sm text-slate-500 border-l border-slate-100 pl-4 hidden md:block">
             Currently managing: <strong>{activeStore?.name}</strong>
          </div>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-[600px] flex flex-col animate-in fade-in">
        <div className="flex justify-between items-center mb-2">
           <h3 className="font-bold text-slate-800 flex items-center gap-2">
              <FileJson size={18} className="text-slate-400" /> Full Dataset JSON
           </h3>
           {jsonError && (
             <div className="flex items-center gap-2 text-red-600 text-xs font-bold bg-red-50 px-2 py-1 rounded">
               <AlertCircle size={12} /> {jsonError}
             </div>
           )}
        </div>
        <div className="flex-1 relative">
            <textarea
              value={jsonString}
              onChange={handleJsonChange}
              className="absolute inset-0 w-full h-full font-mono text-xs p-4 bg-slate-900 text-slate-300 rounded-xl resize-none focus:ring-2 focus:ring-brand-500 outline-none custom-scrollbar"
              spellCheck={false}
            />
        </div>
      </div>

      {/* Action Footer */}
      <div className="fixed bottom-0 left-64 right-0 p-4 bg-white border-t border-slate-200 flex justify-end items-center gap-4 z-10">
        <span className="text-xs text-slate-400">
           Saving will regenerate analytics and insights for the active store.
        </span>
        <button
          onClick={() => {
             setJsonString(JSON.stringify(dataset, null, 2));
             setJsonError(null);
          }}
          className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
        >
          <RotateCcw size={18} /> Reset
        </button>
        <button
          onClick={handleSave}
          disabled={!!jsonError}
          className="px-6 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-colors shadow-lg shadow-brand-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Save size={18} /> Update & Recalculate
        </button>
      </div>
    </div>
  );
};

export default DataEditor;
