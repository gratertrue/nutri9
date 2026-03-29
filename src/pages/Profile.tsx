import React, { useState, useEffect } from 'react';
import GlassCard from '@/components/GlassCard';
import { getStoredData, setStoredData, STORAGE_KEYS } from '@/lib/storage';
import { User, Activity, Heart, Scale } from 'lucide-react';
import { showSuccess } from '@/utils/toast';
import { cn } from '@/lib/utils';

const Profile = () => {
  const [profile, setProfile] = useState(() => getStoredData(STORAGE_KEYS.USER_PROFILE, {
    name: '',
    age: 25,
    weight: 70,
    height: 175,
    gender: 'male',
    activityLevel: 'moderate',
    calorieGoal: 2000,
    healthConditions: [],
    dietaryRestrictions: []
  }));

  const [bmi, setBmi] = useState<number | null>(null);
  const [bmiCategory, setBmiCategory] = useState<string>('');

  useEffect(() => {
    if (profile.weight && profile.height) {
      const heightInMeters = profile.height / 100;
      const calculatedBmi = profile.weight / (heightInMeters * heightInMeters);
      setBmi(calculatedBmi);

      if (calculatedBmi < 18.5) setBmiCategory('Underweight');
      else if (calculatedBmi < 25) setBmiCategory('Healthy');
      else if (calculatedBmi < 30) setBmiCategory('Overweight');
      else setBmiCategory('Obese');
    }
  }, [profile.weight, profile.height]);

  const conditions = ['Diabetes', 'Heart Condition', 'Hypertension', 'Stomach Sensitivity'];
  const diets = ['Vegetarian', 'Vegan', 'Paleo', 'Gluten-Free', 'Keto'];

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setStoredData(STORAGE_KEYS.USER_PROFILE, profile);
    showSuccess("Profile updated successfully!");
  };

  const toggleItem = (list: string[], item: string, key: string) => {
    const newList = list.includes(item) 
      ? list.filter(i => i !== item) 
      : [...list, item];
    setProfile({ ...profile, [key]: newList });
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6 md:space-y-8">
      <header>
        <h2 className="text-2xl md:text-3xl font-bold text-white mb-1 md:mb-2">Biometric Profile</h2>
        <p className="text-slate-400 text-sm md:text-base">Personalize your nutrition intelligence engine.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <GlassCard className="md:col-span-2">
          <h3 className="text-white font-bold mb-4 md:mb-6 flex items-center gap-2 text-sm md:text-base">
            <User size={18} className="text-cyan-400" />
            Basic Information
          </h3>
          <div className="space-y-4">
            <div>
              <label className="text-[10px] text-slate-500 uppercase mb-1 block">Full Name</label>
              <input 
                type="text" 
                value={profile.name}
                onChange={e => setProfile({...profile, name: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 md:p-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-cyan-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-3 md:gap-4">
              <div>
                <label className="text-[10px] text-slate-500 uppercase mb-1 block">Age</label>
                <input 
                  type="number" 
                  value={profile.age}
                  onChange={e => setProfile({...profile, age: parseInt(e.target.value)})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 md:p-3 text-sm text-white focus:outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-500 uppercase mb-1 block">Gender</label>
                <select 
                  value={profile.gender}
                  onChange={e => setProfile({...profile, gender: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 md:p-3 text-sm text-white focus:outline-none"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="flex flex-col items-center justify-center text-center bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border-cyan-500/20">
          <Scale size={32} className="text-cyan-400 mb-3" />
          <h4 className="text-slate-400 text-xs uppercase font-bold tracking-widest mb-1">Your BMI</h4>
          <div className="text-4xl font-black text-white mb-1">{bmi?.toFixed(1) || '--'}</div>
          <div className={cn(
            "text-xs font-bold px-3 py-1 rounded-full",
            bmiCategory === 'Healthy' ? "bg-green-500/20 text-green-400" : "bg-orange-500/20 text-orange-400"
          )}>
            {bmiCategory || 'Enter metrics'}
          </div>
        </GlassCard>
      </div>

      <form onSubmit={handleSave} className="space-y-4 md:space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <GlassCard>
            <h3 className="text-white font-bold mb-4 md:mb-6 flex items-center gap-2 text-sm md:text-base">
              <Activity size={18} className="text-purple-400" />
              Body Metrics
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 md:gap-4">
                <div>
                  <label className="text-[10px] text-slate-500 uppercase mb-1 block">Weight (kg)</label>
                  <input 
                    type="number" 
                    value={profile.weight}
                    onChange={e => setProfile({...profile, weight: parseInt(e.target.value)})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 md:p-3 text-sm text-white focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 uppercase mb-1 block">Height (cm)</label>
                  <input 
                    type="number" 
                    value={profile.height}
                    onChange={e => setProfile({...profile, height: parseInt(e.target.value)})}
                    className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 md:p-3 text-sm text-white focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] text-slate-500 uppercase mb-1 block">Daily Calorie Goal</label>
                <input 
                  type="number" 
                  value={profile.calorieGoal}
                  onChange={e => setProfile({...profile, calorieGoal: parseInt(e.target.value)})}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-2.5 md:p-3 text-sm text-white focus:outline-none"
                />
              </div>
            </div>
          </GlassCard>

          <GlassCard>
            <h3 className="text-white font-bold mb-4 md:mb-6 flex items-center gap-2 text-sm md:text-base">
              <Heart size={18} className="text-pink-400" />
              Health & Diet
            </h3>
            <div className="space-y-6">
              <div>
                <label className="text-[10px] text-slate-500 uppercase mb-3 block">Health Conditions</label>
                <div className="flex flex-wrap gap-2">
                  {conditions.map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => toggleItem(profile.healthConditions, c, 'healthConditions')}
                      className={cn(
                        "px-3 py-1.5 md:px-4 md:py-2 rounded-full text-[11px] md:text-sm transition-all",
                        profile.healthConditions.includes(c) 
                          ? "bg-cyan-500 text-white" 
                          : "bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10"
                      )}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-[10px] text-slate-500 uppercase mb-3 block">Dietary Restrictions</label>
                <div className="flex flex-wrap gap-2">
                  {diets.map(d => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => toggleItem(profile.dietaryRestrictions, d, 'dietaryRestrictions')}
                      className={cn(
                        "px-3 py-1.5 md:px-4 md:py-2 rounded-full text-[11px] md:text-sm transition-all",
                        profile.dietaryRestrictions.includes(d) 
                          ? "bg-purple-500 text-white" 
                          : "bg-white/5 text-slate-400 border border-white/10 hover:bg-white/10"
                      )}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </GlassCard>
        </div>

        <button 
          type="submit"
          className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-bold py-3.5 md:py-4 rounded-2xl text-sm md:text-base shadow-lg shadow-cyan-500/20 hover:scale-[1.01] active:scale-[0.99] transition-transform"
        >
          Save Profile & Recalculate Goals
        </button>
      </form>
    </div>
  );
};

export default Profile;