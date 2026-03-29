"use client";

import React, { useState, useEffect } from 'react';
import GlassCard from '@/components/GlassCard';
import { getStoredData, STORAGE_KEYS, setStoredData } from '@/lib/storage';
import { Trash2, Utensils, Clock, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { showSuccess } from '@/utils/toast';

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

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8">
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

      <div className="space-y-4">
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
                    <h4 className="text-white font-medium capitalize">{item.name}</h4>
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
    </div>
  );
};

export default DailyLog;