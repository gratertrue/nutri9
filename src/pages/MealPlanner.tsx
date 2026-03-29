"use client";

import React, { useState, useEffect } from 'react';
import GlassCard from '@/components/GlassCard';
import { getStoredData, STORAGE_KEYS } from '@/lib/storage';
import { getRecommendations } from '@/lib/edamam';
import { Sparkles, RefreshCw, ExternalLink, Clock, Flame } from 'lucide-react';
import { motion } from 'framer-motion';

const MealPlanner = () => {
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile] = useState(() => getStoredData(STORAGE_KEYS.USER_PROFILE, { dietaryRestrictions: [] }));

  const fetchMeals = async () => {
    setLoading(true);
    const data = await getRecommendations(profile.dietaryRestrictions || []);
    if (data) setRecommendations(data.hits.slice(0, 6));
    setLoading(false);
  };

  useEffect(() => {
    fetchMeals();
  }, []);

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Sparkles className="text-yellow-400" />
            AI Meal Planner
          </h2>
          <p className="text-slate-400">Personalized recommendations based on your profile.</p>
        </div>
        <button 
          onClick={fetchMeals}
          disabled={loading}
          className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-xl border border-white/10 transition-all disabled:opacity-50"
        >
          <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
          Refresh Plan
        </button>
      </header>

      {profile.dietaryRestrictions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {profile.dietaryRestrictions.map((diet: string) => (
            <span key={diet} className="px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs rounded-full font-bold uppercase">
              {diet}
            </span>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          Array(6).fill(0).map((_, i) => (
            <div key={i} className="h-80 bg-white/5 rounded-[24px] animate-pulse" />
          ))
        ) : (
          recommendations.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.1 }}
            >
              <GlassCard className="h-full flex flex-col p-0 overflow-hidden group">
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={item.recipe.image} 
                    alt={item.recipe.label} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold text-white uppercase">
                    {item.recipe.dietLabels[0] || 'Healthy'}
                  </div>
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <h4 className="text-white font-bold text-lg mb-2 line-clamp-1">{item.recipe.label}</h4>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-1 text-slate-400 text-xs">
                      <Clock size={14} /> {item.recipe.totalTime || 30}m
                    </div>
                    <div className="flex items-center gap-1 text-slate-400 text-xs">
                      <Flame size={14} /> {Math.round(item.recipe.calories / item.recipe.yield)} kcal
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1 mb-6">
                    {item.recipe.healthLabels.slice(0, 3).map((label: string) => (
                      <span key={label} className="text-[9px] bg-white/5 text-slate-500 px-2 py-0.5 rounded-md">
                        {label}
                      </span>
                    ))}
                  </div>
                  <a 
                    href={item.recipe.url} 
                    target="_blank" 
                    rel="noreferrer"
                    className="mt-auto w-full flex items-center justify-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-white py-2.5 rounded-xl font-bold transition-colors"
                  >
                    View Recipe <ExternalLink size={14} />
                  </a>
                </div>
              </GlassCard>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default MealPlanner;