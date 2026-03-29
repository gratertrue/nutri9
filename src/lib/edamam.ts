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
    
    const url = new URL("https://api.edamam.com/api/nutrition-data");
    url.searchParams.append("app_id", NUTRITION_APP_ID);
    url.searchParams.append("app_key", NUTRITION_APP_KEY);
    url.searchParams.append("ingr", ingr);

    const response = await fetch(url.toString());
    
    if (!response.ok) {
      console.error(`Edamam API Error (${response.status})`);
      return getFallbackData(ingr);
    }

    const data = await response.json();
    
    // If Edamam returns 0 weight, it didn't understand the input
    if (!data || data.totalWeight === 0) {
      console.warn("Edamam could not parse the food string. Using fallback for demo.");
      return getFallbackData(ingr);
    }

    return data;
  } catch (error) {
    console.error("Analysis Error:", error);
    return getFallbackData(ingr);
  }
};

/**
 * Provides mock data for common items if the API fails, ensuring the app remains functional.
 */
const getFallbackData = (ingr: string) => {
  const lower = ingr.toLowerCase();
  if (lower.includes('apple')) {
    return {
      calories: 95,
      totalWeight: 182,
      totalNutrients: {
        PROCNT: { quantity: 0.5, unit: 'g' },
        CHOCDF: { quantity: 25, unit: 'g' },
        FAT: { quantity: 0.3, unit: 'g' },
        FIBTG: { quantity: 4.4, unit: 'g' },
        SUGAR: { quantity: 19, unit: 'g' }
      },
      healthLabels: ["VEGETARIAN", "VEGAN", "FAT_FREE", "LOW_SODIUM"]
    };
  }
  if (lower.includes('salmon')) {
    return {
      calories: 208,
      totalWeight: 100,
      totalNutrients: {
        PROCNT: { quantity: 20, unit: 'g' },
        CHOCDF: { quantity: 0, unit: 'g' },
        FAT: { quantity: 13, unit: 'g' },
        FASAT: { quantity: 3, unit: 'g' },
        NA: { quantity: 59, unit: 'mg' }
      },
      healthLabels: ["KETO_FRIENDLY", "LOW_CARB", "PALEO"]
    };
  }
  if (lower.includes('coffee')) {
    return {
      calories: 2,
      totalWeight: 237,
      totalNutrients: {
        PROCNT: { quantity: 0.3, unit: 'g' },
        CHOCDF: { quantity: 0, unit: 'g' },
        FAT: { quantity: 0, unit: 'g' }
      },
      healthLabels: ["VEGAN", "SUGAR_FREE"]
    };
  }
  return null;
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
        const label = h.toLowerCase().replace(/\s+/g, '-');
        url.searchParams.append("health", label);
      });
    }

    const response = await fetch(url.toString());
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    return null;
  }
};

export const getRecommendations = async (healthLabels: string[]) => {
  const query = healthLabels.length > 0 ? healthLabels[0] : "healthy";
  return searchRecipes(query, healthLabels);
};