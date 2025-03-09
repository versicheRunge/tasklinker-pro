
import React from 'react';
import { UserPlus } from 'lucide-react';
import { User } from '../../../types/case';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../ui/dialog";
import { Button } from "../../ui/button";
import { CustomAvatar } from "../../ui/CustomAvatar";

interface UserAssignmentDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  users: User[];
  currentAssignee: User;
  onAssign: (userId: string) => void;
}

export const UserAssignmentDialog: React.FC<UserAssignmentDialogProps> = ({
  isOpen,
  onOpenChange,
  users,
  currentAssignee,
  onAssign
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Vorgang zuweisen</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-4">
          {users.map(user => (
            <Button
              key={user.id}
              variant="outline"
              className={`w-full justify-start gap-2 py-6 ${
                user.id === currentAssignee.id ? 'border-primary bg-primary/10' : ''
              }`}
              onClick={() => onAssign(user.id)}
            >
              <CustomAvatar 
                name={user.name} 
                imageSrc={user.avatar} 
                size="sm"
              />
              <div className="flex flex-col items-start">
                <span className="font-medium">{user.name}</span>
                <span className="text-xs text-muted-foreground">{user.role}</span>
              </div>
              {user.id === currentAssignee.id && (
                <div className="ml-auto w-2 h-2 rounded-full bg-primary" />
              )}
            </Button>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Abbrechen</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
