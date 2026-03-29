export const STORAGE_KEYS = {
  USER_SESSION: 'nutri_user_session',
  USERS: 'nutri_users_db',
  FOOD_LOG: 'nutri_food_log',
  FAVORITES: 'nutri_favorites',
  COMPLETION: 'nutri_meal_completion',
  BMI_HISTORY: 'nutri_bmi_history',
  POINTS: 'nutri_points'
};

export const getStoredData = <T>(key: string, defaultValue: T): T => {
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : defaultValue;
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