
import React from 'react';
import { cn } from "@/lib/utils";
import { Badge } from './badge';

interface CustomBadgeProps {
  icon: string;
  label: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'secondary' | 'outline' | 'destructive' | 'warning' | 'success' | 
            'priority-high' | 'priority-medium' | 'priority-low' | 'priority-none';
  onClick?: () => void;
}

export const CustomBadge: React.FC<CustomBadgeProps> = ({
  icon,
  label,
  size = 'md',
  variant = 'default',
  onClick
}) => {
  // Size classes
  const sizeClasses = {
    sm: 'text-xs py-0.5 pl-1 pr-1.5',
    md: 'text-sm py-1 pl-1.5 pr-2',
    lg: 'text-base py-1.5 pl-2 pr-2.5'
  };

  // Icon size classes
  const iconSizeClasses = {
    sm: 'mr-0.5',
    md: 'mr-1',
    lg: 'mr-1.5'
  };

  return (
    <Badge 
      variant={variant}
      className={cn(
        "flex items-center cursor-default font-normal", 
        sizeClasses[size],
        onClick && "cursor-pointer hover:opacity-80"
      )}
      onClick={onClick}
    >
      <span className={cn("inline-block", iconSizeClasses[size])}>{icon}</span>
      <span>{label}</span>
    </Badge>
  );
};
