"use client";

// Edamam API Credentials
const FOOD_APP_ID = "07081ee2";
const FOOD_APP_KEY = "4ef9911c1a046060203091660977ee0d";
const RECIPE_APP_ID = "23cc0b56"; 
const RECIPE_APP_KEY = "9ab0df600176dc9baa30d2fae4b945c8";

// Using CodeTabs proxy
const PROXY_URL = "https://api.codetabs.com/v1/proxy?quest=";

/**
 * Maps UI labels to Edamam API specific health labels
 */
const mapHealthLabel = (label: string): string => {
  const map: Record<string, string> = {
    'vegetarian': 'vegetarian',
    'vegan': 'vegan',
    'paleo': 'paleo',
    'gluten-free': 'gluten-free',
    'keto': 'keto-friendly',
    'dairy-free': 'dairy-free',
    'low-sugar': 'low-sugar'
  };
  const normalized = label.toLowerCase().trim();
  return map[normalized] || normalized;
};

export const analyzeNutrition = async (ingr: string) => {
  try {
    const url = new URL("https://api.edamam.com/api/food-database/v2/parser");
    url.searchParams.append("app_id", FOOD_APP_ID);
    url.searchParams.append("app_key", FOOD_APP_KEY);
    url.searchParams.append("ingr", ingr);

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
    const url = new URL("https://api.edamam.com/api/recipes/v2");
    url.searchParams.append("type", "public");
    url.searchParams.append("q", params.query);
    url.searchParams.append("app_id", RECIPE_APP_ID);
    url.searchParams.append("app_key", RECIPE_APP_KEY);
    
    // Edamam v2 expects specific casing for mealType (e.g., Lunch, Dinner)
    if (params.mealType) {
      const formattedMealType = params.mealType.charAt(0).toUpperCase() + params.mealType.slice(1).toLowerCase();
      url.searchParams.append("mealType", formattedMealType);
    }

    if (params.health && params.health.length > 0) {
      params.health.forEach(h => {
        const mapped = mapHealthLabel(h);
        url.searchParams.append("health", mapped);
      });
    }

    if (params.calories) {
      url.searchParams.append("calories", params.calories);
    }

    if (params.diet) {
      url.searchParams.append("diet", params.diet);
    }

    const response = await fetch(`${PROXY_URL}${encodeURIComponent(url.toString())}`);
    
    if (!response.ok) return null;
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Recipe search failed", error);
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
    breakfast: ['oats', 'eggs', 'smoothie', 'pancakes', 'toast'],
    lunch: ['salad', 'sandwich', 'bowl', 'wrap', 'soup'],
    dinner: ['chicken', 'pasta', 'salmon', 'steak', 'stir fry'],
    snack: ['nuts', 'fruit', 'yogurt', 'hummus', 'cheese']
  };

  const mealTypeKey = params.mealType?.toLowerCase() || 'lunch';
  const queries = baseQueries[mealTypeKey] || baseQueries.lunch;
  const randomQuery = queries[Math.floor(Math.random() * queries.length)];
  
  // Try strict search first
  let results = await searchRecipes({
    query: randomQuery,
    health: params.healthLabels,
    calories: params.calories,
    diet: params.diet,
    mealType: params.mealType
  });

  // If no results, try a broader search by removing the calorie constraint
  if (!results || !results.hits || results.hits.length === 0) {
    results = await searchRecipes({
      query: randomQuery,
      health: params.healthLabels,
      diet: params.diet,
      mealType: params.mealType
    });
  }

  // If still no results, try the most basic search with just query and mealType
  if (!results || !results.hits || results.hits.length === 0) {
    results = await searchRecipes({
      query: randomQuery,
      mealType: params.mealType
    });
  }

  return results;
};