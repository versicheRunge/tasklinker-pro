import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Clock, User, CheckCircle2, AlertCircle, Hourglass, Paperclip, MessageSquare, 
  Save, RefreshCw, Archive, Trash2, Download, FileText, Plus, X, UserPlus, Flag } from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { CaseItem, CaseStatus, CaseActivity, ChecklistItemType, SubChecklistItem, User as UserType, Document, CasePriority } from '../../types/case';
import { CustomAvatar } from '../ui/CustomAvatar';
import { Badge } from '../ui/badge';
import { ChecklistItem } from '../checklists/ChecklistItem';
import { CaseActivityTimeline } from './CaseActivityTimeline';
import { toast } from "../../hooks/use-toast";
import { useUser } from '../../contexts/UserContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "../ui/dialog";
import { Button } from "../ui/button";
import { jsPDF } from "jspdf";
import 'jspdf-autotable';

interface CaseDetailProps {
  cases: CaseItem[];
  updateCase?: (id: string, caseData: Partial<CaseItem>) => void;
}

export const CaseDetail: React.FC<CaseDetailProps> = ({ cases, updateCase }) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAdmin, currentUser, users, mentionUser } = useUser();
  const initialCase = cases.find(c => c.id === id);
  
  const [caseItem, setCaseItem] = useState<CaseItem | undefined>(initialCase);
  const [savingStatus, setSavingStatus] = useState(false);
  const [isAddingChecklistItem, setIsAddingChecklistItem] = useState(false);
  const [newChecklistItemText, setNewChecklistItemText] = useState('');
  const [newChecklistItemDesc, setNewChecklistItemDesc] = useState('');
  const [addToTemplate, setAddToTemplate] = useState(false);
  const [isAssigningUser, setIsAssigningUser] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [mentionSearch, setMentionSearch] = useState('');
  const [showMentions, setShowMentions] = useState(false);
  const [mentionPosition, setMentionPosition] = useState({ top: 0, left: 0 });
  const [cursorPosition, setCursorPosition] = useState(0);
  const commentRef = useRef<HTMLTextAreaElement>(null);
  const [isChangingPriority, setIsChangingPriority] = useState(false);
  
  useEffect(() => {
    const updatedCase = cases.find(c => c.id === id);
    if (updatedCase) {
      setCaseItem(updatedCase);
    }
  }, [cases, id]);

  // Filtern der Benutzer für die @-Mention-Vorschläge
  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(mentionSearch.toLowerCase()) ||
    (user.email && user.email.toLowerCase().includes(mentionSearch.toLowerCase()))
  );

  // Benutzervorschläge basierend auf der Eingabe nach @
  const handleCommentInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setCommentText(text);
    
    const textarea = e.target;
    const cursorPos = textarea.selectionStart;
    setCursorPosition(cursorPos);
    
    // Finde Position des letzten @ vor dem Cursor
    const textBeforeCursor = text.substring(0, cursorPos);
    const lastAtPos = textBeforeCursor.lastIndexOf('@');
    
    if (lastAtPos !== -1) {
      const mentionText = textBeforeCursor.substring(lastAtPos + 1);
      const wordAfterAt = mentionText.match(/^\S*/)?.[0] || '';
      
      // Prüfe, ob ein Leerzeichen nach dem Wort folgt oder wir am Ende des Textes sind
      const isCompleteWord = 
        cursorPos === text.length || 
        text[cursorPos] === ' ' ||
        mentionText.includes(' ');
      
      if (!isCompleteWord && lastAtPos !== cursorPos - 1) {
        setMentionSearch(wordAfterAt);
        setShowMentions(true);
        
        // Berechne Position für das Dropdown
        if (commentRef.current) {
          const cursorCoords = getCaretCoordinates(commentRef.current, cursorPos);
          setMentionPosition({
            top: cursorCoords.top + 20,
            left: cursorCoords.left
          });
        }
      } else {
        setShowMentions(false);
      }
    } else {
      setShowMentions(false);
    }
  };

  // Hilfsfunktion zur Bestimmung der Cursor-Position im Textarea
  const getCaretCoordinates = (element: HTMLTextAreaElement, position: number) => {
    const { offsetLeft, offsetTop } = element;
    const div = document.createElement('div');
    const styles = getComputedStyle(element);
    
    div.style.position = 'absolute';
    div.style.top = '0';
    div.style.left = '0';
    div.style.visibility = 'hidden';
    div.style.width = styles.width;
    div.style.height = 'auto';
    div.style.whiteSpace = 'pre-wrap';
    div.style.wordWrap = 'break-word';
    div.style.paddingTop = styles.paddingTop;
    div.style.paddingRight = styles.paddingRight;
    div.style.paddingBottom = styles.paddingBottom;
    div.style.paddingLeft = styles.paddingLeft;
    div.style.fontSize = styles.fontSize;
    div.style.fontFamily = styles.fontFamily;
    div.style.lineHeight = styles.lineHeight;
    
    const text = element.value.substring(0, position);
    const span = document.createElement('span');
    span.textContent = text;
    div.appendChild(span);
    
    document.body.appendChild(div);
    const { offsetTop: spanTop, offsetLeft: spanLeft } = span;
    document.body.removeChild(div);
    
    return {
      top: offsetTop + spanTop,
      left: offsetLeft + spanLeft
    };
  };

  // Funktion zum Einfügen des ausgewählten Benutzernamens
  const insertMention = (user: UserType) => {
    const textBeforeCursor = commentText.substring(0, cursorPosition);
    const lastAtPos = textBeforeCursor.lastIndexOf('@');
    
    if (lastAtPos !== -1) {
      const textBeforeAt = commentText.substring(0, lastAtPos);
      const textAfterCursor = commentText.substring(cursorPosition);
      
      // Erstelle neuen Text mit eingesetztem Benutzernamen
      const newText = textBeforeAt + '@' + user.name.replace(/\s+/g, '') + ' ' + textAfterCursor;
      setCommentText(newText);
      
      // Setze Cursor nach dem eingefügten Benutzernamen
      setTimeout(() => {
        if (commentRef.current) {
          const newCursorPos = lastAtPos + user.name.replace(/\s+/g, '').length + 2; // +2 für @ und Leerzeichen
          commentRef.current.focus();
          commentRef.current.setSelectionRange(newCursorPos, newCursorPos);
        }
      }, 0);
    }
    
    setShowMentions(false);
  };

  // Klick außerhalb schließt die Mention-Liste
  useEffect(() => {
    const handleClickOutside = () => {
      setShowMentions(false);
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

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
    damage: 'Schadensmeldung',
    evb: 'eVB-Anfrage',
    contract_change: 'Vertragsänderung',
    inquiry: 'Kundenanfrage',
    other: 'Sonstiges'
  };

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

  const handleStatusChange = (newStatus: CaseStatus) => {
    if (caseItem.status === newStatus) return;
    
    setSavingStatus(true);
    
    const newActivity: CaseActivity = {
      id: `act-${Date.now()}`,
      type: 'status',
      content: `Status geändert auf: ${statusLabel[newStatus]}`,
      timestamp: new Date().toISOString(),
      user: currentUser || { id: 'current-user', name: 'Max Schmidt', role: 'Mitarbeiter' },
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
    
    // Send notification to the case creator if it's not the current user
    if (caseItem.assignee.id !== currentUser?.id) {
      sendNotification(
        caseItem.assignee.id, 
        `Status geändert: ${caseItem.title}`,
        `${currentUser?.name} hat den Status auf "${statusLabel[newStatus]}" geändert.`
      );
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

        // Check if all cases are now completed
        const storedCases = localStorage.getItem('cases');
        if (storedCases) {
          const allCases = JSON.parse(storedCases) as CaseItem[];
          const anyOpenCases = allCases.some(c => 
            c.status !== 'completed' && !c.archived
          );
          
          if (!anyOpenCases) {
            showConfetti();
          }
        }
      }
    }, 500);
  };

  const handlePriorityChange = (newPriority: CasePriority) => {
    if (caseItem.priority === newPriority) {
      setIsChangingPriority(false);
      return;
    }
    
    const oldPriorityLabel = caseItem.priority ? priorityLabel[caseItem.priority] : 'Keine';
    const newPriorityLabel = priorityLabel[newPriority];
    
    const newActivity: CaseActivity = {
      id: `act-${Date.now()}`,
      type: 'other',
      content: `Priorität geändert von: ${oldPriorityLabel} auf: ${newPriorityLabel}`,
      timestamp: new Date().toISOString(),
      user: currentUser || { id: 'current-user', name: 'Max Schmidt', role: 'Mitarbeiter' },
      caseId: caseItem.id
    };
    
    const updatedCase = {
      ...caseItem,
      priority: newPriority,
      lastUpdated: new Date().toISOString(),
      activities: [newActivity, ...caseItem.activities]
    };
    
    setCaseItem(updatedCase);
    
    if (updateCase) {
      updateCase(caseItem.id, {
        priority: newPriority,
        lastUpdated: updatedCase.lastUpdated,
        activities: updatedCase.activities
      });
    }
    
    setIsChangingPriority(false);
    
    toast({
      title: "Priorität aktualisiert",
      description: `Die Priorität wurde auf "${newPriorityLabel}" geändert.`
    });
  };

  const handleAssignUser = (userId: string) => {
    const userToAssign = users.find(u => u.id === userId);
    if (!userToAssign || caseItem.assignee.id === userId) {
      setIsAssigningUser(false);
      return;
    }
    
    const newActivity: CaseActivity = {
      id: `act-${Date.now()}`,
      type: 'other',
      content: `Vorgang zugewiesen an: ${userToAssign.name}`,
      timestamp: new Date().toISOString(),
      user: currentUser || { id: 'current-user', name: 'Max Schmidt', role: 'Mitarbeiter' },
      caseId: caseItem.id
    };
    
    const updatedCase = {
      ...caseItem,
      assignee: userToAssign,
      lastUpdated: new Date().toISOString(),
      activities: [newActivity, ...caseItem.activities]
    };
    
    setCaseItem(updatedCase);
    
    if (updateCase) {
      updateCase(caseItem.id, {
        assignee: userToAssign,
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
    
    // Send notification to the newly assigned user
    sendNotification(
      userToAssign.id, 
      `Neuer Vorgang zugewiesen: ${caseItem.title}`,
      `${currentUser?.name} hat Ihnen den Vorgang "${caseItem.title}" zugewiesen.`
    );
    
    setIsAssigningUser(false);
    
    toast({
      title: "Vorgang zugewiesen",
      description: `Der Vorgang wurde ${userToAssign.name} zugewiesen.`
    });
  };

  const sendNotification = (userId: string, title: string, message: string) => {
    // In a real app, this would send to a backend service
    // For now, we'll just store in localStorage
    const notifications = JSON.parse(localStorage.getItem('notifications') || '{}');
    
    if (!notifications[userId]) {
      notifications[userId] = [];
    }
    
    notifications[userId].push({
      id: `notif-${Date.now()}`,
      title,
      message,
      timestamp: new Date().toISOString(),
      read: false,
      caseId: caseItem.id
    });
    
    localStorage.setItem('notifications', JSON.stringify(notifications));
  };

  const showConfetti = () => {
    // Create confetti element
    const confettiContainer = document.createElement('div');
    confettiContainer.style.position = 'fixed';
    confettiContainer.style.top = '0';
    confettiContainer.style.left = '0';
    confettiContainer.style.width = '100%';
    confettiContainer.style.height = '100%';
    confettiContainer.style.zIndex = '9999';
    confettiContainer.style.pointerEvents = 'none';
    document.body.appendChild(confettiContainer);

    // Create confetti pieces
    for (let i = 0; i < 100; i++) {
      const confetti = document.createElement('div');
      confetti.style.position = 'absolute';
      confetti.style.width = `${Math.random() * 10 + 5}px`;
      confetti.style.height = `${Math.random() * 10 + 5}px`;
      confetti.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 50%)`;
      confetti.style.borderRadius = '50%';
      confetti.style.top = '0';
      confetti.style.left = `${Math.random() * 100}%`;
      confetti.style.transform = 'translateY(-100%)';
      confetti.style.animation = `fall ${Math.random() * 3 + 2}s linear forwards`;
      confettiContainer.appendChild(confetti);
    }

    // Create congrats message
    const congratsMsg = document.createElement('div');
    congratsMsg.style.position = 'fixed';
    congratsMsg.style.top = '50%';
    congratsMsg.style.left = '50%';
    congratsMsg.style.transform = 'translate(-50%, -50%)';
    congratsMsg.style.background = 'white';
    congratsMsg.style.padding = '2rem';
    congratsMsg.style.borderRadius = '0.5rem';
    congratsMsg.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
    congratsMsg.style.zIndex = '10000';
    congratsMsg.style.textAlign = 'center';
    congratsMsg.innerHTML = `
      <h3 style="font-size: 1.5rem; font-weight: bold; margin-bottom: 1rem;">Glückwunsch!</h3>
      <p style="margin-bottom: 1.5rem;">Alle Vorgänge wurden erfolgreich abgeschlossen.</p>
      <button id="confetti-close" style="background: #3b82f6; color: white; border: none; padding: 0.5rem 1rem; border-radius: 0.25rem; cursor: pointer;">Schließen</button>
    `;
    document.body.appendChild(congratsMsg);

    // Add animation styles
    const style = document.createElement('style');
    style.innerHTML = `
      @keyframes fall {
        to {
          transform: translateY(100vh) rotate(360deg);
        }
      }
    `;
    document.head.appendChild(style);

    // Add event listener to close button
    document.getElementById('confetti-close')?.addEventListener('click', () => {
      document.body.removeChild(confettiContainer);
      document.body.removeChild(congratsMsg);
      document.head.removeChild(style);
    });

    // Auto-remove after 7 seconds
    setTimeout(() => {
      if (document.body.contains(confettiContainer)) {
        document.body.removeChild(confettiContainer);
      }
      if (document.body.contains(congratsMsg)) {
        document.body.removeChild(congratsMsg);
      }
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    }, 7000);
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
      user: currentUser || { id: 'current-user', name: 'Max Schmidt', role: 'Mitarbeiter' }
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

  const handleAddChecklistItem = () => {
    if (!newChecklistItemText.trim()) {
      toast({
        title: "Fehler",
        description: "Bitte geben Sie einen Text für den neuen Eintrag ein",
        variant: "destructive"
      });
      return;
    }

    const newItem: ChecklistItemType = {
      text: newChecklistItemText,
      description: newChecklistItemDesc || undefined,
      completed: false,
      subItems: []
    };

    const updatedChecklist = [...caseItem.checklist, newItem];
    
    // Create activity for the new checklist item
    const newActivity: CaseActivity = {
      id: `act-${Date.now()}`,
      type: 'checklist',
      content: `Neuer Checklist-Eintrag hinzugefügt: "${newChecklistItemText}"`,
      timestamp: new Date().toISOString(),
      user: currentUser || { id: 'current-user', name: 'Max Schmidt', role: 'Mitarbeiter' }
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

    // Add to template if requested
    if (addToTemplate) {
      const storedTemplates = localStorage.getItem('checklistTemplates');
      if (storedTemplates) {
        const templates = JSON.parse(storedTemplates);
        const templateToUpdate = templates.find((t: any) => t.type === caseItem.type);
        
        if (templateToUpdate) {
          templateToUpdate.items = [...templateToUpdate.items, newItem];
          localStorage.setItem('checklistTemplates', JSON.stringify(templates));
          
          toast({
            title: "Vorlage aktualisiert",
            description: "Der neue Eintrag wurde auch zur Standardvorlage hinzugefügt"
          });
        }
      }
    }

    setNewChecklistItemText('');
    setNewChecklistItemDesc('');
    setAddToTemplate(false);
    setIsAddingChecklistItem(false);
  };

  const handleAddSubItem = (parentItem: ChecklistItemType, subItemText: string, addToTemplate: boolean) => {
    const newSubItem: SubChecklistItem = {
      text: subItemText,
      completed: false
    };

    // Find index of parent item
    const parentIndex = caseItem.checklist.findIndex(item => item.text === parentItem.text);
    if (parentIndex === -1) return;

    // Create updated checklist
    const updatedChecklist = [...caseItem.checklist];
    
    // Ensure subItems array exists
    if (!updatedChecklist[parentIndex].subItems) {
      updatedChecklist[parentIndex].subItems = [];
    }
    
    // Add the new sub-item
    updatedChecklist[parentIndex].subItems = [
      ...(updatedChecklist[parentIndex].subItems || []),
      newSubItem
    ];

    // Create activity for the new checklist sub-item
    const newActivity: CaseActivity = {
      id: `act-${Date.now()}`,
      type: 'checklist',
      content: `Neuer Unterpunkt hinzugefügt zu "${parentItem.text}": "${subItemText}"`,
      timestamp: new Date().toISOString(),
      user: currentUser || { id: 'current-user', name: 'Max Schmidt', role: 'Mitarbeiter' }
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

    // Add to template if requested
    if (addToTemplate) {
      const storedTemplates = localStorage.getItem('checklistTemplates');
      if (storedTemplates) {
        const templates = JSON.parse(storedTemplates);
        const templateToUpdate = templates.find((t: any) => t.type === caseItem.type);
        
        if (templateToUpdate) {
          const templateParentIndex = templateToUpdate.items.findIndex((item: any) => item.text === parentItem.text);
          
          if (templateParentIndex !== -1) {
            if (!templateToUpdate.items[templateParentIndex].subItems) {
              templateToUpdate.items[templateParentIndex].subItems = [];
            }
            
            templateToUpdate.items[templateParentIndex].subItems.push(newSubItem);
            localStorage.setItem('checklistTemplates', JSON.stringify(templates));
            
            toast({
              title: "Vorlage aktualisiert",
              description: "Der neue Unterpunkt wurde auch zur Standardvorlage hinzugefügt"
            });
          }
        }
      }
    }
  };

  const handleArchiveCase = () => {
    toast({
      title: "Vorgang archiviert",
      description: "Der Vorgang wurde erfolgreich archiviert."
    });
    navigate('/cases');
  };

  const generatePDF = () => {
    const customerName = caseItem.customerName || 'Kunde';
    const fileName = `${customerName}_${caseItem.title}_${new Date().toISOString().split('T')[0]}.pdf`;
    
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.text('Vorgangsdetails', 14, 20);
    
    // Add case info
    doc.setFontSize(12);
    // Ersetze 'case' mit 'Vorgang' in der ID
    const formattedId = caseItem.id.replace('case', 'Vorgang');
    doc.text(`Vorgangsnummer: ${formattedId}`, 14, 30);
    doc.text(`Titel: ${caseItem.title}`, 14, 37);
    doc.text(`Kunde: ${customerName}`, 14, 44);
    doc.text(`Status: ${statusLabel[caseItem.status]}`, 14, 51);
    doc.text(`Typ: ${typeLabel[caseItem.type as keyof typeof typeLabel] || caseItem.type}`, 14, 58);
    doc.text(`Erstellt am: ${new Date(caseItem.createdAt).toLocaleDateString('de-DE')}`, 14, 65);
    doc.text(`Zugewiesen an: ${caseItem.assignee.name}`, 14, 72);
    
    // Add description
    doc.setFontSize(14);
    doc.text('Beschreibung', 14, 85);
    doc.setFontSize(12);
    
    const descriptionLines = doc.splitTextToSize(caseItem.description, 180);
    doc.text(descriptionLines, 14, 92);
    
    let yPos = 95 + descriptionLines.length * 7;
    
    // Add checklist with proper checkbox symbols
    if (caseItem.checklist && caseItem.checklist.length > 0) {
      doc.setFontSize(14);
      doc.text('Checkliste', 14, yPos);
      yPos += 10;
      
      doc.setFontSize(12);
      caseItem.checklist.forEach((item, index) => {
        // Bessere Checkbox-Symbole verwenden
        const checkboxSymbol = item.completed ? '✓' : '□';
        doc.text(`${checkboxSymbol} ${item.text}`, 14, yPos);
        yPos += 7;
        
        if (item.description) {
          doc.setFontSize(10);
          const descLines = doc.splitTextToSize(item.description, 170);
          doc.text(descLines, 20, yPos);
          yPos += descLines.length * 6;
          doc.setFontSize(12);
        }
        
        // Add sub-items with proper checkbox symbols
        if (item.subItems && item.subItems.length > 0) {
          item.subItems.forEach(subItem => {
            const subCheckboxSymbol = subItem.completed ? '✓' : '□';
            doc.text(`   ${subCheckboxSymbol} ${subItem.text}`, 20, yPos);
            yPos += 7;
          });
        }
      });
    }
    
    // Add activities
    if (caseItem.activities && caseItem.activities.length > 0) {
      if (yPos > 250) {
        doc.addPage();
        yPos = 20;
      }
      
      doc.setFontSize(14);
      doc.text('Aktivitäten', 14, yPos);
      yPos += 10;
      
      doc.setFontSize(10);
      
      // Only include the last 10 activities to save space
      const recentActivities = caseItem.activities.slice(0, 10);
      
      recentActivities.forEach(activity => {
        const date = new Date(activity.timestamp).toLocaleString('de-DE');
        const user = activity.user.name;
        
        doc.text(`${date} - ${user}:`, 14, yPos);
        yPos += 6;
        
        const contentLines = doc.splitTextToSize(activity.content, 180);
        doc.text(contentLines, 20, yPos);
        yPos += contentLines.length * 6 + 4;
        
        if (yPos > 280) {
          doc.addPage();
          yPos = 20;
        }
      });
    }
    
    // Save the PDF
    doc.save(fileName);
    
    toast({
      title: "PDF generiert",
      description: `Die Datei "${fileName}" wurde erfolgreich erstellt und heruntergeladen.`
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleFileUpload = () =>
