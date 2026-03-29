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
  Sun
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { showSuccess } from '@/utils/toast';
import { cn } from '@/lib/utils';

const mealTypes = [
  { id: 'breakfast', label: 'Breakfast', icon: Coffee, color: 'text-yellow-400' },
  { id: 'lunch', label: 'Lunch', icon: Sun, color: 'text-orange-400' },
  { id: 'dinner', label: 'Dinner', icon: Moon, color: 'text-indigo-400' },
  { id: 'snack', label: 'Snacks', icon: UtensilsCrossed, color: 'text-pink-400' },
];

const MealPlanner = () => {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeMealType, setActiveMealType] = useState('lunch');
  const [profile] = useState(() => getStoredData(STORAGE_KEYS.USER_PROFILE, { dietaryRestrictions: [] }));

  const fetchMeals = async (type: string) => {
    setLoading(true);
    try {
      const data = await getRecommendations(profile.dietaryRestrictions || [], type);
      if (data) setRecommendations(data.hits);
    } catch (error) {
      console.error("Failed to fetch meals", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeals(activeMealType);
  }, [activeMealType]);

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
          <p className="text-slate-400 text-sm md:text-base">Personalized recipes based on your dietary profile.</p>
        </div>
        <button 
          onClick={() => fetchMeals(activeMealType)}
          disabled={loading}
          className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-xl border border-white/10 transition-all disabled:opacity-50 text-sm"
        >
          <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          Refresh Plan
        </button>
      </header>

      {/* Meal Type Tabs */}
      <div className="flex overflow-x-auto pb-2 gap-2 no-scrollbar">
        {mealTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => setActiveMealType(type.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2.5 rounded-2xl border transition-all shrink-0",
              activeMealType === type.id 
                ? "bg-white/15 border-cyan-500/50 text-white shadow-lg shadow-cyan-500/10" 
                : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10"
            )}
          >
            <type.icon size={18} className={cn(activeMealType === type.id ? type.color : "text-slate-500")} />
            <span className="text-sm font-bold">{type.label}</span>
          </button>
        ))}
      </div>

      {profile.dietaryRestrictions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {profile.dietaryRestrictions.map((diet: string) => (
            <span key={diet} className="px-2.5 py-1 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[10px] rounded-full font-bold uppercase tracking-wider">
              {diet}
            </span>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        <AnimatePresence mode="wait">
          {loading ? (
            Array(8).fill(0).map((_, i) => (
              <div key={i} className="h-[400px] bg-white/5 rounded-[24px] animate-pulse" />
            ))
          ) : (
            recommendations.map((item, i) => (
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
            ))
          )}
        </AnimatePresence>
      </div>

      {!loading && recommendations.length === 0 && (
        <div className="text-center py-20">
          <ChefHat size={48} className="mx-auto text-slate-700 mb-4" />
          <h3 className="text-white font-bold">No recipes found</h3>
          <p className="text-slate-500 text-sm mt-2">Try adjusting your dietary restrictions in your profile.</p>
        </div>
      )}
    </div>
  );
};

export default MealPlanner;