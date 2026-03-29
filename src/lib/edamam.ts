const NUTRITION_APP_ID = "5006387d";
const NUTRITION_APP_KEY = "a0b84fa17a95362c2fb8084d5161a5e4";
const RECIPE_APP_ID = "23cc0b56"; 
const RECIPE_APP_KEY = "9ab0df600176dc9baa30d2fae4b945c8";

export const analyzeNutrition = async (ingr: string) => {
  try {
    const response = await fetch(
      `https://api.edamam.com/api/nutrition-data?app_id=${NUTRITION_APP_ID}&app_key=${NUTRITION_APP_KEY}&nutrition-type=logging&ingr=${encodeURIComponent(ingr)}`
    );
    if (!response.ok) throw new Error("API limit reached or invalid input");
    return await response.json();
  } catch (error) {
    console.error("Nutrition Analysis Error:", error);
    return null;
  }
};

export const searchRecipes = async (query: string, health?: string[]) => {
  try {
    let url = `https://api.edamam.com/search?q=${encodeURIComponent(query)}&app_id=${RECIPE_APP_ID}&app_key=${RECIPE_APP_KEY}`;
    if (health && health.length > 0) {
      health.forEach(h => {
        // Edamam health labels are usually lowercase with hyphens
        const label = h.toLowerCase().replace(/\s+/g, '-');
        url += `&health=${label}`;
      });
    }
    const response = await fetch(url);
    if (!response.ok) throw new Error("Recipe Search Error");
    return await response.json();
  } catch (error) {
    console.error("Recipe Search Error:", error);
    return null;
  }
};

export const getRecommendations = async (healthLabels: string[]) => {
  // Default search for healthy options if no labels provided
  const query = healthLabels.length > 0 ? healthLabels[0] : "healthy";
  return searchRecipes(query, healthLabels);
};