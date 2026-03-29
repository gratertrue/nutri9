"use client";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import MobileHeader from "./components/MobileHeader";
import Index from "./pages/Index";
import FoodLookup from "./pages/FoodLookup";
import Profile from "./pages/Profile";
import Achievements from "./pages/Achievements";
import DailyLog from "./pages/DailyLog";
import History from "./pages/History";
import MealPlanner from "./pages/MealPlanner";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner position="top-right" />
      <BrowserRouter>
        <div className="flex flex-col md:flex-row min-h-screen bg-[#0F172A] text-slate-200 font-sans selection:bg-cyan-500/30">
          <MobileHeader />
          <Sidebar />
          <main className="flex-1 overflow-y-auto">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/lookup" element={<FoodLookup />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/achievements" element={<Achievements />} />
              <Route path="/planner" element={<MealPlanner />} />
              <Route path="/log" element={<DailyLog />} />
              <Route path="/history" element={<History />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;