"use client";

// Edamam API Credentials
const FOOD_APP_ID = "07081ee2";
const FOOD_APP_KEY = "4ef9911c1a046060203091660977ee0d";
const RECIPE_APP_ID = "23cc0b56"; 
const RECIPE_APP_KEY = "9ab0df600176dc9baa30d2fae4b945c8";

// Using CodeTabs proxy to bypass CORS
const PROXY_URL = "https://api.codetabs.com/v1/proxy?quest=";

/**
 * Safely parses JSON from a response, handling cases where HTML might be returned instead
 */
const safeFetchJson = async (url: string) => {
  try {
    const response = await fetch(`${PROXY_URL}${encodeURIComponent(url)}`);
    const text = await response.text();
    
    if (text.trim().startsWith('<')) {
      console.warn("API Proxy returned HTML. Switching to Demo Mode data.");
      return null;
    }
    
    return JSON.parse(text);
  } catch (error) {
    console.error("Fetch error:", error);
    return null;
  }
};

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

    const data = await safeFetchJson(url.toString());
    
    if (!data || !data.hints || data.hints.length === 0) {
      return getFallbackNutrition(ingr);
    }

    const hint = data.hints.find((h: any) => h.food && h.food.nutrients) || data.hints[0];
    const food = hint.food;
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
    return getFallbackNutrition(ingr);
  }
};

const getFallbackNutrition = (ingr: string) => {
  const lower = ingr.toLowerCase();
  const mocks: Record<string, any> = {
    apple: { calories: 95, PROCNT: 0.5, CHOCDF: 25, FAT: 0.3, FIBTG: 4.5, SUGAR: 19 },
    banana: { calories: 105, PROCNT: 1.3, CHOCDF: 27, FAT: 0.4, FIBTG: 3.1, SUGAR: 14 },
    chicken: { calories: 165, PROCNT: 31, CHOCDF: 0, FAT: 3.6, FIBTG: 0, SUGAR: 0 },
    salmon: { calories: 208, PROCNT: 20, CHOCDF: 0, FAT: 13, FIBTG: 0, SUGAR: 0 },
    egg: { calories: 70, PROCNT: 6, CHOCDF: 0.6, FAT: 5, FIBTG: 0, SUGAR: 0 },
    rice: { calories: 130, PROCNT: 2.7, CHOCDF: 28, FAT: 0.3, FIBTG: 0.4, SUGAR: 0.1 },
    avocado: { calories: 160, PROCNT: 2, CHOCDF: 8.5, FAT: 14.7, FIBTG: 6.7, SUGAR: 0.7 },
    broccoli: { calories: 34, PROCNT: 2.8, CHOCDF: 6.6, FAT: 0.4, FIBTG: 2.6, SUGAR: 1.7 },
    coffee: { calories: 2, PROCNT: 0.1, CHOCDF: 0, FAT: 0, FIBTG: 0, SUGAR: 0 },
    steak: { calories: 250, PROCNT: 26, CHOCDF: 0, FAT: 15, FIBTG: 0, SUGAR: 0 }
  };

  const match = Object.keys(mocks).find(key => lower.includes(key)) || 'apple';
  const data = mocks[match];
  
  return {
    calories: data.calories,
    totalWeight: 100,
    totalNutrients: {
      PROCNT: { quantity: data.PROCNT, unit: 'g' },
      CHOCDF: { quantity: data.CHOCDF, unit: 'g' },
      FAT: { quantity: data.FAT, unit: 'g' },
      FIBTG: { quantity: data.FIBTG, unit: 'g' },
      SUGAR: { quantity: data.SUGAR, unit: 'g' },
      FASAT: { quantity: data.FAT * 0.3, unit: 'g' },
      NA: { quantity: 5, unit: 'mg' }
    },
    healthLabels: ["DEMO_MODE_DATA"]
  };
};

export const searchRecipes = async (params: any) => {
  try {
    const query = typeof params === 'string' ? params : params.query;
    const url = new URL("https://api.edamam.com/api/recipes/v2");
    url.searchParams.append("type", "public");
    url.searchParams.append("q", query);
    url.searchParams.append("app_id", RECIPE_APP_ID);
    url.searchParams.append("app_key", RECIPE_APP_KEY);
    
    const data = await safeFetchJson(url.toString());
    if (!data || !data.hits) return getMockRecipes(query);
    return data;
  } catch (error) {
    return getMockRecipes(typeof params === 'string' ? params : params.query);
  }
};

const getMockRecipes = (query: string) => {
  const mockHits = [
    {
      recipe: {
        uri: "mock-1",
        label: `${query} Power Bowl`,
        image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=500&q=80",
        url: "#",
        yield: 1,
        dietLabels: ["High-Protein"],
        healthLabels: ["Vegan", "Gluten-Free"],
        calories: 450,
        totalTime: 20,
        totalNutrients: {
          PROCNT: { quantity: 25 },
          CHOCDF: { quantity: 45 },
          FAT: { quantity: 12 }
        }
      }
    },
    {
      recipe: {
        uri: "mock-2",
        label: `Roasted ${query} Salad`,
        image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=500&q=80",
        url: "#",
        yield: 2,
        dietLabels: ["Low-Carb"],
        healthLabels: ["Vegetarian"],
        calories: 600,
        totalTime: 35,
        totalNutrients: {
          PROCNT: { quantity: 15 },
          CHOCDF: { quantity: 20 },
          FAT: { quantity: 18 }
        }
      }
    }
  ];
  return { hits: mockHits };
};

export const getRecommendations = async (params: any) => {
  const results = await searchRecipes(params.mealType || "Healthy");
  return results;
};