
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Clock, User, CheckCircle2, AlertCircle, Hourglass, Paperclip, MessageSquare, 
  Save, RefreshCw, Archive, Trash2, Download, FileText, Plus } from 'lucide-react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { CaseItem, CaseStatus, CaseActivity, ChecklistItemType, SubChecklistItem, User as UserType, Document } from '../../types/case';
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
  const { isAdmin, currentUser, users } = useUser();
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
    doc.text(`Vorgangsnummer: ${caseItem.id}`, 14, 30);
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
    
    // Add checklist
    if (caseItem.checklist && caseItem.checklist.length > 0) {
      doc.setFontSize(14);
      doc.text('Checkliste', 14, yPos);
      yPos += 10;
      
      doc.setFontSize(12);
      caseItem.checklist.forEach((item, index) => {
        const status = item.completed ? '✓' : '□';
        doc.text(`${status} ${item.text}`, 14, yPos);
        yPos += 7;
        
        if (item.description) {
          doc.setFontSize(10);
          const descLines = doc.splitTextToSize(item.description, 170);
          doc.text(descLines, 20, yPos);
          yPos += descLines.length * 6;
          doc.setFontSize(12);
        }
        
        // Add sub-items
        if (item.subItems && item.subItems.length > 0) {
          item.subItems.forEach(subItem => {
            const subStatus = subItem.completed ? '✓' : '□';
            doc.text(`   ${subStatus} ${subItem.text}`, 20, yPos);
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

  const handleFileUpload = () => {
    if (!selectedFile) return;
    
    setIsUploading(true);
    
    // Simulating file upload
    setTimeout(() => {
      const newDocument: Document = {
        id: `doc-${Date.now()}`,
        name: selectedFile.name,
        size: formatFileSize(selectedFile.size),
        type: selectedFile.type,
        uploadedAt: new Date().toISOString(),
        uploadedBy: currentUser || { id: 'current-user', name: 'Max Schmidt', role: 'Mitarbeiter' }
      };
      
      const newDocuments = [...(caseItem.documents || []), newDocument];
      
      // Create activity for the document upload
      const newActivity: CaseActivity = {
        id: `act-${Date.now()}`,
        type: 'document',
        content: `Dokument hochgeladen: "${selectedFile.name}"`,
        timestamp: new Date().toISOString(),
        user: currentUser || { id: 'current-user', name: 'Max Schmidt', role: 'Mitarbeiter' },
        attachment: {
          name: selectedFile.name,
          size: formatFileSize(selectedFile.size)
        }
      };
      
      const updatedCase = {
        ...caseItem,
        documents: newDocuments,
        lastUpdated: new Date().toISOString(),
        activities: [newActivity, ...caseItem.activities]
      };
      
      setCaseItem(updatedCase);
      
      if (updateCase) {
        updateCase(caseItem.id, {
          documents: newDocuments,
          lastUpdated: updatedCase.lastUpdated,
          activities: updatedCase.activities
        });
      }
      
      setSelectedFile(null);
      setIsUploading(false);
      
      toast({
        title: "Dokument hochgeladen",
        description: `Die Datei "${selectedFile.name}" wurde erfolgreich hochgeladen.`
      });
    }, 1000);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  // Parse comment text for @mentions and notify mentioned users
  const processCommentForMentions = (text: string): string => {
    const mentionRegex = /@(\w+)/g;
    const mentionedUsernames: Set<string> = new Set();
    let match;
    
    while ((match = mentionRegex.exec(text)) !== null) {
      const username = match[1];
      mentionedUsernames.add(username);
    }
    
    if (mentionedUsernames.size > 0) {
      // Find user IDs that match the usernames
      users.forEach(user => {
        const usernameFromEmail = user.email?.split('@')[0] || '';
        const usernameFromName = user.name.toLowerCase().replace(/\s+/g, '');
        
        if (mentionedUsernames.has(usernameFromEmail) || 
            mentionedUsernames.has(usernameFromName)) {
          // Send notification to this user
          sendNotification(
            user.id,
            `Erwähnung in Kommentar: ${caseItem.title}`,
            `${currentUser?.name} hat Sie in einem Kommentar in "${caseItem.title}" erwähnt.`
          );
        }
      });
    }
    
    // Return text with highlighted mentions
    return text.replace(mentionRegex, '<span class="text-primary font-medium">@$1</span>');
  };

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const commentForm = e.target as HTMLFormElement;
    const commentText = new FormData(commentForm).get('comment') as string;
    
    if (!commentText.trim()) return;
    
    // Process text for @mentions
    const processedText = processCommentForMentions(commentText);
    
    const newComment: CaseActivity = {
      id: `act-${Date.now()}`,
      type: 'comment',
      content: commentText, // Store original text
      timestamp: new Date().toISOString(),
      user: currentUser || { id: 'current-user', name: 'Max Schmidt', role: 'Mitarbeiter' }
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
    
    // Notify original creator if this is a different user
    if (caseItem.activities[caseItem.activities.length - 1]?.user.id !== currentUser?.id) {
      const originalCreator = caseItem.activities[caseItem.activities.length - 1]?.user;
      if (originalCreator && originalCreator.id) {
        sendNotification(
          originalCreator.id,
          `Neuer Kommentar: ${caseItem.title}`,
          `${currentUser?.name} hat einen Kommentar zu "${caseItem.title}" hinzugefügt.`
        );
      }
    }
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
            <button
              onClick={generatePDF}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm bg-primary text-white hover:bg-primary/90"
            >
              <FileText className="w-4 h-4" />
              PDF exportieren
            </button>
            
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <p className="text-sm font-medium">Zugewiesen an</p>
                  <p className="text-sm text-muted-foreground">{caseItem.assignee.name}</p>
                </div>
                <button 
                  onClick={() => setIsAssigningUser(true)}
                  className="hover:bg-muted rounded-full p-1"
                  title="Benutzer zuweisen"
                >
                  <User className="w-4 h-4 text-muted-foreground" />
                </button>
              </div>
              <CustomAvatar name={caseItem.assignee.name} imageSrc={caseItem.assignee.avatar} size="lg" />
            </div>
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
                onClick={generatePDF}
              >
                <Download className="w-4 h-4" />
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
                <CustomAvatar name={currentUser?.name || "Max Schmidt"} size="sm" />
                <div className="flex-1">
                  <textarea 
                    name="comment"
                    className="w-full p-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-1 focus:ring-primary/50 resize-none"
                    placeholder="Schreibe einen Kommentar... @benutzername für Erwähnungen"
                    rows={3}
                    required
                  ></textarea>
                  <div className="flex justify-between mt-3">
                    <label 
                      htmlFor="file-upload" 
                      className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground cursor-pointer"
                    >
                      <Paperclip className="w-4 h-4 mr-1" />
                      <span>Anhängen</span>
                      <input 
                        id="file-upload" 
                        type="file" 
                        className="hidden"
                        onChange={handleFileChange}
                      />
                    </label>
                    <button 
                      type="submit"
                      className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90"
                    >
                      Kommentar senden
                    </button>
                  </div>
                  {selectedFile && (
                    <div className="mt-2 p-2 bg-muted rounded-md flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Paperclip className="w-4 h-4" />
                        <span className="text-sm truncate max-w-[200px]">{selectedFile.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          type="button"
                          className="text-sm text-primary hover:text-primary/80"
                          onClick={handleFileUpload}
                          disabled={isUploading}
                        >
                          {isUploading ? 'Wird hochgeladen...' : 'Hochladen'}
                        </button>
                        <button 
                          type="button"
                          className="text-sm text-muted-foreground hover:text-foreground"
                          onClick={() => setSelectedFile(null)}
                          disabled={isUploading}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
        
        <div>
          <div className="bg-card rounded-xl border border-border p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium">Checkliste</h2>
              {!isAddingChecklistItem && caseItem.status !== 'completed' && (
                <button 
                  className="flex items-center gap-1 text-sm text-primary hover:text-primary/80"
                  onClick={() => setIsAddingChecklistItem(true)}
                >
                  <Plus className="w-4 h-4" />
                  <span>Hinzufügen</span>
                </button>
              )}
            </div>
            
            {isAddingChecklistItem && (
              <div className="mb-4 p-4 border border-dashed border-primary/50 rounded-lg">
                <h3 className="text-sm font-medium mb-2">Neuen Eintrag hinzufügen</h3>
                <div className="space-y-3">
                  <input
                    type="text"
                    className="w-full p-2 rounded-md border border-input text-sm"
                    value={newChecklistItemText}
                    onChange={(e) => setNewChecklistItemText(e.target.value)}
                    placeholder="Eintrag"
                  />
                  <textarea
                    className="w-full p-2 rounded-md border border-input text-sm resize-none"
                    value={newChecklistItemDesc}
                    onChange={(e) => setNewChecklistItemDesc(e.target.value)}
                    placeholder="Beschreibung (optional)"
                    rows={2}
                  ></textarea>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="addToTemplate"
                      checked={addToTemplate}
                      onChange={(e) => setAddToTemplate(e.target.checked)}
                      className="w-4 h-4 rounded border-gray-300"
                    />
                    <label htmlFor="addToTemplate" className="text-xs">
                      Zur Standardvorlage hinzufügen
                    </label>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      className="px-3 py-1.5 text-sm rounded-md border border-input hover:bg-muted/30"
                      onClick={() => setIsAddingChecklistItem(false)}
                    >
                      Abbrechen
                    </button>
                    <button
                      className="px-3 py-1.5 text-sm rounded-md bg-primary text-white hover:bg-primary/90"
                      onClick={handleAddChecklistItem}
                    >
                      Hinzufügen
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              {caseItem.checklist && caseItem.checklist.length > 0 ? (
                caseItem.checklist.map((item, index) => (
                  <ChecklistItem 
                    key={index} 
                    item={item}
                    onComplete={(completed) => handleChecklistItemComplete(index, completed)}
                    readOnly={caseItem.status === 'completed'}
                    onAddSubItem={handleAddSubItem}
                    allowEditing={caseItem.status !== 'completed'}
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
            
            <label htmlFor="doc-upload" className="block w-full mt-4 px-4 py-2 rounded-lg border border-primary text-primary text-sm font-medium hover:bg-primary/5 text-center cursor-pointer">
              Dokument hochladen
              <input 
                id="doc-upload" 
                type="file" 
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
            
            {selectedFile && (
              <div className="mt-3 p-3 border border-border rounded-lg">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Paperclip className="w-4 h-4" />
                    <span className="text-sm font-medium truncate max-w-[150px]">{selectedFile.name}</span>
                    <span className="text-xs text-muted-foreground">({formatFileSize(selectedFile.size)})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      className="text-sm text-primary hover:text-primary/80"
                      onClick={handleFileUpload}
                      disabled={isUploading}
                    >
                      {isUploading ? 
                        <RefreshCw className="w-4 h-4 animate-spin" /> : 
                        'Hochladen'
                      }
                    </button>
                    <button 
                      className="text-sm text-muted-foreground hover:text-foreground"
                      onClick={() => setSelectedFile(null)}
                      disabled={isUploading}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* User Assignment Dialog */}
      <Dialog open={isAssigningUser} onOpenChange={setIsAssigningUser}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Vorgang zuweisen</DialogTitle>
            <DialogDescription>
              Wählen Sie einen Benutzer aus, dem dieser Vorgang zugewiesen werden soll.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-3 max-h-[300px] overflow-y-auto">
            {users.map((user) => (
              <button
                key={user.id}
                className={`w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors text-left ${
                  caseItem.assignee.id === user.id ? 'bg-muted border border-primary/30' : ''
                }`}
                onClick={() => handleAssignUser(user.id)}
              >
                <CustomAvatar name={user.name} imageSrc={user.avatar} size="md" />
                <div>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.role}</p>
                </div>
                {caseItem.assignee.id === user.id && (
                  <CheckCircle2 className="w-4 h-4 text-primary ml-auto" />
                )}
              </button>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAssigningUser(false)}>
              Abbrechen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
