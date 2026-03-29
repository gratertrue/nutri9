const NUTRITION_APP_ID = "5006387d";
const NUTRITION_APP_KEY = "a0b84fa17a95362c2fb8084d5161a5e4";
const RECIPE_APP_ID = "23cc0b56"; 
const RECIPE_APP_KEY = "9ab0df600176dc9baa30d2fae4b945c8";

export const analyzeNutrition = async (ingr: string) => {
  try {
    // We use the 'logging' type for better accuracy with raw ingredients/quantities
    const url = new URL("https://api.edamam.com/api/nutrition-data");
    url.searchParams.append("app_id", NUTRITION_APP_ID);
    url.searchParams.append("app_key", NUTRITION_APP_KEY);
    url.searchParams.append("nutrition-type", "logging");
    url.searchParams.append("ingr", ingr);

    const response = await fetch(url.toString());
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Edamam API Error:", errorData);
      throw new Error(errorData.message || "API request failed");
    }

    const data = await response.json();
    
    // Edamam returns a 200 even if it can't parse the food, but totalWeight will be 0
    if (!data || data.totalWeight === 0) {
      return null;
    }

    return data;
  } catch (error) {
    console.error("Nutrition Analysis Error:", error);
    return null;
  }
};

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
    if (!response.ok) throw new Error("Recipe Search Error");
    return await response.json();
  } catch (error) {
    console.error("Recipe Search Error:", error);
    return null;
  }
};

export const getRecommendations = async (healthLabels: string[]) => {
  const query = healthLabels.length > 0 ? healthLabels[0] : "healthy";
  return searchRecipes(query, healthLabels);
};