
import React from 'react';
import { MoreHorizontal, Edit, Trash2, Camera, Award, CalendarClock, KeyRound } from 'lucide-react';
import { USER_COLORS } from '../../contexts/UserTypes';
import { User } from '../../types/case';
import { CustomBadge } from '../ui/CustomBadge';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "../ui/dropdown-menu";

interface TeamMemberCardProps {
  user: User;
  currentUserId?: string;
  isAdmin: boolean;
  onEdit: (user: User) => void;
  onDelete: (id: string) => void;
  onAvatarChange: (user: User) => void;
  onManageBadges: (user: User) => void;
  onManageVacation?: (user: User) => void;
  onResetPassword?: (user: User) => void;
  userStats?: { absence: number; sick: number };
}

export const TeamMemberCard: React.FC<TeamMemberCardProps> = ({
  user,
  currentUserId,
  isAdmin,
  onEdit,
  onResetPassword,
  onDelete,
  onAvatarChange,
  onManageBadges,
  onManageVacation,
  userStats
}) => {
  const isCurrentUser = user.id === currentUserId;
  
  // Assign a consistent color based on user ID
  const getUserColor = () => {
    const userIndex = parseInt(user.id.replace(/\D/g, '')) % USER_COLORS.length;
    return USER_COLORS[userIndex];
  };
  
  const color = getUserColor();

  const handleEmailClick = (email: string, e: React.MouseEvent) => {
    e.stopPropagation();
    window.location.href = `mailto:${email}`;
  };

  const handlePhoneClick = (phone: string, e: React.MouseEvent) => {
    e.stopPropagation();
    // Format phone number for WhatsApp by removing spaces, dashes, etc.
    const formattedPhone = phone.replace(/\s+/g, '').replace(/-/g, '').replace(/\(/g, '').replace(/\)/g, '');
    window.open(`https://wa.me/${formattedPhone}`, '_blank');
  };
  
  return (
    <div className="bg-card rounded-xl overflow-hidden border border-border">
      <div className={`h-20 ${color.bg || color.primary}`} />
      <div className="p-5 pb-6 relative">
        <div className="absolute -top-12 left-5">
          <div 
            className="relative group w-20 h-20 rounded-full border-4 border-background overflow-hidden bg-background"
            onClick={() => isAdmin && onAvatarChange(user)}
          >
            <img 
              src={user.avatar || 'https://randomuser.me/api/portraits/lego/1.jpg'} 
              alt={user.name} 
              className="w-full h-full object-cover"
            />
            {isAdmin && (
              <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <Camera className="text-white w-6 h-6" />
              </div>
            )}
          </div>
        </div>
        
        <div className="ml-24 flex justify-between items-start">
          <div>
            <h3 className="font-bold text-lg">{user.name}</h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                user.department === 'aussendienst' ? 'bg-blue-100 text-blue-700' :
                user.department === 'leitung' ? 'bg-purple-100 text-purple-700' :
                'bg-green-100 text-green-700'
              }`}>
                {user.department === 'aussendienst' ? 'Außendienst' :
                 user.department === 'leitung' ? 'Agenturleitung' : 'Innendienst'}
              </span>
              {user.userRole === 'admin' && (
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">Admin</span>
              )}
            </div>
          </div>
          
          {isAdmin && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-1.5 rounded-md hover:bg-muted transition-colors">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(user)}>
                  <Edit className="w-4 h-4 mr-2" />
                  <span>Bearbeiten</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onAvatarChange(user)}>
                  <Camera className="w-4 h-4 mr-2" />
                  <span>Avatar ändern</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onManageBadges(user)}>
                  <Award className="w-4 h-4 mr-2" />
                  <span>Auszeichnungen verwalten</span>
                </DropdownMenuItem>
                {onManageVacation && (
                  <DropdownMenuItem onClick={() => onManageVacation(user)}>
                    <CalendarClock className="w-4 h-4 mr-2" />
                    <span>Urlaubsanspruch</span>
                  </DropdownMenuItem>
                )}
                {onResetPassword && !isCurrentUser && (
                  <DropdownMenuItem onClick={() => onResetPassword(user)}>
                    <KeyRound className="w-4 h-4 mr-2" />
                    <span>Passwort zurücksetzen</span>
                  </DropdownMenuItem>
                )}
                {!isCurrentUser && (
                  <DropdownMenuItem 
                    className="text-destructive" 
                    onClick={() => onDelete(user.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    <span>Löschen</span>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        
        <div className="mt-5 space-y-2">
          {user.email && (
            <div className="flex items-center text-sm">
              <span className="w-20 text-muted-foreground">Email:</span>
              <a 
                href={`mailto:${user.email}`}
                className="truncate text-primary hover:underline"
                onClick={(e) => handleEmailClick(user.email || '', e)}
              >
                {user.email}
              </a>
            </div>
          )}
          
          
          {user.phone && (
            <div className="flex items-center text-sm">
              <span className="w-20 text-muted-foreground">Telefon:</span>
              <a 
                href={`#`}
                className="text-primary hover:underline"
                onClick={(e) => handlePhoneClick(user.phone || '', e)}
              >
                {user.phone}
              </a>
            </div>
          )}
          
          <div className="flex items-center text-sm">
            <span className="w-20 text-muted-foreground">Rolle:</span>
            <span>{user.userRole === 'admin' ? 'Administrator' : 'Mitarbeiter'}</span>
          </div>
          
          {userStats && (
            <div className="pt-2 mt-3 border-t border-border flex items-center gap-4">
              <div className="flex items-center gap-1">
                <span className="text-blue-500">🏖️</span>
                <span>{userStats.absence} Urlaubstage</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-pink-500">🤒</span>
                <span>{userStats.sick} Krankheitstage</span>
              </div>
            </div>
          )}
          
          {user.badges && user.badges.length > 0 && (
            <div className="pt-2 mt-3 border-t border-border">
              <div className="flex flex-wrap gap-2 mt-1">
                {user.badges.map((badge, index) => (
                  <CustomBadge 
                    key={index} 
                    icon={badge.icon} 
                    label={badge.name}
                    size="sm"
                    variant="outline"
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
