"use client";

// Credentials provided by user
const NUTRITION_APP_ID = "5006387d";
const NUTRITION_APP_KEY = "a0b84fa17a95362c2fb8084d5161a5e4";
const RECIPE_APP_ID = "23cc0b56"; 
const RECIPE_APP_KEY = "9ab0df600176dc9baa30d2fae4b945c8";

/**
 * Fetches full nutrition data for a specific food item or recipe string.
 */
export const analyzeNutrition = async (ingr: string) => {
  try {
    const params = new URLSearchParams({
      app_id: NUTRITION_APP_ID,
      app_key: NUTRITION_APP_KEY,
      ingr: ingr
    });

    const response = await fetch(`/api/nutrition?${params.toString()}`);
    if (!response.ok) throw new Error("Nutrition analysis failed");
    return await response.json();
  } catch (error) {
    console.error(error);
    return null;
  }
};

/**
 * Advanced recipe search with health, diet, and meal type filters.
 */
export const searchRecipes = async (params: {
  query: string;
  health?: string[];
  mealType?: string;
  calories?: string;
  diet?: string;
  ingredients?: string[];
}) => {
  try {
    const urlParams = new URLSearchParams({
      type: "public",
      app_id: RECIPE_APP_ID,
      app_key: RECIPE_APP_KEY,
      q: params.query || (params.ingredients ? params.ingredients.join(",") : "")
    });

    if (params.mealType) urlParams.append("mealType", params.mealType);
    if (params.diet) urlParams.append("diet", params.diet);
    if (params.calories) urlParams.append("calories", params.calories);
    
    if (params.health) {
      params.health.forEach(h => urlParams.append("health", h));
    }

    const response = await fetch(`/api/recipes?${urlParams.toString()}`);
    if (!response.ok) throw new Error("Recipe search failed");
    return await response.json();
  } catch (error) {
    console.error(error);
    return null;
  }
};

/**
 * Helper to get recommendations based on user profile.
 */
export const getRecommendations = async (profile: any, mealType: string) => {
  const healthLabels = profile.dietaryRestrictions || [];
  const query = mealType === 'breakfast' ? 'oats' : mealType === 'lunch' ? 'salad' : 'chicken';
  
  return searchRecipes({
    query,
    health: healthLabels,
    mealType: mealType,
    calories: profile.calorieGoal ? `0-${Math.round(profile.calorieGoal / 3)}` : undefined
  });
};