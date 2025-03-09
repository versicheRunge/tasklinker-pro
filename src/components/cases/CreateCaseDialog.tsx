
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { FolderOpen, User, AlertTriangle } from 'lucide-react';
import { CaseDefaultTitle, CasePriority, CaseStatus, CaseType, User as UserType } from '../../types/case';
import { useUser } from '../../contexts/UserContext';
import { 
  Select, 
  SelectContent, 
  SelectGroup, 
  SelectItem, 
  SelectLabel, 
  SelectTrigger, 
  SelectValue 
} from '../ui/select';
import { useEmailTemplates } from '../../hooks/useEmailTemplates';

interface CreateCaseDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onCreateCase: (caseData: any, assigneeId: string) => string;
  defaultTitles: CaseDefaultTitle[];
}

export const CreateCaseDialog: React.FC<CreateCaseDialogProps> = ({ 
  isOpen, 
  onOpenChange,
  onCreateCase,
  defaultTitles
}) => {
  const { users, currentUser } = useUser();
  const { templates, fillTemplate, fillSubject } = useEmailTemplates();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [type, setType] = useState<CaseType>('other');
  const [priority, setPriority] = useState<CasePriority>('medium');
  const [assigneeId, setAssigneeId] = useState('');
  const [error, setError] = useState('');
  const [titleSelected, setTitleSelected] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [emailBody, setEmailBody] = useState<string>('');
  
  // Reset form when dialog opens
  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen]);
  
  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCustomerName('');
    setType('other');
    setPriority('medium');
    setError('');
    setTitleSelected(false);
    // Set current user as default assignee if available
    setAssigneeId(currentUser ? currentUser.id : '');
    setSelectedTemplateId('');
    setEmailBody('');
  };
  
  // Handle default title selection
  const handleDefaultTitleSelect = (defaultTitle: CaseDefaultTitle) => {
    setTitle(defaultTitle.title);
    setType(defaultTitle.type);
    setTitleSelected(true);
  };
  
  // Handle form submission
  const handleSubmit = () => {
    if (!title.trim()) {
      setError('Bitte geben Sie einen Titel ein');
      return;
    }
    
    if (!assigneeId) {
      setError('Bitte wählen Sie einen Bearbeiter aus');
      return;
    }
    
    const assignee = users.find(u => u.id === assigneeId);
    if (!assignee) {
      setError('Der ausgewählte Bearbeiter existiert nicht');
      return;
    }
    
    const caseData = {
      title,
      description,
      customerName: customerName || 'Kunde',
      type,
      priority,
      status: 'new' as CaseStatus,
      assignee, // Include the full user object
      creator: currentUser // Add the creator
    };
    
    const caseId = onCreateCase(caseData, assigneeId);
    
    // Clear form and close dialog
    resetForm();
    onOpenChange(false);
  };
  
  // Handle template selection
  useEffect(() => {
    if (selectedTemplateId && currentUser) {
      const template = templates.find(t => t.id === selectedTemplateId);
      if (template) {
        // Create a dummy case object to fill template
        const dummyCase = {
          id: 'new-case',
          title: title,
          description: description,
          customerName: customerName || 'Kunde',
          type: type,
          createdAt: new Date().toISOString(),
          lastUpdated: new Date().toISOString(),
          assignee: users.find(u => u.id === assigneeId) || currentUser,
          creator: currentUser,
          activities: [],
          checklist: [],
          status: 'new' as CaseStatus
        };
        
        setEmailBody(fillTemplate(template, dummyCase, currentUser));
      }
    }
  }, [selectedTemplateId, title, description, customerName, type, assigneeId]);
  
  // Get email templates relevant to the case type
  let emailCategory: 'general' | 'damage' | 'contract' | 'inquiry' | 'evb' | 'other' = 'general';
  
  if (type === 'damage') emailCategory = 'damage';
  else if (type === 'contract_change') emailCategory = 'contract';
  else if (type === 'inquiry') emailCategory = 'inquiry';
  else if (type === 'evb') emailCategory = 'evb';
  else if (type === 'other') emailCategory = 'other';
  
  const relevantTemplates = templates.filter(t => t.category === emailCategory || t.category === 'general');
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FolderOpen className="w-5 h-5" />
            Neuen Vorgang erstellen
          </DialogTitle>
          <DialogDescription>
            Erstellen Sie einen neuen Vorgang und weisen Sie ihn einem Mitarbeiter zu.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          {error && (
            <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-md">
              <AlertTriangle className="w-5 h-5" />
              <p>{error}</p>
            </div>
          )}
          
          {/* Default title selection */}
          <div className="grid gap-1.5">
            <Label>Vorgangstyp auswählen</Label>
            <div className="flex flex-wrap gap-2">
              {defaultTitles.map(defaultTitle => (
                <button
                  key={defaultTitle.id}
                  type="button"
                  className={`px-3 py-1.5 rounded-md text-sm ${
                    title === defaultTitle.title 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  }`}
                  onClick={() => handleDefaultTitleSelect(defaultTitle)}
                >
                  {defaultTitle.title}
                </button>
              ))}
            </div>
          </div>
          
          {/* Title */}
          <div className="grid gap-1.5">
            <Label htmlFor="title">Titel</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (titleSelected) setTitleSelected(false);
              }}
              placeholder="Titel des Vorgangs"
            />
          </div>
          
          {/* Customer name */}
          <div className="grid gap-1.5">
            <Label htmlFor="customer">Kundenname</Label>
            <Input
              id="customer"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Name des Kunden (optional)"
            />
          </div>
          
          {/* Description */}
          <div className="grid gap-1.5">
            <Label htmlFor="description">Beschreibung</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Beschreibung des Vorgangs"
              rows={5}
            />
          </div>
          
          {/* Priority */}
          <div className="grid gap-1.5">
            <Label htmlFor="priority">Priorität</Label>
            <Select value={priority} onValueChange={(value) => setPriority(value as CasePriority)}>
              <SelectTrigger id="priority">
                <SelectValue placeholder="Priorität auswählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Niedrig</SelectItem>
                <SelectItem value="medium">Mittel</SelectItem>
                <SelectItem value="high">Hoch</SelectItem>
                <SelectItem value="urgent">Dringend</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Assignee */}
          <div className="grid gap-1.5">
            <Label htmlFor="assignee" className="flex items-center gap-1">
              <User className="w-4 h-4" />
              Bearbeiter
            </Label>
            <Select value={assigneeId} onValueChange={setAssigneeId}>
              <SelectTrigger id="assignee">
                <SelectValue placeholder="Bearbeiter auswählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Mitarbeiter</SelectLabel>
                  {users.map(user => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          
          {/* Email template selection */}
          <div className="grid gap-1.5">
            <Label htmlFor="email-template">E-Mail-Vorlage</Label>
            <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
              <SelectTrigger id="email-template">
                <SelectValue placeholder="E-Mail-Vorlage auswählen (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Keine Vorlage</SelectItem>
                {relevantTemplates.length > 0 && (
                  <>
                    {relevantTemplates.map(template => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.title}
                      </SelectItem>
                    ))}
                  </>
                )}
              </SelectContent>
            </Select>
            
            {selectedTemplateId && (
              <div className="mt-2">
                <Label htmlFor="email-preview">E-Mail-Vorschau</Label>
                <div className="mt-1 p-3 bg-muted rounded-md text-sm max-h-36 overflow-y-auto whitespace-pre-wrap">
                  {emailBody}
                </div>
              </div>
            )}
          </div>
        </div>
        
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Abbrechen
          </Button>
          <Button onClick={handleSubmit}>Vorgang erstellen</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
