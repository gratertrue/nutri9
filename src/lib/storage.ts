export const STORAGE_KEYS = {
  USER_PROFILE: 'nutri_user_profile',
  FOOD_LOG: 'nutri_food_log',
  ACHIEVEMENTS: 'nutri_achievements',
  STREAK: 'nutri_streak',
  POINTS: 'nutri_points',
  WATER_INTAKE: 'nutri_water_intake',
  WEIGHT_HISTORY: 'nutri_weight_history',
  MEAL_PLANNER_LOG: 'nutri_meal_planner_log'
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
  const newPoints = current + amount;
  setStoredData(STORAGE_KEYS.POINTS, newPoints);
  return newPoints;
};