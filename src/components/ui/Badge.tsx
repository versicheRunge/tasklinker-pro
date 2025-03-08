
import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'outline' | 'secondary';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ 
  children, 
  variant = 'default', 
  className = '' 
}) => {
  const baseStyle = 'inline-flex items-center rounded-full';
  
  const variantStyles = {
    default: 'bg-primary text-primary-foreground px-2.5 py-0.5 text-xs font-semibold',
    outline: 'border bg-transparent px-2.5 py-0.5 text-xs font-semibold',
    secondary: 'bg-secondary text-secondary-foreground px-2.5 py-0.5 text-xs font-semibold'
  };
  
  return (
    <span className={`${baseStyle} ${variantStyles[variant]} ${className}`}>
      {children}
    </span>
  );
};
