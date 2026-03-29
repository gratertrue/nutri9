"use client";

import React, { useState, useEffect } from 'react';
import GlassCard from '@/components/GlassCard';
import { getStoredData, STORAGE_KEYS, setStoredData, updatePoints } from '@/lib/storage';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Flame, Target, TrendingUp, Award, Scale, ChevronRight, Droplets, Plus, Minus } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { showSuccess } from '@/utils/toast';

const Index = () => {
  const [profile] = useState(() => getStoredData(STORAGE_KEYS.USER_PROFILE, { 
    name: 'User', 
    calorieGoal: 2000,
    weight: 0,
    height: 0
  }));
  const [points, setPoints] = useState(() => getStoredData(STORAGE_KEYS.POINTS, 0));
  const [log] = useState(() => getStoredData(STORAGE_KEYS.FOOD_LOG, []));
  const [water, setWater] = useState(() => getStoredData(STORAGE_KEYS.WATER_INTAKE, 0));

  const today = new Date().toISOString().split('T')[0];
  const todayLog = log.filter((item: any) => item.date === today);
  
  const consumedCalories = todayLog.reduce((acc: number, curr: any) => acc + curr.calories, 0);
  const remaining = Math.max(0, profile.calorieGoal - consumedCalories);

  const calculateBMI = () => {
    if (profile.weight && profile.height) {
      const heightInMeters = profile.height / 100;
      return (profile.weight / (heightInMeters * heightInMeters)).toFixed(1);
    }
    return null;
  };

  const bmi = calculateBMI();

  const updateWater = (amount: number) => {
    const newWater = Math.max(0, water + amount);
    setWater(newWater);
    setStoredData(STORAGE_KEYS.WATER_INTAKE, newWater);
    if (amount > 0) {
      const newPoints = updatePoints(5);
      setPoints(newPoints);
      showSuccess("Hydration tracked! +5 pts");
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-6 md:space-y-8 max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl md:text-3xl font-bold text-white mb-1 md:mb-2"
          >
            Welcome back, {profile.name || 'User'}!
          </motion.h2>
          <p className="text-slate-400 text-sm md:text-base">Here's your nutrition intelligence overview for today.</p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
          <GlassCard className="py-2 px-4 flex items-center gap-2 w-full md:w-auto justify-center">
            <Award className="text-yellow-400" size={20} />
            <span className="text-white font-bold">{points} pts</span>
          </GlassCard>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <GlassCard className="relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Flame size={60} className="text-orange-500 md:w-20 md:h-20" />
          </div>
          <h3 className="text-slate-400 text-xs md:text-sm font-medium mb-4">Daily Calories</h3>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl md:text-4xl font-bold text-white">{consumedCalories}</span>
            <span className="text-slate-500 text-sm">/ {profile.calorieGoal} kcal</span>
          </div>
          <div className="mt-6 h-2 bg-white/5 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, (consumedCalories / profile.calorieGoal) * 100)}%` }}
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500"
            />
          </div>
          <p className="mt-4 text-xs md:text-sm text-cyan-400 font-medium">{remaining} kcal remaining</p>
        </GlassCard>

        <GlassCard className="relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Droplets size={60} className="text-blue-500 md:w-20 md:h-20" />
          </div>
          <h3 className="text-slate-400 text-xs md:text-sm font-medium mb-4">Water Intake</h3>
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-3xl md:text-4xl font-bold text-white">{water}</span>
            <span className="text-slate-500 text-sm">/ 8 glasses</span>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => updateWater(1)}
              className="flex-1 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 py-2 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <Plus size={16} /> Add Glass
            </button>
            <button 
              onClick={() => updateWater(-1)}
              className="px-4 bg-white/5 hover:bg-white/10 text-slate-400 py-2 rounded-xl transition-colors"
            >
              <Minus size={16} />
            </button>
          </div>
        </GlassCard>

        <GlassCard className="flex flex-col justify-center relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <Scale size={60} className="text-cyan-500 md:w-20 md:h-20" />
          </div>
          <h3 className="text-slate-400 text-xs md:text-sm font-medium mb-4">Body Mass Index</h3>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl md:text-4xl font-bold text-white">{bmi || '--'}</span>
            <span className="text-slate-500 text-sm">BMI</span>
          </div>
          <div className="mt-4">
            <Link to="/profile" className="text-xs text-cyan-400 hover:underline flex items-center gap-1">
              Update metrics <ChevronRight size={12} />
            </Link>
          </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <GlassCard>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-white font-bold flex items-center gap-2 text-sm md:text-base">
              <TrendingUp size={20} className="text-cyan-400" />
              Weekly Progress
            </h3>
          </div>
          <div className="h-48 md:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={log.slice(-7)}>
                <XAxis dataKey="date" stroke="#64748b" fontSize={10} tickFormatter={(val) => val.split('-')[2]} />
                <YAxis stroke="#64748b" fontSize={10} />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px' }}
                />
                <Bar dataKey="calories" fill="#22d3ee" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-white font-bold flex items-center gap-2 text-sm md:text-base">
              <Target size={20} className="text-purple-400" />
              AI Insights
            </h3>
          </div>
          <div className="space-y-3 md:space-y-4">
            <div className="p-3 md:p-4 bg-white/5 rounded-2xl border border-white/10">
              <p className="text-slate-300 text-xs md:text-sm leading-relaxed">
                "Based on your activity levels, you're hitting your protein goals consistently. Consider increasing fiber intake during lunch to maintain energy levels."
              </p>
            </div>
            <div className="p-3 md:p-4 bg-white/5 rounded-2xl border border-white/10">
              <p className="text-slate-300 text-xs md:text-sm leading-relaxed">
                "You tend to consume 20% more calories on weekends. Try meal prepping on Fridays to stay on track."
              </p>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default Index;