"use client";

import React, { useState, useEffect } from 'react';
import GlassCard from '@/components/GlassCard';
import { getStoredData, STORAGE_KEYS, setStoredData } from '@/lib/storage';
import { Trash2, Utensils, Clock, ChevronRight, PieChart as PieIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { showSuccess } from '@/utils/toast';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const DailyLog = () => {
  const [log, setLog] = useState<any[]>([]);
  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    const allLogs = getStoredData(STORAGE_KEYS.FOOD_LOG, []);
    setLog(allLogs.filter((item: any) => item.date === today));
  }, []);

  const removeItem = (id: number) => {
    const allLogs = getStoredData(STORAGE_KEYS.FOOD_LOG, []);
    const updatedLogs = allLogs.filter((item: any) => item.id !== id);
    setStoredData(STORAGE_KEYS.FOOD_LOG, updatedLogs);
    setLog(updatedLogs.filter((item: any) => item.date === today));
    showSuccess("Item removed from log");
  };

  const totalCalories = log.reduce((acc, curr) => acc + curr.calories, 0);
  const totalProtein = log.reduce((acc, curr) => acc + (curr.protein || 0), 0);
  const totalCarbs = log.reduce((acc, curr) => acc + (curr.carbs || 0), 0);
  const totalFat = log.reduce((acc, curr) => acc + (curr.fat || 0), 0);

  const macroData = [
    { name: 'Protein', value: totalProtein, color: '#22d3ee' },
    { name: 'Carbs', value: totalCarbs, color: '#a855f7' },
    { name: 'Fat', value: totalFat, color: '#ec4899' },
  ].filter(d => d.value > 0);

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Today's Log</h2>
          <p className="text-slate-400">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-cyan-400">{totalCalories}</div>
          <div className="text-xs text-slate-500 uppercase">Total Calories</div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <AnimatePresence mode="popLayout">
            {log.length > 0 ? (
              log.map((item, i) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <GlassCard className="p-4 flex items-center gap-4 group">
                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-cyan-400">
                      <Utensils size={20} />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-white font-medium capitalize truncate max-w-[150px] sm:max-w-none">{item.name}</h4>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <Clock size={12} /> {new Date(item.id).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className="text-xs text-slate-400 font-bold">{item.calories} kcal</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="hidden md:flex gap-3 text-[10px] uppercase font-bold">
                        <span className="text-cyan-500/70">P: {item.protein?.toFixed(0)}g</span>
                        <span className="text-purple-500/70">C: {item.carbs?.toFixed(0)}g</span>
                        <span className="text-pink-500/70">F: {item.fat?.toFixed(0)}g</span>
                      </div>
                      <button 
                        onClick={() => removeItem(item.id)}
                        className="p-2 text-slate-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </GlassCard>
                </motion.div>
              ))
            ) : (
              <div className="text-center py-20">
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-600">
                  <Utensils size={40} />
                </div>
                <h3 className="text-white font-medium">No entries yet</h3>
                <p className="text-slate-500 text-sm mt-2">Start by looking up some food!</p>
                <a href="/lookup" className="inline-block mt-6 text-cyan-400 hover:underline flex items-center justify-center gap-2">
                  Go to Food Lookup <ChevronRight size={16} />
                </a>
              </div>
            )}
          </AnimatePresence>
        </div>

        <div className="space-y-6">
          <GlassCard className="sticky top-24">
            <h3 className="text-white font-bold mb-6 flex items-center gap-2">
              <PieIcon size={18} className="text-purple-400" />
              Macro Distribution
            </h3>
            
            {macroData.length > 0 ? (
              <>
                <div className="h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={macroData}
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {macroData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px', fontSize: '12px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-3 mt-4">
                  {macroData.map((macro) => (
                    <div key={macro.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: macro.color }} />
                        <span className="text-xs text-slate-400">{macro.name}</span>
                      </div>
                      <span className="text-xs font-bold text-white">{macro.value.toFixed(1)}g</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-10 text-slate-500 text-xs italic">
                Log food to see macro breakdown
              </div>
            )}
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default DailyLog;