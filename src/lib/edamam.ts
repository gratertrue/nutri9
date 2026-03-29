"use client";

// Edamam API Credentials
const NUTRITION_APP_ID = "5006387d";
const NUTRITION_APP_KEY = "a0b84fa17a95362c2fb8084d5161a5e4";
const MEAL_PLANNER_APP_ID = "23cc0b56"; 
const MEAL_PLANNER_APP_KEY = "9ab0df600176dc9baa30d2fae4b945c8";

// Using corsproxy.io which handles POST requests and preflight better than codetabs
const PROXY_URL = "https://corsproxy.io/?";

export const analyzeNutrition = async (ingr: string) => {
  try {
    const url = new URL("https://api.edamam.com/api/nutrition-data");
    url.searchParams.append("app_id", NUTRITION_APP_ID);
    url.searchParams.append("app_key", NUTRITION_APP_KEY);
    url.searchParams.append("ingr", ingr);

    const response = await fetch(`${PROXY_URL}${encodeURIComponent(url.toString())}`);
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error("Nutrition analysis failed", error);
    return null;
  }
};

export const getWeeklyMealPlan = async (userId: string, params: any) => {
  try {
    // The Meal Planner API requires a POST request with a JSON body
    const baseUrl = `https://api.edamam.com/api/meal-planner/v1/${userId}/week?app_id=${MEAL_PLANNER_APP_ID}&app_key=${MEAL_PLANNER_APP_KEY}`;
    
    const response = await fetch(`${PROXY_URL}${encodeURIComponent(baseUrl)}`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(params)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error("Meal planner API error:", errorText);
      return null;
    }
    return await response.json();
  } catch (error) {
    console.error("Meal planner request failed", error);
    return null;
  }
};

export const searchRecipes = async (query: string, health: string[] = [], diet?: string) => {
  try {
    const url = new URL("https://api.edamam.com/api/recipes/v2");
    url.searchParams.append("type", "public");
    url.searchParams.append("q", query);
    url.searchParams.append("app_id", MEAL_PLANNER_APP_ID);
    url.searchParams.append("app_key", MEAL_PLANNER_APP_KEY);
    
    health.forEach(h => {
      const formatted = h.toLowerCase().replace(/\s+/g, '-');
      url.searchParams.append("health", formatted);
    });
    
    if (diet) url.searchParams.append("diet", diet);

    const response = await fetch(`${PROXY_URL}${encodeURIComponent(url.toString())}`);
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error("Recipe search failed", error);
    return null;
  }
};