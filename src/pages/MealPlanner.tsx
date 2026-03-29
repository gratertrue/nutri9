"use client";

import React, { useState, useEffect } from 'react';
import GlassCard from '@/components/GlassCard';
import { getStoredData, STORAGE_KEYS, setStoredData, updatePoints } from '@/lib/storage';
import { getRecommendations } from '@/lib/edamam';
import { 
  Sparkles, 
  RefreshCw, 
  ExternalLink, 
  Clock, 
  Flame, 
  Plus, 
  ChefHat,
  UtensilsCrossed,
  Coffee,
  Moon,
  Sun,
  Filter,
  Zap,
  Leaf,
  Target
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { showSuccess, showError } from '@/utils/toast';
import { cn } from '@/lib/utils';

const mealTypes = [
  { id: 'breakfast', label: 'Breakfast', icon: Coffee, color: 'text-yellow-400' },
  { id: 'lunch', label: 'Lunch', icon: Sun, color: 'text-orange-400' },
  { id: 'dinner', label: 'Dinner', icon: Moon, color: 'text-indigo-400' },
  { id: 'snack', label: 'Snacks', icon: UtensilsCrossed, color: 'text-pink-400' },
];

const smartFilters = [
  { id: 'high-protein', label: 'High Protein', icon: Zap, color: 'text-cyan-400', diet: 'high-protein' },
  { id: 'low-carb', label: 'Low Carb', icon: Target, color: 'text-purple-400', diet: 'low-carb' },
  { id: 'low-fat', label: 'Low Fat', icon: Leaf, color: 'text-green-400', diet: 'low-fat' },
];

const MealPlanner = () => {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeMealType, setActiveMealType] = useState('lunch');
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [useCalorieRange, setUseCalorieRange] = useState(true);
  
  const [profile] = useState(() => getStoredData(STORAGE_KEYS.USER_PROFILE, { 
    dietaryRestrictions: [],
    calorieGoal: 2000 
  }));

  const fetchMeals = async () => {
    setLoading(true);
    try {
      let calorieRange = "";
      if (useCalorieRange) {
        const perMeal = activeMealType === 'snack' 
          ? profile.calorieGoal * 0.15 
          : profile.calorieGoal * 0.35;
        calorieRange = `${Math.round(perMeal * 0.7)}-${Math.round(perMeal * 1.3)}`;
      }

      const selectedFilter = smartFilters.find(f => f.id === activeFilter);

      const data = await getRecommendations({
        healthLabels: profile.dietaryRestrictions || [],
        mealType: activeMealType,
        calories: calorieRange || undefined,
        diet: selectedFilter?.diet
      });

      if (data && data.hits) {
        setRecommendations(data.hits);
      } else {
        setRecommendations([]);
        showError("No recipes found. Try broadening your search.");
      }
    } catch (error) {
      console.error("Failed to fetch meals", error);
      showError("Failed to connect to the recipe engine.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeals();
  }, [activeMealType, activeFilter, useCalorieRange]);

  const addToLog = (recipe: any) => {
    const log = getStoredData(STORAGE_KEYS.FOOD_LOG, []);
    const servings = recipe.yield || 1;
    const newEntry = {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      name: recipe.label,
      calories: Math.round(recipe.calories / servings),
      protein: (recipe.totalNutrients?.PROCNT?.quantity || 0) / servings,
      carbs: (recipe.totalNutrients?.CHOCDF?.quantity || 0) / servings,
      fat: (recipe.totalNutrients?.FAT?.quantity || 0) / servings,
    };
    
    setStoredData(STORAGE_KEYS.FOOD_LOG, [...log, newEntry]);
    updatePoints(30);
    showSuccess(`Added one serving of ${recipe.label} to log!`);
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 md:space-y-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-1 md:mb-2 flex items-center gap-3">
            <Sparkles className="text-yellow-400" />
            AI Meal Planner
          </h2>
          <p className="text-slate-400 text-sm md:text-base">Personalized recipes based on your dietary profile and goals.</p>
        </div>
        <button 
          onClick={fetchMeals}
          disabled={loading}
          className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-xl border border-white/10 transition-all disabled:opacity-50 text-sm"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Refresh Plan
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="space-y-6">
          <GlassCard className="p-4 space-y-6">
            <div>
              <h3 className="text-white font-bold text-xs uppercase tracking-widest mb-4 flex items-center gap-2">
                <UtensilsCrossed size={14} className="text-cyan-400" />
                Meal Type
              </h3>
              <div className="space-y-2">
                {mealTypes.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setActiveMealType(type.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-2.5 rounded-xl border transition-all",
                      activeMealType === type.id 
                        ? "bg-cyan-500/10 border-cyan-500/50 text-white" 
                        : "bg-white/5 border-white/5 text-slate-400 hover:bg-white/10"
                    )}
                  >
                    <type.icon size={16} className={cn(activeMealType === type.id ? type.color : "text-slate-500")} />
                    <span className="text-sm font-medium">{type.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-white font-bold text-xs uppercase tracking-widest mb-4 flex items-center gap-2">
                <Filter size={14} className="text-purple-400" />
                Smart Filters
              </h3>
              <div className="space-y-2">
                {smartFilters.map((filter) => (
                  <button
                    key={filter.id}
                    onClick={() => setActiveFilter(activeFilter === filter.id ? null : filter.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-2.5 rounded-xl border transition-all",
                      activeFilter === filter.id 
                        ? "bg-purple-500/10 border-purple-500/50 text-white" 
                        : "bg-white/5 border-white/5 text-slate-400 hover:bg-white/10"
                    )}
                  >
                    <filter.icon size={16} className={cn(activeFilter === filter.id ? filter.color : "text-slate-500")} />
                    <span className="text-sm font-medium">{filter.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-white/10">
              <label className="flex items-center justify-between cursor-pointer group">
                <span className="text-xs text-slate-400 group-hover:text-white transition-colors">Calorie Optimization</span>
                <div 
                  onClick={() => setUseCalorieRange(!useCalorieRange)}
                  className={cn(
                    "w-10 h-5 rounded-full transition-colors relative",
                    useCalorieRange ? "bg-cyan-500" : "bg-white/10"
                  )}
                >
                  <div className={cn(
                    "absolute top-1 w-3 h-3 bg-white rounded-full transition-all",
                    useCalorieRange ? "left-6" : "left-1"
                  )} />
                </div>
              </label>
              <p className="text-[10px] text-slate-500 mt-2">
                Matches recipes to your daily goal of {profile.calorieGoal} kcal.
              </p>
            </div>
          </GlassCard>
        </div>

        <div className="lg:col-span-3">
          <AnimatePresence mode="popLayout">
            {loading ? (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6"
              >
                {Array(6).fill(0).map((_, i) => (
                  <div key={i} className="h-[400px] bg-white/5 rounded-[24px] animate-pulse" />
                ))}
              </motion.div>
            ) : recommendations.length > 0 ? (
              <motion.div 
                key="results"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6"
              >
                {recommendations.map((item, i) => (
                  <motion.div
                    key={item.recipe.uri}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <GlassCard className="h-full flex flex-col p-0 overflow-hidden group border-white/10 hover:border-white/20 transition-colors">
                      <div className="relative h-44 overflow-hidden">
                        <img 
                          src={item.recipe.image} 
                          alt={item.recipe.label} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-[9px] font-bold text-white uppercase tracking-tighter">
                          {item.recipe.dietLabels[0] || 'Healthy'}
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                          <div className="flex items-center gap-3 text-white text-[10px] font-bold">
                            <span className="flex items-center gap-1"><Clock size={12} /> {item.recipe.totalTime || 30}m</span>
                            <span className="flex items-center gap-1"><Flame size={12} /> {Math.round(item.recipe.calories / item.recipe.yield)} kcal</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-4 flex-1 flex flex-col">
                        <h4 className="text-white font-bold text-sm mb-3 line-clamp-2 h-10">{item.recipe.label}</h4>
                        
                        <div className="grid grid-cols-3 gap-2 mb-4">
                          <div className="text-center p-1.5 bg-white/5 rounded-lg">
                            <div className="text-[10px] text-cyan-400 font-bold">
                              {((item.recipe.totalNutrients?.PROCNT?.quantity || 0) / item.recipe.yield).toFixed(0)}g
                            </div>
                            <div className="text-[8px] text-slate-500 uppercase">Prot</div>
                          </div>
                          <div className="text-center p-1.5 bg-white/5 rounded-lg">
                            <div className="text-[10px] text-purple-400 font-bold">
                              {((item.recipe.totalNutrients?.CHOCDF?.quantity || 0) / item.recipe.yield).toFixed(0)}g
                            </div>
                            <div className="text-[8px] text-slate-500 uppercase">Carb</div>
                          </div>
                          <div className="text-center p-1.5 bg-white/5 rounded-lg">
                            <div className="text-[10px] text-pink-400 font-bold">
                              {((item.recipe.totalNutrients?.FAT?.quantity || 0) / item.recipe.yield).toFixed(0)}g
                            </div>
                            <div className="text-[8px] text-slate-500 uppercase">Fat</div>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-1 mb-6">
                          {item.recipe.healthLabels.slice(0, 2).map((label: string) => (
                            <span key={label} className="text-[8px] bg-white/5 text-slate-400 px-1.5 py-0.5 rounded border border-white/5">
                              {label}
                            </span>
                          ))}
                        </div>

                        <div className="mt-auto flex gap-2">
                          <a 
                            href={item.recipe.url} 
                            target="_blank" 
                            rel="noreferrer"
                            className="flex-1 flex items-center justify-center gap-1.5 bg-white/5 hover:bg-white/10 text-white py-2 rounded-xl text-xs font-bold transition-colors border border-white/10"
                          >
                            Recipe <ExternalLink size={12} />
                          </a>
                          <button 
                            onClick={() => addToLog(item.recipe)}
                            className="w-10 h-10 flex items-center justify-center bg-cyan-500 hover:bg-cyan-400 text-white rounded-xl transition-colors shadow-lg shadow-cyan-500/20"
                            title="Add to Log"
                          >
                            <Plus size={18} />
                          </button>
                        </div>
                      </div>
                    </GlassCard>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="col-span-full text-center py-20"
              >
                <ChefHat size={48} className="mx-auto text-slate-700 mb-4" />
                <h3 className="text-white font-bold">No recipes found</h3>
                <p className="text-slate-500 text-sm mt-2">Try adjusting your dietary restrictions or disabling calorie optimization.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default MealPlanner;