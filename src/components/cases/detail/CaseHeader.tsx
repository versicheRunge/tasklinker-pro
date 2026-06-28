
import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, UserPlus, Clock, Flag, Hourglass, CalendarCheck, CalendarClock, Mail, Phone, Pencil, Check, X } from 'lucide-react';
import { CaseItem, User, CaseStatus, CasePriority, CASE_TYPE_LABELS } from '../../../types/case';
import { CustomAvatar } from '../../ui/CustomAvatar';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { UserAssignmentDialog } from './UserAssignmentDialog';
import { PrioritySelector } from './PrioritySelector';
import { StatusChanger } from './StatusChanger';
import { format, isPast, isToday } from 'date-fns';
import { de } from 'date-fns/locale';

interface CaseHeaderProps {
  caseItem: CaseItem;
  users: User[];
  onStatusChange: (newStatus: CaseStatus, waitingReason?: string) => void;
  onPriorityChange: (newPriority: CasePriority) => void;
  onAssignUser: (userId: string) => void;
  onTitleChange?: (newTitle: string) => void;
  isAdmin: boolean;
  currentUser?: User;
}

const statusColors = {
  new:         'bg-blue-100 text-blue-700 border-blue-200',
  in_progress: 'bg-amber-100 text-amber-700 border-amber-200',
  waiting:     'bg-purple-100 text-purple-700 border-purple-200',
  completed:   'bg-green-100 text-green-700 border-green-200',
};

const statusLabel = {
  new: 'Neu', in_progress: 'In Bearbeitung', waiting: 'Wartet auf Rückmeldung', completed: 'Erledigt',
};

