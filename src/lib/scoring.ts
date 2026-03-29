export interface NutritionData {
  calories: number;
  totalNutrients: any;
  healthLabels: string[];
  dietLabels: string[];
}

export const calculateHealthyScore = (data: NutritionData) => {
  let score = 50; // Base score
  
  const protein = data.totalNutrients?.PROCNT?.quantity || 0;
  const fiber = data.totalNutrients?.FIBTG?.quantity || 0;
  const sugar = data.totalNutrients?.SUGAR?.quantity || 0;
  const satFat = data.totalNutrients?.FASAT?.quantity || 0;
  const sodium = data.totalNutrients?.NA?.quantity || 0;

  // Bonuses
  if (protein >= 20) score += 20;
  else if (protein >= 10) score += 10;
  
  if (fiber >= 5) score += 15;
  
  // Penalties
  if (sugar > 15) score -= 15;
  if (satFat > 5) score -= 10;
  if (sodium > 400) score -= 10;

  return Math.max(0, Math.min(100, score));
};

export const analyzeHealthConditions = (data: NutritionData, conditions: string[]) => {
  const alerts: { type: 'caution' | 'warning', message: string }[] = [];
  const sugar = data.totalNutrients?.SUGAR?.quantity || 0;
  const sodium = data.totalNutrients?.NA?.quantity || 0;
  const satFat = data.totalNutrients?.FASAT?.quantity || 0;

  if (conditions.includes('Diabetes')) {
    if (sugar > 15) alerts.push({ type: 'warning', message: 'High sugar content - Caution for Diabetes' });
    else if (sugar > 8) alerts.push({ type: 'caution', message: 'Moderate sugar content' });
  }

  if (conditions.includes('Hypertension') && sodium > 200) {
    alerts.push({ type: 'warning', message: 'High sodium - Caution for Hypertension' });
  }

  if (conditions.includes('Heart Condition') && satFat > 5) {
    alerts.push({ type: 'warning', message: 'High saturated fat - Caution for Heart Health' });
  }

  return alerts;
};