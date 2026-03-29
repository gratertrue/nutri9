"use client";

export const calculateAdvancedScore = (data: any) => {
  let score = 50;
  const nutrients = data.totalNutrients || {};
  
  const protein = nutrients.PROCNT?.quantity || 0;
  const fiber = nutrients.FIBTG?.quantity || 0;
  const sugar = nutrients.SUGAR?.quantity || 0;
  const satFat = nutrients.FASAT?.quantity || 0;
  const sodium = nutrients.NA?.quantity || 0;
  const calories = data.calories || 0;

  // Positive points
  score += (protein / 5) * 5;
  score += (fiber / 2) * 5;
  
  // Negative points
  score -= (calories / 100) * 2;
  score -= (sugar / 5) * 5;
  score -= (satFat / 2) * 5;
  score -= (sodium / 100) * 5;

  const finalScore = Math.max(0, Math.min(100, score));
  
  let grade = 'E';
  if (finalScore >= 80) grade = 'A';
  else if (finalScore >= 60) grade = 'B';
  else if (finalScore >= 40) grade = 'C';
  else if (finalScore >= 20) grade = 'D';

  return { score: Math.round(finalScore), grade };
};

export const detectUPF = (ingredients: string[] = []) => {
  const upfKeywords = [
    'artificial sweetener', 'bha', 'bht', 'sodium nitrite', 
    'hydrogenated oil', 'hfcs', 'maltodextrin', 'corn syrup',
    'aspartame', 'sucralose', 'saccharin', 'acesulfame', 'monosodium glutamate',
    'carrageenan', 'guar gum', 'xanthan gum', 'artificial flavor', 'modified starch'
  ];
  
  const detected = ingredients.filter(ing => 
    upfKeywords.some(keyword => ing.toLowerCase().includes(keyword))
  );
  
  return {
    isUPF: detected.length > 0 || ingredients.length > 10,
    detectedKeywords: detected
  };
};

export const getAllergenAlerts = (ingredients: string[] = []) => {
  const allergens = {
    Milk: ['milk', 'cheese', 'yogurt', 'butter', 'cream', 'lactose', 'whey', 'casein'],
    Eggs: ['egg', 'albumin', 'mayonnaise'],
    Fish: ['fish', 'salmon', 'tuna', 'cod', 'anchovy'],
    Shellfish: ['shrimp', 'crab', 'lobster', 'mussel', 'prawn'],
    TreeNuts: ['almond', 'walnut', 'cashew', 'pistachio', 'pecan', 'hazelnut'],
    Peanuts: ['peanut', 'arachis'],
    Wheat: ['wheat', 'flour', 'gluten', 'semolina', 'spelt'],
    Soy: ['soy', 'tofu', 'edamame', 'lecithin'],
    Sesame: ['sesame', 'tahini']
  };

  const alerts: string[] = [];
  const text = ingredients.join(' ').toLowerCase();

  Object.entries(allergens).forEach(([name, keywords]) => {
    if (keywords.some(k => text.includes(k))) alerts.push(name);
  });

  return alerts;
};

export const analyzeHealthConditions = (data: any, conditions: string[]) => {
  const alerts: { type: 'warning' | 'good' | 'info', message: string }[] = [];
  const nutrients = data.totalNutrients || {};
  
  const sugar = nutrients.SUGAR?.quantity || 0;
  const carbs = nutrients.CHOCDF?.quantity || 0;
  const fiber = nutrients.FIBTG?.quantity || 0;
  const sodium = nutrients.NA?.quantity || 0;
  const satFat = nutrients.FASAT?.quantity || 0;
  const transFat = nutrients.FATRN?.quantity || 0;
  const phosphorus = nutrients.P?.quantity || 0;
  const potassium = nutrients.K?.quantity || 0;
  const fat = nutrients.FAT?.quantity || 0;
  const folate = nutrients.FOLDFE?.quantity || 0;
  const iron = nutrients.FE?.quantity || 0;
  const caffeine = nutrients.CAFFN?.quantity || 0;

  if (conditions.includes('Diabetes')) {
    if (sugar > 15 || carbs > 30) alerts.push({ type: 'warning', message: 'High sugar/carbs - Caution for Diabetes' });
    else if (sugar < 5 && fiber > 3) alerts.push({ type: 'good', message: 'Diabetes friendly: Low sugar, high fiber' });
  }

  if (conditions.includes('Heart Condition') || conditions.includes('Hypertension')) {
    if (satFat > 5 || sodium > 400 || transFat > 0) alerts.push({ type: 'warning', message: 'High sodium/sat fat - Caution for Heart Health' });
    else if (sodium < 140 && satFat < 2) alerts.push({ type: 'good', message: 'Heart healthy: Low sodium and sat fat' });
  }

  if (conditions.includes('Kidney Disease')) {
    if (phosphorus > 200 || potassium > 250 || sodium > 200) alerts.push({ type: 'warning', message: 'High phosphorus/potassium/sodium - Caution for Kidney Health' });
  }

  if (conditions.includes('Stomach Sensitivity') || conditions.includes('GI issues')) {
    if (fat > 15) alerts.push({ type: 'warning', message: 'High fat content may trigger GI issues/GERD' });
    if (caffeine > 50) alerts.push({ type: 'warning', message: 'Caffeine detected - potential GERD trigger' });
  }

  if (conditions.includes('Pregnancy')) {
    if (caffeine > 200) alerts.push({ type: 'warning', message: 'High caffeine (>200mg) - Limit during pregnancy' });
    if (folate > 100) alerts.push({ type: 'good', message: 'Excellent source of Folate for pregnancy' });
    if (iron > 5) alerts.push({ type: 'good', message: 'Good source of Iron for pregnancy' });
  }

  return alerts;
};

export const getEnvironmentalImpact = (foodName: string) => {
  const lower = foodName.toLowerCase();
  if (lower.includes('beef') || lower.includes('lamb')) return 'High';
  if (lower.includes('chicken') || lower.includes('pork') || lower.includes('cheese') || lower.includes('dairy')) return 'Medium';
  return 'Low';
};