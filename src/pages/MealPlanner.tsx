"use client";

import React, { useState, useEffect } from 'react';
import GlassCard from '@/components/GlassCard';
import { getWeeklyMealPlan } from '@/lib/edamam';
import { getStoredData, STORAGE_KEYS, setStoredData } from '@/lib/storage';
import { 
  Calendar, ShoppingCart, Mic, Play, ChevronRight, 
  RefreshCw, Trash2, Plus, Scale, ChefHat
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { showSuccess, showError } from '@/utils/toast';
import { cn } from '@/lib/utils';

const MealPlanner = () => {
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'calendar' | 'shopping'>('calendar');
  const [cookingMode, setCookingMode] = useState(false);
  const [profile] = useState(() => getStoredData(STORAGE_KEYS.USER_PROFILE, { calorieGoal: 2000 }));

  const generatePlan = async () => {
    setLoading(true);
    try {
      const data = await getWeeklyMealPlan('user123', {
        size: 7,
        plan: {
          accept: { all: [{ health: profile.healthConditions || [] }] },
          fit: { ENERC_KCAL: { min: profile.calorieGoal * 0.8, max: profile.calorieGoal * 1.2 } }
        }
      });
      if (data) {
        setPlan(data);
        setStoredData(STORAGE_KEYS.MEAL_PLANNER_LOG, data);
        showSuccess("Weekly plan generated!");
      }
    } catch (err) {
      showError("Failed to generate plan.");
    } finally {
      setLoading(false);
    }
  };

  const startCooking = (recipe: any) => {
    setCookingMode(true);
    if ('speechSynthesis' in window) {
      const msg = new SpeechSynthesisUtterance(`Starting to cook ${recipe.label}. Step 1: Prepare your ingredients.`);
      window.speechSynthesis.speak(msg);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2">AI Meal Planner</h2>
          <p className="text-slate-400">Personalized weekly nutrition strategy.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setActiveTab('calendar')}
            className={cn("px-4 py-2 rounded-xl text-sm font-bold transition-all", activeTab === 'calendar' ? "bg-cyan-500 text-white" : "bg-white/5 text-slate-400")}
          >
            Calendar
          </button>
          <button 
            onClick={() => setActiveTab('shopping')}
            className={cn("px-4 py-2 rounded-xl text-sm font-bold transition-all", activeTab === 'shopping' ? "bg-purple-500 text-white" : "bg-white/5 text-slate-400")}
          >
            Shopping List
          </button>
        </div>
      </header>

      {!plan ? (
        <div className="text-center py-20">
          <ChefHat size={64} className="mx-auto text-slate-700 mb-6" />
          <h3 className="text-2xl font-bold text-white mb-4">No Active Plan</h3>
          <button 
            onClick={generatePlan}
            disabled={loading}
            className="bg-gradient-to-r from-cyan-500 to-purple-500 text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-cyan-500/20"
          >
            {loading ? <RefreshCw className="animate-spin" /> : "Generate Weekly Plan"}
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {activeTab === 'calendar' ? (
            <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
                <GlassCard key={day} className="p-4 flex flex-col gap-4">
                  <h4 className="text-cyan-400 font-bold text-center border-b border-white/10 pb-2">{day}</h4>
                  <div className="space-y-3">
                    <div className="p-2 bg-white/5 rounded-lg text-[10px] text-slate-300">
                      <div className="font-bold text-white truncate">Oatmeal with Berries</div>
                      <div className="mt-1">340 kcal</div>
                    </div>
                    <div className="p-2 bg-white/5 rounded-lg text-[10px] text-slate-300">
                      <div className="font-bold text-white truncate">Grilled Chicken Salad</div>
                      <div className="mt-1">520 kcal</div>
                    </div>
                    <button 
                      onClick={() => startCooking({label: 'Grilled Chicken Salad'})}
                      className="w-full py-1 bg-cyan-500/20 text-cyan-400 rounded-md text-[10px] font-bold flex items-center justify-center gap-1"
                    >
                      <Play size={10} /> Cook
                    </button>
                  </div>
                </GlassCard>
              ))}
            </div>
          ) : (
            <GlassCard className="max-w-2xl mx-auto">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <ShoppingCart className="text-purple-400" />
                Weekly Shopping List
              </h3>
              <div className="space-y-4">
                {['Produce', 'Dairy', 'Meat', 'Pantry'].map(cat => (
                  <div key={cat}>
                    <h5 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">{cat}</h5>
                    <div className="space-y-2">
                      <label className="flex items-center gap-3 p-3 bg-white/5 rounded-xl cursor-pointer hover:bg-white/10 transition-colors">
                        <input type="checkbox" className="w-4 h-4 rounded border-white/10 bg-transparent text-cyan-500" />
                        <span className="text-sm text-slate-300">Fresh Spinach (200g)</span>
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          )}
        </div>
      )}

      {cookingMode && (
        <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-xl z-[100] flex items-center justify-center p-8">
          <div className="max-w-3xl w-full text-center space-y-8">
            <h2 className="text-5xl font-black text-white">Step 1: Preparation</h2>
            <p className="text-2xl text-slate-400 leading-relaxed">
              Wash the spinach and slice the grilled chicken into thin strips.
            </p>
            <div className="flex justify-center gap-6">
              <button className="p-6 bg-white/5 rounded-full text-white hover:bg-white/10 transition-all">
                <Mic size={32} />
              </button>
              <button 
                onClick={() => setCookingMode(false)}
                className="px-12 py-4 bg-red-500 text-white rounded-2xl font-bold text-xl"
              >
                Exit Mode
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MealPlanner;