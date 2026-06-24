import React from 'react';
import { useUser } from '../contexts/UserContext';
import { useUserOperations } from './team/useUserOperations';
import { useAvatarOperations } from './team/useAvatarOperations';
import { useBadgeOperations } from './team/useBadgeOperations';
import { useVacationOperations } from './team/useVacationOperations';
import { useCalendarEvents } from './team/useCalendarEvents';

export const useTeamManager = () => {
  const { users } = useUser();
  const userOps = useUserOperations();
  const avatarOps = useAvatarOperations();
  const badgeOps = useBadgeOperations();
  const vacationOps = useVacationOperations();
  const { calendarEvents } = useCalendarEvents();


  return {
    users,
    currentUser: userOps.currentUser,
    isAdmin: userOps.isAdmin,
    calendarEvents,
    
    // User operations
    isDialogOpen: userOps.isDialogOpen,
    setIsDialogOpen: userOps.setIsDialogOpen,
    isEditingDialogOpen: userOps.isEditingDialogOpen,
    setIsEditingDialogOpen: userOps.setIsEditingDialogOpen,
    newUser: userOps.newUser,
    setNewUser: userOps.setNewUser,
    editingUser: userOps.editingUser,
    setEditingUser: userOps.setEditingUser,
    handleAddUser: userOps.handleAddUser,
    handleDeleteUser: userOps.handleDeleteUser,
    handleEditUser: userOps.handleEditUser,
    handleSaveUser: userOps.handleSaveUser,
    
    // Avatar operations
    avatarUrl: avatarOps.avatarUrl,
    setAvatarUrl: avatarOps.setAvatarUrl,
    isAvatarDialogOpen: avatarOps.isAvatarDialogOpen,
    setIsAvatarDialogOpen: avatarOps.setIsAvatarDialogOpen,
    userToChangeAvatar: avatarOps.userToChangeAvatar,
    handleOpenAvatarDialog: avatarOps.handleOpenAvatarDialog,
    handleSaveAvatar: avatarOps.handleSaveAvatar,
    generateRandomAvatar: avatarOps.generateRandomAvatar,
    
    // Badge operations
    isBadgeDialogOpen: badgeOps.isBadgeDialogOpen,
    setIsBadgeDialogOpen: badgeOps.setIsBadgeDialogOpen,
    userForBadges: badgeOps.userForBadges,
    badgeCategories: badgeOps.badgeCategories,
    availableBadges: badgeOps.availableBadges,
    handleOpenBadgeDialog: badgeOps.handleOpenBadgeDialog,
    handleToggleBadge: badgeOps.handleToggleBadge,
    handleSaveBadges: badgeOps.handleSaveBadges,
    
    // Vacation operations
    isVacationDialogOpen: vacationOps.isVacationDialogOpen,
    setIsVacationDialogOpen: vacationOps.setIsVacationDialogOpen,
    userForVacation: vacationOps.userForVacation,
    handleOpenVacationDialog: vacationOps.handleOpenVacationDialog,
    handleSaveVacation: vacationOps.handleSaveVacation
  };
};
