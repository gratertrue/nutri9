import React from 'react';
import { cn } from '@/lib/utils';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
}

const GlassCard = ({ children, className }: GlassCardProps) => {
  return (
    <div className={cn(
      "bg-white/10 backdrop-blur-md border border-white/20 rounded-[24px] p-4 md:p-6 shadow-xl",
      className
    )}>
      {children}
    </div>
  );
};

export default GlassCard;