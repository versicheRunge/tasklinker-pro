
import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from './avatar';

interface CustomAvatarProps {
  name: string;
  imageSrc?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const CustomAvatar: React.FC<CustomAvatarProps> = ({ name, imageSrc, size = 'md' }) => {
  // Helper function to get initials from name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Map size to CSS classes
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-16 w-16 border-4 border-background',
  };

  return (
    <Avatar className={sizeClasses[size]}>
      {imageSrc ? (
        <AvatarImage src={imageSrc} alt={name} />
      ) : (
        <AvatarFallback>{getInitials(name)}</AvatarFallback>
      )}
    </Avatar>
  );
};
