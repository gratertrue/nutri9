"use client";

import React, { useState } from 'react';
import GlassCard from '@/components/GlassCard';
import { analyzeNutrition, searchRecipes } from '@/lib/edamam';
import { calculateHealthyScore, analyzeHealthConditions } from '@/lib/scoring';
import { getStoredData, STORAGE_KEYS, setStoredData, updatePoints } from '@/lib/storage';
import { Search, Info, AlertTriangle, CheckCircle2, Plus, Loader2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { showSuccess, showError } from '@/utils/toast';
import { cn } from '@/lib/utils';

const FoodLookup = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [recipes, setRecipes] = useState<any[]>([]);
  const [profile] = useState(() => getStoredData(STORAGE_KEYS.USER_PROFILE, { healthConditions: [] }));

  const examples = ["1 large apple", "100g grilled salmon", "1 cup of coffee", "1 avocado"];

  const handleSearch = async (e?: React.FormEvent, testQuery?: string) => {
    if (e) e.preventDefault();
    const searchQuery = testQuery || query;
    if (!searchQuery.trim()) return;
    
    setQuery(searchQuery);
    setLoading(true);
    setResult(null);
    
    try {
      const data = await analyzeNutrition(searchQuery);
      
      // Check if data exists and has weight (meaning it was successfully parsed)
      if (data && data.totalWeight > 0) {
        const score = calculateHealthyScore(data);
        const alerts = analyzeHealthConditions(data, profile.healthConditions || []);
        setResult({ ...data, score, alerts });
        
        // Also search for related recipes
        const recipeData = await searchRecipes(searchQuery);
        if (recipeData) setRecipes(recipeData.hits.slice(0, 4));
        
        updatePoints(10);
      } else {
        showError("Could not analyze this food. Try being more specific (e.g., '1 large apple')");
      }
    } catch (err) {
      showError("An error occurred during analysis.");
    } finally {
      setLoading(false);
    }
  };

  const addToLog = (food: any) => {
    const log = getStoredData(STORAGE_KEYS.FOOD_LOG, []);
    const newEntry = {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      name: query,
      calories: food.calories || 0,
      protein: food.totalNutrients?.PROCNT?.quantity || 0,
      carbs: food.totalNutrients?.CHOCDF?.quantity || 0,
      fat: food.totalNutrients?.FAT?.quantity || 0,
    };
    setStoredData(STORAGE_KEYS.FOOD_LOG, [...log, newEntry]);
    updatePoints(20);
    showSuccess("Added to today's log!");
  };

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8">
      <header>
        <h2 className="text-3xl font-bold text-white mb-2">Nutrition Intelligence</h2>
        <p className="text-slate-400">Analyze any food or ingredient with AI-powered precision.</p>
      </header>

      <div className="space-y-4">
        <form onSubmit={(e) => handleSearch(e)} className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="e.g., 100g grilled chicken breast or 1 avocado"
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 pl-14 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
          />
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
          <button 
            disabled={loading}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-cyan-500 hover:bg-cyan-400 text-white px-6 py-2 rounded-xl font-medium transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : 'Analyze'}
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs text-slate-500 uppercase font-bold flex items-center gap-1">
            <Sparkles size={12} /> Quick Test:
          </span>
          {examples.map((ex) => (
            <button
              key={ex}
              onClick={() => handleSearch(undefined, ex)}
              className="text-xs bg-white/5 hover:bg-white/10 text-slate-300 px-3 py-1.5 rounded-full border border-white/10 transition-colors"
            >
              {ex}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            <GlassCard className="md:col-span-2">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-white capitalize">{query}</h3>
                  <p className="text-slate-400">{result.calories} kcal per serving</p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-slate-400 mb-1">Healthy Score</div>
                  <div className={cn(
                    "text-3xl font-bold",
                    result.score > 70 ? "text-green-400" : result.score > 40 ? "text-yellow-400" : "text-red-400"
                  )}>
                    {result.score}/100
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-8">
                <div className="p-4 bg-white/5 rounded-2xl text-center">
                  <div className="text-cyan-400 font-bold text-xl">{result.totalNutrients?.PROCNT?.quantity.toFixed(1)}g</div>
                  <div className="text-xs text-slate-500 uppercase">Protein</div>
                </div>
                <div className="p-4 bg-white/5 rounded-2xl text-center">
                  <div className="text-purple-400 font-bold text-xl">{result.totalNutrients?.CHOCDF?.quantity.toFixed(1)}g</div>
                  <div className="text-xs text-slate-500 uppercase">Carbs</div>
                </div>
                <div className="p-4 bg-white/5 rounded-2xl text-center">
                  <div className="text-pink-400 font-bold text-xl">{result.totalNutrients?.FAT?.quantity.toFixed(1)}g</div>
                  <div className="text-xs text-slate-500 uppercase">Fat</div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-white font-medium flex items-center gap-2">
                  <Info size={16} className="text-cyan-400" />
                  Health Insights
                </h4>
                {result.alerts.length > 0 ? (
                  result.alerts.map((alert: any, i: number) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-200 text-sm">
                      <AlertTriangle size={16} />
                      {alert.message}
                    </div>
                  ))
                ) : (
                  <div className="flex items-center gap-3 p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-green-200 text-sm">
                    <CheckCircle2 size={16} />
                    No health warnings for your profile.
                  </div>
                )}
              </div>

              <button 
                onClick={() => addToLog(result)}
                className="w-full mt-8 flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white py-3 rounded-xl transition-colors"
              >
                <Plus size={20} />
                Add to Daily Log
              </button>
            </GlassCard>

            <div className="space-y-6">
              <h4 className="text-white font-bold">Related Recipes</h4>
              {recipes.length > 0 ? recipes.map((item, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="group cursor-pointer"
                >
                  <a href={item.recipe.url} target="_blank" rel="noreferrer">
                    <GlassCard className="p-3 flex gap-4 hover:bg-white/15 transition-colors">
                      <img src={item.recipe.image} alt={item.recipe.label} className="w-16 h-16 rounded-xl object-cover" />
                      <div className="flex-1 min-w-0">
                        <h5 className="text-white font-medium truncate">{item.recipe.label}</h5>
                        <p className="text-xs text-slate-500">{Math.round(item.recipe.calories / item.recipe.yield)} kcal/serving</p>
                      </div>
                    </GlassCard>
                  </a>
                </motion.div>
              )) : (
                <p className="text-slate-500 text-sm italic">No related recipes found.</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FoodLookup;