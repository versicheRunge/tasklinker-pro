
import React from 'react';
import { cn } from "@/lib/utils";
import { Badge } from './badge';
import * as LucideIcons from 'lucide-react';
import { LucideIcon, Award } from 'lucide-react';

interface CustomBadgeProps {
  icon: string;
  label: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'secondary' | 'outline' | 'destructive' | 'warning' | 'success' | 
            'priority-high' | 'priority-medium' | 'priority-low' | 'priority-none' |
            'achievement' | 'skill' | 'tenure' | 'certification' | 'special';
  onClick?: () => void;
  selected?: boolean;
  className?: string;
}

export const CustomBadge: React.FC<CustomBadgeProps> = ({
  icon,
  label,
  size = 'md',
  variant = 'default',
  onClick,
  selected = false,
  className
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
  
  // Category to variant mapping for badge styling
  const categoryVariantMap = {
    achievement: 'default',
    skill: 'secondary',
    tenure: 'success',
    certification: 'priority-medium',
    special: 'priority-high'
  };
  
  // If variant is a category name, map it to a proper visual variant
  const visualVariant = Object.keys(categoryVariantMap).includes(variant) 
    ? categoryVariantMap[variant as keyof typeof categoryVariantMap] 
    : variant;

  // Check if icon is a Lucide icon name (either directly or with 'lucide:' prefix)
  const iconName = icon.startsWith('lucide:') ? icon.substring(7) : icon;
  const hasLucideIcon = iconName in LucideIcons;
  
  // Render the badge content
  const renderIconContent = () => {
    if (hasLucideIcon) {
      // Get the icon component safely
      const IconComponent = LucideIcons[iconName as keyof typeof LucideIcons] as LucideIcon;
      return <IconComponent className="h-4 w-4" />;
    }
    
    // Fallback to text/emoji if not a Lucide icon
    return icon;
  };

  return (
    <Badge 
      variant={visualVariant as any}
      className={cn(
        "flex items-center cursor-default font-normal", 
        sizeClasses[size],
        onClick && "cursor-pointer hover:opacity-80",
        selected && "ring-2 ring-primary ring-offset-1",
        className
      )}
      onClick={onClick}
    >
      <span className={cn("inline-block", iconSizeClasses[size])}>
        {renderIconContent()}
      </span>
      <span>{label}</span>
    </Badge>
  );
};
