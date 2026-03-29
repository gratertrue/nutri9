"use client";

// Edamam API Credentials
// Note: These are public demo keys. For production, users should use their own keys.
const NUTRITION_APP_ID = "5006387d";
const NUTRITION_APP_KEY = "a0b84fa17a95362c2fb8084d5161a5e4";
const RECIPE_APP_ID = "23cc0b56"; 
const RECIPE_APP_KEY = "9ab0df600176dc9baa30d2fae4b945c8";

/**
 * Analyzes the nutrition of a given food string (e.g., "1 large apple").
 */
export const analyzeNutrition = async (ingr: string) => {
  try {
    console.log(`Analyzing nutrition for: "${ingr}"`);
    
    // The Nutrition Analysis API works best with a GET request for single ingredients
    const url = new URL("https://api.edamam.com/api/nutrition-data");
    url.searchParams.append("app_id", NUTRITION_APP_ID);
    url.searchParams.append("app_key", NUTRITION_APP_KEY);
    url.searchParams.append("nutrition-type", "logging");
    url.searchParams.append("ingr", ingr);

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Edamam API Error (${response.status}):`, errorText);
      return null;
    }

    const data = await response.json();
    
    // Edamam returns a 200 even if it can't parse the food, but totalWeight will be 0
    if (!data || data.totalWeight === 0 || !data.calories) {
      console.warn("Edamam could not parse the food string. Try a more specific format like '100g apple' or '1 large banana'.");
      return null;
    }

    console.log("Nutrition analysis successful:", data);
    return data;
  } catch (error) {
    console.error("Network or Analysis Error:", error);
    return null;
  }
};

/**
 * Searches for recipes based on a query and optional health labels.
 */
export const searchRecipes = async (query: string, health?: string[]) => {
  try {
    const url = new URL("https://api.edamam.com/search");
    url.searchParams.append("q", query);
    url.searchParams.append("app_id", RECIPE_APP_ID);
    url.searchParams.append("app_key", RECIPE_APP_KEY);
    
    if (health && health.length > 0) {
      health.forEach(h => {
        // Edamam expects kebab-case for health labels
        const label = h.toLowerCase().replace(/\s+/g, '-');
        url.searchParams.append("health", label);
      });
    }

    const response = await fetch(url.toString());
    if (!response.ok) {
      console.error(`Recipe Search Error (${response.status})`);
      return null;
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Recipe Search Network Error:", error);
    return null;
  }
};

/**
 * Gets recommended recipes based on user health labels.
 */
export const getRecommendations = async (healthLabels: string[]) => {
  const query = healthLabels.length > 0 ? healthLabels[0] : "healthy";
  return searchRecipes(query, healthLabels);
};