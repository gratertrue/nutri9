"use client";

import React from 'react';
import { NavLink } from 'react-router-dom';
import { Menu, Zap } from 'lucide-react';
import { 
  Sheet, 
  SheetContent, 
  SheetTrigger,
  SheetHeader,
  SheetTitle 
} from '@/components/ui/sheet';
import { navItems } from './Sidebar';
import { cn } from '@/lib/utils';

const MobileHeader = () => {
  const [open, setOpen] = React.useState(false);

  return (
    <header className="md:hidden flex items-center justify-between p-4 bg-slate-950/50 backdrop-blur-xl border-b border-white/10 sticky top-0 z-50">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-cyan-500 rounded-lg flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.4)]">
          <Zap className="text-white fill-white" size={18} />
        </div>
        <span className="font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
          NutriIntel
        </span>
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <button className="p-2 text-slate-400 hover:text-white transition-colors">
            <Menu size={24} />
          </button>
        </SheetTrigger>
        <SheetContent side="left" className="bg-slate-950 border-white/10 p-6 w-72">
          <SheetHeader className="mb-8 text-left">
            <SheetTitle className="flex items-center gap-3">
              <div className="w-10 h-10 bg-cyan-500 rounded-xl flex items-center justify-center">
                <Zap className="text-white fill-white" size={24} />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                NutriIntel
              </span>
            </SheetTitle>
          </SheetHeader>
          <nav className="space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setOpen(false)}
                className={({ isActive }) => cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300",
                  isActive 
                    ? "bg-white/10 text-cyan-400 border border-white/10" 
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                )}
              >
                <item.icon size={20} />
                <span className="font-medium">{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </SheetContent>
      </Sheet>
    </header>
  );
};

export default MobileHeader;