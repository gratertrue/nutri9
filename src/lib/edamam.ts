"use client";

// Edamam API Credentials
const FOOD_APP_ID = "07081ee2";
const FOOD_APP_KEY = "4ef9911c1a046060203091660977ee0d";
const RECIPE_APP_ID = "23cc0b56"; 
const RECIPE_APP_KEY = "9ab0df600176dc9baa30d2fae4b945c8";

// Using AllOrigins as a more reliable CORS proxy for v1 API calls
const PROXY_URL = "https://api.allorigins.win/raw?url=";

export const analyzeNutrition = async (ingr: string) => {
  try {
    const url = new URL("https://api.edamam.com/api/food-database/v2/parser");
    url.searchParams.append("app_id", FOOD_APP_ID);
    url.searchParams.append("app_key", FOOD_APP_KEY);
    url.searchParams.append("ingr", ingr);

    // Food Database v2 usually supports CORS, but we'll proxy it to be safe
    const response = await fetch(`${PROXY_URL}${encodeURIComponent(url.toString())}`);
    if (!response.ok) return getFallbackData(ingr);

    const data = await response.json();
    if (!data || !data.hints || data.hints.length === 0) return getFallbackData(ingr);

    const food = data.hints[0].food;
    const nutrients = food.nutrients;

    return {
      calories: Math.round(nutrients.ENERC_KCAL || 0),
      totalWeight: 100,
      totalNutrients: {
        PROCNT: { quantity: nutrients.PROCNT || 0, unit: 'g' },
        CHOCDF: { quantity: nutrients.CHOCDF || 0, unit: 'g' },
        FAT: { quantity: nutrients.FAT || 0, unit: 'g' },
        FIBTG: { quantity: nutrients.FIBTG || 0, unit: 'g' },
        SUGAR: { quantity: nutrients.SUGAR || 0, unit: 'g' },
        FASAT: { quantity: nutrients.FASAT || 0, unit: 'g' },
        NA: { quantity: nutrients.NA || 0, unit: 'mg' }
      },
      healthLabels: food.foodContentsLabel ? [food.foodContentsLabel] : ["NATURAL_FOOD"]
    };
  } catch (error) {
    return getFallbackData(ingr);
  }
};

const getFallbackData = (ingr: string) => {
  const lower = ingr.toLowerCase();
  const mocks: Record<string, any> = {
    apple: { calories: 95, totalNutrients: { PROCNT: { quantity: 0.5 }, CHOCDF: { quantity: 25 }, FAT: { quantity: 0.3 } } },
    banana: { calories: 105, totalNutrients: { PROCNT: { quantity: 1.3 }, CHOCDF: { quantity: 27 }, FAT: { quantity: 0.4 } } },
    chicken: { calories: 165, totalNutrients: { PROCNT: { quantity: 31 }, CHOCDF: { quantity: 0 }, FAT: { quantity: 3.6 } } },
    salmon: { calories: 208, totalNutrients: { PROCNT: { quantity: 20 }, CHOCDF: { quantity: 0 }, FAT: { quantity: 13 } } }
  };

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
      healthLabels: ["NATURAL_FOOD"]
    };
  }
  return null;
};

export const searchRecipes = async (params: {
  query: string;
  health?: string[];
  mealType?: string;
  calories?: string;
  diet?: string;
}) => {
  try {
    const url = new URL("https://api.edamam.com/search");
    url.searchParams.append("q", params.query);
    url.searchParams.append("app_id", RECIPE_APP_ID);
    url.searchParams.append("app_key", RECIPE_APP_KEY);
    url.searchParams.append("from", "0");
    url.searchParams.append("to", "12");
    
    if (params.health && params.health.length > 0) {
      params.health.forEach(h => {
        url.searchParams.append("health", h.toLowerCase().replace(/\s+/g, '-'));
      });
    }

    if (params.calories) {
      url.searchParams.append("calories", params.calories);
    }

    if (params.diet) {
      url.searchParams.append("diet", params.diet);
    }

    // Mandatory proxy for v1 Search API to bypass CORS
    const response = await fetch(`${PROXY_URL}${encodeURIComponent(url.toString())}`);
    
    if (!response.ok) {
      console.error("Edamam API Error:", response.status);
      return null;
    }
    
    return await response.json();
  } catch (error) {
    console.error("Fetch Error:", error);
    return null;
  }
};

export const getRecommendations = async (params: {
  healthLabels: string[];
  mealType?: string;
  calories?: string;
  diet?: string;
}) => {
  const baseQueries: Record<string, string[]> = {
    breakfast: ['oats', 'eggs', 'smoothie', 'pancakes', 'yogurt'],
    lunch: ['salad', 'sandwich', 'bowl', 'soup', 'wrap'],
    dinner: ['roast', 'pasta', 'stir fry', 'grill', 'stew'],
    snack: ['nuts', 'fruit', 'bar', 'dip', 'crackers']
  };

  const mealTypeKey = params.mealType?.toLowerCase() || 'lunch';
  const queries = baseQueries[mealTypeKey] || baseQueries.lunch;
  const randomQuery = queries[Math.floor(Math.random() * queries.length)];
  
  const finalQuery = `${mealTypeKey} ${randomQuery} ${params.healthLabels.length > 0 ? params.healthLabels[0] : ''}`.trim();

  return searchRecipes({
    query: finalQuery,
    health: params.healthLabels,
    calories: params.calories,
    diet: params.diet
  });
};