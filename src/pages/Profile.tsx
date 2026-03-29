"use client";

import React, { useState, useEffect } from 'react';
import GlassCard from '@/components/GlassCard';
import { getStoredData, setStoredData, STORAGE_KEYS } from '@/lib/storage';
import { User, Activity, Heart, Scale, History, TrendingUp } from 'lucide-react';
import { showSuccess } from '@/utils/toast';
import { cn } from '@/lib/utils';

const Profile = () => {
  const [profile, setProfile] = useState(() => getStoredData(STORAGE_KEYS.USER_PROFILE, {
    name: '', age: 25, weight: 70, height: 175, gender: 'male',
    activityLevel: 'moderate', calorieGoal: 2000,
    healthConditions: [], dietaryRestrictions: []
  }));

  const [bmiHistory, setBmiHistory] = useState(() => getStoredData<any[]>(STORAGE_KEYS.BMI_HISTORY, []));

  const calculateBMI = (w: number, h: number) => {
    const hM = h / 100;
    return (w / (hM * hM)).toFixed(1);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const currentBmi = calculateBMI(profile.weight, profile.height);
    const newHistory = [{ date: new Date().toISOString(), bmi: currentBmi }, ...bmiHistory].slice(0, 10);
    
    setStoredData(STORAGE_KEYS.USER_PROFILE, profile);
    setStoredData(STORAGE_KEYS.BMI_HISTORY, newHistory);
    setBmiHistory(newHistory);
    showSuccess("Profile and BMI history updated!");
  };

  const toggleItem = (list: string[], item: string, key: string) => {
    const newList = list.includes(item) ? list.filter(i => i !== item) : [...list, item];
    setProfile({ ...profile, [key]: newList });
  };

  const conditions = ['Diabetes', 'Heart Disease', 'Kidney Disease', 'GI issues', 'Celiac', 'Lactose intolerance', 'Pregnancy'];
  const diets = ['Vegetarian', 'Vegan', 'Paleo', 'Gluten-Free', 'Keto', 'Low-Sugar', 'Low-Sodium'];

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8">
      <header>
        <h2 className="text-3xl font-bold text-white mb-2">User Intelligence Profile</h2>
        <p className="text-slate-400">Configure your biometric data and health preferences.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSave} className="space-y-6">
            <GlassCard>
              <h3 className="text-white font-bold mb-6 flex items-center gap-2">
                <User size={18} className="text-cyan-400" />
                Biometrics
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-slate-500 uppercase font-bold mb-2 block">Weight (kg)</label>
                  <input type="number" value={profile.weight} onChange={e => setProfile({...profile, weight: Number(e.target.value)})} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white" />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 uppercase font-bold mb-2 block">Height (cm)</label>
                  <input type="number" value={profile.height} onChange={e => setProfile({...profile, height: Number(e.target.value)})} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white" />
                </div>
              </div>
            </GlassCard>

            <GlassCard>
              <h3 className="text-white font-bold mb-6 flex items-center gap-2">
                <Heart size={18} className="text-pink-400" />
                Health Conditions
              </h3>
              <div className="flex flex-wrap gap-2">
                {conditions.map(c => (
                  <button
                    key={c} type="button"
                    onClick={() => toggleItem(profile.healthConditions, c, 'healthConditions')}
                    className={cn(
                      "px-4 py-2 rounded-xl text-xs font-bold transition-all",
                      profile.healthConditions.includes(c) ? "bg-cyan-500 text-white" : "bg-white/5 text-slate-400 border border-white/10"
                    )}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </GlassCard>

            <GlassCard>
              <h3 className="text-white font-bold mb-6 flex items-center gap-2">
                <Activity size={18} className="text-purple-400" />
                Dietary Preferences
              </h3>
              <div className="flex flex-wrap gap-2">
                {diets.map(d => (
                  <button
                    key={d} type="button"
                    onClick={() => toggleItem(profile.dietaryRestrictions, d, 'dietaryRestrictions')}
                    className={cn(
                      "px-4 py-2 rounded-xl text-xs font-bold transition-all",
                      profile.dietaryRestrictions.includes(d) ? "bg-purple-500 text-white" : "bg-white/5 text-slate-400 border border-white/10"
                    )}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </GlassCard>

            <button type="submit" className="w-full bg-cyan-500 hover:bg-cyan-400 text-white py-4 rounded-2xl font-bold shadow-lg shadow-cyan-500/20 transition-all">
              Save Profile & Update BMI
            </button>
          </form>
        </div>

        <div className="space-y-6">
          <GlassCard className="text-center py-8 bg-gradient-to-br from-cyan-500/10 to-purple-500/10">
            <Scale size={40} className="text-cyan-400 mx-auto mb-4" />
            <div className="text-xs text-slate-500 uppercase font-bold mb-1">Current BMI</div>
            <div className="text-5xl font-black text-white mb-2">{calculateBMI(profile.weight, profile.height)}</div>
            <div className="text-xs font-bold text-cyan-400">Healthy Range: 18.5 - 24.9</div>
          </GlassCard>

          <GlassCard>
            <h3 className="text-white font-bold mb-6 flex items-center gap-2">
              <History size={18} className="text-slate-400" />
              BMI History
            </h3>
            <div className="space-y-4">
              {bmiHistory.length > 0 ? bmiHistory.map((entry, i) => (
                <div key={i} className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
                  <div className="text-xs text-slate-400">{new Date(entry.date).toLocaleDateString()}</div>
                  <div className="font-bold text-white">{entry.bmi}</div>
                </div>
              )) : (
                <div className="text-center py-4 text-slate-500 text-xs italic">No history yet.</div>
              )}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};

export default Profile;