export const CaseHeader: React.FC<CaseHeaderProps> = ({
  caseItem, users, onStatusChange, onPriorityChange, onAssignUser, onTitleChange, isAdmin, currentUser
}) => {
  const [isAssigningUser, setIsAssigningUser] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(caseItem.title);
  const titleInputRef = useRef<HTMLInputElement>(null);

  const canEditTitle = isAdmin || currentUser?.id === caseItem.assignee?.id;

  useEffect(() => { setTitleDraft(caseItem.title); }, [caseItem.title]);
  useEffect(() => { if (editingTitle) titleInputRef.current?.focus(); }, [editingTitle]);

  const saveTitle = () => {
    const trimmed = titleDraft.trim();
    if (trimmed && trimmed !== caseItem.title) onTitleChange?.(trimmed);
    setEditingTitle(false);
  };
  const cancelTitle = () => { setTitleDraft(caseItem.title); setEditingTitle(false); };

  const followUp = caseItem.followUpDate ? new Date(caseItem.followUpDate) : null;
  const due = caseItem.dueDate ? new Date(caseItem.dueDate) : null;
  const dueOverdue = due && isPast(due) && caseItem.status !== 'completed';

  return (
    <div className="mb-6">
      <div className="flex items-center gap-3 mb-3">
        <Link to="/cases" className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        {editingTitle ? (
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <input
              ref={titleInputRef}
              value={titleDraft}
              onChange={e => setTitleDraft(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') saveTitle(); if (e.key === 'Escape') cancelTitle(); }}
              onBlur={saveTitle}
              className="flex-1 min-w-0 text-xl font-semibold bg-transparent border-b-2 border-primary outline-none px-0"
            />
            <button onMouseDown={e => { e.preventDefault(); saveTitle(); }} className="p-1 text-green-600 hover:text-green-700"><Check className="w-4 h-4" /></button>
            <button onMouseDown={e => { e.preventDefault(); cancelTitle(); }} className="p-1 text-muted-foreground hover:text-foreground"><X className="w-4 h-4" /></button>
          </div>
        ) : (
          <div className="flex items-center gap-2 group">
            <h1 className="text-xl font-semibold">{caseItem.title}</h1>
            {canEditTitle && onTitleChange && (
              <button onClick={() => setEditingTitle(true)}
                className="opacity-0 group-hover:opacity-100 p-1 rounded text-muted-foreground hover:text-foreground transition-opacity">
                <Pencil className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Kunde + Meta-Chips */}
      <div className="flex flex-wrap gap-2 items-center mb-3">
        <Badge className={statusColors[caseItem.status]}>{statusLabel[caseItem.status]}</Badge>
        <Badge variant="outline">{CASE_TYPE_LABELS[caseItem.type] ?? caseItem.type}</Badge>
        {caseItem.priority && caseItem.priority !== 'medium' && (
          <Badge variant="outline" className="flex items-center gap-1">
            <Flag className="w-3 h-3" />
            {caseItem.priority === 'low' ? 'Niedrig' : caseItem.priority === 'high' ? 'Hoch' : 'Dringend'}
          </Badge>
        )}
        {caseItem.customerName && (
          <span className="text-sm text-muted-foreground">· Kunde: <strong>{caseItem.customerName}</strong></span>
        )}
        {caseItem.customerEmail && (
          <a href={`mailto:${caseItem.customerEmail}`} className="flex items-center gap-1 text-sm text-primary hover:underline">
            <Mail className="w-3.5 h-3.5" />{caseItem.customerEmail}
          </a>
        )}
        {caseItem.customerPhone && (
          <a href={`tel:${caseItem.customerPhone}`} className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
            <Phone className="w-3.5 h-3.5" />{caseItem.customerPhone}
          </a>
        )}
      </div>

      {/* Wartet-Grund */}
      {caseItem.status === 'waiting' && caseItem.waitingReason && (
        <div className="flex items-center gap-2 bg-purple-50 border border-purple-200 rounded-lg px-3 py-2 mb-3 text-sm text-purple-700">
          <Hourglass className="w-4 h-4 shrink-0" />
          <span>{caseItem.waitingReason}</span>
        </div>
      )}

      {/* Datum-Chips */}
      {(followUp || due) && (
        <div className="flex flex-wrap gap-2 mb-3">
          {followUp && (
            <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border ${isToday(followUp) ? 'border-green-400 bg-green-50 text-green-700 font-semibold' : 'border-border bg-muted text-muted-foreground'}`}>
              <CalendarCheck className="w-3 h-3" />
              Wiedervorlage: {format(followUp, "dd. MMM yyyy", { locale: de })}
              {isToday(followUp) && ' — heute!'}
            </span>
          )}
          {due && (
            <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full border ${dueOverdue ? 'border-red-400 bg-red-50 text-red-700 font-semibold' : 'border-border bg-muted text-muted-foreground'}`}>
              <CalendarClock className="w-3 h-3" />
              Fällig: {format(due, "dd. MMM yyyy", { locale: de })}
              {dueOverdue && ' — überfällig!'}
            </span>
          )}
        </div>
      )}

      {/* Assignee + Erstellt */}
      <div className="flex flex-wrap items-center gap-4 mb-4 text-sm text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <Clock className="w-4 h-4" />
          <span>Erstellt {new Date(caseItem.createdAt).toLocaleDateString('de-DE')}</span>
        </div>
        <div className="flex items-center gap-2">
          <CustomAvatar name={caseItem.assignee.name} imageSrc={caseItem.assignee.avatar} size="sm" />
          <span>Zugewiesen an <strong>{caseItem.assignee.name}</strong></span>
          {(isAdmin || currentUser?.id === caseItem.assignee.id) && (
            <Button variant="ghost" size="sm" className="h-6 px-2" onClick={() => setIsAssigningUser(true)}>
              <UserPlus className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      </div>

      {/* Status + Priorität */}
      <div className="flex flex-wrap gap-3 items-start">
        <StatusChanger currentStatus={caseItem.status} onStatusChange={onStatusChange} />
        <PrioritySelector currentPriority={caseItem.priority} onPriorityChange={onPriorityChange} />
      </div>

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
