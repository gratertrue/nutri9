"use client";

import React, { useState, useEffect } from 'react';
import GlassCard from '@/components/GlassCard';
import { searchRecipes } from '@/lib/edamam';
import { getStoredData, STORAGE_KEYS, setStoredData, toggleFavorite } from '@/lib/storage';
import { 
  Sparkles, RefreshCw, ExternalLink, Clock, Flame, Plus, 
  ChefHat, ShoppingCart, Heart, Timer, Filter, ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { showSuccess, showError } from '@/utils/toast';
import { cn } from '@/lib/utils';

const MealPlanner = () => {
  const [recipes, setRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'plan' | 'grocery' | 'favorites'>('plan');
  const [profile] = useState(() => getStoredData(STORAGE_KEYS.USER_PROFILE, { dietaryRestrictions: [], calorieGoal: 2000 }));
  const [favorites, setFavorites] = useState(() => getStoredData<any[]>(STORAGE_KEYS.FAVORITES, []));

  const fetchPlan = async () => {
    setLoading(true);
    try {
      const data = await searchRecipes({
        query: 'healthy',
        health: profile.dietaryRestrictions,
        calories: `0-${Math.round(profile.calorieGoal / 3)}`
      });
      if (data && data.hits) setRecipes(data.hits);
    } catch (err) {
      showError("Failed to fetch meal plan.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlan();
  }, []);

  const handleFavorite = (recipe: any) => {
    const isFav = toggleFavorite(recipe);
    setFavorites(getStoredData(STORAGE_KEYS.FAVORITES, []));
    showSuccess(isFav ? "Added to cookbook!" : "Removed from cookbook");
  };

  const generateGroceryList = () => {
    const allIngredients = recipes.flatMap(r => r.recipe.ingredients);
    const grouped = allIngredients.reduce((acc: any, curr: any) => {
      const cat = curr.foodCategory || 'Other';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(curr.text);
      return acc;
    }, {});
    return grouped;
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Sparkles className="text-yellow-400" />
            AI Meal Planner
          </h2>
          <p className="text-slate-400">Personalized nutrition strategy for your goals.</p>
        </div>
        <div className="flex gap-2">
          {['plan', 'grocery', 'favorites'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as any)}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all",
                activeTab === tab ? "bg-cyan-500 text-white" : "bg-white/5 text-slate-400 hover:bg-white/10"
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </header>

      <AnimatePresence mode="wait">
        {activeTab === 'plan' && (
          <motion.div 
            key="plan"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {loading ? Array(6).fill(0).map((_, i) => (
              <div key={i} className="h-80 bg-white/5 rounded-[24px] animate-pulse" />
            )) : recipes.map((item, i) => (
              <GlassCard key={i} className="p-0 overflow-hidden group flex flex-col">
                <div className="relative h-48">
                  <img src={item.recipe.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <button 
                    onClick={() => handleFavorite(item.recipe)}
                    className="absolute top-3 right-3 p-2 bg-black/40 backdrop-blur-md rounded-full text-white hover:text-pink-400 transition-colors"
                  >
                    <Heart size={18} fill={favorites.some(f => f.uri === item.recipe.uri) ? "currentColor" : "none"} />
                  </button>
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <h4 className="text-white font-bold mb-4 line-clamp-2">{item.recipe.label}</h4>
                  <div className="flex items-center gap-4 text-xs text-slate-400 mb-6">
                    <span className="flex items-center gap-1"><Clock size={14} /> {item.recipe.totalTime || 30}m</span>
                    <span className="flex items-center gap-1"><Flame size={14} /> {Math.round(item.recipe.calories / item.recipe.yield)} kcal</span>
                  </div>
                  <div className="mt-auto flex gap-2">
                    <a href={item.recipe.url} target="_blank" className="flex-1 bg-white/5 hover:bg-white/10 text-white py-2.5 rounded-xl text-xs font-bold text-center border border-white/10">
                      View Recipe
                    </a>
                    <button className="w-12 bg-cyan-500 hover:bg-cyan-400 text-white rounded-xl flex items-center justify-center">
                      <Plus size={20} />
                    </button>
                  </div>
                </div>
              </GlassCard>
            ))}
          </motion.div>
        )}

        {activeTab === 'grocery' && (
          <motion.div 
            key="grocery"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="max-w-2xl mx-auto space-y-6"
          >
            <GlassCard>
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <ShoppingCart size={20} className="text-cyan-400" />
                Weekly Grocery List
              </h3>
              <div className="space-y-8">
                {Object.entries(generateGroceryList()).map(([cat, items]: any) => (
                  <div key={cat}>
                    <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3">{cat}</h4>
                    <div className="space-y-2">
                      {items.map((item: string, i: number) => (
                        <label key={i} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl cursor-pointer hover:bg-white/10 transition-colors">
                          <input type="checkbox" className="w-4 h-4 rounded border-white/10 bg-transparent text-cyan-500 focus:ring-0" />
                          <span className="text-sm text-slate-300">{item}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </motion.div>
        )}

        {activeTab === 'favorites' && (
          <motion.div 
            key="favorites"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {favorites.length > 0 ? favorites.map((recipe, i) => (
              <GlassCard key={i} className="p-0 overflow-hidden group flex flex-col">
                <div className="relative h-48">
                  <img src={recipe.image} className="w-full h-full object-cover" />
                  <button 
                    onClick={() => handleFavorite(recipe)}
                    className="absolute top-3 right-3 p-2 bg-black/40 backdrop-blur-md rounded-full text-pink-400"
                  >
                    <Heart size={18} fill="currentColor" />
                  </button>
                </div>
                <div className="p-5">
                  <h4 className="text-white font-bold mb-4">{recipe.label}</h4>
                  <a href={recipe.url} target="_blank" className="w-full block bg-white/5 hover:bg-white/10 text-white py-2.5 rounded-xl text-xs font-bold text-center border border-white/10">
                    Open Recipe
                  </a>
                </div>
              </GlassCard>
            )) : (
              <div className="col-span-full text-center py-20">
                <ChefHat size={48} className="mx-auto text-slate-700 mb-4" />
                <p className="text-slate-500">Your cookbook is empty. Save some recipes!</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MealPlanner;