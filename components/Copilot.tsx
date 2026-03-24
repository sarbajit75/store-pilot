
import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Sparkles, Zap, MessageSquare, Info, ClipboardList } from 'lucide-react';
import { ChatMessage, StoreData, Mission } from '../types';
import { chatWithStorePilot } from '../services/geminiService';

interface CopilotProps {
  storeData: StoreData;
  missions: Mission[];
}

const Copilot: React.FC<CopilotProps> = ({ storeData, missions }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: "Hi! I'm StorePilot. I've analyzed your store's data and active missions. You can ask me about sales, waste, or specific details of your missions like steps and assignees."
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (overrideInput?: string) => {
    const textToSend = overrideInput || input;
    if (!textToSend.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: textToSend
    };

    setMessages(prev => [...prev, userMsg]);
    if (!overrideInput) setInput('');
    setIsTyping(true);

    const history = messages.map(m => ({
      role: m.role,
      parts: [{ text: m.text }]
    }));

    const context = {
        storePerformance: storeData,
        activeMissions: missions
    };
    
    const responseText = await chatWithStorePilot(history, textToSend, JSON.stringify(context));

    const botMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'model',
      text: responseText
    };

    setMessages(prev => [...prev, botMsg]);
    setIsTyping(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Simple formatting helper for bot messages
  const formatMessage = (text: string) => {
    return text.split('\n').map((line, i) => {
      // Bold text formatting
      const formattedLine = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
      
      if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
        return (
          <div key={i} className="flex items-start gap-2 mb-1">
            <div className="w-1.5 h-1.5 rounded-full bg-brand-400 mt-2 flex-shrink-0" />
            <span dangerouslySetInnerHTML={{ __html: formattedLine.replace(/^[*-]\s*/, '') }} />
          </div>
        );
      }
      return <p key={i} className="mb-2" dangerouslySetInnerHTML={{ __html: formattedLine }} />;
    });
  };

  // Generate dynamic suggestions based on missions
  const suggestions = missions
    .filter(m => m.status !== 'COMPLETED')
    .slice(0, 2)
    .map(m => `What are the steps for the ${m.title} mission?`);

  if (suggestions.length === 0) {
    suggestions.push("How is our Suncare performance vs peers?");
  }

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden animate-in fade-in zoom-in-95 duration-300">
      {/* Copilot Header with Context Badge */}
      <div className="bg-slate-50 p-4 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
            <div className="bg-brand-600 p-2 rounded-lg text-white shadow-lg shadow-brand-200">
                <Bot size={20} />
            </div>
            <div>
                <h2 className="font-bold text-slate-800 flex items-center gap-2">
                  StorePilot Assistant
                  <span className="bg-emerald-100 text-emerald-700 text-[10px] px-2 py-0.5 rounded-full font-bold animate-pulse">LIVE</span>
                </h2>
                <div className="flex items-center gap-2 text-[10px] text-slate-500 font-medium">
                  <ClipboardList size={10} /> 
                  <span>Context: {missions.length} Missions & {storeData.departments.length} Departments Analyzed</span>
                </div>
            </div>
        </div>
        <div className="hidden sm:flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-slate-200 shadow-sm">
           <Zap size={12} className="text-brand-500" />
           <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tighter">Powered by Gemini 3 Pro</span>
        </div>
      </div>

      {/* Message Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gradient-to-b from-white to-slate-50/30">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex max-w-[85%] gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm ${
                msg.role === 'user' ? 'bg-slate-100 border border-slate-200' : 'bg-brand-600 text-white'
              }`}>
                {msg.role === 'user' ? <User size={18} className="text-slate-500"/> : <Bot size={18} />}
              </div>
              <div className={`p-4 rounded-2xl text-sm leading-relaxed shadow-sm border ${
                msg.role === 'user' 
                  ? 'bg-white text-slate-800 border-slate-200 rounded-tr-none' 
                  : 'bg-white text-slate-800 border-brand-100 rounded-tl-none'
              }`}>
                {msg.role === 'model' ? (
                  <div className="prose-sm">
                    {formatMessage(msg.text)}
                  </div>
                ) : (
                  msg.text
                )}
              </div>
            </div>
          </div>
        ))}
        
        {isTyping && (
           <div className="flex justify-start">
             <div className="flex gap-4 max-w-[80%]">
               <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-brand-100">
                 <Bot size={18} className="text-white"/>
               </div>
               <div className="bg-white border border-brand-100 p-4 rounded-2xl rounded-tl-none flex items-center gap-2 shadow-sm">
                 <div className="w-1.5 h-1.5 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                 <div className="w-1.5 h-1.5 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                 <div className="w-1.5 h-1.5 bg-brand-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                 <span className="text-[10px] font-bold text-brand-400 ml-2 uppercase tracking-widest">Thinking</span>
               </div>
             </div>
           </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input & Suggestions */}
      <div className="p-4 border-t border-slate-200 bg-white">
        {/* Suggestion Chips */}
        {!isTyping && (
          <div className="flex flex-wrap gap-2 mb-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {suggestions.map((s, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(s)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 hover:bg-brand-50 border border-slate-200 hover:border-brand-200 rounded-full text-[11px] font-semibold text-slate-600 hover:text-brand-600 transition-all shadow-sm"
              >
                <MessageSquare size={12} className="opacity-50" />
                {s}
              </button>
            ))}
          </div>
        )}

        <div className="relative group">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about wastage, specific missions, or team assignments..."
            className="w-full pl-5 pr-14 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-brand-500/10 focus:border-brand-500 focus:bg-white transition-all text-sm font-medium"
            disabled={isTyping}
          />
          <button 
            onClick={() => handleSend()}
            disabled={!input.trim() || isTyping}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-2.5 bg-brand-600 text-white rounded-xl hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-brand-500/30 group-focus-within:scale-105"
          >
            <Send size={20} />
          </button>
        </div>
        
        <div className="mt-3 flex items-center justify-center gap-4 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
           <span className="flex items-center gap-1"><Info size={10} /> Data updated 2m ago</span>
           <span className="flex items-center gap-1"><Sparkles size={10} /> Fully Encrypted</span>
        </div>
      </div>
    </div>
  );
};

export default Copilot;
