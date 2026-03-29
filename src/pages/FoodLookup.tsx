"use client";

import React, { useState } from 'react';
import GlassCard from '@/components/GlassCard';
import { analyzeNutrition } from '@/lib/edamam';
import { calculateAdvancedScore, analyzeHealthConditions, detectUPF, getEnvironmentalImpact, getAllergenAlerts } from '@/lib/scoring';
import { getStoredData, STORAGE_KEYS, getCurrentUser } from '@/lib/storage';
import { 
  Search, Info, AlertTriangle, CheckCircle2, Loader2, 
  Leaf, ShieldAlert, Clock, ArrowRightLeft, Database, ChevronDown, ChevronUp,
  Zap, Beaker, Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { showError } from '@/utils/toast';
import { cn } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, CartesianGrid } from 'recharts';

const FoodLookup = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [expandedSection, setExpandedSection] = useState<string | null>('macros');
  const user = getCurrentUser();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setLoading(true);
    try {
      const data = await analyzeNutrition(query);
      if (data && data.calories > 0) {
        const scoreData = calculateAdvancedScore(data);
        const alerts = analyzeHealthConditions(data, user?.healthConditions || []);
        const upf = detectUPF(data.ingredientLines || []);
        const impact = getEnvironmentalImpact(query);
        const allergens = getAllergenAlerts(data.ingredientLines || []);
        
        setResult({ ...data, ...scoreData, alerts, upf, impact, allergens });
      } else {
        showError("Could not analyze this food. Try being more specific (e.g. '1 large apple').");
      }
    } catch (err) {
      showError("An error occurred during analysis.");
    } finally {
      setLoading(false);
    }
  };

  const macroData = result ? [
    { name: 'Protein', value: result.totalNutrients?.PROCNT?.quantity || 0, color: '#22d3ee' },
    { name: 'Carbs', value: result.totalNutrients?.CHOCDF?.quantity || 0, color: '#a855f7' },
    { name: 'Fat', value: result.totalNutrients?.FAT?.quantity || 0, color: '#ec4899' },
  ] : [];

  const dvData = result ? [
    { name: 'Calories', val: Math.round((result.calories / 2000) * 100), target: 100 },
    { name: 'Protein', val: Math.round(((result.totalNutrients?.PROCNT?.quantity || 0) / 50) * 100), target: 100 },
    { name: 'Fiber', val: Math.round(((result.totalNutrients?.FIBTG?.quantity || 0) / 28) * 100), target: 100 },
    { name: 'Sodium', val: Math.round(((result.totalNutrients?.NA?.quantity || 0) / 2300) * 100), target: 100 },
    { name: 'Iron', val: Math.round(((result.totalNutrients?.FE?.quantity || 0) / 18) * 100), target: 100 },
    { name: 'Calcium', val: Math.round(((result.totalNutrients?.CA?.quantity || 0) / 1000) * 100), target: 100 },
  ] : [];

  const NutrientSection = ({ title, id, icon: Icon, children }: any) => (
    <div className="border-b border-white/5 last:border-0">
      <button 
        onClick={() => setExpandedSection(expandedSection === id ? null : id)}
        className="w-full py-5 flex justify-between items-center text-white font-bold hover:bg-white/5 px-6 transition-colors group"
      >
        <div className="flex items-center gap-3">
          <Icon size={18} className="text-cyan-400 group-hover:scale-110 transition-transform" />
          <span>{title}</span>
        </div>
        {expandedSection === id ? <ChevronUp size={18} className="text-slate-500" /> : <ChevronDown size={18} className="text-slate-500" />}
      </button>
      <AnimatePresence>
        {expandedSection === id && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden px-6 pb-6"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8">
      <header className="space-y-2">
        <h2 className="text-4xl font-black text-white tracking-tight">Nutrition Intelligence</h2>
        <p className="text-slate-400 text-lg">Deep-dive analysis powered by Edamam AI.</p>
      </header>

      <form onSubmit={handleSearch} className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-2xl blur opacity-20 group-focus-within:opacity-40 transition duration-500"></div>
        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for food (e.g., '1 avocado', 'grilled salmon', 'big mac')..."
            className="w-full bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl py-5 px-6 pl-14 text-white text-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
          />
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" size={24} />
          <button 
            disabled={loading}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-cyan-500 hover:bg-cyan-400 text-white px-8 py-2.5 rounded-xl font-bold transition-all disabled:opacity-50 shadow-lg shadow-cyan-500/20"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Analyze'}
          </button>
        </div>
      </form>

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            <div className="lg:col-span-2 space-y-8">
              <GlassCard className="p-0 overflow-hidden border-white/10">
                <div className="p-8 border-b border-white/10 flex justify-between items-start bg-white/5">
                  <div>
                    <h3 className="text-3xl font-black text-white capitalize mb-2">{query}</h3>
                    <div className="flex items-center gap-4">
                      <span className="text-slate-400 font-medium">{result.calories} kcal / serving</span>
                      <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
                      <span className="text-cyan-400 font-bold">{result.totalWeight?.toFixed(0)}g total</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={cn(
                      "text-6xl font-black mb-1 drop-shadow-lg",
                      result.score >= 80 ? "text-green-400" : result.score >= 40 ? "text-yellow-400" : "text-red-400"
                    )}>
                      {result.grade}
                    </div>
                    <div className="text-xs text-slate-500 uppercase font-black tracking-widest">Nutri-Score</div>
                  </div>
                </div>

                <NutrientSection title="Macronutrients" id="macros" icon={Activity}>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {[
                      { label: 'Protein', val: result.totalNutrients?.PROCNT, color: 'text-cyan-400' },
                      { label: 'Carbs', val: result.totalNutrients?.CHOCDF, color: 'text-purple-400' },
                      { label: 'Fat', val: result.totalNutrients?.FAT, color: 'text-pink-400' },
                      { label: 'Fiber', val: result.totalNutrients?.FIBTG, color: 'text-emerald-400' }
                    ].map((m) => (
                      <div key={m.label} className="p-4 bg-white/5 rounded-2xl border border-white/5 text-center">
                        <div className={cn("text-xl font-black", m.color)}>{m.val?.quantity.toFixed(1)}{m.val?.unit}</div>
                        <div className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">{m.label}</div>
                      </div>
                    ))}
                  </div>
                  <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie 
                          data={macroData} 
                          innerRadius={60} 
                          outerRadius={90} 
                          paddingAngle={8} 
                          dataKey="value"
                          stroke="none"
                        >
                          {macroData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px', color: '#fff' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </NutrientSection>

                <NutrientSection title="Vitamins & Minerals" id="vitamins" icon={Beaker}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-3 text-sm">
                    {Object.entries(result.totalNutrients)
                      .filter(([_, n]: any) => n.quantity > 0)
                      .slice(10, 35)
                      .map(([key, nut]: any) => (
                      <div key={key} className="flex justify-between py-2 border-b border-white/5 group hover:bg-white/5 px-2 rounded-lg transition-colors">
                        <span className="text-slate-400 group-hover:text-slate-200">{nut.label}</span>
                        <span className="text-white font-bold">{nut.quantity.toFixed(1)} {nut.unit}</span>
                      </div>
                    ))}
                  </div>
                </NutrientSection>

                <NutrientSection title="Daily Value Progress" id="dv" icon={Database}>
                  <div className="space-y-6">
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={dvData} layout="vertical" margin={{ left: 20, right: 40 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                          <XAxis type="number" domain={[0, 100]} hide />
                          <YAxis dataKey="name" type="category" stroke="#64748b" fontSize={12} width={80} />
                          <Tooltip 
                            cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                            contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '12px' }}
                          />
                          <Bar dataKey="val" radius={[0, 4, 4, 0]}>
                            {dvData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.val > 100 ? '#ef4444' : '#22d3ee'} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                    <p className="text-[10px] text-slate-500 text-center uppercase tracking-widest">Based on a 2,000 calorie diet</p>
                  </div>
                </NutrientSection>
              </GlassCard>

              <GlassCard className="border-white/10">
                <h4 className="text-xl font-black text-white mb-6 flex items-center gap-3">
                  <ShieldAlert size={24} className="text-red-400" />
                  Intelligence Alerts
                </h4>
                <div className="space-y-4">
                  {result.allergens.length > 0 && (
                    <div className="p-5 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-start gap-4 text-red-200">
                      <AlertTriangle className="shrink-0 mt-1" size={20} />
                      <div>
                        <div className="font-black text-sm uppercase tracking-wider mb-1">Allergen Warning</div>
                        <p className="text-sm opacity-80">Contains: {result.allergens.join(', ')}</p>
                      </div>
                    </div>
                  )}
                  {result.alerts.map((alert: any, i: number) => (
                    <div key={i} className={cn(
                      "p-5 rounded-2xl flex items-start gap-4 border transition-all",
                      alert.type === 'warning' ? "bg-red-500/10 border-red-500/20 text-red-200" : 
                      alert.type === 'good' ? "bg-green-500/10 border-green-500/20 text-green-200" :
                      "bg-blue-500/10 border-blue-500/20 text-blue-200"
                    )}>
                      {alert.type === 'warning' ? <AlertTriangle className="shrink-0 mt-1" size={20} /> : 
                       alert.type === 'good' ? <CheckCircle2 className="shrink-0 mt-1" size={20} /> :
                       <Info className="shrink-0 mt-1" size={20} />}
                      <span className="text-sm font-medium">{alert.message}</span>
                    </div>
                  ))}
                  {result.upf.isUPF && (
                    <div className="p-5 bg-orange-500/10 border border-orange-500/20 rounded-2xl flex items-start gap-4 text-orange-200">
                      <Zap className="shrink-0 mt-1" size={20} />
                      <div>
                        <div className="font-black text-sm uppercase tracking-wider mb-1">UPF Detected</div>
                        <p className="text-sm opacity-80">
                          {result.upf.detectedKeywords.length > 0 
                            ? `Contains processed markers: ${result.upf.detectedKeywords.join(', ')}`
                            : "High ingredient count suggests ultra-processing."}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </GlassCard>
            </div>

            <div className="space-y-8">
              <GlassCard className="border-white/10 bg-gradient-to-br from-green-500/5 to-transparent">
                <h4 className="text-white font-black mb-4 flex items-center gap-3">
                  <Leaf size={20} className="text-green-400" />
                  Eco Impact
                </h4>
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                  <span className="text-slate-400 text-sm font-bold">Carbon Footprint</span>
                  <span className={cn(
                    "px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest",
                    result.impact === 'Low' ? "bg-green-500/20 text-green-400" : 
                    result.impact === 'Medium' ? "bg-yellow-500/20 text-yellow-400" : 
                    "bg-red-500/20 text-red-400"
                  )}>
                    {result.impact}
                  </span>
                </div>
              </GlassCard>

              <GlassCard className="border-white/10 bg-gradient-to-br from-cyan-500/5 to-transparent">
                <h4 className="text-white font-black mb-4 flex items-center gap-3">
                  <ArrowRightLeft size={20} className="text-cyan-400" />
                  Smart Swap
                </h4>
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                  <p className="text-slate-300 text-sm leading-relaxed italic">
                    {result.score < 60 
                      ? "This item is high in processed markers. Consider swapping for a whole-food alternative like fresh produce or raw nuts."
                      : "This is a nutrient-dense choice! It aligns well with a high-performance diet."}
                  </p>
                </div>
              </GlassCard>

              <GlassCard className="border-white/10 bg-gradient-to-br from-purple-500/5 to-transparent">
                <h4 className="text-white font-black mb-4 flex items-center gap-3">
                  <Clock size={20} className="text-purple-400" />
                  Meal Timing
                </h4>
                <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                  <p className="text-slate-300 text-sm leading-relaxed">
                    {new Date().getHours() > 18 
                      ? "Late evening consumption: High-carb or high-fat items may impact sleep quality. Consider a smaller portion."
                      : "Daytime consumption: This provides a solid energy profile for your active hours."}
                  </p>
                </div>
              </GlassCard>

              <GlassCard className="border-white/10 bg-slate-900/40">
                <h4 className="text-white font-black mb-4 flex items-center gap-3">
                  <Info size={20} className="text-slate-400" />
                  Ingredients
                </h4>
                <div className="flex flex-wrap gap-2">
                  {result.ingredientLines?.map((ing: string, i: number) => (
                    <span key={i} className="px-3 py-1 bg-white/5 rounded-lg text-[10px] text-slate-400 border border-white/5">
                      {ing}
                    </span>
                  )) || <span className="text-slate-500 text-xs italic">No ingredient data available</span>}
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