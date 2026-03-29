export const STORAGE_KEYS = {
  USER_SESSION: 'nutri_user_session',
  USERS: 'nutri_users_db',
  FOOD_LOG: 'nutri_food_log',
  FAVORITES: 'nutri_favorites',
  COMPLETION: 'nutri_meal_completion',
  MEAL_PLAN: 'nutri_current_meal_plan', // Dedicated key for the plan object
  BMI_HISTORY: 'nutri_bmi_history',
  WEIGHT_HISTORY: 'nutri_weight_history',
  USER_PROFILE: 'nutri_user_profile',
  POINTS: 'nutri_points',
  WATER_INTAKE: 'nutri_water_intake'
};

export const getStoredData = <T>(key: string, defaultValue: T): T => {
  try {
    const stored = localStorage.getItem(key);
    if (!stored) return defaultValue;
    const parsed = JSON.parse(stored);
    // Basic type safety check
    if (Array.isArray(defaultValue) && !Array.isArray(parsed)) return defaultValue;
    if (typeof defaultValue === 'object' && defaultValue !== null && (Array.isArray(parsed) || typeof parsed !== 'object')) return defaultValue;
    return parsed;
  } catch (e) {
    return defaultValue;
  }
};

export const setStoredData = (key: string, data: any) => {
  localStorage.setItem(key, JSON.stringify(data));
};

export const getCurrentUser = () => getStoredData(STORAGE_KEYS.USER_SESSION, null);

export const updatePoints = (amount: number) => {
  const user = getCurrentUser();
  if (!user) return 0;
  const current = getStoredData(`${STORAGE_KEYS.POINTS}_${user.email}`, 0);
  const newPoints = current + amount;
  setStoredData(`${STORAGE_KEYS.POINTS}_${user.email}`, newPoints);
  return newPoints;
};