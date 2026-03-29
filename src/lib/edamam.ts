"use client";

// Edamam API Credentials
const NUTRITION_APP_ID = "5006387d";
const NUTRITION_APP_KEY = "a0b84fa17a95362c2fb8084d5161a5e4";
const RECIPE_APP_ID = "23cc0b56"; 
const RECIPE_APP_KEY = "9ab0df600176dc9baa30d2fae4b945c8";

// Using a more reliable proxy for GET requests
const PROXY_URL = "https://api.codetabs.com/v1/proxy?quest=";

/**
 * Comprehensive Mock Data for Fallback (Requirement 19)
 */
const MOCK_FOODS = [
  { name: 'Apple', calories: 95, protein: 0.5, carbs: 25, fat: 0.3, fiber: 4.4, sugar: 19 },
  { name: 'Chicken Breast', calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0, sugar: 0 },
  { name: 'Salmon', calories: 208, protein: 20, carbs: 0, fat: 13, fiber: 0, sugar: 0 },
  { name: 'Brown Rice', calories: 216, protein: 5, carbs: 45, fat: 1.8, fiber: 3.5, sugar: 0.7 },
  { name: 'Broccoli', calories: 55, protein: 3.7, carbs: 11, fat: 0.6, fiber: 4, sugar: 2.2 },
  { name: 'Almonds', calories: 164, protein: 6, carbs: 6, fat: 14, fiber: 3.5, sugar: 1.2 },
  { name: 'Greek Yogurt', calories: 100, protein: 10, carbs: 3.6, fat: 5, fiber: 0, sugar: 3.6 },
  { name: 'Quinoa', calories: 222, protein: 8, carbs: 39, fat: 3.6, fiber: 5, sugar: 0 },
  { name: 'Avocado', calories: 234, protein: 2.9, carbs: 12, fat: 21, fiber: 10, sugar: 1 },
  { name: 'Sweet Potato', calories: 112, protein: 2, carbs: 26, fat: 0.1, fiber: 3.9, sugar: 5 },
  { name: 'Egg', calories: 78, protein: 6, carbs: 0.6, fat: 5, fiber: 0, sugar: 0.6 },
  { name: 'Oatmeal', calories: 158, protein: 6, carbs: 27, fat: 3.2, fiber: 4, sugar: 0.5 },
  { name: 'Tuna', calories: 132, protein: 28, carbs: 0, fat: 1, fiber: 0, sugar: 0 },
  { name: 'Spinach', calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, fiber: 2.2, sugar: 0.4 },
  { name: 'Banana', calories: 105, protein: 1.3, carbs: 27, fat: 0.4, fiber: 3.1, sugar: 14 }
];

export const analyzeNutrition = async (ingr: string) => {
  try {
    const url = new URL("https://api.edamam.com/api/nutrition-data");
    url.searchParams.append("app_id", NUTRITION_APP_ID);
    url.searchParams.append("app_key", NUTRITION_APP_KEY);
    url.searchParams.append("ingr", ingr);

    const response = await fetch(`${PROXY_URL}${encodeURIComponent(url.toString())}`);
    if (!response.ok) throw new Error("API Error");
    return await response.json();
  } catch (error) {
    // Fallback to mock data if API fails
    const lower = ingr.toLowerCase();
    const found = MOCK_FOODS.find(f => lower.includes(f.name.toLowerCase()));
    if (found) {
      return {
        calories: found.calories,
        totalNutrients: {
          PROCNT: { quantity: found.protein, unit: 'g' },
          CHOCDF: { quantity: found.carbs, unit: 'g' },
          FAT: { quantity: found.fat, unit: 'g' },
          FIBTG: { quantity: found.fiber, unit: 'g' },
          SUGAR: { quantity: found.sugar, unit: 'g' },
          NA: { quantity: 50, unit: 'mg' }
        },
        ingredientLines: [ingr]
      };
    }
    return null;
  }
};

export const getWeeklyMealPlan = async (userId: string, params: any) => {
  // 1. Try the official Meal Planner POST API
  try {
    const baseUrl = `https://api.edamam.com/api/meal-planner/v1/${userId}/week?app_id=${RECIPE_APP_ID}&app_key=${RECIPE_APP_KEY}`;
    const response = await fetch(`https://corsproxy.io/?${encodeURIComponent(baseUrl)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    });
    
    if (response.ok) return await response.json();
  } catch (e) {
    console.warn("Meal Planner POST failed, falling back to Recipe Search...");
  }

  // 2. Fallback: Generate a plan using Recipe Search (GET is more proxy-friendly)
  try {
    const recipes = await searchRecipes("healthy", params.plan?.accept?.all[0]?.health || []);
    if (recipes && recipes.hits) {
      const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      const plan: any = { selection: [] };
      
      days.forEach((day, i) => {
        const dailyRecipes = recipes.hits.slice(i * 3, (i * 3) + 3);
        plan.selection.push({
          day,
          meals: dailyRecipes.map((hit: any) => ({
            label: hit.recipe.label,
            image: hit.recipe.image,
            calories: hit.recipe.calories / hit.recipe.yield,
            nutrients: hit.recipe.totalNutrients,
            ingredients: hit.recipe.ingredientLines
          }))
        });
      });
      return plan;
    }
  } catch (e) {
    console.warn("Recipe Search fallback failed, using internal database...");
  }

  // 3. Final Fallback: Internal Database
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  return {
    selection: days.map(day => ({
      day,
      meals: [
        { label: 'Oatmeal with Banana', calories: 260, nutrients: { PROCNT: { quantity: 8 } } },
        { label: 'Grilled Chicken Salad', calories: 450, nutrients: { PROCNT: { quantity: 35 } } },
        { label: 'Salmon with Quinoa', calories: 580, nutrients: { PROCNT: { quantity: 42 } } }
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

    const response = await fetch(`${PROXY_URL}${encodeURIComponent(url.toString())}`);
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    return null;
  }
};