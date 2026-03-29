"use client";

import { getStoredData, STORAGE_KEYS } from './storage';

// Edamam API Credentials
const NUTRITION_APP_ID = "5006387d";
const NUTRITION_APP_KEY = "a0b84fa17a95362c2fb8084d5161a5e4";
const RECIPE_APP_ID = "23cc0b56"; 
const RECIPE_APP_KEY = "9ab0df600176dc9baa30d2fae4b945c8";

// Using a more robust proxy that handles preflight better
const PROXY_URL = "https://corsproxy.io/?";

const getHeaders = () => {
  const profile = getStoredData(STORAGE_KEYS.USER_PROFILE, { email: 'user@example.com' });
  // We remove 'Content-Type' for GET requests to keep them "simple" and avoid some CORS preflight issues
  return {
    'Edamam-Account-User': profile.email || 'anonymous-user'
  };
};

export const analyzeNutrition = async (ingr: string) => {
  try {
    const url = new URL("https://api.edamam.com/api/nutrition-data");
    url.searchParams.append("app_id", NUTRITION_APP_ID);
    url.searchParams.append("app_key", NUTRITION_APP_KEY);
    url.searchParams.append("ingr", ingr);

    const response = await fetch(`${PROXY_URL}${encodeURIComponent(url.toString())}`, {
      method: 'GET',
      headers: getHeaders()
    });
    
    if (!response.ok) throw new Error("API Error");
    const data = await response.json();
    
    if (!data.calories || data.calories === 0) throw new Error("Empty API result");
    return { ...data, source: 'api' };
  } catch (error) {
    console.error("Nutrition Analysis Error:", error);
    return null;
  }
};

export const getWeeklyMealPlan = async (userId: string, params: any) => {
  try {
    const healthLabels = params.plan?.accept?.all[0]?.health || [];
    const recipes = await searchRecipes("healthy meal", healthLabels);
    
    if (recipes && recipes.hits && recipes.hits.length >= 21) {
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const plan: any = { selection: [] };
      
      days.forEach((day, i) => {
        const dailyRecipes = recipes.hits.slice(i * 3, (i * 3) + 3);
        plan.selection.push({
          day,
          meals: dailyRecipes.map((hit: any) => ({
            label: hit.recipe.label,
            image: hit.recipe.image,
            calories: Math.round(hit.recipe.calories / hit.recipe.yield),
            protein: Math.round((hit.recipe.totalNutrients?.PROCNT?.quantity || 0) / hit.recipe.yield),
            ingredients: hit.recipe.ingredientLines
          }))
        });
      });
      return plan;
    }
  } catch (e) {
    console.warn("Recipe Search failed, using fallback plan...");
  }

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  return {
    selection: days.map(day => ({
      day,
      meals: [
        { label: 'Oatmeal with Berries', calories: 340, protein: 12, ingredients: ['Oats', 'Blueberries', 'Milk'] },
        { label: 'Grilled Chicken Salad', calories: 520, protein: 45, ingredients: ['Chicken', 'Lettuce', 'Olive Oil'] },
        { label: 'Quinoa Power Bowl', calories: 480, protein: 18, ingredients: ['Quinoa', 'Chickpeas', 'Spinach'] }
      ]
    }))
  };
};

export const searchRecipes = async (query: string, health: string[] = []) => {
  try {
    const url = new URL("https://api.edamam.com/api/recipes/v2");
    url.searchParams.append("type", "public");
    url.searchParams.append("q", query);
    url.searchParams.append("app_id", RECIPE_APP_ID);
    url.searchParams.append("app_key", RECIPE_APP_KEY);
    
    health.forEach(h => {
      const formatted = h.toLowerCase().replace(/\s+/g, '-');
      url.searchParams.append("health", formatted);
    });

    const response = await fetch(`${PROXY_URL}${encodeURIComponent(url.toString())}`, {
      method: 'GET',
      headers: getHeaders()
    });
    
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error("Recipe Search Error:", error);
    return null;
  }
};