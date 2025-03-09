
import React, { useEffect, useState } from 'react';
import { LucideIcon, LightbulbIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  color: string;
  className?: string;
  showTipOfDay?: boolean;
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  icon: Icon, 
  color, 
  className = '',
  showTipOfDay = false,
  onClick
}) => {
  const [tipOfDay, setTipOfDay] = useState<string | null>(null);
  
  useEffect(() => {
    if (showTipOfDay) {
      // @ts-ignore - AdminUtils may not be recognized properly
      const tip = AdminUtils.getRandomTip?.() || "Tipp des Tages: Regelmäßige Updates helfen deinem Team auf dem Laufenden zu bleiben.";
      setTipOfDay(tip);
    }
  }, [showTipOfDay]);

  if (showTipOfDay && tipOfDay) {
    return (
      <div className={`p-6 rounded-xl border border-border bg-card ${className}`}>
        <div className="flex items-center gap-4 mb-3">
          <div className={`p-3 rounded-full bg-amber-100 text-amber-600`}>
            <LightbulbIcon className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-medium">{tipOfDay.split(':')[0]}</h3>
        </div>
        <p className="text-muted-foreground pl-[52px]">{tipOfDay.split(':').slice(1).join(':').trim()}</p>
      </div>
    );
  }

  const cardClasses = `flex items-center gap-4 p-6 rounded-xl border border-border bg-card ${className} ${onClick ? 'cursor-pointer hover:bg-muted/30 transition-colors' : ''}`;

  return (
    <div className={cardClasses} onClick={onClick}>
      <div className={`p-3 rounded-full ${color}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        <p className="text-2xl font-bold mt-1">{value}</p>
      </div>
    </div>
  );
};
