import { useState } from 'react';
import { User } from '../../types/case';
import { useUser } from '../../contexts/UserContext';
import { UserBadge } from '../../contexts/UserTypes';
import { toast } from "../use-toast";
import { generateDefaultBadges } from '../../components/team/badge/defaultBadges';

const AVAILABLE_BADGES = generateDefaultBadges();

export const useBadgeOperations = () => {
  const { updateUser } = useUser();
  const [isBadgeDialogOpen, setIsBadgeDialogOpen] = useState(false);
  const [userForBadges, setUserForBadges] = useState<User | null>(null);

  const handleOpenBadgeDialog = (user: User) => {
    setUserForBadges({ ...user });
    setIsBadgeDialogOpen(true);
  };

  const handleToggleBadge = (badgeId: string) => {
    if (!userForBadges) return;
    const current = userForBadges.badges ?? [];
    const idx = current.findIndex(b => b.id === badgeId);
    let updated: UserBadge[];
    if (idx >= 0) {
      updated = current.filter(b => b.id !== badgeId);
    } else {
      const badge = AVAILABLE_BADGES.find(b => b.id === badgeId);
      updated = badge ? [...current, badge] : current;
    }
    setUserForBadges({ ...userForBadges, badges: updated });
  };

  const handleSaveBadges = () => {
    if (!userForBadges) return;
    updateUser(userForBadges.id, { badges: userForBadges.badges });
    setIsBadgeDialogOpen(false);
    toast({ title: 'Auszeichnungen aktualisiert' });
  };

  const badgeCategories = [
    { id: 'achievement', name: 'Leistung' },
    { id: 'skill', name: 'Kompetenz' },
    { id: 'tenure', name: 'Zugehörigkeit' },
    { id: 'certification', name: 'Zertifizierung' },
    { id: 'special', name: 'Besondere Auszeichnung' },
  ];

  return {
    isBadgeDialogOpen, setIsBadgeDialogOpen,
    userForBadges,
    badgeCategories,
    availableBadges: AVAILABLE_BADGES,
    handleOpenBadgeDialog, handleToggleBadge, handleSaveBadges,
  };
};
