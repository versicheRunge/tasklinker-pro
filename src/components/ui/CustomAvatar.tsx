
import React from 'react';
import { Avatar, AvatarImage, AvatarFallback } from './avatar';

interface CustomAvatarProps {
  name: string;
  imageSrc?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const CustomAvatar: React.FC<CustomAvatarProps> = ({ 
  name, 
  imageSrc, 
  size = 'md' 
}) => {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getSizeClass = (size: string) => {
    switch (size) {
      case 'sm':
        return 'w-8 h-8 text-xs';
      case 'lg':
        return 'w-16 h-16 text-base';
      case 'md':
      default:
        return 'w-10 h-10 text-sm';
    }
  };

  const sizeClass = getSizeClass(size);

  return (
    <Avatar className={sizeClass}>
      {imageSrc ? (
        <AvatarImage src={imageSrc} alt={name} />
      ) : (
        <AvatarFallback>{getInitials(name)}</AvatarFallback>
      )}
    </Avatar>
  );
};
