
import React from 'react';

interface AvatarProps {
  name: string;
  imageSrc?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const Avatar: React.FC<AvatarProps> = ({ 
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
        return 'w-12 h-12 text-base';
      case 'md':
      default:
        return 'w-10 h-10 text-sm';
    }
  };

  const getRandomColor = (name: string) => {
    const colors = [
      'bg-blue-100 text-blue-600',
      'bg-green-100 text-green-600',
      'bg-purple-100 text-purple-600',
      'bg-amber-100 text-amber-600',
      'bg-red-100 text-red-600',
      'bg-indigo-100 text-indigo-600',
      'bg-pink-100 text-pink-600',
      'bg-teal-100 text-teal-600',
    ];
    
    // Generate a deterministic index based on the name
    const charCodes = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[charCodes % colors.length];
  };

  const sizeClass = getSizeClass(size);
  const avatarColor = getRandomColor(name);

  return (
    <div className={`${sizeClass} rounded-full flex items-center justify-center font-medium ${!imageSrc ? avatarColor : ''} overflow-hidden border border-border`}>
      {imageSrc ? (
        <img 
          src={imageSrc} 
          alt={name} 
          className="w-full h-full object-cover"
        />
      ) : (
        getInitials(name)
      )}
    </div>
  );
};
