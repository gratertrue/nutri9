export const STORAGE_KEYS = {
  USER_PROFILE: 'nutri_user_profile',
  FOOD_LOG: 'nutri_food_log',
  ACHIEVEMENTS: 'nutri_achievements',
  STREAK: 'nutri_streak',
  POINTS: 'nutri_points'
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