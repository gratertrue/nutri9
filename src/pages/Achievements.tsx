"use client";

import React, { useState } from 'react';
import GlassCard from '@/components/GlassCard';
import { getStoredData, STORAGE_KEYS } from '@/lib/storage';
import { Trophy, Star, Zap, Flame, Award, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const achievementsList = [
  { id: 'streak_3', title: 'Consistent Eater', desc: 'Log food for 3 consecutive days', icon: Flame, color: 'text-orange-400', points: 100 },
  { id: 'protein_master', title: 'Protein Master', desc: 'Hit 100g protein in a single day', icon: Zap, color: 'text-cyan-400', points: 250 },
  { id: 'explorer', title: 'Food Explorer', desc: 'Analyze 20 different foods', icon: Star, color: 'text-yellow-400', points: 150 },
  { id: 'healthy_streak', title: 'Health Nut', desc: 'Maintain a Healthy Score > 80 for 5 meals', icon: Award, color: 'text-green-400', points: 300 },
];

const Achievements = () => {
  const [points] = useState(() => getStoredData(STORAGE_KEYS.POINTS, 0));
  const [unlocked] = useState(() => getStoredData(STORAGE_KEYS.ACHIEVEMENTS, ['streak_3']));

  const level = Math.floor(points / 500) + 1;
  const progress = (points % 500) / 5;

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">Achievements</h2>
          <p className="text-slate-400">Track your progress and unlock rewards.</p>
        </div>
        <div className="text-left md:text-right">
          <div className="text-4xl font-black text-white">{points}</div>
          <div className="text-xs text-slate-500 uppercase tracking-widest">Total Points</div>
        </div>
      </header>

      <GlassCard className="relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-cyan-500 to-purple-500 flex items-center justify-center text-4xl font-bold text-white shadow-lg">
            {level}
          </div>
          <div className="flex-1 w-full">
            <div className="flex justify-between mb-2">
              <span className="text-white font-bold">Level {level} Explorer</span>
              <span className="text-slate-400 text-sm">{points % 500} / 500 XP</span>
            </div>
            <div className="h-3 bg-white/5 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                className="h-full bg-gradient-to-r from-cyan-500 to-purple-500"
              />
            </div>
          </div>
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {achievementsList.map((ach, i) => {
          const isUnlocked = unlocked.includes(ach.id);
          return (
            <motion.div
              key={ach.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <GlassCard className={cn(
                "relative group transition-all duration-500",
                !isUnlocked && "opacity-50 grayscale"
              )}>
                <div className="flex gap-5">
                  <div className={cn(
                    "w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center shrink-0",
                    ach.color
                  )}>
                    <ach.icon size={28} />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h3 className="text-white font-bold">{ach.title}</h3>
                      {isUnlocked && <CheckCircle2 size={16} className="text-green-400" />}
                    </div>
                    <p className="text-slate-400 text-sm mt-1">{ach.desc}</p>
                    <div className="mt-4 text-xs font-bold text-cyan-400">+{ach.points} XP</div>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default Achievements;