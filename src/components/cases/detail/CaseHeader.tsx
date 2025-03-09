
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, UserPlus, Clock, Flag } from 'lucide-react';
import { CaseItem, User } from '../../../types/case';
import { CustomAvatar } from '../../ui/CustomAvatar';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { UserAssignmentDialog } from './UserAssignmentDialog';
import { PrioritySelector } from './PrioritySelector';
import { StatusChanger } from './StatusChanger';

interface CaseHeaderProps {
  caseItem: CaseItem;
  users: User[];
  onStatusChange: (newStatus: CaseStatus) => void;
  onPriorityChange: (newPriority: CasePriority) => void;
  onAssignUser: (userId: string) => void;
  isAdmin: boolean;
  currentUser?: User;
}

export const CaseHeader: React.FC<CaseHeaderProps> = ({
  caseItem,
  users,
  onStatusChange,
  onPriorityChange,
  onAssignUser,
  isAdmin,
  currentUser
}) => {
  const [isAssigningUser, setIsAssigningUser] = useState(false);

  const typeLabel = {
    damage: 'Schadensmeldung',
    evb: 'eVB-Anfrage',
    contract_change: 'Vertragsänderung',
    inquiry: 'Kundenanfrage',
    other: 'Sonstiges'
  };

  const statusColors = {
    new: 'bg-blue-100 text-blue-700 border-blue-200',
    in_progress: 'bg-amber-100 text-amber-700 border-amber-200',
    waiting: 'bg-purple-100 text-purple-700 border-purple-200',
    completed: 'bg-green-100 text-green-700 border-green-200'
  };

  const statusLabel = {
    new: 'Neu',
    in_progress: 'In Bearbeitung',
    waiting: 'Wartet auf Rückmeldung',
    completed: 'Erledigt'
  };

  return (
    <div className="mb-6">
      <div className="flex items-center gap-3 mb-4">
        <Link to="/cases" className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <h1 className="text-xl font-semibold">{caseItem.title}</h1>
      </div>
      
      <div className="flex flex-wrap gap-3 justify-between items-start mb-6">
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge 
              className={statusColors[caseItem.status]}
            >
              {statusLabel[caseItem.status]}
            </Badge>
            
            <Badge variant="outline">
              {typeLabel[caseItem.type as keyof typeof typeLabel] || caseItem.type}
            </Badge>
            
            {caseItem.priority && (
              <Badge 
                variant={`priority-${caseItem.priority}` as any}
                className="flex items-center gap-1"
              >
                <Flag className="w-3 h-3" />
                {caseItem.priority === 'low' ? 'Niedrig' : 
                 caseItem.priority === 'medium' ? 'Mittel' : 
                 caseItem.priority === 'high' ? 'Hoch' : 'Dringend'}
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm">
                Erstellt am {new Date(caseItem.createdAt).toLocaleDateString('de-DE')}
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="relative">
                <CustomAvatar name={caseItem.assignee.name} imageSrc={caseItem.assignee.avatar} size="sm" />
              </div>
              <span className="text-sm">
                Zugewiesen an {caseItem.assignee.name}
              </span>
              {(isAdmin || currentUser?.id === caseItem.assignee.id) && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 px-2"
                  onClick={() => setIsAssigningUser(true)}
                >
                  <UserPlus className="w-3.5 h-3.5" />
                </Button>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <PrioritySelector
            currentPriority={caseItem.priority}
            onPriorityChange={onPriorityChange}
          />
        </div>
      </div>
      
      <StatusChanger 
        currentStatus={caseItem.status} 
        onStatusChange={onStatusChange} 
      />
      
      <UserAssignmentDialog
        isOpen={isAssigningUser}
        onOpenChange={setIsAssigningUser}
        users={users}
        currentAssignee={caseItem.assignee}
        onAssign={onAssignUser}
      />
    </div>
  );
};
