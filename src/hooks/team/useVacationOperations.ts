
import { useState } from 'react';
import { User } from '../../types/case';
import { toast } from "../use-toast";

export const useVacationOperations = () => {
  const [isVacationDialogOpen, setIsVacationDialogOpen] = useState(false);
  const [userForVacation, setUserForVacation] = useState<User | null>(null);

  const handleOpenVacationDialog = (user: User) => {
    setUserForVacation(user);
    setIsVacationDialogOpen(true);
  };

  const handleSaveVacation = () => {
    setIsVacationDialogOpen(false);
    
    toast({
      title: "Urlaubsanspruch aktualisiert",
      description: "Der Urlaubsanspruch wurde erfolgreich aktualisiert."
    });
  };

  return {
    isVacationDialogOpen,
    setIsVacationDialogOpen,
    userForVacation,
    handleOpenVacationDialog,
    handleSaveVacation
  };
};
