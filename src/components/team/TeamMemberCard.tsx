
import React from 'react';
import { MoreHorizontal, Edit, Trash2, Camera, Award, CalendarClock } from 'lucide-react';
import { USER_COLORS } from '../../contexts/UserTypes';
import { User } from '../../types/case';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "../ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";

interface TeamMemberCardProps {
  user: User;
  currentUserId?: string;
  isAdmin: boolean;
  onEdit: (user: User) => void;
  onDelete: (id: string) => void;
  onAvatarChange: (user: User) => void;
  onManageBadges: (user: User) => void;
  onManageVacation?: (user: User) => void;
  userStats?: { absence: number; sick: number };
}

export const TeamMemberCard: React.FC<TeamMemberCardProps> = ({
  user,
  currentUserId,
  isAdmin,
  onEdit,
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
            <p className="text-muted-foreground">{user.role}</p>
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
                {isAdmin && (
                  <DropdownMenuItem onClick={() => onManageBadges(user)}>
                    <Award className="w-4 h-4 mr-2" />
                    <span>Auszeichnungen verwalten</span>
                  </DropdownMenuItem>
                )}
                {onManageVacation && isAdmin && (
                  <DropdownMenuItem onClick={() => onManageVacation(user)}>
                    <CalendarClock className="w-4 h-4 mr-2" />
                    <span>Urlaubsanspruch</span>
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
              <span className="truncate">{user.email}</span>
            </div>
          )}
          
          {user.department && (
            <div className="flex items-center text-sm">
              <span className="w-20 text-muted-foreground">Abteilung:</span>
              <span>{user.department}</span>
            </div>
          )}
          
          {user.phone && (
            <div className="flex items-center text-sm">
              <span className="w-20 text-muted-foreground">Telefon:</span>
              <span>{user.phone}</span>
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
              <div className="flex flex-wrap gap-1 mt-1">
                {user.badges.map((badge, index) => (
                  <span key={index} title={badge.name} className="inline-block">
                    {badge.icon}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
