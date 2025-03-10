
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../ui/dialog";
import BadgeForm from './BadgeForm';
import { UserBadge } from '../../../contexts/UserTypes';
import { Button } from '../../ui/button';

interface BadgeDialogsProps {
  isEditDialogOpen: boolean;
  setIsEditDialogOpen: (open: boolean) => void;
  isCreateDialogOpen: boolean;
  setIsCreateDialogOpen: (open: boolean) => void;
  currentBadge: UserBadge | null;
  setCurrentBadge: (badge: UserBadge | null) => void;
  newBadge: UserBadge;
  setNewBadge: (badge: UserBadge) => void;
  badgeCategories: { id: string; name: string }[];
  onSaveEdit: () => void;
  onCreateBadge: () => void;
}

const BadgeDialogs: React.FC<BadgeDialogsProps> = ({
  isEditDialogOpen,
  setIsEditDialogOpen,
  isCreateDialogOpen,
  setIsCreateDialogOpen,
  currentBadge,
  setCurrentBadge,
  newBadge,
  setNewBadge,
  badgeCategories,
  onSaveEdit,
  onCreateBadge
}) => {
  return (
    <>
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Auszeichnung bearbeiten</DialogTitle>
          </DialogHeader>
          {currentBadge && (
            <BadgeForm
              badge={currentBadge}
              onChange={setCurrentBadge}
              badgeCategories={badgeCategories}
            />
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Abbrechen
            </Button>
            <Button onClick={onSaveEdit}>
              Speichern
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Neue Auszeichnung erstellen</DialogTitle>
          </DialogHeader>
          <BadgeForm
            badge={newBadge}
            onChange={setNewBadge}
            badgeCategories={badgeCategories}
          />
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateDialogOpen(false)}
            >
              Abbrechen
            </Button>
            <Button onClick={onCreateBadge}>
              Erstellen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default BadgeDialogs;
