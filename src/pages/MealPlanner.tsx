"use client";

import React, { useState, useEffect } from 'react';
import GlassCard from '@/components/GlassCard';
import { getWeeklyMealPlan } from '@/lib/edamam';
import { getStoredData, STORAGE_KEYS, setStoredData, getCurrentUser } from '@/lib/storage';
import { 
  Calendar, ShoppingCart, Play, RefreshCw, ChefHat, Clock, CheckCircle2, ListChecks
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { showSuccess, showError } from '@/utils/toast';
import { cn } from '@/lib/utils';

const MealPlanner = () => {
  // Use dedicated MEAL_PLAN key for the plan object
  const [plan, setPlan] = useState<any>(() => getStoredData(STORAGE_KEYS.MEAL_PLAN, null));
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'calendar' | 'shopping'>('calendar');
  // Use COMPLETION key only for the array of IDs
  const [completedMeals, setCompletedMeals] = useState<string[]>(() => getStoredData(STORAGE_KEYS.COMPLETION, []));
  const user = getCurrentUser();

  const generatePlan = async () => {
    if (!user) {
      showError("Please sign in to generate a plan.");
      return;
    }
    setLoading(true);
    try {
      const data = await getWeeklyMealPlan();
      if (data) {
        setPlan(data);
        setStoredData(STORAGE_KEYS.MEAL_PLAN, data);
        showSuccess("Weekly plan generated!");
      }
    } catch (err) {
      showError("Failed to generate plan.");
    } finally {
      setLoading(false);
    }
  };

  const toggleMeal = (mealId: string) => {
    const newCompleted = completedMeals.includes(mealId)
      ? completedMeals.filter(id => id !== mealId)
      : [...completedMeals, mealId];
    setCompletedMeals(newCompleted);
    setStoredData(STORAGE_KEYS.COMPLETION, newCompleted);
  };

  // Flatten shopping list for easier rendering and counting
  const shoppingList = plan?.selection?.flatMap((day: any) => 
    day.meals.flatMap((meal: any) => meal.ingredients || [])
  ) || [];

  // Unique items for the list
  const uniqueIngredients = Array.from(new Set(shoppingList));

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white">AI Meal Planner</h2>
          <p className="text-slate-400">Personalized weekly nutrition strategy.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setActiveTab('calendar')}
            className={cn("px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2", activeTab === 'calendar' ? "bg-cyan-500 text-white" : "bg-white/5 text-slate-400")}
          >
            <Calendar size={16} /> Calendar
          </button>
          <button 
            onClick={() => setActiveTab('shopping')}
            className={cn("px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2", activeTab === 'shopping' ? "bg-purple-500 text-white" : "bg-white/5 text-slate-400")}
          >
            <ShoppingCart size={16} /> Shopping List
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
                      <div key={meal.id || idx} className={cn(
                        "p-3 bg-white/5 rounded-xl text-[10px] text-slate-300 group relative transition-all",
                        completedMeals.includes(meal.id) && "opacity-50 grayscale"
                      )}>
                        <div className="font-bold text-white truncate mb-1" title={meal.label}>{meal.label}</div>
                        <div className="flex justify-between items-center">
                          <span>{meal.calories} kcal</span>
                          <button 
                            onClick={() => toggleMeal(meal.id)}
                            className={cn(
                              "p-1 rounded-full transition-colors",
                              completedMeals.includes(meal.id) ? "text-green-400" : "text-slate-600 hover:text-white"
                            )}
                          >
                            <CheckCircle2 size={16} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              ))}
            </div>
          ) : (
            <div className="max-w-2xl mx-auto">
              <GlassCard>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <ListChecks size={20} className="text-purple-400" />
                    Weekly Grocery List
                  </h3>
                  <span className="text-xs text-slate-500">{uniqueIngredients.length} unique items</span>
                </div>
                <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                  {uniqueIngredients.length > 0 ? (
                    uniqueIngredients.map((item: string, i: number) => (
                      <label key={i} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl cursor-pointer hover:bg-white/10 transition-colors group">
                        <input type="checkbox" className="w-4 h-4 rounded border-white/10 bg-transparent text-cyan-500 focus:ring-0" />
                        <span className="text-sm text-slate-300 group-hover:text-white transition-colors">{item}</span>
                      </label>
                    ))
                  ) : (
                    <p className="text-center text-slate-500 py-10">No ingredients found in plan.</p>
                  )}
                </div>
              </GlassCard>
            </div>
          )}
          
          <div className="flex justify-center">
            <button 
              onClick={generatePlan}
              className="text-slate-500 hover:text-white text-sm flex items-center gap-2 transition-colors"
            >
              <RefreshCw size={14} /> Regenerate Weekly Plan
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MealPlanner;