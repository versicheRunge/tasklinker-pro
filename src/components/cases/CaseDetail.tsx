
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Clock, User, CheckCircle2, AlertCircle, Hourglass, Paperclip, MessageSquare, Save, RefreshCw, Archive, Trash2 } from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { CaseItem, CaseStatus, CaseActivity } from '../../types/case';
import { CustomAvatar } from '../ui/CustomAvatar';
import { Badge } from '../ui/badge';
import { ChecklistItem } from '../checklists/ChecklistItem';
import { CaseActivityTimeline } from './CaseActivityTimeline';
import { toast } from "../../hooks/use-toast";
import { useUser } from '../../contexts/UserContext';

interface CaseDetailProps {
  cases: CaseItem[];
  updateCase?: (id: string, caseData: Partial<CaseItem>) => void;
}

export const CaseDetail: React.FC<CaseDetailProps> = ({ cases, updateCase }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAdmin } = useUser();
  const initialCase = cases.find(c => c.id === id);
  
  const [caseItem, setCaseItem] = useState<CaseItem | undefined>(initialCase);
  const [savingStatus, setSavingStatus] = useState(false);
  
  useEffect(() => {
    const updatedCase = cases.find(c => c.id === id);
    if (updatedCase) {
      setCaseItem(updatedCase);
    }
  }, [cases, id]);

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

  const handleStatusChange = (newStatus: CaseStatus) => {
    if (caseItem.status === newStatus) return;
    
    setSavingStatus(true);
    
    const newActivity: CaseActivity = {
      id: `act-${Date.now()}`,
      type: 'status',
      content: `Status geändert auf: ${statusLabel[newStatus]}`,
      timestamp: new Date().toISOString(),
      user: { id: 'current-user', name: 'Max Schmidt', role: 'Mitarbeiter' },
      caseId: caseItem.id
    };
    
    const updatedCase = {
      ...caseItem,
      status: newStatus,
      lastUpdated: new Date().toISOString(),
      activities: [newActivity, ...caseItem.activities]
    };
    
    setCaseItem(updatedCase);
    
    if (updateCase) {
      // Use a direct update to ensure the state is saved
      updateCase(caseItem.id, {
        status: newStatus,
        lastUpdated: updatedCase.lastUpdated,
        activities: updatedCase.activities
      });
      
      // Store in localStorage as a backup
      const storedCases = localStorage.getItem('cases');
      if (storedCases) {
        const allCases = JSON.parse(storedCases) as CaseItem[];
        const updatedCases = allCases.map(c => 
          c.id === caseItem.id ? updatedCase : c
        );
        localStorage.setItem('cases', JSON.stringify(updatedCases));
      }
    }
    
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

  const handleChecklistItemComplete = (index: number, completed: boolean) => {
    const updatedChecklist = [...caseItem.checklist];
    
    updatedChecklist[index] = {
      ...updatedChecklist[index],
      completed
    };
    
    const newActivity: CaseActivity = {
      id: `act-${Date.now()}`,
      type: 'checklist',
      content: `Checklist-Aufgabe "${updatedChecklist[index].text}" ${completed ? 'abgeschlossen' : 'wieder geöffnet'}`,
      timestamp: new Date().toISOString(),
      user: { id: 'current-user', name: 'Max Schmidt', role: 'Mitarbeiter' }
    };
    
    const updatedCase = {
      ...caseItem,
      checklist: updatedChecklist,
      lastUpdated: new Date().toISOString(),
      activities: [newActivity, ...caseItem.activities]
    };
    
    setCaseItem(updatedCase);
    
    if (updateCase) {
      updateCase(caseItem.id, {
        checklist: updatedChecklist,
        lastUpdated: updatedCase.lastUpdated,
        activities: updatedCase.activities
      });
    }
    
    const allComplete = updatedChecklist.every(item => item.completed);
    if (allComplete && caseItem.status !== 'completed') {
      toast({
        title: "Alle Aufgaben erledigt",
        description: "Möchten Sie den Status auf 'Erledigt' ändern?",
        action: (
          <button 
            className="px-3 py-1 bg-green-500 text-white rounded-md text-xs"
            onClick={() => handleStatusChange('completed')}
          >
            Ja, erledigt
          </button>
        )
      });
    }
  };

  const handleArchiveCase = () => {
    toast({
      title: "Vorgang archiviert",
      description: "Der Vorgang wurde erfolgreich archiviert."
    });
    navigate('/cases');
  };

  const handleExportCase = () => {
    toast({
      title: "Vorgang exportiert",
      description: "Der Vorgang wurde erfolgreich exportiert."
    });
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const commentForm = e.target as HTMLFormElement;
    const commentText = new FormData(commentForm).get('comment') as string;
    
    if (!commentText.trim()) return;
    
    const newComment: CaseActivity = {
      id: `act-${Date.now()}`,
      type: 'comment',
      content: commentText,
      timestamp: new Date().toISOString(),
      user: { id: 'current-user', name: 'Max Schmidt', role: 'Mitarbeiter' }
    };
    
    const updatedCase = {
      ...caseItem,
      lastUpdated: new Date().toISOString(),
      activities: [newComment, ...caseItem.activities]
    };
    
    setCaseItem(updatedCase);
    
    if (updateCase) {
      updateCase(caseItem.id, {
        lastUpdated: updatedCase.lastUpdated,
        activities: updatedCase.activities
      });
    }
    
    commentForm.reset();
    
    toast({
      title: "Kommentar hinzugefügt",
      description: "Ihr Kommentar wurde erfolgreich hinzugefügt."
    });
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
                {typeLabel[caseItem.type as keyof typeof typeLabel] || caseItem.type}
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
            <CustomAvatar name={caseItem.assignee.name} imageSrc={caseItem.assignee.avatar} size="lg" />
          </div>
        </div>
        
        <div className="border-t border-border pt-4">
          <h3 className="font-medium mb-2">Beschreibung</h3>
          <p className="text-sm text-muted-foreground whitespace-pre-line">
            {caseItem.description}
          </p>
        </div>
        
        {caseItem.status !== 'completed' && (
          <div className="mt-6 pt-4 border-t border-border">
            <h3 className="font-medium mb-3">Status ändern</h3>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(statusLabel) as CaseStatus[]).map((status) => (
                <button
                  key={status}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm ${
                    caseItem.status === status
                      ? 'bg-primary text-primary-foreground'
                      : `${statusColors[status]} bg-opacity-50 hover:bg-opacity-70`
                  }`}
                  onClick={() => handleStatusChange(status)}
                  disabled={caseItem.status === status || savingStatus}
                >
                  {statusIcons[status]}
                  {statusLabel[status]}
                  {savingStatus && caseItem.status !== status && <RefreshCw className="w-3 h-3 ml-1 animate-spin" />}
                </button>
              ))}
            </div>
          </div>
        )}
        
        {caseItem.status === 'completed' && (
          <div className="mt-6 pt-4 border-t border-border">
            <div className="flex flex-wrap gap-2">
              <button
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm bg-blue-100 text-blue-700 hover:bg-blue-200"
                onClick={() => handleExportCase()}
              >
                <Archive className="w-4 h-4" />
                Exportieren
              </button>
              
              {isAdmin && (
                <button
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm bg-red-100 text-red-700 hover:bg-red-200"
                  onClick={() => handleArchiveCase()}
                >
                  <Trash2 className="w-4 h-4" />
                  Archivieren
                </button>
              )}
            </div>
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="bg-card rounded-xl border border-border p-6 mb-6">
            <h2 className="text-lg font-medium mb-4">Aktivitäten</h2>
            <CaseActivityTimeline activities={caseItem.activities} />
            
            <div className="mt-6 pt-6 border-t border-border">
              <h3 className="text-sm font-medium mb-3">Neuen Kommentar hinzufügen</h3>
              <form onSubmit={handleCommentSubmit} className="flex gap-3">
                <CustomAvatar name="Max Schmidt" size="sm" />
                <div className="flex-1">
                  <textarea 
                    name="comment"
                    className="w-full p-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary/50 resize-none"
                    placeholder="Schreibe einen Kommentar..."
                    rows={3}
                    required
                  ></textarea>
                  <div className="flex justify-between mt-3">
                    <button 
                      type="button" 
                      className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
                    >
                      <Paperclip className="w-4 h-4 mr-1" />
                      <span>Anhängen</span>
                    </button>
                    <button 
                      type="submit"
                      className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90"
                    >
                      Kommentar senden
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
        
        <div>
          <div className="bg-card rounded-xl border border-border p-6 mb-6">
            <h2 className="text-lg font-medium mb-4">Checkliste</h2>
            <div className="space-y-2">
              {caseItem.checklist && caseItem.checklist.length > 0 ? (
                caseItem.checklist.map((item, index) => (
                  <ChecklistItem 
                    key={index} 
                    item={item}
                    onComplete={(completed) => handleChecklistItemComplete(index, completed)}
                    readOnly={caseItem.status === 'completed'}
                  />
                ))
              ) : (
                <p className="text-sm text-muted-foreground">Keine Checkliste vorhanden</p>
              )}
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
