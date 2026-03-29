"use client";

import React, { useState } from 'react';
import GlassCard from '@/components/GlassCard';
import { analyzeNutrition } from '@/lib/edamam';
import { calculateAdvancedScore, analyzeHealthConditions, detectUPF, getEnvironmentalImpact, getAllergenAlerts } from '@/lib/scoring';
import { getStoredData, STORAGE_KEYS, getCurrentUser } from '@/lib/storage';
import { 
  Search, Info, AlertTriangle, CheckCircle2, Loader2, 
  Leaf, ShieldAlert, Clock, ArrowRightLeft, Database, ChevronDown, ChevronUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { showError } from '@/utils/toast';
import { cn } from '@/lib/utils';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

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
      if (data) {
        const scoreData = calculateAdvancedScore(data);
        const alerts = analyzeHealthConditions(data, user?.healthConditions || []);
        const upf = detectUPF(data.ingredientLines || []);
        const impact = getEnvironmentalImpact(query);
        const allergens = getAllergenAlerts(data.ingredientLines || []);
        
        setResult({ ...data, ...scoreData, alerts, upf, impact, allergens });
      } else {
        showError("Could not analyze this food.");
      }
    } catch (err) {
      showError("An error occurred.");
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
    { name: 'Calories', val: Math.round((result.calories / 2000) * 100) },
    { name: 'Protein', val: Math.round((result.totalNutrients?.PROCNT?.quantity / 50) * 100) },
    { name: 'Fiber', val: Math.round((result.totalNutrients?.FIBTG?.quantity / 28) * 100) },
    { name: 'Sodium', val: Math.round((result.totalNutrients?.NA?.quantity / 2300) * 100) },
  ] : [];

  const NutrientSection = ({ title, id, children }: any) => (
    <div className="border-b border-white/5 last:border-0">
      <button 
        onClick={() => setExpandedSection(expandedSection === id ? null : id)}
        className="w-full py-4 flex justify-between items-center text-white font-bold hover:bg-white/5 px-4 transition-colors"
      >
        <span>{title}</span>
        {expandedSection === id ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>
      <AnimatePresence>
        {expandedSection === id && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden px-4 pb-4"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8">
      <header>
        <h2 className="text-3xl font-bold text-white mb-2">Nutrition Intelligence</h2>
        <p className="text-slate-400">Deep analysis of any food or recipe.</p>
      </header>

      <form onSubmit={handleSearch} className="relative">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for food (e.g., 'Apple', 'Chicken Breast', 'Salmon')..."
          className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 pl-14 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
        />
        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
        <button 
          disabled={loading}
          className="absolute right-3 top-1/2 -translate-y-1/2 bg-cyan-500 hover:bg-cyan-400 text-white px-6 py-2 rounded-xl font-medium transition-colors disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin" size={20} /> : 'Analyze'}
        </button>
      </form>

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            <div className="lg:col-span-2 space-y-6">
              <GlassCard className="p-0 overflow-hidden">
                <div className="p-6 border-b border-white/10 flex justify-between items-start">
                  <div>
                    <h3 className="text-2xl font-bold text-white capitalize mb-1">{query}</h3>
                    <p className="text-slate-400">{result.calories} kcal per serving</p>
                  </div>
                  <div className="text-right">
                    <div className={cn(
                      "text-4xl font-black mb-1",
                      result.score >= 80 ? "text-green-400" : result.score >= 40 ? "text-yellow-400" : "text-red-400"
                    )}>
                      {result.grade}
                    </div>
                    <div className="text-[10px] text-slate-500 uppercase font-bold">Nutri-Score</div>
                  </div>
                </div>

                <NutrientSection title="Macronutrients" id="macros">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="p-3 bg-white/5 rounded-xl text-center">
                      <div className="text-cyan-400 font-bold">{result.totalNutrients?.PROCNT?.quantity.toFixed(1)}g</div>
                      <div className="text-[10px] text-slate-500 uppercase">Protein</div>
                    </div>
                    <div className="p-3 bg-white/5 rounded-xl text-center">
                      <div className="text-purple-400 font-bold">{result.totalNutrients?.CHOCDF?.quantity.toFixed(1)}g</div>
                      <div className="text-[10px] text-slate-500 uppercase">Carbs</div>
                    </div>
                    <div className="p-3 bg-white/5 rounded-xl text-center">
                      <div className="text-pink-400 font-bold">{result.totalNutrients?.FAT?.quantity.toFixed(1)}g</div>
                      <div className="text-[10px] text-slate-500 uppercase">Fat</div>
                    </div>
                    <div className="p-3 bg-white/5 rounded-xl text-center">
                      <div className="text-yellow-400 font-bold">{result.totalNutrients?.FIBTG?.quantity.toFixed(1)}g</div>
                      <div className="text-[10px] text-slate-500 uppercase">Fiber</div>
                    </div>
                  </div>
                  <div className="h-48 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={macroData} innerRadius={40} outerRadius={60} paddingAngle={5} dataKey="value">
                          {macroData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </NutrientSection>

                <NutrientSection title="Vitamins & Minerals" id="vitamins">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-sm">
                    {Object.entries(result.totalNutrients).slice(10, 30).map(([key, nut]: any) => (
                      <div key={key} className="flex justify-between py-1 border-b border-white/5">
                        <span className="text-slate-400">{nut.label}</span>
                        <span className="text-white font-medium">{nut.quantity.toFixed(1)} {nut.unit}</span>
                      </div>
                    ))}
                  </div>
                </NutrientSection>

                <NutrientSection title="Daily Value Progress" id="dv">
                  <div className="space-y-4">
                    {dvData.map((item) => (
                      <div key={item.name}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-400">{item.name}</span>
                          <span className="text-white">{item.val}%</span>
                        </div>
                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min(100, item.val)}%` }}
                            className={cn("h-full", item.val > 100 ? "bg-red-500" : "bg-cyan-500")}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </NutrientSection>
              </GlassCard>

              <GlassCard>
                <h4 className="text-white font-bold mb-4 flex items-center gap-2">
                  <ShieldAlert size={18} className="text-red-400" />
                  Health & Safety Alerts
                </h4>
                <div className="space-y-3">
                  {result.allergens.length > 0 && (
                    <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-200">
                      <AlertTriangle size={16} />
                      <span className="text-sm font-bold">Allergens: {result.allergens.join(', ')}</span>
                    </div>
                  )}
                  {result.alerts.map((alert: any, i: number) => (
                    <div key={i} className={cn(
                      "p-4 rounded-xl flex items-center gap-3 border",
                      alert.type === 'warning' ? "bg-red-500/10 border-red-500/20 text-red-200" : "bg-green-500/10 border-green-500/20 text-green-200"
                    )}>
                      {alert.type === 'warning' ? <AlertTriangle size={16} /> : <CheckCircle2 size={16} />}
                      <span className="text-sm">{alert.message}</span>
                    </div>
                  ))}
                  {result.upf.isUPF && (
                    <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl flex items-center gap-3 text-orange-200">
                      <Zap size={16} />
                      <span className="text-sm">UPF Detected: {result.upf.detectedKeywords.join(', ') || 'High processing'}</span>
                    </div>
                  )}
                </div>
              </GlassCard>
            </div>

            <div className="space-y-6">
              <GlassCard>
                <h4 className="text-white font-bold mb-4 flex items-center gap-2">
                  <Leaf size={18} className="text-green-400" />
                  Eco Impact
                </h4>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 text-sm">Carbon Footprint</span>
                  <span className={cn(
                    "px-3 py-1 rounded-full text-xs font-bold",
                    result.impact === 'Low' ? "bg-green-500/20 text-green-400" : result.impact === 'Medium' ? "bg-yellow-500/20 text-yellow-400" : "bg-red-500/20 text-red-400"
                  )}>
                    {result.impact}
                  </span>
                </div>
              </GlassCard>

              <GlassCard>
                <h4 className="text-white font-bold mb-4 flex items-center gap-2">
                  <ArrowRightLeft size={18} className="text-cyan-400" />
                  Smart Swap
                </h4>
                <p className="text-slate-400 text-sm italic">
                  {result.score < 60 
                    ? "Consider swapping this for a whole-food alternative like fresh fruit or nuts."
                    : "This is a high-quality choice! Keep it up."}
                </p>
              </GlassCard>

              <GlassCard>
                <h4 className="text-white font-bold mb-4 flex items-center gap-2">
                  <Clock size={18} className="text-purple-400" />
                  Meal Timing
                </h4>
                <p className="text-slate-400 text-sm">
                  {new Date().getHours() > 18 
                    ? "High-carb foods at night may disrupt sleep. Consider a lighter portion."
                    : "Great choice for sustained energy throughout the day."}
                </p>
              </GlassCard>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FoodLookup;