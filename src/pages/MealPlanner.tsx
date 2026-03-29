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
  const [plan, setPlan] = useState<any>(() => getStoredData(STORAGE_KEYS.MEAL_PLANNER_LOG, null));
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'calendar' | 'shopping'>('calendar');
  const [cookingMode, setCookingMode] = useState(false);
  const [activeRecipe, setActiveRecipe] = useState<any>(null);
  const [profile] = useState(() => getStoredData(STORAGE_KEYS.USER_PROFILE, { calorieGoal: 2000, healthConditions: [] }));

  const generatePlan = async () => {
    setLoading(true);
    try {
      const data = await getWeeklyMealPlan('user123', {
        plan: {
          accept: { all: [{ health: profile.healthConditions || [] }] }
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
    setActiveRecipe(recipe);
    setCookingMode(true);
    if ('speechSynthesis' in window) {
      const msg = new SpeechSynthesisUtterance(`Starting to cook ${recipe.label}. Step 1: Prepare your ingredients.`);
      window.speechSynthesis.speak(msg);
    }
  };

  // Extract all ingredients for the shopping list
  const shoppingList = plan?.selection?.reduce((acc: string[], day: any) => {
    day.meals.forEach((meal: any) => {
      if (meal.ingredients) acc.push(...meal.ingredients);
    });
    return Array.from(new Set(acc)); // Unique ingredients
  }, []) || [];

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
            className="bg-gradient-to-r from-cyan-500 to-purple-500 text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-cyan-500/20 flex items-center gap-2 mx-auto"
          >
            {loading ? <RefreshCw className="animate-spin" /> : <RefreshCw size={20} />}
            {loading ? "Generating..." : "Generate Weekly Plan"}
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {activeTab === 'calendar' ? (
            <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-4">
              {plan.selection.map((dayData: any) => (
                <GlassCard key={dayData.day} className="p-4 flex flex-col gap-4">
                  <h4 className="text-cyan-400 font-bold text-center border-b border-white/10 pb-2">{dayData.day}</h4>
                  <div className="space-y-3">
                    {dayData.meals.map((meal: any, idx: number) => (
                      <div key={idx} className="p-2 bg-white/5 rounded-lg text-[10px] text-slate-300 group relative">
                        <div className="font-bold text-white truncate" title={meal.label}>{meal.label}</div>
                        <div className="mt-1 flex justify-between">
                          <span>{meal.calories} kcal</span>
                          <span className="text-cyan-400">{meal.protein}g P</span>
                        </div>
                        <button 
                          onClick={() => startCooking(meal)}
                          className="mt-2 w-full py-1 bg-cyan-500/20 text-cyan-400 rounded-md text-[10px] font-bold flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Play size={10} /> Cook
                        </button>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              ))}
            </div>
          ) : (
            <GlassCard className="max-w-2xl mx-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <ShoppingCart className="text-purple-400" />
                  Weekly Shopping List
                </h3>
                <span className="text-xs text-slate-500">{shoppingList.length} items</span>
              </div>
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
                {shoppingList.map((item, i) => (
                  <label key={i} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl cursor-pointer hover:bg-white/10 transition-colors">
                    <input type="checkbox" className="w-4 h-4 rounded border-white/10 bg-transparent text-cyan-500" />
                    <span className="text-sm text-slate-300">{item}</span>
                  </label>
                ))}
              </div>
            </GlassCard>
          )}
          
          <div className="flex justify-center">
            <button 
              onClick={generatePlan}
              className="text-slate-500 hover:text-white text-sm flex items-center gap-2 transition-colors"
            >
              <RefreshCw size={14} /> Regenerate Plan
            </button>
          </div>
        </div>
      )}

      {cookingMode && activeRecipe && (
        <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-xl z-[100] flex items-center justify-center p-8">
          <div className="max-w-3xl w-full text-center space-y-8">
            <div className="text-cyan-400 text-sm font-bold uppercase tracking-widest">Cooking Mode</div>
            <h2 className="text-4xl md:text-5xl font-black text-white">{activeRecipe.label}</h2>
            <div className="p-6 bg-white/5 rounded-3xl border border-white/10">
              <p className="text-xl md:text-2xl text-slate-300 leading-relaxed">
                Step 1: Gather your ingredients. You'll need: {activeRecipe.ingredients?.slice(0, 3).join(', ')} and more.
              </p>
            </div>
            <div className="flex justify-center gap-6">
              <button className="p-6 bg-white/5 rounded-full text-white hover:bg-white/10 transition-all border border-white/10">
                <Mic size={32} />
              </button>
              <button 
                onClick={() => setCookingMode(false)}
                className="px-12 py-4 bg-red-500 text-white rounded-2xl font-bold text-xl shadow-lg shadow-red-500/20"
              >
                Exit Mode
              </button>
            </div>
            <p className="text-slate-500 text-sm italic">Voice commands: "Next step", "Repeat", "Ingredients"</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MealPlanner;