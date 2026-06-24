
import React, { useState, useEffect } from 'react';
import { DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../components/ui/dialog";
import { User } from '../../types/case';
import { getVacationAllowance, saveVacationAllowance } from '../../utils/calendarUtils';

interface VacationAllowanceDialogProps {
  user: User;
  onClose: () => void;
  onSave: () => void;
}

export const VacationAllowanceDialog: React.FC<VacationAllowanceDialogProps> = ({ user, onClose, onSave }) => {
  const currentYear = new Date().getFullYear();
  const [vacationDays, setVacationDays] = useState<number>(0);

  useEffect(() => {
    if (user) {
      getVacationAllowance(user.id, currentYear).then(setVacationDays);
    }
  }, [user]);

  const handleSave = async () => {
    if (user) {
      await saveVacationAllowance(user.id, currentYear, vacationDays);
      onSave();
    }
  };

  return (
    <DialogContent className="sm:max-w-[500px]">
      <DialogHeader>
        <DialogTitle>Urlaubsanspruch für {user.name}</DialogTitle>
      </DialogHeader>
      <div className="space-y-4 py-4">
        <div>
          <label className="block text-sm font-medium mb-1">Jahr</label>
          <input type="number" className="w-full p-2 rounded-md border border-input" value={currentYear} disabled />
          <p className="text-xs text-muted-foreground mt-1">Der Urlaubsanspruch wird für das aktuelle Jahr festgelegt.</p>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Urlaubstage pro Jahr*</label>
          <input type="number" min="0" max="365" className="w-full p-2 rounded-md border border-input" value={vacationDays} onChange={e => setVacationDays(Math.max(0, parseInt(e.target.value) || 0))} />
          <p className="text-xs text-muted-foreground mt-1">Gesamtzahl der Urlaubstage für dieses Jahr.</p>
        </div>
      </div>
      <DialogFooter>
        <button className="px-4 py-2 rounded-lg border border-input hover:bg-muted transition-colors" onClick={onClose}>Abbrechen</button>
        <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors" onClick={handleSave}>Speichern</button>
      </DialogFooter>
    </DialogContent>
  );
};
