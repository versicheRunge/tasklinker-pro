
import React from 'react';
import { ArrowLeft, Clock, User, CheckCircle2, AlertCircle, Hourglass, Paperclip, MessageSquare } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { CaseItem } from '../../types/case';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { ChecklistItem } from '../checklists/ChecklistItem';
import { CaseActivityTimeline } from './CaseActivityTimeline';

interface CaseDetailProps {
  cases: CaseItem[];
}

export const CaseDetail: React.FC<CaseDetailProps> = ({ cases }) => {
  const { id } = useParams<{ id: string }>();
  const caseItem = cases.find(c => c.id === id);

  if (!caseItem) {
    return (
      <div className="p-8 text-center">
        <p>Vorgang nicht gefunden</p>
        <Link to="/cases" className="text-primary hover:underline mt-4 inline-block">
          Zurück zur Übersicht
        </Link>
      </div>
    );
  }

  const statusIcons = {
    new: <AlertCircle className="w-5 h-5 text-blue-500" />,
    in_progress: <Clock className="w-5 h-5 text-amber-500" />,
    waiting: <Hourglass className="w-5 h-5 text-purple-500" />,
    completed: <CheckCircle2 className="w-5 h-5 text-green-500" />
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

  const typeLabel = {
    damage: 'Schadenmeldung',
    evb: 'eVB-Anfrage',
    contract_change: 'Vertragsänderung',
    inquiry: 'Kundenanfrage',
    other: 'Sonstiges'
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <Link to="/cases" className="inline-flex items-center text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4 mr-2" />
          <span>Zurück zur Übersicht</span>
        </Link>
      </div>
      
      <div className="bg-card rounded-xl border border-border p-6 mb-6">
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className={`flex items-center gap-1 px-2.5 py-1 text-sm font-medium ${statusColors[caseItem.status]}`}>
                {statusIcons[caseItem.status]}
                {statusLabel[caseItem.status]}
              </Badge>
              <Badge variant="outline" className="bg-secondary text-sm">
                {typeLabel[caseItem.type]}
              </Badge>
            </div>
            <h1 className="text-2xl font-semibold mb-1">{caseItem.title}</h1>
            <p className="text-sm text-muted-foreground">#{caseItem.id.slice(0, 8)} • Erstellt am {new Date(caseItem.createdAt).toLocaleDateString('de-DE')}</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-sm font-medium">Zugewiesen an</p>
              <p className="text-sm text-muted-foreground">{caseItem.assignee.name}</p>
            </div>
            <Avatar name={caseItem.assignee.name} imageSrc={caseItem.assignee.avatar} size="lg" />
          </div>
        </div>
        
        <div className="border-t border-border pt-4">
          <h3 className="font-medium mb-2">Beschreibung</h3>
          <p className="text-sm text-muted-foreground whitespace-pre-line">
            {caseItem.description}
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-card rounded-xl border border-border p-6 mb-6">
            <h2 className="text-lg font-medium mb-4">Aktivitäten</h2>
            <CaseActivityTimeline activities={caseItem.activities} />
            
            <div className="mt-6 pt-6 border-t border-border">
              <h3 className="text-sm font-medium mb-3">Neuen Kommentar hinzufügen</h3>
              <div className="flex gap-3">
                <Avatar name="Max Schmidt" size="sm" />
                <div className="flex-1">
                  <textarea 
                    className="w-full p-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary/50 resize-none"
                    placeholder="Schreibe einen Kommentar..."
                    rows={3}
                  ></textarea>
                  <div className="flex justify-between mt-3">
                    <button className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
                      <Paperclip className="w-4 h-4 mr-1" />
                      <span>Anhängen</span>
                    </button>
                    <button className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90">
                      Kommentar senden
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div>
          <div className="bg-card rounded-xl border border-border p-6 mb-6">
            <h2 className="text-lg font-medium mb-4">Checkliste</h2>
            <div className="space-y-2">
              {caseItem.checklist.map((item, index) => (
                <ChecklistItem key={index} item={item} />
              ))}
            </div>
          </div>
          
          <div className="bg-card rounded-xl border border-border p-6">
            <h2 className="text-lg font-medium mb-4">Dokumente</h2>
            {caseItem.documents && caseItem.documents.length > 0 ? (
              <ul className="space-y-3">
                {caseItem.documents.map((doc, index) => (
                  <li key={index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50">
                    <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center">
                      <Paperclip className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{doc.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(doc.uploadedAt).toLocaleDateString('de-DE')}
                      </p>
                    </div>
                    <button className="text-primary hover:text-primary/70 text-sm">
                      Ansehen
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">Keine Dokumente vorhanden</p>
            )}
            
            <button className="w-full mt-4 px-4 py-2 rounded-lg border border-primary text-primary text-sm font-medium hover:bg-primary/5">
              Dokument hochladen
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
