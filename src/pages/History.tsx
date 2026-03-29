"use client";

import React, { useState, useEffect } from 'react';
import GlassCard from '@/components/GlassCard';
import { getStoredData, STORAGE_KEYS } from '@/lib/storage';
import { Calendar as CalendarIcon, TrendingUp, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const History = () => {
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    const log = getStoredData(STORAGE_KEYS.FOOD_LOG, []);
    // Group by date
    const grouped = log.reduce((acc: any, curr: any) => {
      if (!acc[curr.date]) {
        acc[curr.date] = {
          date: curr.date,
          calories: 0,
          protein: 0,
          carbs: 0,
          fat: 0,
          count: 0
        };
      }
      acc[curr.date].calories += curr.calories;
      acc[curr.date].protein += curr.protein || 0;
      acc[curr.date].carbs += curr.carbs || 0;
      acc[curr.date].fat += curr.fat || 0;
      acc[curr.date].count += 1;
      return acc;
    }, {});

    setHistory(Object.values(grouped).sort((a: any, b: any) => b.date.localeCompare(a.date)));
  }, []);

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8">
      <header>
        <h2 className="text-3xl font-bold text-white mb-2">Nutrition History</h2>
        <p className="text-slate-400">Review your past performance and consistency.</p>
      </header>

      <div className="grid grid-cols-1 gap-4">
        {history.length > 0 ? (
          history.map((day, i) => (
            <motion.div
              key={day.date}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <GlassCard className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:bg-white/15 transition-colors cursor-pointer group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                    <CalendarIcon size={20} />
                  </div>
                  <div>
                    <h4 className="text-white font-bold">
                      {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </h4>
                    <p className="text-xs text-slate-500">{day.count} items logged</p>
                  </div>
                </div>

                <div className="flex flex-1 justify-around md:justify-end md:gap-12 items-center">
                  <div className="text-center md:text-right">
                    <div className="text-lg font-bold text-white">{day.calories}</div>
                    <div className="text-[10px] text-slate-500 uppercase">Calories</div>
                  </div>
                  <div className="hidden sm:block text-center md:text-right">
                    <div className="text-lg font-bold text-purple-400">{day.protein.toFixed(0)}g</div>
                    <div className="text-[10px] text-slate-500 uppercase">Protein</div>
                  </div>
                  <div className="flex items-center text-slate-500 group-hover:text-white transition-colors">
                    <ChevronRight size={20} />
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-20">
            <TrendingUp size={48} className="mx-auto text-slate-700 mb-4" />
            <p className="text-slate-500">No history available yet. Keep logging!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default History;