"use client";

import React, { useState } from 'react';
import GlassCard from '@/components/GlassCard';
import { getStoredData, setStoredData, STORAGE_KEYS } from '@/lib/storage';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Zap } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const users = getStoredData(STORAGE_KEYS.USERS, []);

    if (isLogin) {
      const user = users.find((u: any) => u.email === email && u.password === password);
      if (user) {
        setStoredData(STORAGE_KEYS.USER_SESSION, user);
        showSuccess(`Welcome back, ${user.name}!`);
        navigate('/');
      } else {
        showError("Invalid credentials");
      }
    } else {
      if (users.find((u: any) => u.email === email)) {
        showError("User already exists");
        return;
      }
      const newUser = { email, password, name, healthConditions: [], calorieGoal: 2000 };
      setStoredData(STORAGE_KEYS.USERS, [...users, newUser]);
      setStoredData(STORAGE_KEYS.USER_SESSION, newUser);
      showSuccess("Account created successfully!");
      navigate('/profile');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#0F172A]">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="w-16 h-16 bg-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-[0_0_30px_rgba(6,182,212,0.5)]">
            <Zap className="text-white fill-white" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-white">NutriIntel™</h1>
          <p className="text-slate-400 mt-2">Precision Nutrition Intelligence</p>
        </div>

        <GlassCard>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                <input
                  type="text"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                  required
                />
              </div>
            )}
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                required
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-bold py-3 rounded-xl shadow-lg shadow-cyan-500/20 hover:scale-[1.02] transition-transform"
            >
              {isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-slate-400 hover:text-cyan-400 transition-colors"
            >
              {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
            </button>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default Auth;