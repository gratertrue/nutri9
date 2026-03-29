"use client";

import { getCurrentUser } from './storage';

const NUTRITION_APP_ID = "5006387d";
const NUTRITION_APP_KEY = "a0b84fa17a95362c2fb8084d5161a5e4";
const RECIPE_APP_ID = "23cc0b56"; 
const RECIPE_APP_KEY = "9ab0df600176dc9baa30d2fae4b945c8";

export const analyzeNutrition = async (ingr: string) => {
  try {
    const response = await fetch(`/api/nutrition?app_id=${NUTRITION_APP_ID}&app_key=${NUTRITION_APP_KEY}&ingr=${encodeURIComponent(ingr)}`);
    if (!response.ok) throw new Error("API Error");
    return await response.json();
  } catch (error) {
    console.error("Nutrition Analysis Error:", error);
    return null;
  }
};

export const getWeeklyMealPlan = async (params: any = {}) => {
  const user = getCurrentUser();
  if (!user?.email) throw new Error("User email required for Meal Planner API");

  try {
    const url = new URL("/api/recipes", window.location.origin);
    url.searchParams.append("type", "public");
    url.searchParams.append("app_id", RECIPE_APP_ID);
    url.searchParams.append("app_key", RECIPE_APP_KEY);
    url.searchParams.append("q", params.q || "healthy");

    // Map health conditions to API labels
    if (user.healthConditions?.includes('Diabetes')) url.searchParams.append("health", "low-sugar");
    if (user.healthConditions?.includes('Heart Disease')) url.searchParams.append("health", "low-sodium");
    
    const response = await fetch(url.toString(), {
      headers: {
        'Edamam-Account-User': user.email
      }
    });

    if (!response.ok) throw new Error("Meal Planner API Error");
    const data = await response.json();
    
    // Transform into weekly structure
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return {
      selection: days.map((day, i) => ({
        day,
        meals: data.hits.slice(i * 3, (i * 3) + 3).map((hit: any) => ({
          id: hit.recipe.uri.split('_')[1],
          label: hit.recipe.label,
          image: hit.recipe.image,
          calories: Math.round(hit.recipe.calories / hit.recipe.yield),
          protein: Math.round((hit.recipe.totalNutrients?.PROCNT?.quantity || 0) / hit.recipe.yield),
          ingredients: hit.recipe.ingredientLines,
          readyInMinutes: hit.recipe.totalTime || 30
        }))
      }))
    };
  } catch (error) {
    console.error("Meal Planner Error:", error);
    return null;
  }
};

export const searchRecipesByIngredients = async (ingredients: string) => {
  try {
    const url = `/api/recipes?type=public&q=${encodeURIComponent(ingredients)}&app_id=${RECIPE_APP_ID}&app_key=${RECIPE_APP_KEY}`;
    const response = await fetch(url);
    return await response.json();
  } catch (error) {
    return null;
  }
};