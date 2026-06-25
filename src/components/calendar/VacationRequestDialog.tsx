import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from '../../hooks/use-toast';

interface VacationRequestDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  defaultType?: 'vacation' | 'sick';
  onSuccess?: () => void;
}

export const VacationRequestDialog: React.FC<VacationRequestDialogProps> = ({
  isOpen, onOpenChange, defaultType = 'vacation', onSuccess,
}) => {
  const { profile } = useAuth();
  const today = new Date().toISOString().split('T')[0];
  const [type, setType] = useState<'vacation' | 'sick'>(defaultType);
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const calcWorkingDays = (from: string, to: string) => {
    let count = 0;
    const cur = new Date(from);
    const end = new Date(to);
    while (cur <= end) {
      const day = cur.getDay();
      if (day !== 0 && day !== 6) count++;
      cur.setDate(cur.getDate() + 1);
    }
    return Math.max(1, count);
  };

  const handleSubmit = async () => {
    if (!profile) return;
    setLoading(true);
    const workingDays = calcWorkingDays(startDate, endDate);
    const { error } = await supabase.from('vacation_requests').insert({
      user_id: profile.id,
      type,
      start_date: startDate,
      end_date: endDate,
      working_days: workingDays,
      note: note.trim() || null,
      status: 'pending',
    });

    if (error) {
      toast({ title: 'Fehler', description: error.message, variant: 'destructive' });
    } else {
      toast({
        title: type === 'vacation' ? 'Urlaubsantrag eingereicht' : 'Krankmeldung eingereicht',
        description: `${workingDays} Arbeitstag${workingDays > 1 ? 'e' : ''} — wartet auf Genehmigung.`,
      });
      onOpenChange(false);
      setNote('');
      onSuccess?.();
    }
    setLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>{type === 'vacation' ? 'Urlaub beantragen' : 'Krank melden'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex gap-2">
            <button
              onClick={() => setType('vacation')}
              className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-colors ${type === 'vacation' ? 'bg-primary text-primary-foreground border-primary' : 'hover:bg-muted'}`}
            >
              Urlaub
            </button>
            <button
              onClick={() => setType('sick')}
              className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-colors ${type === 'sick' ? 'bg-primary text-primary-foreground border-primary' : 'hover:bg-muted'}`}
            >
              Krankheit
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Von</Label>
              <input
                type="date"
                className="w-full mt-1 p-2 rounded-md border border-input bg-background text-sm"
                value={startDate}
                min={type === 'vacation' ? today : undefined}
                onChange={e => { setStartDate(e.target.value); if (e.target.value > endDate) setEndDate(e.target.value); }}
              />
            </div>
            <div>
              <Label>Bis</Label>
              <input
                type="date"
                className="w-full mt-1 p-2 rounded-md border border-input bg-background text-sm"
                value={endDate}
                min={startDate}
                onChange={e => setEndDate(e.target.value)}
              />
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            {calcWorkingDays(startDate, endDate)} Arbeitstag{calcWorkingDays(startDate, endDate) > 1 ? 'e' : ''}
          </div>
          <div>
            <Label>Notiz (optional)</Label>
            <textarea
              className="w-full mt-1 p-2 rounded-md border border-input bg-background text-sm"
              rows={2}
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="z.B. Familienurlaub, Arzttermin, ..."
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Abbrechen</Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? 'Wird eingereicht…' : 'Antrag einreichen'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
