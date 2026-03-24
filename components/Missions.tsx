
import React, { useState, useEffect } from 'react';
import { Mission, InsightType } from '../types';
import { TEAM_MEMBERS } from '../constants';
import { CheckCircle2, AlertTriangle, Lightbulb, Play, RotateCcw, ChevronDown, ChevronUp, Calendar, User, BarChart3, Plus, X, ListTodo, Gauge, Sparkles, Target, ArrowRight, ClipboardList, CheckSquare, Square } from 'lucide-react';

interface MissionsProps {
  missions: Mission[];
  isLoading: boolean;
  onRefresh: () => void;
  onUpdateMission: (mission: Mission) => void;
  onCreateMission: (mission: Mission) => void;
  initialFocusedId?: string | null;
  onClearFocus?: () => void;
}

const Missions: React.FC<MissionsProps> = ({ missions, isLoading, onRefresh, onUpdateMission, onCreateMission, initialFocusedId, onClearFocus }) => {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (initialFocusedId) {
      setExpandedIds(new Set([initialFocusedId]));
      const el = document.getElementById(`mission-${initialFocusedId}`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [initialFocusedId]);

  const [newMission, setNewMission] = useState<{
    title: string;
    description: string;
    type: InsightType;
    impact: string;
    steps: string[];
    assignee: string;
    dueDate: string;
  }>({
    title: '',
    description: '',
    type: InsightType.OPPORTUNITY,
    impact: '£0',
    steps: [''],
    assignee: TEAM_MEMBERS[0],
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });

  const toggleMission = (id: string) => {
    const next = new Set(expandedIds);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setExpandedIds(next);
  };

  const handleStepToggle = (mission: Mission, index: number) => {
    const currentCompleted = mission.completedStepsIndices || [];
    let nextCompleted: number[];
    
    if (currentCompleted.includes(index)) {
      nextCompleted = currentCompleted.filter(i => i !== index);
    } else {
      nextCompleted = [...currentCompleted, index];
    }

    const totalSteps = mission.steps.length;
    const nextProgress = totalSteps > 0 ? Math.round((nextCompleted.length / totalSteps) * 100) : 0;
    
    let nextStatus = mission.status;
    if (nextProgress === 100 && mission.status === 'IN_PROGRESS') {
      nextStatus = 'COMPLETED';
    } else if (nextProgress < 100 && mission.status === 'COMPLETED') {
      nextStatus = 'IN_PROGRESS';
    }

    onUpdateMission({
      ...mission,
      completedStepsIndices: nextCompleted,
      progress: nextProgress,
      status: nextStatus as any
    });
  };

  const handleAddStep = () => {
    setNewMission({ ...newMission, steps: [...newMission.steps, ''] });
  };

  const handleStepChange = (index: number, value: string) => {
    const nextSteps = [...newMission.steps];
    nextSteps[index] = value;
    setNewMission({ ...newMission, steps: nextSteps });
  };

  const handleRemoveStep = (index: number) => {
    const nextSteps = newMission.steps.filter((_, i) => i !== index);
    setNewMission({ ...newMission, steps: nextSteps.length ? nextSteps : [''] });
  };

  const handleSubmitNewMission = () => {
    if (!newMission.title || !newMission.description) return;
    
    const missionToAdd: Mission = {
      id: `manual-${Date.now()}`,
      title: newMission.title,
      description: newMission.description,
      impact: newMission.impact,
      status: 'NEW',
      type: newMission.type,
      steps: newMission.steps.filter(s => s.trim() !== ''),
      completedStepsIndices: [],
      assignee: newMission.assignee,
      dueDate: newMission.dueDate,
      progress: 0
    };
    
    onCreateMission(missionToAdd);
    setIsCreating(false);
    setNewMission({
      title: '',
      description: '',
      type: InsightType.OPPORTUNITY,
      impact: '£0',
      steps: [''],
      assignee: TEAM_MEMBERS[0],
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    });
  };

  if (isLoading) {
    return (
      <div className="h-full flex flex-col items-center justify-center space-y-4 py-20">
        <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin"></div>
        <p className="text-slate-500 animate-pulse font-medium">Booting Strategy Engine & Fetching KPIs...</p>
      </div>
    );
  }

  const filteredMissions = missions.filter(m => {
    if (activeTab === 'active') return m.status !== 'COMPLETED';
    return m.status === 'COMPLETED';
  });

  const activeCount = missions.filter(m => m.status !== 'COMPLETED').length;
  const completedCount = missions.filter(m => m.status === 'COMPLETED').length;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-6">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            Strategy Center
            <span className="bg-brand-50 text-brand-600 text-[10px] px-3 py-1 rounded-full uppercase font-black tracking-widest border border-brand-100">Management v2</span>
          </h2>
          <p className="text-slate-500 font-medium max-w-lg mt-1">Translate store intelligence into operational excellence through interactive mission tracking.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setIsCreating(true)}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-6 py-3 rounded-2xl text-sm font-black transition-all shadow-xl shadow-slate-200 active:scale-95"
          >
            <Plus size={18} strokeWidth={3} /> New Strategy
          </button>

          <div className="flex bg-slate-200 p-1.5 rounded-2xl shadow-inner border border-slate-300">
            <button
              onClick={() => setActiveTab('active')}
              className={`px-6 py-2.5 text-xs font-black rounded-xl transition-all uppercase tracking-widest ${
                activeTab === 'active' ? 'bg-white text-slate-900 shadow-md' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Active <span className="ml-2 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">{activeCount}</span>
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`px-6 py-2.5 text-xs font-black rounded-xl transition-all uppercase tracking-widest ${
                activeTab === 'completed' ? 'bg-white text-slate-900 shadow-md' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Archived <span className="ml-2 bg-slate-100 px-2 py-0.5 rounded-lg border border-slate-200">{completedCount}</span>
            </button>
          </div>
        </div>
      </div>

      {isCreating && (
        <div className="bg-white rounded-[2.5rem] border-2 border-brand-100 shadow-2xl overflow-hidden animate-in slide-in-from-top-4 duration-500 ring-4 ring-brand-500/5">
          <div className="p-8 border-b border-slate-50 flex justify-between items-center bg-gradient-to-r from-brand-50/50 to-white">
             <div className="flex items-center gap-3">
                <div className="bg-brand-600 p-2.5 rounded-2xl text-white shadow-lg shadow-brand-200">
                   <Target size={20} />
                </div>
                <div>
                   <h3 className="text-slate-900 font-black text-lg">Define New Operational Goal</h3>
                   <p className="text-slate-500 text-xs font-medium">Link this mission to specific store KPIs for tracking.</p>
                </div>
             </div>
             <button onClick={() => setIsCreating(false)} className="bg-slate-100 hover:bg-red-50 text-slate-400 hover:text-red-500 p-2 rounded-xl transition-all">
                <X size={24} />
             </button>
          </div>
          <div className="p-10 grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-6">
              <div>
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Strategic Title</label>
                <input 
                  type="text" 
                  value={newMission.title}
                  onChange={e => setNewMission({...newMission, title: e.target.value})}
                  placeholder="e.g., Weekly Pharmacy Efficiency Audit"
                  className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-black focus:border-brand-500 focus:bg-white outline-none transition-all shadow-sm"
                />
              </div>
              <div>
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Executive Summary</label>
                <textarea 
                  rows={4}
                  value={newMission.description}
                  onChange={e => setNewMission({...newMission, description: e.target.value})}
                  placeholder="Define the problem and the intended success criteria..."
                  className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-medium focus:border-brand-500 focus:bg-white outline-none transition-all resize-none shadow-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Mission Class</label>
                  <select 
                    value={newMission.type}
                    onChange={e => setNewMission({...newMission, type: e.target.value as InsightType})}
                    className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-black focus:border-brand-500 outline-none transition-all cursor-pointer shadow-sm"
                  >
                    <option value={InsightType.OPPORTUNITY}>Revenue Growth</option>
                    <option value={InsightType.RISK}>Loss Prevention</option>
                    <option value={InsightType.INFO}>Team Compliance</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Target Impact</label>
                  <input 
                    type="text" 
                    value={newMission.impact}
                    onChange={e => setNewMission({...newMission, impact: e.target.value})}
                    placeholder="e.g., £1,200 saved"
                    className="w-full p-4 bg-emerald-50/30 border-2 border-emerald-100 rounded-2xl text-sm font-black text-emerald-700 focus:border-emerald-500 outline-none transition-all shadow-sm"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                   <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Assign Team Lead</label>
                   <select 
                    value={newMission.assignee}
                    onChange={e => setNewMission({...newMission, assignee: e.target.value})}
                    className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-black focus:border-brand-500 outline-none transition-all cursor-pointer shadow-sm"
                  >
                    {TEAM_MEMBERS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                   <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest mb-3">Target Date</label>
                   <input 
                    type="date"
                    value={newMission.dueDate}
                    onChange={e => setNewMission({...newMission, dueDate: e.target.value})}
                    className="w-full p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-sm font-black focus:border-brand-500 outline-none transition-all shadow-sm"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <label className="block text-[11px] font-black text-slate-400 uppercase tracking-widest">Tactical Steps (Checklist)</label>
                <button 
                  onClick={handleAddStep}
                  className="text-[11px] font-black text-brand-600 uppercase hover:underline flex items-center gap-1 bg-brand-50 px-3 py-1.5 rounded-lg border border-brand-100 transition-all active:scale-95"
                >
                  <Plus size={14} strokeWidth={3} /> Add Step
                </button>
              </div>
              <div className="space-y-4 flex-1 max-h-[480px] overflow-y-auto pr-4 custom-scrollbar">
                {newMission.steps.map((step, idx) => (
                  <div key={idx} className="flex gap-3 group animate-in slide-in-from-right-4 duration-200">
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 border-2 border-slate-100 flex items-center justify-center text-xs font-black text-slate-300 flex-shrink-0 group-focus-within:border-brand-300 group-focus-within:text-brand-500 transition-all">
                      {idx + 1}
                    </div>
                    <input 
                      type="text"
                      value={step}
                      onChange={e => handleStepChange(idx, e.target.value)}
                      placeholder={`Describe action item ${idx + 1}...`}
                      className="flex-1 p-3.5 bg-white border-2 border-slate-100 rounded-2xl text-sm font-bold outline-none focus:border-brand-500 transition-all shadow-sm"
                    />
                    <button onClick={() => handleRemoveStep(idx)} className="text-slate-300 hover:text-red-500 p-2 transition-colors">
                      <X size={20} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-end gap-4">
             <button onClick={() => setIsCreating(false)} className="px-8 py-3.5 text-sm font-black text-slate-500 hover:text-slate-800 transition-colors uppercase tracking-widest">Cancel</button>
             <button 
               onClick={handleSubmitNewMission}
               disabled={!newMission.title || !newMission.description}
               className="px-12 py-3.5 bg-brand-600 text-white rounded-2xl text-sm font-black disabled:opacity-50 shadow-2xl shadow-brand-200 transition-all hover:scale-105 active:scale-95 uppercase tracking-widest"
             >
                Commit Mission
             </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 pb-20">
        {filteredMissions.length > 0 ? filteredMissions.map((mission) => {
          const isCompleted = mission.status === 'COMPLETED';
          const isExpanded = expandedIds.has(mission.id);
          const inProgress = mission.status === 'IN_PROGRESS';
          const progress = mission.progress || 0;
          const completedIndices = mission.completedStepsIndices || [];
          
          return (
            <div 
              key={mission.id} 
              id={`mission-${mission.id}`}
              className={`bg-white rounded-[2rem] border-2 transition-all duration-500 overflow-hidden ${
                isExpanded ? 'border-brand-500 shadow-2xl ring-4 ring-brand-500/5' : 
                isCompleted ? 'border-slate-100 opacity-80' : 'border-slate-100 hover:border-brand-200 hover:shadow-xl'
              }`}
            >
              <div 
                onClick={() => toggleMission(mission.id)}
                className={`p-8 cursor-pointer transition-colors ${isExpanded ? 'bg-gradient-to-r from-brand-50/30 to-white border-b-2 border-slate-50' : 'hover:bg-slate-50/50'}`}
              >
                <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center">
                  <div className="flex-shrink-0">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-md transition-transform duration-500 ${isExpanded ? 'scale-105' : ''} ${
                      isCompleted ? 'bg-slate-100 text-slate-400' :
                      mission.type === InsightType.RISK ? 'bg-red-50 text-red-600' : 
                      mission.type === InsightType.OPPORTUNITY ? 'bg-emerald-50 text-emerald-600' : 
                      'bg-brand-50 text-brand-600'
                    }`}>
                      {mission.type === InsightType.RISK ? <AlertTriangle size={28} strokeWidth={2.5} /> :
                       mission.type === InsightType.OPPORTUNITY ? <Target size={28} strokeWidth={2.5} /> :
                       <CheckCircle2 size={28} strokeWidth={2.5} />}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col gap-1.5">
                       <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className={`text-[9px] font-black px-2 py-0.5 rounded-lg uppercase tracking-widest border ${
                            mission.type === InsightType.RISK ? 'bg-red-50 text-red-700 border-red-100' : 
                            mission.type === InsightType.OPPORTUNITY ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                            'bg-brand-50 text-brand-700 border-brand-100'
                          }`}>
                            {mission.type}
                          </span>
                          <span className={`text-[9px] font-black px-2 py-0.5 rounded-lg uppercase tracking-widest border ${
                            isCompleted ? 'bg-slate-100 text-slate-500 border-slate-200' : 
                            inProgress ? 'bg-blue-50 text-blue-700 border-blue-100' : 
                            'bg-amber-50 text-amber-700 border-amber-100'
                          }`}>
                            {mission.status.replace('_', ' ')}
                            {inProgress && ` • ${progress}%`}
                          </span>
                       </div>
                       <h3 className={`text-xl lg:text-2xl font-black transition-colors tracking-tight leading-tight ${isCompleted ? 'text-slate-400 line-through' : 'text-slate-900'}`}>
                          {mission.title}
                       </h3>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-8 lg:pl-8 lg:border-l border-slate-100">
                    <div className="text-right">
                      <span className={`block text-2xl font-black leading-none ${isCompleted ? 'text-slate-400' : 'text-emerald-600'}`}>{mission.impact}</span>
                      <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest mt-1.5 block">Expected Benefit</span>
                    </div>
                    <div className={`transition-transform duration-500 p-2 rounded-full ${isExpanded ? 'rotate-180 bg-brand-50 text-brand-600' : 'text-slate-300 hover:bg-slate-100'}`}>
                      <ChevronDown size={24} strokeWidth={3} />
                    </div>
                  </div>
                </div>

                {inProgress && (
                   <div className="mt-6 flex items-center gap-4">
                      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-brand-500 rounded-full transition-all duration-700" style={{ width: `${progress}%` }}></div>
                      </div>
                      <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest whitespace-nowrap">{progress}% COMPLETE</span>
                   </div>
                )}
              </div>

              {isExpanded && (
                <div className="px-8 lg:px-12 pb-12 pt-8 animate-in slide-in-from-top-4 fade-in duration-500 bg-white">
                   <div className="space-y-12">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                         <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 shadow-sm transition-all hover:bg-white hover:border-brand-100">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                               <User size={14} className="text-brand-500" /> Ownership
                            </label>
                            <select 
                               value={mission.assignee || ''}
                               onClick={(e) => e.stopPropagation()}
                               onChange={(e) => onUpdateMission({...mission, assignee: e.target.value})}
                               className="w-full bg-white p-3.5 rounded-2xl text-sm font-black border-2 border-slate-100 focus:border-brand-500 outline-none transition-all"
                            >
                               <option value="">Select Assignee</option>
                               {TEAM_MEMBERS.map(member => <option key={member} value={member}>{member}</option>)}
                            </select>
                         </div>
                         <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 shadow-sm transition-all hover:bg-white hover:border-brand-100">
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                               <Calendar size={14} className="text-amber-500" /> Deadline
                            </label>
                            <input 
                              type="date"
                              value={mission.dueDate || ''}
                              onClick={(e) => e.stopPropagation()}
                              onChange={(e) => onUpdateMission({...mission, dueDate: e.target.value})}
                              className="w-full bg-white p-3.5 rounded-2xl text-sm font-black border-2 border-slate-100 focus:border-brand-500 outline-none transition-all"
                            />
                         </div>
                         <div className="md:col-span-2 bg-gradient-to-br from-brand-600 to-brand-800 p-8 rounded-[2.5rem] text-white shadow-xl shadow-brand-200">
                            <div className="flex justify-between items-center mb-5">
                               <span className="text-[10px] font-black uppercase tracking-widest opacity-80">Execution Progress</span>
                               <span className="text-3xl font-black">{progress}%</span>
                            </div>
                            <div className="space-y-4">
                               <div className="h-4 bg-white/20 rounded-full overflow-hidden p-1 shadow-inner backdrop-blur-md">
                                  <div className="h-full bg-white rounded-full transition-all duration-700" style={{ width: `${progress}%` }} />
                                </div>
                                <div className="text-[10px] font-medium opacity-70 text-center uppercase tracking-widest">
                                  Check off steps below to update progress automatically
                                </div>
                            </div>
                         </div>
                      </div>

                      <div className="max-w-5xl">
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                           <Lightbulb size={14} className="text-brand-500" /> Operational Insight
                        </h4>
                        <p className={`text-xl lg:text-2xl font-bold leading-relaxed tracking-tight ${isCompleted ? 'text-slate-400' : 'text-slate-800'}`}>
                          {mission.description}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                         <div className="lg:col-span-2 space-y-6">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex justify-between items-end">
                               <span className="flex items-center gap-2"><ListTodo size={14} className="text-brand-500" /> Strategic Action Pathway</span>
                               <span className="text-brand-600 bg-brand-50 px-3 py-1 rounded-full text-[10px]">{completedIndices.length} / {mission.steps.length} Steps Done</span>
                            </h4>
                            <div className="grid grid-cols-1 gap-4">
                              {mission.steps.map((step, idx) => {
                                const isChecked = completedIndices.includes(idx);
                                return (
                                  <button 
                                    key={idx} 
                                    onClick={(e) => { e.stopPropagation(); handleStepToggle(mission, idx); }}
                                    className={`w-full flex items-center gap-5 p-6 rounded-3xl border-2 transition-all group text-left ${
                                      isChecked 
                                        ? 'bg-slate-50 border-slate-100 opacity-70' 
                                        : 'bg-white border-slate-100 hover:border-brand-500 hover:shadow-xl hover:shadow-brand-500/5'
                                    }`}
                                  >
                                    <div className={`w-12 h-12 rounded-2xl border-2 flex items-center justify-center text-sm font-black transition-all flex-shrink-0 ${
                                      isChecked 
                                        ? 'bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-200' 
                                        : 'bg-slate-50 border-slate-200 text-slate-400 group-hover:bg-brand-50 group-hover:text-brand-600 group-hover:border-brand-200'
                                    }`}>
                                      {isChecked ? <CheckCircle2 size={24} /> : idx + 1}
                                    </div>
                                    <div className="flex-1">
                                      <span className={`text-base font-bold block ${isChecked ? 'text-slate-400 line-through' : 'text-slate-800'}`}>
                                        {step}
                                      </span>
                                    </div>
                                    <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                                      isChecked ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-200 text-transparent'
                                    }`}>
                                      <CheckSquare size={18} fill={isChecked ? "white" : "transparent"} stroke={isChecked ? "emerald" : "currentColor"} />
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                         </div>

                         <div className="space-y-8">
                            <div className="bg-slate-900 rounded-[3rem] p-10 text-white relative overflow-hidden shadow-2xl border border-slate-800">
                                <Sparkles size={120} className="absolute -bottom-10 -right-10 opacity-5" />
                                <h4 className="text-[10px] font-black text-brand-400 uppercase tracking-widest mb-8 flex items-center gap-2">
                                  <BarChart3 size={16} /> Strategy Metadata
                                </h4>
                                <div className="space-y-8">
                                   <div>
                                      <span className="text-[9px] text-slate-500 uppercase font-black block mb-2 tracking-widest">Detection Source</span>
                                      <span className="text-sm font-black text-white bg-white/5 px-4 py-2.5 rounded-xl border border-white/10 inline-block">
                                        {mission.insightType || "Performance Engine"}
                                      </span>
                                   </div>
                                   {mission.trigger && (
                                     <div>
                                        <span className="text-[9px] text-slate-500 uppercase font-black block mb-3 tracking-widest">KPI Variation</span>
                                        <div className="bg-white/5 p-6 rounded-3xl border border-white/10 font-medium text-slate-300 leading-relaxed text-sm italic">
                                          "{mission.trigger}"
                                        </div>
                                     </div>
                                   )}
                                </div>
                            </div>

                            <div className="flex flex-col gap-4 pt-4">
                              {mission.status === 'NEW' && (
                                <button onClick={(e) => { e.stopPropagation(); onUpdateMission({...mission, status: 'IN_PROGRESS', progress: 0, completedStepsIndices: []}); }} className="w-full bg-brand-600 hover:bg-brand-700 text-white px-8 py-5 rounded-3xl text-sm font-black flex items-center justify-center gap-3 shadow-2xl shadow-brand-500/20 transition-all hover:scale-105 active:scale-95 uppercase tracking-widest">
                                    <Play size={20} fill="currentColor" /> Activate Mission
                                </button>
                              )}
                              {mission.status === 'IN_PROGRESS' && (
                                <button onClick={(e) => { e.stopPropagation(); onUpdateMission({...mission, status: 'COMPLETED', progress: 100, completedStepsIndices: mission.steps.map((_, i) => i)}); }} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-5 rounded-3xl text-sm font-black flex items-center justify-center gap-3 shadow-2xl shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95 uppercase tracking-widest">
                                    <CheckCircle2 size={20} /> Complete Mission
                                </button>
                              )}
                              {mission.status === 'COMPLETED' && (
                                <button onClick={(e) => { e.stopPropagation(); onUpdateMission({...mission, status: 'IN_PROGRESS', progress: 90, completedStepsIndices: mission.completedStepsIndices?.slice(0, -1) }); }} className="w-full bg-white border-2 border-slate-200 text-slate-600 hover:bg-slate-50 px-8 py-5 rounded-3xl text-sm font-black flex items-center justify-center gap-3 transition-all uppercase tracking-widest">
                                    <RotateCcw size={20} strokeWidth={3} /> Re-Open Strategy
                                </button>
                              )}
                            </div>
                         </div>
                      </div>
                   </div>
                </div>
              )}
            </div>
          );
        }) : (
          <div className="py-40 text-center space-y-6">
             <div className="w-24 h-24 bg-slate-100 rounded-[2.5rem] flex items-center justify-center mx-auto text-slate-300">
                <ClipboardList size={48} />
             </div>
             <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">No Strategic Missions Found</h3>
                <p className="text-slate-500 font-medium">Clear of all operational risks. Great job manager!</p>
             </div>
             <button onClick={onRefresh} className="text-brand-600 font-black uppercase text-xs tracking-widest hover:underline">Force System Audit</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Missions;
