
import React, { useState } from 'react';
import { AlertCircle, Clock, Hourglass, CheckCircle2 } from 'lucide-react';
import { CaseStatus } from '../../../types/case';
import { toast } from "../../../hooks/use-toast";
import { Button } from "../../ui/button";

interface StatusChangerProps {
  currentStatus: CaseStatus;
  onStatusChange: (newStatus: CaseStatus) => void;
}

export const StatusChanger: React.FC<StatusChangerProps> = ({ 
  currentStatus, 
  onStatusChange 
}) => {
  const [savingStatus, setSavingStatus] = useState(false);

  const statusIcons = {
    new: <AlertCircle className="w-5 h-5 text-blue-500" />,
    in_progress: <Clock className="w-5 h-5 text-amber-500" />,
    waiting: <Hourglass className="w-5 h-5 text-purple-500" />,
    completed: <CheckCircle2 className="w-5 h-5 text-green-500" />
  };

  const statusLabel = {
    new: 'Neu',
    in_progress: 'In Bearbeitung',
    waiting: 'Wartet auf Rückmeldung',
    completed: 'Erledigt'
  };

  const handleStatusChange = (newStatus: CaseStatus) => {
    if (currentStatus === newStatus) return;
    
    setSavingStatus(true);
    onStatusChange(newStatus);
    
    setTimeout(() => {
      setSavingStatus(false);
      
      toast({
        title: "Status aktualisiert",
        description: `Der Status wurde auf "${statusLabel[newStatus]}" geändert.`
      });
      
      if (newStatus === 'completed') {
        toast({
          title: "Vorgang abgeschlossen",
          description: "Der Vorgang wurde als erledigt markiert und zu den abgeschlossenen Vorgängen verschoben."
        });
      }
    }, 500);
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant={currentStatus === 'new' ? 'default' : 'outline'}
        size="sm"
        className="flex items-center gap-1.5"
        onClick={() => handleStatusChange('new')}
        disabled={savingStatus}
      >
        {statusIcons.new} {statusLabel.new}
      </Button>
      <Button
        variant={currentStatus === 'in_progress' ? 'default' : 'outline'}
        size="sm"
        className="flex items-center gap-1.5"
        onClick={() => handleStatusChange('in_progress')}
        disabled={savingStatus}
      >
        {statusIcons.in_progress} {statusLabel.in_progress}
      </Button>
      <Button
        variant={currentStatus === 'waiting' ? 'default' : 'outline'}
        size="sm"
        className="flex items-center gap-1.5"
        onClick={() => handleStatusChange('waiting')}
        disabled={savingStatus}
      >
        {statusIcons.waiting} {statusLabel.waiting}
      </Button>
      <Button
        variant={currentStatus === 'completed' ? 'default' : 'outline'}
        size="sm"
        className="flex items-center gap-1.5"
        onClick={() => handleStatusChange('completed')}
        disabled={savingStatus}
      >
        {statusIcons.completed} {statusLabel.completed}
      </Button>
    </div>
  );
};
