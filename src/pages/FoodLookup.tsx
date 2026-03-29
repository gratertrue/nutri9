"use client";

import React, { useState } from 'react';
import GlassCard from '@/components/GlassCard';
import { analyzeNutrition } from '@/lib/edamam';
import { calculateFoodScore, checkHealthCompatibility, detectUltraProcessed } from '@/lib/scoring';
import { getStoredData, STORAGE_KEYS, setStoredData, updatePoints } from '@/lib/storage';
import { 
  Search, Info, AlertTriangle, CheckCircle2, Plus, Loader2, 
  ChevronDown, ChevronUp, ShieldAlert, Leaf, Scale, Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { showSuccess, showError } from '@/utils/toast';
import { cn } from '@/lib/utils';

const NutrientSection = ({ title, nutrients, open, onToggle }: any) => (
  <div className="border-b border-white/5 last:border-0">
    <button 
      onClick={onToggle}
      className="w-full flex items-center justify-between py-4 text-left hover:bg-white/5 px-2 transition-colors"
    >
      <span className="text-sm font-bold text-slate-300 uppercase tracking-wider">{title}</span>
      {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
    </button>
    <AnimatePresence>
      {open && (
        <motion.div 
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="overflow-hidden pb-4 px-2 space-y-2"
        >
          {nutrients.map((n: any) => n && (
            <div key={n.label} className="flex justify-between text-xs">
              <span className="text-slate-400">{n.label}</span>
              <span className="text-white font-medium">{Math.round(n.quantity)}{n.unit}</span>
            </div>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

const FoodLookup = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [sections, setSections] = useState({ macros: true, vitamins: false, minerals: false });
  const [profile] = useState(() => getStoredData(STORAGE_KEYS.USER_PROFILE, { healthConditions: [] }));

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setLoading(true);
    try {
      const data = await analyzeNutrition(query);
      if (data && data.calories !== undefined) {
        const scoreData = calculateFoodScore(data);
        const healthAlerts = checkHealthCompatibility(data, profile.healthConditions || []);
        const upfData = detectUltraProcessed(data.ingredientLines || []);
        
        setResult({ ...data, ...scoreData, healthAlerts, upfData });
        updatePoints(15);
      } else {
        showError("Could not analyze this food. Try a specific quantity (e.g., '1 large apple').");
      }
    } catch (err) {
      showError("Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const addToLog = () => {
    const log = getStoredData(STORAGE_KEYS.FOOD_LOG, []);
    const newEntry = {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      name: query,
      calories: result.calories,
      protein: result.totalNutrients?.PROCNT?.quantity || 0,
      carbs: result.totalNutrients?.CHOCDF?.quantity || 0,
      fat: result.totalNutrients?.FAT?.quantity || 0,
    };
    setStoredData(STORAGE_KEYS.FOOD_LOG, [...log, newEntry]);
    showSuccess("Added to daily log!");
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8">
      <header>
        <h2 className="text-3xl font-bold text-white mb-2">Nutrition Intelligence</h2>
        <p className="text-slate-400">Deep analysis of any food or recipe.</p>
      </header>

      <form onSubmit={handleSearch} className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g., 100g chicken breast or 1 large apple"
          className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 pl-14 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
        />
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
        <button 
          disabled={loading}
          className="absolute right-3 top-1/2 -translate-y-1/2 bg-cyan-500 hover:bg-cyan-400 text-white px-6 py-2 rounded-xl font-bold transition-all disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : 'Analyze'}
        </button>
      </form>

      <AnimatePresence mode="wait">
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            <div className="lg:col-span-2 space-y-6">
              <GlassCard>
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h3 className="text-2xl font-bold text-white capitalize">{query}</h3>
                    <p className="text-slate-400">{result.calories} kcal per serving</p>
                  </div>
                  <div className="text-center">
                    <div className={cn(
                      "w-16 h-16 rounded-2xl flex items-center justify-center text-3xl font-black shadow-lg",
                      result.grade === 'A' ? "bg-green-500 text-white" : 
                      result.grade === 'B' ? "bg-emerald-500 text-white" :
                      result.grade === 'C' ? "bg-yellow-500 text-white" : "bg-red-500 text-white"
                    )}>
                      {result.grade}
                    </div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold mt-2 block">Food Grade</span>
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4 mb-8">
                  {[
                    { label: 'Protein', val: result.totalNutrients?.PROCNT, color: 'text-cyan-400' },
                    { label: 'Carbs', val: result.totalNutrients?.CHOCDF, color: 'text-purple-400' },
                    { label: 'Fat', val: result.totalNutrients?.FAT, color: 'text-pink-400' },
                    { label: 'Fiber', val: result.totalNutrients?.FIBTG, color: 'text-green-400' },
                  ].map(m => (
                    <div key={m.label} className="text-center p-3 bg-white/5 rounded-2xl">
                      <div className={cn("font-bold text-lg", m.color)}>{Math.round(m.val?.quantity || 0)}g</div>
                      <div className="text-[10px] text-slate-500 uppercase">{m.label}</div>
                    </div>
                  ))}
                </div>

                <div className="space-y-1">
                  <NutrientSection 
                    title="Macronutrients" 
                    open={sections.macros} 
                    onToggle={() => setSections({...sections, macros: !sections.macros})}
                    nutrients={[
                      result.totalNutrients?.FASAT,
                      result.totalNutrients?.FATRN,
                      result.totalNutrients?.CHOLE,
                      result.totalNutrients?.NA,
                      result.totalNutrients?.SUGAR,
                      result.totalNutrients?.SUGAR_ADDED
                    ]}
                  />
                  <NutrientSection 
                    title="Vitamins" 
                    open={sections.vitamins} 
                    onToggle={() => setSections({...sections, vitamins: !sections.vitamins})}
                    nutrients={[
                      result.totalNutrients?.VITA_RAE,
                      result.totalNutrients?.VITC,
                      result.totalNutrients?.VITD,
                      result.totalNutrients?.VITE,
                      result.totalNutrients?.VITK1,
                      result.totalNutrients?.THIA,
                      result.totalNutrients?.RIBF,
                      result.totalNutrients?.NIA,
                      result.totalNutrients?.VITB6A,
                      result.totalNutrients?.FOLDFE,
                      result.totalNutrients?.VITB12
                    ]}
                  />
                  <NutrientSection 
                    title="Minerals" 
                    open={sections.minerals} 
                    onToggle={() => setSections({...sections, minerals: !sections.minerals})}
                    nutrients={[
                      result.totalNutrients?.CA,
                      result.totalNutrients?.FE,
                      result.totalNutrients?.MG,
                      result.totalNutrients?.K,
                      result.totalNutrients?.P,
                      result.totalNutrients?.ZN,
                      result.totalNutrients?.CU,
                      result.totalNutrients?.MN,
                      result.totalNutrients?.SELE
                    ]}
                  />
                </div>

                <button 
                  onClick={addToLog}
                  className="w-full mt-8 bg-white/10 hover:bg-white/20 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all"
                >
                  <Plus size={20} /> Add to Today's Log
                </button>
              </GlassCard>
            </div>

            <div className="space-y-6">
              <GlassCard className="border-cyan-500/20">
                <h4 className="text-white font-bold mb-4 flex items-center gap-2">
                  <ShieldAlert size={18} className="text-cyan-400" />
                  Health Compatibility
                </h4>
                <div className="space-y-3">
                  {result.healthAlerts.length > 0 ? result.healthAlerts.map((alert: any, i: number) => (
                    <div key={i} className={cn(
                      "p-3 rounded-xl text-xs flex gap-3",
                      alert.type === 'warning' ? "bg-red-500/10 text-red-400 border border-red-500/20" :
                      alert.type === 'good' ? "bg-green-500/10 text-green-400 border border-green-500/20" :
                      "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                    )}>
                      <div className="shrink-0 mt-0.5">
                        {alert.type === 'warning' ? <AlertTriangle size={14} /> : <CheckCircle2 size={14} />}
                      </div>
                      <div>
                        <div className="font-bold uppercase text-[10px] mb-1">{alert.condition}</div>
                        {alert.message}
                      </div>
                    </div>
                  )) : (
                    <div className="text-slate-500 text-xs italic">No specific alerts for your profile.</div>
                  )}
                </div>
              </GlassCard>

              <GlassCard>
                <h4 className="text-white font-bold mb-4 flex items-center gap-2">
                  <Zap size={18} className="text-yellow-400" />
                  Smart Insights
                </h4>
                <div className="space-y-4">
                  <div className="p-3 bg-white/5 rounded-xl">
                    <div className="text-[10px] text-slate-500 uppercase font-bold mb-2">Processing Level</div>
                    {result.upfData.isUPF ? (
                      <div className="text-orange-400 text-xs flex items-center gap-2">
                        <AlertTriangle size={14} /> Ultra-processed detected
                      </div>
                    ) : (
                      <div className="text-green-400 text-xs flex items-center gap-2">
                        <CheckCircle2 size={14} /> Minimally processed
                      </div>
                    )}
                  </div>
                  <div className="p-3 bg-white/5 rounded-xl">
                    <div className="text-[10px] text-slate-500 uppercase font-bold mb-2">Eco Impact</div>
                    <div className="flex items-center gap-2 text-xs text-slate-300">
                      <Leaf size={14} className="text-green-500" /> Low Carbon Footprint
                    </div>
                  </div>
                </div>
              </GlassCard>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FoodLookup;