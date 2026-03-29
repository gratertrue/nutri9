export interface Nutrient {
  label: string;
  quantity: number;
  unit: string;
}

export const calculateFoodScore = (data: any) => {
  if (!data || !data.totalNutrients) return { score: 0, grade: 'E' };

  const nutrients = data.totalNutrients;
  let score = 50;

  // Positive factors
  if (nutrients.PROCNT?.quantity > 15) score += 10;
  if (nutrients.FIBTG?.quantity > 5) score += 15;
  if (nutrients.VITC?.quantity > 20) score += 5;

  // Negative factors
  if (nutrients.ENERC_KCAL?.quantity > 500) score -= 10;
  if (nutrients.SUGAR?.quantity > 15) score -= 15;
  if (nutrients.FASAT?.quantity > 5) score -= 10;
  if (nutrients.NA?.quantity > 400) score -= 10;

  const finalScore = Math.max(0, Math.min(100, score));
  let grade = 'E';
  if (finalScore >= 85) grade = 'A';
  else if (finalScore >= 70) grade = 'B';
  else if (finalScore >= 50) grade = 'C';
  else if (finalScore >= 30) grade = 'D';

  return { score: finalScore, grade };
};

export const detectUltraProcessed = (ingredients: string[]) => {
  const flags = [
    'sweetener', 'aspartame', 'sucralose', 'nitrite', 'hydrogenated', 
    'hfcs', 'syrup', 'maltodextrin', 'bha', 'bht', 'artificial'
  ];
  
  const detected = ingredients.filter(ing => 
    flags.some(flag => ing.toLowerCase().includes(flag))
  );

  return {
    isUPF: detected.length > 0 || ingredients.length > 10,
    flags: detected
  };
};

export const checkHealthCompatibility = (data: any, conditions: string[]) => {
  const alerts: { type: 'warning' | 'good' | 'caution', message: string, condition: string }[] = [];
  const n = data.totalNutrients;

  if (conditions.includes('Diabetes')) {
    if (n.SUGAR?.quantity > 15 || n.CHOCDF?.quantity > 30) {
      alerts.push({ type: 'warning', condition: 'Diabetes', message: 'High sugar/carbs detected.' });
    } else if (n.SUGAR?.quantity < 5 && n.FIBTG?.quantity > 3) {
      alerts.push({ type: 'good', condition: 'Diabetes', message: 'Low sugar and high fiber - Excellent choice.' });
    }
  }

  if (conditions.includes('Heart Disease')) {
    if (n.FASAT?.quantity > 5 || n.NA?.quantity > 400) {
      alerts.push({ type: 'warning', condition: 'Heart Health', message: 'High saturated fat or sodium.' });
    } else if (n.NA?.quantity < 140 && n.FASAT?.quantity < 2) {
      alerts.push({ type: 'good', condition: 'Heart Health', message: 'Heart-healthy sodium and fat levels.' });
    }
  }

  if (conditions.includes('Celiac')) {
    const glutenIngr = ['wheat', 'barley', 'rye', 'oats'];
    // Simple check for demo, in production this would check ingredient list
    alerts.push({ type: 'caution', condition: 'Celiac', message: 'Always verify ingredient labels for hidden gluten.' });
  }

  return alerts;
};