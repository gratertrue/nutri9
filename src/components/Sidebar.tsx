"use client";

import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Search, 
  Calendar, 
  ClipboardList, 
  History, 
  User, 
  Trophy,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: Search, label: 'Food Lookup', path: '/lookup' },
  { icon: Calendar, label: 'Meal Planner', path: '/planner' },
  { icon: ClipboardList, label: "Today's Log", path: '/log' },
  { icon: History, label: 'History', path: '/history' },
  { icon: Trophy, label: 'Achievements', path: '/achievements' },
  { icon: User, label: 'Profile', path: '/profile' },
];

const Sidebar = () => {
  return (
    <aside className="hidden md:flex w-64 h-screen sticky top-0 bg-slate-950/50 backdrop-blur-xl border-r border-white/10 p-6 flex-col">
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="w-10 h-10 bg-cyan-500 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.5)]">
          <Zap className="text-white fill-white" size={24} />
        </div>
        <h1 className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
          NutriIntel
        </h1>
      </div>

      <nav className="flex-1 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group",
              isActive 
                ? "bg-white/10 text-cyan-400 border border-white/10" 
                : "text-slate-400 hover:bg-white/5 hover:text-white"
            )}
          >
            <item.icon size={20} className="group-hover:scale-110 transition-transform" />
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto pt-6 border-t border-white/10">
        <div className="text-[10px] text-slate-500 uppercase tracking-widest mb-2 px-2">Powered by</div>
        <a href="https://www.edamam.com" target="_blank" rel="noreferrer" className="opacity-70 hover:opacity-100 transition-opacity">
          <img src="https://developer.edamam.com/images/logo.png" alt="Edamam" className="h-6" />
        </a>
      </div>
    </aside>
  );
};

export default Sidebar;