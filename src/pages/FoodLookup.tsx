"use client";

import React, { useState, useEffect } from 'react';
import GlassCard from '@/components/GlassCard';
import { analyzeNutrition, searchRecipes } from '@/lib/edamam';
import { calculateHealthyScore, analyzeHealthConditions } from '@/lib/scoring';
import { getStoredData, STORAGE_KEYS, setStoredData, updatePoints } from '@/lib/storage';
import { 
  Search, 
  Info, 
  AlertTriangle, 
  CheckCircle2, 
  Plus, 
  Loader2, 
  Sparkles,
  Apple,
  Beef,
  Leaf,
  Coffee,
  Cookie,
  Filter,
  ChevronRight,
  Scale
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { showSuccess, showError } from '@/utils/toast';
import { cn } from '@/lib/utils';

const categories = [
  { id: 'fruits', label: 'Fruits', icon: Apple, color: 'text-red-400', items: ['Apple', 'Banana', 'Orange', 'Strawberry', 'Blueberries'] },
  { id: 'proteins', label: 'Proteins', icon: Beef, color: 'text-orange-400', items: ['Chicken Breast', 'Salmon', 'Tofu', 'Eggs', 'Greek Yogurt'] },
  { id: 'veggies', label: 'Vegetables', icon: Leaf, color: 'text-green-400', items: ['Broccoli', 'Spinach', 'Kale', 'Carrot', 'Avocado'] },
  { id: 'drinks', label: 'Drinks', icon: Coffee, color: 'text-cyan-400', items: ['Coffee', 'Green Tea', 'Orange Juice', 'Smoothie'] },
  { id: 'snacks', label: 'Snacks', icon: Cookie, color: 'text-purple-400', items: ['Almonds', 'Dark Chocolate', 'Hummus', 'Walnuts'] },
];

const dietTags = [
  { label: 'High Protein', query: 'high protein' },
  { label: 'Low Carb', query: 'low carb' },
  { label: 'Vegan', query: 'vegan' },
  { label: 'Keto', query: 'keto' },
  { label: 'Gluten Free', query: 'gluten free' },
];

const FoodLookup = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [weight, setWeight] = useState<number>(100);
  const [recipes, setRecipes] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [profile] = useState(() => getStoredData(STORAGE_KEYS.USER_PROFILE, { healthConditions: [] }));

  const handleSearch = async (e?: React.FormEvent, testQuery?: string) => {
    if (e) e.preventDefault();
    const searchQuery = testQuery || query;
    if (!searchQuery.trim()) return;
    
    setQuery(searchQuery);
    setLoading(true);
    setResult(null);
    
    try {
      const data = await analyzeNutrition(searchQuery);
      
      if (data && data.totalWeight > 0) {
        const score = calculateHealthyScore(data);
        const alerts = analyzeHealthConditions(data, profile.healthConditions || []);
        setResult({ ...data, score, alerts });
        setWeight(data.totalWeight || 100);
        
        const recipeData = await searchRecipes(searchQuery);
        if (recipeData) setRecipes(recipeData.hits.slice(0, 4));
        
        updatePoints(10);
      } else {
        showError("Could not analyze this food. Try being more specific.");
      }
    } catch (err) {
      showError("An error occurred during analysis.");
    } finally {
      setLoading(false);
    }
  };

  const scaleNutrient = (baseValue: number) => {
    if (!result) return 0;
    const baseWeight = result.totalWeight || 100;
    return (baseValue / baseWeight) * weight;
  };

  const addToLog = () => {
    if (!result) return;
    
    const log = getStoredData(STORAGE_KEYS.FOOD_LOG, []);
    const newEntry = {
      id: Date.now(),
      date: new Date().toISOString().split('T')[0],
      name: `${weight}g ${query}`,
      calories: Math.round(scaleNutrient(result.calories)),
      protein: scaleNutrient(result.totalNutrients?.PROCNT?.quantity || 0),
      carbs: scaleNutrient(result.totalNutrients?.CHOCDF?.quantity || 0),
      fat: scaleNutrient(result.totalNutrients?.FAT?.quantity || 0),
    };
    
    setStoredData(STORAGE_KEYS.FOOD_LOG, [...log, newEntry]);
    updatePoints(20);
    showSuccess(`Added ${weight}g of ${query} to log!`);
  };

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-6 md:space-y-8">
      <header>
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-1 md:mb-2">Nutrition Intelligence</h2>
        <p className="text-slate-400 text-sm md:text-base">Analyze any food or browse our curated database.</p>
      </header>

      <div className="space-y-6">
        {/* Search Bar */}
        <form onSubmit={(e) => handleSearch(e)} className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for food..."
            className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 md:py-4 px-4 md:px-6 pl-12 md:pl-14 text-white text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all"
          />
          <Search className="absolute left-4 md:left-5 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <button 
            disabled={loading}
            className="absolute right-2 md:right-3 top-1/2 -translate-y-1/2 bg-cyan-500 hover:bg-cyan-400 text-white px-4 md:px-6 py-1.5 md:py-2 rounded-xl text-sm font-medium transition-colors disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : 'Analyze'}
          </button>
        </form>

        {/* Diet Tags */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 text-slate-500 mr-1">
            <Filter size={12} />
            <span className="text-[10px] font-bold uppercase tracking-wider">Filters:</span>
          </div>
          {dietTags.map((tag) => (
            <button
              key={tag.label}
              onClick={() => handleSearch(undefined, tag.query)}
              className="text-[10px] md:text-xs bg-white/5 hover:bg-cyan-500/20 hover:text-cyan-400 text-slate-400 px-2.5 py-1 rounded-full border border-white/10 transition-all"
            >
              {tag.label}
            </button>
          ))}
        </div>

        {/* Advanced Categories */}
        <div className="grid grid-cols-3 md:grid-cols-5 gap-2 md:gap-4">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)}
              className={cn(
                "flex flex-col items-center gap-2 p-3 md:p-4 rounded-2xl border transition-all duration-300",
                activeCategory === cat.id 
                  ? "bg-white/15 border-cyan-500/50 shadow-lg shadow-cyan-500/10" 
                  : "bg-white/5 border-white/10 hover:bg-white/10"
              )}
            >
              <cat.icon className={cn("w-5 h-5 md:w-6 md:h-6", cat.color)} />
              <span className="text-[10px] md:text-sm font-medium text-white">{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Category Items List */}
        <AnimatePresence>
          {activeCategory && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <GlassCard className="bg-white/5 border-white/10 p-3 md:p-4">
                <div className="flex flex-wrap gap-2">
                  {categories.find(c => c.id === activeCategory)?.items.map((item) => (
                    <button
                      key={item}
                      onClick={() => handleSearch(undefined, item)}
                      className="flex items-center gap-2 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-xl text-[11px] md:text-sm text-slate-300 transition-colors group"
                    >
                      {item}
                      <ChevronRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </button>
                  ))}
                </div>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence mode="wait">
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6"
          >
            <GlassCard className="md:col-span-2">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
                <div>
                  <h3 className="text-xl md:text-2xl font-bold text-white capitalize">{query}</h3>
                  <p className="text-slate-400 text-sm">{Math.round(scaleNutrient(result.calories))} kcal total</p>
                </div>
                <div className="text-left sm:text-right">
                  <div className="text-xs text-slate-400 mb-1">Healthy Score</div>
                  <div className={cn(
                    "text-2xl md:text-3xl font-bold",
                    result.score > 70 ? "text-green-400" : result.score > 40 ? "text-yellow-400" : "text-red-400"
                  )}>
                    {result.score}/100
                  </div>
                </div>
              </div>

              {/* Weight Adjustment */}
              <div className="mb-8 p-4 bg-cyan-500/5 border border-cyan-500/10 rounded-2xl">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-xs font-bold text-cyan-400 uppercase flex items-center gap-2">
                    <Scale size={14} /> Adjust Weight (grams)
                  </label>
                  <span className="text-white font-bold">{weight}g</span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="1000" 
                  value={weight}
                  onChange={(e) => setWeight(parseInt(e.target.value))}
                  className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
                <div className="flex justify-between mt-2">
                  <input 
                    type="number" 
                    value={weight}
                    onChange={(e) => setWeight(Math.max(1, parseInt(e.target.value) || 0))}
                    className="bg-white/5 border border-white/10 rounded-lg px-3 py-1 text-sm text-white w-20 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                  <div className="flex gap-2">
                    {[50, 100, 200, 500].map(val => (
                      <button 
                        key={val}
                        onClick={() => setWeight(val)}
                        className="text-[10px] bg-white/5 hover:bg-white/10 text-slate-400 px-2 py-1 rounded-md border border-white/10 transition-colors"
                      >
                        {val}g
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 md:gap-4 mb-8">
                <div className="p-3 md:p-4 bg-white/5 rounded-2xl text-center">
                  <div className="text-cyan-400 font-bold text-base md:text-xl">
                    {scaleNutrient(result.totalNutrients?.PROCNT?.quantity || 0).toFixed(1)}g
                  </div>
                  <div className="text-[9px] md:text-xs text-slate-500 uppercase">Protein</div>
                </div>
                <div className="p-3 md:p-4 bg-white/5 rounded-2xl text-center">
                  <div className="text-purple-400 font-bold text-base md:text-xl">
                    {scaleNutrient(result.totalNutrients?.CHOCDF?.quantity || 0).toFixed(1)}g
                  </div>
                  <div className="text-[9px] md:text-xs text-slate-500 uppercase">Carbs</div>
                </div>
                <div className="p-3 md:p-4 bg-white/5 rounded-2xl text-center">
                  <div className="text-pink-400 font-bold text-base md:text-xl">
                    {scaleNutrient(result.totalNutrients?.FAT?.quantity || 0).toFixed(1)}g
                  </div>
                  <div className="text-[9px] md:text-xs text-slate-500 uppercase">Fat</div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-white font-medium flex items-center gap-2 text-sm md:text-base">
                  <Info size={16} className="text-cyan-400" />
                  Health Insights
                </h4>
                {result.alerts.length > 0 ? (
                  result.alerts.map((alert: any, i: number) => (
                    <div key={i} className="flex items-center gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-200 text-xs md:text-sm">
                      <AlertTriangle size={14} className="shrink-0" />
                      {alert.message}
                    </div>
                  ))
                ) : (
                  <div className="flex items-center gap-3 p-3 bg-green-500/10 border border-green-500/20 rounded-xl text-green-200 text-xs md:text-sm">
                    <CheckCircle2 size={14} className="shrink-0" />
                    No health warnings for your profile.
                  </div>
                )}
              </div>

              <button 
                onClick={addToLog}
                className="w-full mt-8 flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white py-3 rounded-xl text-sm md:text-base transition-colors"
              >
                <Plus size={18} />
                Add {weight}g to Daily Log
              </button>
            </GlassCard>

            <div className="space-y-4 md:space-y-6">
              <h4 className="text-white font-bold flex items-center gap-2 text-sm md:text-base">
                <Sparkles size={18} className="text-yellow-400" />
                Related Recipes
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-3">
                {recipes.length > 0 ? recipes.map((item, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="group cursor-pointer"
                  >
                    <a href={item.recipe.url} target="_blank" rel="noreferrer">
                      <GlassCard className="p-3 flex gap-3 hover:bg-white/15 transition-colors">
                        <img src={item.recipe.image} alt={item.recipe.label} className="w-12 h-12 md:w-16 md:h-16 rounded-xl object-cover" />
                        <div className="flex-1 min-w-0">
                          <h5 className="text-white font-medium text-xs md:text-sm truncate">{item.recipe.label}</h5>
                          <p className="text-[10px] md:text-xs text-slate-500">{Math.round(item.recipe.calories / item.recipe.yield)} kcal/serving</p>
                        </div>
                      </GlassCard>
                    </a>
                  </motion.div>
                )) : (
                  <p className="text-slate-500 text-xs italic">No related recipes found.</p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FoodLookup;