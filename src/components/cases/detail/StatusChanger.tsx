
import React, { useState } from 'react';
import { AlertCircle, Clock, Hourglass, CheckCircle2, ChevronDown } from 'lucide-react';
import { CaseStatus } from '../../../types/case';
import { toast } from "../../../hooks/use-toast";
import { Button } from "../../ui/button";

const WAITING_REASONS = [
  'Wartet auf Dokumente vom Kunden',
  'Wartet auf Rückruf des Kunden',
  'Wartet auf Antwort des Versicherers',
  'Wartet auf Gutachter',
  'Wartet auf Handwerker-Angebot',
  'Wartet auf Freigabe intern',
  'Wartet auf Unterschrift',
  'Sonstiges',
];

interface StatusChangerProps {
  currentStatus: CaseStatus;
  onStatusChange: (newStatus: CaseStatus, waitingReason?: string) => void;
}

export const StatusChanger: React.FC<StatusChangerProps> = ({ currentStatus, onStatusChange }) => {
  const [showReasonPicker, setShowReasonPicker] = useState(false);
  const [pendingReason, setPendingReason] = useState('');

  const statusIcons = {
    new:         <AlertCircle className="w-4 h-4 text-blue-500" />,
    in_progress: <Clock className="w-4 h-4 text-amber-500" />,
    waiting:     <Hourglass className="w-4 h-4 text-purple-500" />,
    completed:   <CheckCircle2 className="w-4 h-4 text-green-500" />,
  };

  const statusLabel = {
    new:         'Neu',
    in_progress: 'In Bearbeitung',
    waiting:     'Wartet auf Rückmeldung',
    completed:   'Erledigt',
  };

  const handleClick = (newStatus: CaseStatus) => {
    if (currentStatus === newStatus) return;
    if (newStatus === 'waiting') {
      setShowReasonPicker(true);
      return;
    }
    commit(newStatus);
  };

  const commit = (newStatus: CaseStatus, reason?: string) => {
    onStatusChange(newStatus, reason);
    setShowReasonPicker(false);
    setPendingReason('');
    toast({ title: 'Status aktualisiert', description: `Status auf „${statusLabel[newStatus]}" gesetzt.` });
    if (newStatus === 'completed') {
      toast({ title: 'Vorgang abgeschlossen', description: 'Vorgang wurde als erledigt markiert.' });
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {(['new', 'in_progress', 'waiting', 'completed'] as CaseStatus[]).map(s => (
          <Button
            key={s}
            variant={currentStatus === s ? 'default' : 'outline'}
            size="sm"
            className="flex items-center gap-1.5"
            onClick={() => handleClick(s)}
          >
            {statusIcons[s]} {statusLabel[s]}
            {s === 'waiting' && <ChevronDown className="w-3 h-3 opacity-60" />}
          </Button>
        ))}
      </div>

      {/* Inline Grund-Picker für "Wartet" */}
      {showReasonPicker && (
        <div className="border border-purple-200 bg-purple-50 rounded-lg p-3 space-y-2">
          <p className="text-xs font-semibold text-purple-700">Worauf wird gewartet?</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {WAITING_REASONS.map(r => (
              <button
                key={r}
                onClick={() => commit('waiting', r)}
                className={`text-left text-xs px-2.5 py-1.5 rounded-md border transition-colors ${pendingReason === r ? 'border-purple-500 bg-purple-100 font-medium' : 'border-purple-200 hover:bg-purple-100'}`}
              >
                {r}
              </button>
            ))}
          </div>
          <div className="flex gap-2 pt-1">
            <button onClick={() => commit('waiting')} className="text-xs text-purple-600 hover:underline">
              Ohne Grund speichern
            </button>
            <span className="text-muted-foreground">·</span>
            <button onClick={() => setShowReasonPicker(false)} className="text-xs text-muted-foreground hover:text-foreground">
              Abbrechen
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
