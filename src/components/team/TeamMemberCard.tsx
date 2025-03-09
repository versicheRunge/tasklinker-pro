
import React from 'react';
import { Mail, Phone, Award, Edit2, Trash2, Image as ImageIcon, ExternalLink } from 'lucide-react';
import { User } from '../../types/case';
import { CustomBadge } from '../ui/CustomBadge';

interface TeamMemberCardProps {
  user: User;
  currentUserId?: string;
  isAdmin: boolean;
  onEdit: (user: User) => void;
  onDelete: (id: string) => void;
  onAvatarChange: (user: User) => void;
  onManageBadges: (user: User) => void;
  userStats: {
    absence: number;
    sick: number;
  };
}

export const TeamMemberCard: React.FC<TeamMemberCardProps> = ({
  user,
  currentUserId,
  isAdmin,
  onEdit,
  onDelete,
  onAvatarChange,
  onManageBadges,
  userStats
}) => {
  // Handle opening email client
  const handleEmailClick = (email: string) => {
    window.location.href = `mailto:${email}`;
  };

  // Handle opening WhatsApp
  const handleWhatsAppClick = (phone: string) => {
    // Clean phone number - remove spaces, dashes, etc.
    const cleanPhone = phone.replace(/\s+/g, '').replace(/-/g, '').replace(/\(/g, '').replace(/\)/g, '');
    window.open(`https://wa.me/${cleanPhone}`, '_blank');
  };

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <div className="flex items-center gap-4 mb-4">
        <div className="relative group">
          <img 
            src={user.avatar || 'https://randomuser.me/api/portraits/lego/1.jpg'} 
            alt={user.name} 
            className="w-20 h-20 rounded-full object-cover"
          />
          {isAdmin && (
            <button 
              onClick={() => onAvatarChange(user)}
              className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <ImageIcon className="w-6 h-6 text-white" />
            </button>
          )}
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold">{user.name}</h3>
          <p className="text-muted-foreground">{user.role}</p>
        </div>
        {isAdmin && (
          <div className="flex gap-2">
            <button 
              className="p-2 text-muted-foreground hover:text-foreground rounded-md hover:bg-muted transition-colors"
              onClick={() => onEdit(user)}
            >
              <Edit2 className="w-4 h-4" />
            </button>
            {user.id !== currentUserId && (
              <button 
                className="p-2 text-red-400 hover:text-red-500 rounded-md hover:bg-red-50 transition-colors"
                onClick={() => onDelete(user.id)}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm">
          <Mail className="w-4 h-4 text-muted-foreground" />
          <button 
            className="flex items-center gap-1 text-blue-500 hover:text-blue-700 hover:underline"
            onClick={() => handleEmailClick(user.email || '')}
          >
            <span>{user.email}</span>
            <ExternalLink className="w-3 h-3" />
          </button>
        </div>
        {user.phone && (
          <div className="flex items-center gap-2 text-sm">
            <Phone className="w-4 h-4 text-muted-foreground" />
            <button 
              className="flex items-center gap-1 text-green-500 hover:text-green-700 hover:underline"
              onClick={() => handleWhatsAppClick(user.phone || '')}
            >
              <span>{user.phone}</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        )}
        {user.department && (
          <div className="flex items-center gap-2 text-sm">
            <Award className="w-4 h-4 text-muted-foreground" />
            <span>{user.department}</span>
          </div>
        )}
      </div>
      
      {/* Badges section */}
      {user.badges && user.badges.length > 0 && (
        <div className="mt-3 pt-3 border-t border-border">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium">Auszeichnungen</h4>
            {isAdmin && (
              <button 
                className="text-xs text-blue-500 hover:text-blue-700"
                onClick={() => onManageBadges(user)}
              >
                Bearbeiten
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-1">
            {user.badges.map((badge) => (
              <CustomBadge 
                key={badge.id}
                icon={badge.icon}
                label={badge.name}
                size="sm"
              />
            ))}
          </div>
        </div>
      )}
      
      {/* Stats section */}
      <div className="mt-4 pt-4 border-t border-border">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-xl font-bold">{user.stats?.casesHandled || 0}</p>
            <p className="text-xs text-muted-foreground">Vorgänge</p>
          </div>
          <div>
            <p className="text-xl font-bold">{user.stats?.inProgress || 0}</p>
            <p className="text-xs text-muted-foreground">In Bearbeitung</p>
          </div>
          <div>
            <p className="text-xl font-bold">{user.stats?.completed || 0}</p>
            <p className="text-xs text-muted-foreground">Erledigt</p>
          </div>
        </div>
      </div>
      
      {isAdmin && !user.badges?.length && (
        <div className="mt-3 pt-3 border-t border-border">
          <button 
            className="w-full text-sm text-center text-blue-500 hover:text-blue-700"
            onClick={() => onManageBadges(user)}
          >
            Auszeichnungen hinzufügen
          </button>
        </div>
      )}
    </div>
  );
};
