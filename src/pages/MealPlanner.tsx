"use client";

import React, { useState, useEffect } from 'react';
import GlassCard from '@/components/GlassCard';
import { getWeeklyMealPlan } from '@/lib/edamam';
import { getStoredData, STORAGE_KEYS, setStoredData, getCurrentUser } from '@/lib/storage';
import { 
  Calendar, ShoppingCart, Play, RefreshCw, ChefHat, Cpu, Clock, CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { showSuccess, showError } from '@/utils/toast';
import { cn } from '@/lib/utils';

const MealPlanner = () => {
  const [plan, setPlan] = useState<any>(() => getStoredData(STORAGE_KEYS.COMPLETION, null));
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'calendar' | 'shopping'>('calendar');
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
        setStoredData('current_meal_plan', data);
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

  const shoppingList = plan?.selection?.reduce((acc: any, day: any) => {
    day.meals.forEach((meal: any) => {
      meal.ingredients.forEach((ing: string) => {
        const category = ing.toLowerCase().includes('milk') || ing.toLowerCase().includes('cheese') ? 'Dairy' :
                        ing.toLowerCase().includes('chicken') || ing.toLowerCase().includes('beef') ? 'Meat' :
                        ing.toLowerCase().includes('spinach') || ing.toLowerCase().includes('apple') ? 'Produce' : 'Pantry';
        if (!acc[category]) acc[category] = [];
        acc[category].push(ing);
      });
    });
    return acc;
  }, {}) || {};

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
                    {dayData.meals.map((meal: any) => (
                      <div key={meal.id} className={cn(
                        "p-3 bg-white/5 rounded-xl text-[10px] text-slate-300 group relative transition-all",
                        completedMeals.includes(meal.id) && "opacity-50 grayscale"
                      )}>
                        <div className="font-bold text-white truncate mb-1">{meal.label}</div>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(shoppingList).map(([category, items]: any) => (
                <GlassCard key={category}>
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <ShoppingCart size={18} className="text-purple-400" />
                    {category}
                  </h3>
                  <div className="space-y-2">
                    {items.map((item: string, i: number) => (
                      <label key={i} className="flex items-center gap-3 p-2 bg-white/5 rounded-lg cursor-pointer hover:bg-white/10 transition-colors">
                        <input type="checkbox" className="w-4 h-4 rounded border-white/10 bg-transparent text-cyan-500" />
                        <span className="text-xs text-slate-300">{item}</span>
                      </label>
                    ))}
                  </div>
                </GlassCard>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MealPlanner;