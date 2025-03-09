
import React, { useState } from 'react';
import { Flag } from 'lucide-react';
import { CasePriority } from '../../../types/case';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../ui/dialog";
import { Button } from "../../ui/button";

interface PrioritySelectorProps {
  currentPriority?: CasePriority;
  onPriorityChange: (newPriority: CasePriority) => void;
}

export const PrioritySelector: React.FC<PrioritySelectorProps> = ({ 
  currentPriority, 
  onPriorityChange 
}) => {
  const [isChangingPriority, setIsChangingPriority] = useState(false);

  const priorityLabel = {
    low: 'Niedrig',
    medium: 'Mittel',
    high: 'Hoch',
    urgent: 'Dringend'
  };

  const priorityColors = {
    low: 'bg-green-100 text-green-700 border-green-200',
    medium: 'bg-blue-100 text-blue-700 border-blue-200',
    high: 'bg-amber-100 text-amber-700 border-amber-200',
    urgent: 'bg-red-100 text-red-700 border-red-200'
  };

  const priorityIcons = {
    low: <Flag className="w-4 h-4 text-green-500" />,
    medium: <Flag className="w-4 h-4 text-blue-500" />,
    high: <Flag className="w-4 h-4 text-amber-500" />,
    urgent: <Flag className="w-4 h-4 text-red-500" />
  };

  const handlePrioritySelection = (newPriority: CasePriority) => {
    onPriorityChange(newPriority);
    setIsChangingPriority(false);
  };

  const getPriorityDisplay = () => {
    if (!currentPriority) {
      return (
        <Button 
          variant="outline" 
          size="sm" 
          className="text-muted-foreground"
          onClick={() => setIsChangingPriority(true)}
        >
          <Flag className="w-4 h-4 mr-2" />
          Priorität festlegen
        </Button>
      );
    }

    return (
      <Button
        variant="outline"
        size="sm"
        className={`flex items-center gap-1.5 ${priorityColors[currentPriority]}`}
        onClick={() => setIsChangingPriority(true)}
      >
        {priorityIcons[currentPriority]}
        {priorityLabel[currentPriority]}
      </Button>
    );
  };

  return (
    <>
      {getPriorityDisplay()}
      
      <Dialog open={isChangingPriority} onOpenChange={setIsChangingPriority}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Priorität wählen</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-3 py-4">
            <Button
              variant="outline"
              className="justify-start gap-2 py-6"
              onClick={() => handlePrioritySelection('low')}
            >
              {priorityIcons.low}
              <div className="flex flex-col items-start">
                <span className="font-medium">{priorityLabel.low}</span>
                <span className="text-xs text-muted-foreground">Routine-Aufgabe ohne Zeitdruck</span>
              </div>
            </Button>
            
            <Button
              variant="outline"
              className="justify-start gap-2 py-6"
              onClick={() => handlePrioritySelection('medium')}
            >
              {priorityIcons.medium}
              <div className="flex flex-col items-start">
                <span className="font-medium">{priorityLabel.medium}</span>
                <span className="text-xs text-muted-foreground">Wichtig, aber nicht dringend</span>
              </div>
            </Button>
            
            <Button
              variant="outline"
              className="justify-start gap-2 py-6"
              onClick={() => handlePrioritySelection('high')}
            >
              {priorityIcons.high}
              <div className="flex flex-col items-start">
                <span className="font-medium">{priorityLabel.high}</span>
                <span className="text-xs text-muted-foreground">Hohe Priorität, zeitnah erledigen</span>
              </div>
            </Button>
            
            <Button
              variant="outline"
              className="justify-start gap-2 py-6"
              onClick={() => handlePrioritySelection('urgent')}
            >
              {priorityIcons.urgent}
              <div className="flex flex-col items-start">
                <span className="font-medium">{priorityLabel.urgent}</span>
                <span className="text-xs text-muted-foreground">Höchste Priorität, sofort erledigen</span>
              </div>
            </Button>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsChangingPriority(false)}>Abbrechen</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
