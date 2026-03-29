"use client";

import React, { useState, useEffect } from 'react';
import GlassCard from './GlassCard';
import { Droplets, Plus, Minus } from 'lucide-react';
import { motion } from 'framer-motion';
import { getStoredData, setStoredData, STORAGE_KEYS } from '@/lib/storage';

const WaterTracker = () => {
  const today = new Date().toISOString().split('T')[0];
  const [glasses, setGlasses] = useState(() => {
    const data = getStoredData(STORAGE_KEYS.STREAK + '_water', {});
    return data[today] || 0;
  });

  const goal = 8;

  useEffect(() => {
    const data = getStoredData(STORAGE_KEYS.STREAK + '_water', {});
    data[today] = glasses;
    setStoredData(STORAGE_KEYS.STREAK + '_water', data);
  }, [glasses, today]);

  const updateWater = (val: number) => {
    setGlasses(prev => Math.max(0, prev + val));
  };

  return (
    <GlassCard className="relative overflow-hidden group">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-white font-bold flex items-center gap-2 text-sm md:text-base">
          <Droplets size={20} className="text-blue-400" />
          Hydration
        </h3>
        <span className="text-xs text-slate-500 font-bold">{glasses}/{goal} glasses</span>
      </div>

      <div className="flex justify-center gap-2 mb-6">
        {Array(goal).fill(0).map((_, i) => (
          <motion.div
            key={i}
            initial={false}
            animate={{ 
              height: i < glasses ? [20, 32, 28] : 28,
              backgroundColor: i < glasses ? '#38bdf8' : 'rgba(255,255,255,0.05)'
            }}
            className="w-3 rounded-full transition-colors"
          />
        ))}
      </div>

      <div className="flex items-center justify-between gap-4">
        <button 
          onClick={() => updateWater(-1)}
          className="p-2 bg-white/5 hover:bg-white/10 rounded-xl text-slate-400 transition-colors border border-white/5"
        >
          <Minus size={16} />
        </button>
        <div className="text-center flex-1">
          <div className="text-2xl font-bold text-white">{glasses * 250}</div>
          <div className="text-[10px] text-slate-500 uppercase">Milliliters</div>
        </div>
        <button 
          onClick={() => updateWater(1)}
          className="p-2 bg-cyan-500 hover:bg-cyan-400 text-white rounded-xl transition-colors shadow-lg shadow-cyan-500/20"
        >
          <Plus size={16} />
        </button>
      </div>
    </GlassCard>
  );
};

export default WaterTracker;