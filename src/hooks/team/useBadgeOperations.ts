
import { useState } from 'react';
import { User } from '../../types/case';
import { useUser } from '../../contexts/UserContext';
import { UserBadge } from '../../contexts/UserTypes';
import { toast } from "../use-toast";

export const useBadgeOperations = () => {
  const { updateUser } = useUser();
  const [isBadgeDialogOpen, setIsBadgeDialogOpen] = useState(false);
  const [userForBadges, setUserForBadges] = useState<User | null>(null);

  const handleOpenBadgeDialog = (user: User) => {
    setUserForBadges(user);
    setIsBadgeDialogOpen(true);
  };

  const handleToggleBadge = (badgeId: string) => {
    if (!userForBadges) return;
    
    const updatedBadges = userForBadges.badges || [];
    const badgeIndex = updatedBadges.findIndex(badge => badge.id === badgeId);
    
    if (badgeIndex >= 0) {
      updatedBadges.splice(badgeIndex, 1);
    } else {
      const selectedBadge = getAvailableBadges().find(badge => badge.id === badgeId);
      if (selectedBadge) {
        updatedBadges.push(selectedBadge);
      }
    }
    
    setUserForBadges({
      ...userForBadges,
      badges: updatedBadges
    });
  };

  const handleSaveBadges = () => {
    if (!userForBadges) return;
    
    updateUser(userForBadges.id, { badges: userForBadges.badges });
    setIsBadgeDialogOpen(false);
    
    toast({
      title: "Auszeichnungen aktualisiert",
      description: "Die Auszeichnungen wurden erfolgreich aktualisiert."
    });
  };

  const getAvailableBadges = (): UserBadge[] => {
    const storedBadges = localStorage.getItem('userBadges');
    if (storedBadges) {
      try {
        return JSON.parse(storedBadges);
      } catch (e) {
        console.error('Error parsing badges:', e);
      }
    }
    
    // Default badges if none are stored
    const defaultBadges: UserBadge[] = [
      { id: 'top-performer', name: 'Top Performer', icon: '🏆', category: 'achievement' },
      { id: 'team-player', name: 'Team Player', icon: '👥', category: 'achievement' },
      { id: 'expert', name: 'Experte', icon: '🧠', category: 'skill' },
      { id: 'mentor', name: 'Mentor', icon: '👨‍🏫', category: 'skill' },
      { id: 'veteran', name: '5 Jahre', icon: '⏱️', category: 'tenure' },
      { id: 'certified', name: 'Zertifiziert', icon: '📜', category: 'certification' },
      { id: 'innovator', name: 'Innovator', icon: '💡', category: 'special' }
    ];
    
    // Store the default badges
    localStorage.setItem('userBadges', JSON.stringify(defaultBadges));
    return defaultBadges;
  };

  const badgeCategories = [
    { id: 'achievement', name: 'Leistung' },
    { id: 'skill', name: 'Kompetenz' },
    { id: 'tenure', name: 'Zugehörigkeit' },
    { id: 'certification', name: 'Zertifizierung' },
    { id: 'special', name: 'Besondere Auszeichnung' }
  ];

  return {
    isBadgeDialogOpen,
    setIsBadgeDialogOpen,
    userForBadges,
    badgeCategories,
    availableBadges: getAvailableBadges(),
    handleOpenBadgeDialog,
    handleToggleBadge,
    handleSaveBadges
  };
};
