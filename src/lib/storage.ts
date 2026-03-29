export const STORAGE_KEYS = {
  USER_PROFILE: 'nutri_user_profile',
  FOOD_LOG: 'nutri_food_log',
  ACHIEVEMENTS: 'nutri_achievements',
  POINTS: 'nutri_points',
  BMI_HISTORY: 'nutri_bmi_history',
  FAVORITES: 'nutri_favorites',
  GROCERY_LIST: 'nutri_grocery_list',
  MEAL_COMPLETION: 'nutri_meal_completion'
};

export const getStoredData = <T>(key: string, defaultValue: T): T => {
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : defaultValue;
};

export const setStoredData = (key: string, data: any) => {
  localStorage.setItem(key, JSON.stringify(data));
};

export const updatePoints = (amount: number) => {
  const current = getStoredData(STORAGE_KEYS.POINTS, 0);
  setStoredData(STORAGE_KEYS.POINTS, current + amount);
  return current + amount;
};

export const toggleFavorite = (recipe: any) => {
  const favorites = getStoredData<any[]>(STORAGE_KEYS.FAVORITES, []);
  const exists = favorites.find(f => f.uri === recipe.uri);
  
  if (exists) {
    setStoredData(STORAGE_KEYS.FAVORITES, favorites.filter(f => f.uri !== recipe.uri));
    return false;
  } else {
    setStoredData(STORAGE_KEYS.FAVORITES, [...favorites, recipe]);
    return true;
  }
};