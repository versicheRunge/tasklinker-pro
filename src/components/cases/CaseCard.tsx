
import React from 'react';
import { Clock, User, CheckCircle2, AlertCircle, Hourglass, Flag } from 'lucide-react';
import { Badge } from '../ui/badge';
import { CustomAvatar } from '../ui/CustomAvatar';
import { Link } from 'react-router-dom';
import { CaseStatus, CaseType, CaseItem } from '../../types/case';

const statusIcons = {
  new: <AlertCircle className="w-4 h-4 text-blue-500" />,
  in_progress: <Clock className="w-4 h-4 text-amber-500" />,
  waiting: <Hourglass className="w-4 h-4 text-purple-500" />,
  completed: <CheckCircle2 className="w-4 h-4 text-green-500" />
};

const statusColors = {
  new: 'bg-blue-100 text-blue-700 border-blue-200',
  in_progress: 'bg-amber-100 text-amber-700 border-amber-200',
  waiting: 'bg-purple-100 text-purple-700 border-purple-200',
  completed: 'bg-green-100 text-green-700 border-green-200'
};

const priorityVariants: Record<string, string> = {
  high: "bg-red-100 text-red-800",
  urgent: "bg-red-100 text-red-800",
  medium: "bg-amber-100 text-amber-800",
  low: "bg-green-100 text-green-800",
  none: "bg-gray-100 text-gray-800"
};

interface CaseCardProps {
  caseItem: CaseItem;
}

export const CaseCard: React.FC<CaseCardProps> = ({ caseItem }) => {
  const statusLabel = {
    new: 'Neu',
    in_progress: 'In Bearbeitung',
    waiting: 'Wartet auf Rückmeldung',
    completed: 'Erledigt'
  };

  const typeLabel = {
    damage: 'Schadenmeldung',
    evb: 'eVB-Anfrage',
    contract_change: 'Vertragsänderung',
    inquiry: 'Kundenanfrage',
    other: 'Sonstiges'
  };

  // Determine priority from caseItem or randomly assign if missing
  const priority = caseItem.priority || 
    (['high', 'medium', 'low', 'none'] as const)[Math.floor(Math.random() * 4)];

  const priorityLabel = {
    high: 'Hoch',
    medium: 'Mittel',
    low: 'Niedrig',
    none: 'Keine',
    urgent: 'Dringend'
  };

  return (
    <Link to={`/vorgaenge/${caseItem.id}`}>
      <div className="bg-card border border-border rounded-xl p-5 hover:shadow-md transition-all duration-300 hover:-translate-y-1 cursor-pointer animate-scale-in">
        <div className="flex justify-between items-start mb-3">
          <span className="text-xs text-muted-foreground">Vorgang-{caseItem.id.slice(0, 8)}</span>
          <div className="flex gap-2">
            <Badge className={`flex items-center gap-1 px-2 py-1 text-xs font-medium ${priorityVariants[priority]}`}>
              <Flag className="w-3 h-3" />
              Prio {priorityLabel[priority]}
            </Badge>
            <Badge variant="outline" className={`flex items-center gap-1 px-2 py-1 text-xs font-medium ${statusColors[caseItem.status]}`}>
              {statusIcons[caseItem.status]}
              {statusLabel[caseItem.status]}
            </Badge>
          </div>
        </div>
        
        <h3 className="font-medium text-lg mb-1">{caseItem.title}</h3>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{caseItem.description}</p>
        
        <div className="flex items-center justify-between">
          <div>
            <Badge variant="outline" className="text-xs bg-secondary">
              {typeLabel[caseItem.type]}
            </Badge>
            <p className="text-xs text-muted-foreground mt-2">
              Letzte Aktivität: {new Date(caseItem.lastUpdated).toLocaleDateString('de-DE')}
            </p>
          </div>
          
          <div className="flex -space-x-2">
            <CustomAvatar name={caseItem.assignee.name} imageSrc={caseItem.assignee.avatar} />
          </div>
        </div>
      </div>
    </Link>
  );
};
