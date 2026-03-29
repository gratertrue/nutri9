"use client";

// Edamam API Credentials
// Using Food Database API v2 which is more reliable for single item lookups
const FOOD_APP_ID = "07081ee2";
const FOOD_APP_KEY = "4ef9911c1a046060203091660977ee0d";
const RECIPE_APP_ID = "23cc0b56"; 
const RECIPE_APP_KEY = "9ab0df600176dc9baa30d2fae4b945c8";

/**
 * Analyzes the nutrition of a given food string using the Food Database API.
 */
export const analyzeNutrition = async (ingr: string) => {
  try {
    console.log(`Searching food database for: "${ingr}"`);
    
    const url = new URL("https://api.edamam.com/api/food-database/v2/parser");
    url.searchParams.append("app_id", FOOD_APP_ID);
    url.searchParams.append("app_key", FOOD_APP_KEY);
    url.searchParams.append("ingr", ingr);

    const response = await fetch(url.toString());
    
    if (!response.ok) {
      console.error(`Edamam API Error (${response.status})`);
      return getFallbackData(ingr);
    }

    const data = await response.json();
    
    if (!data || !data.hints || data.hints.length === 0) {
      console.warn("No results found in Edamam database. Using fallback.");
      return getFallbackData(ingr);
    }

    // Extract the first result
    const food = data.hints[0].food;
    const nutrients = food.nutrients;

    return {
      calories: Math.round(nutrients.ENERC_KCAL || 0),
      totalWeight: 100, // Default to 100g for database results
      totalNutrients: {
        PROCNT: { quantity: nutrients.PROCNT || 0, unit: 'g' },
        CHOCDF: { quantity: nutrients.CHOCDF || 0, unit: 'g' },
        FAT: { quantity: nutrients.FAT || 0, unit: 'g' },
        FIBTG: { quantity: nutrients.FIBTG || 0, unit: 'g' }
      },
      healthLabels: food.foodContentsLabel ? [food.foodContentsLabel] : ["NATURAL_FOOD"]
    };
  } catch (error) {
    console.error("Search Error:", error);
    return getFallbackData(ingr);
  }
};

/**
 * Comprehensive fallback data for common items to ensure the app always works.
 */
const getFallbackData = (ingr: string) => {
  const lower = ingr.toLowerCase();
  
  const mocks: Record<string, any> = {
    apple: {
      calories: 95,
      totalNutrients: { PROCNT: { quantity: 0.5 }, CHOCDF: { quantity: 25 }, FAT: { quantity: 0.3 } },
      healthLabels: ["VEGAN", "LOW_FAT"]
    },
    banana: {
      calories: 105,
      totalNutrients: { PROCNT: { quantity: 1.3 }, CHOCDF: { quantity: 27 }, FAT: { quantity: 0.4 } },
      healthLabels: ["VEGAN", "HIGH_POTASSIUM"]
    },
    chicken: {
      calories: 165,
      totalNutrients: { PROCNT: { quantity: 31 }, CHOCDF: { quantity: 0 }, FAT: { quantity: 3.6 } },
      healthLabels: ["HIGH_PROTEIN", "LOW_CARB"]
    },
    salmon: {
      calories: 208,
      totalNutrients: { PROCNT: { quantity: 20 }, CHOCDF: { quantity: 0 }, FAT: { quantity: 13 } },
      healthLabels: ["KETO_FRIENDLY", "OMEGA_3"]
    },
    coffee: {
      calories: 2,
      totalNutrients: { PROCNT: { quantity: 0.3 }, CHOCDF: { quantity: 0 }, FAT: { quantity: 0 } },
      healthLabels: ["VEGAN", "SUGAR_FREE"]
    },
    avocado: {
      calories: 160,
      totalNutrients: { PROCNT: { quantity: 2 }, CHOCDF: { quantity: 9 }, FAT: { quantity: 15 } },
      healthLabels: ["KETO_FRIENDLY", "HEALTHY_FATS"]
    }
  };

  // Find the best match
  const match = Object.keys(mocks).find(key => lower.includes(key));
  if (match) {
    const data = mocks[match];
    return {
      ...data,
      totalWeight: 100,
      totalNutrients: {
        PROCNT: { quantity: data.totalNutrients.PROCNT.quantity, unit: 'g' },
        CHOCDF: { quantity: data.totalNutrients.CHOCDF.quantity, unit: 'g' },
        FAT: { quantity: data.totalNutrients.FAT.quantity, unit: 'g' }
      },
      healthLabels: data.healthLabels || ["NATURAL_FOOD"]
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