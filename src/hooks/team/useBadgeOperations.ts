
import { useState, useEffect } from 'react';
import { User } from '../../types/case';
import { useUser } from '../../contexts/UserContext';
import { UserBadge } from '../../contexts/UserTypes';
import { toast } from "../use-toast";
import { generateDefaultBadges } from '../../components/team/BadgeTemplatesManager';

export const useBadgeOperations = () => {
  const { updateUser } = useUser();
  const [isBadgeDialogOpen, setIsBadgeDialogOpen] = useState(false);
  const [userForBadges, setUserForBadges] = useState<User | null>(null);
  const [availableBadges, setAvailableBadges] = useState<UserBadge[]>([]);

  // Load available badges when component mounts
  useEffect(() => {
    console.log("Initializing badge operations...");
    loadAvailableBadges();
    
    // Listen for storage changes from other tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'userBadges') {
        console.log("userBadges changed in storage, reloading...");
        loadAvailableBadges();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const loadAvailableBadges = () => {
    const badges = getAvailableBadges();
    console.log(`Loaded ${badges.length} badges into badge operations`);
    setAvailableBadges(badges);
    
    // If no badges are available, initialize with default badges
    if (badges.length === 0) {
      console.log("No badges found, initializing defaults");
      const defaultBadges = generateDefaultBadges();
      localStorage.setItem('userBadges', JSON.stringify(defaultBadges));
      setAvailableBadges(defaultBadges);
    }
  };

  const handleOpenBadgeDialog = (user: User) => {
    setUserForBadges(user);
    setIsBadgeDialogOpen(true);
    // Reload badges in case they were updated
    loadAvailableBadges();
  };

  const handleToggleBadge = (badgeId: string) => {
    if (!userForBadges) return;
    
    const updatedBadges = userForBadges.badges || [];
    const badgeIndex = updatedBadges.findIndex(badge => badge.id === badgeId);
    
    if (badgeIndex >= 0) {
      updatedBadges.splice(badgeIndex, 1);
    } else {
      const selectedBadge = availableBadges.find(badge => badge.id === badgeId);
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
    try {
      const storedBadges = localStorage.getItem('userBadges');
      if (storedBadges) {
        const parsedBadges = JSON.parse(storedBadges);
        if (Array.isArray(parsedBadges) && parsedBadges.length > 0) {
          return parsedBadges;
        } else {
          console.warn("Retrieved badges are empty or not an array, using defaults");
          return generateDefaultBadges();
        }
      }
    } catch (e) {
      console.error('Error loading badges:', e);
    }
    // If we reach here, either there were no badges in localStorage or there was an error
    return generateDefaultBadges();
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
    availableBadges,
    handleOpenBadgeDialog,
    handleToggleBadge,
    handleSaveBadges
  };
};
