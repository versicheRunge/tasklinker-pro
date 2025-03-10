
import React, { useState, useEffect } from 'react';
import { Mail } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { toast } from "../../hooks/use-toast";
import { CaseItem } from '../../types/case';
import { User } from '../../types/case';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  category: string;
}

interface EmailTemplateSelectorProps {
  caseItem: CaseItem;
  currentUser: User | null;
}

export const EmailTemplateSelector: React.FC<EmailTemplateSelectorProps> = ({
  caseItem,
  currentUser
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<EmailTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<EmailTemplate | null>(null);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  
  // Categories for filter
  const categories = [
    { id: 'all', name: 'Alle Kategorien' },
    { id: 'damage', name: 'Schadensmeldung' },
    { id: 'evb', name: 'eVB-Anfrage' },
    { id: 'contract_change', name: 'Vertragsänderung' },
    { id: 'inquiry', name: 'Kundenanfrage' },
    { id: 'confirmation', name: 'Bestätigung' },
    { id: 'other', name: 'Sonstiges' }
  ];
  
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Load templates from localStorage
  useEffect(() => {
    const storedTemplates = localStorage.getItem('emailTemplates');
    if (storedTemplates) {
      try {
        const parsed = JSON.parse(storedTemplates);
        setTemplates(parsed);
        setFilteredTemplates(parsed);
      } catch (e) {
        console.error('Error parsing email templates:', e);
      }
    }
  }, []);
  
  // Filter templates when category changes
  useEffect(() => {
    if (selectedCategory === 'all') {
      setFilteredTemplates(templates);
    } else {
      setFilteredTemplates(templates.filter(t => t.category === selectedCategory));
    }
  }, [selectedCategory, templates]);

  // Update email content when template changes
  useEffect(() => {
    if (selectedTemplate) {
      const replacedSubject = replacePlaceholders(selectedTemplate.subject);
      const replacedBody = replacePlaceholders(selectedTemplate.body);
      
      setEmailSubject(replacedSubject);
      setEmailBody(replacedBody);
    }
  }, [selectedTemplate]);

  const replacePlaceholders = (text: string) => {
    if (!text) return '';
    
    return text
      .replace(/{{customerName}}/g, caseItem.customerName || 'Kunde')
      .replace(/{{caseNumber}}/g, caseItem.id || '')
      .replace(/{{caseTitle}}/g, caseItem.title || '')
      .replace(/{{userName}}/g, currentUser?.name || '')
      .replace(/{{userEmail}}/g, currentUser?.email || '')
      .replace(/{{userPhone}}/g, currentUser?.phone || '')
      .replace(/{{date}}/g, new Date().toLocaleDateString('de-DE'));
  };

  const handleSelectTemplate = (template: EmailTemplate) => {
    setSelectedTemplate(template);
  };

  const handleSendEmail = () => {
    if (!emailSubject || !emailBody) {
      toast({
        title: "Fehler",
        description: "Betreff und Inhalt dürfen nicht leer sein.",
        variant: "destructive"
      });
      return;
    }
    
    // In a real application, we would send the email via an API
    // For now, we'll just open the user's mail client with the prepared email
    
    // Ensure customerName has a value for the mailto
    const customerName = caseItem.customerName || 'Kunde';
    const customerEmail = caseItem.customerEmail || '';
    
    const mailtoLink = `mailto:${customerEmail}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    
    window.open(mailtoLink, '_blank');
    
    setIsDialogOpen(false);
    toast({
      title: "E-Mail wird vorbereitet",
      description: "Ihr E-Mail-Programm wurde geöffnet."
    });
  };

  if (templates.length === 0) return null;

  return (
    <>
      <button
        className="flex items-center gap-2 px-4 py-2 bg-card text-card-foreground border border-border rounded-lg hover:bg-muted transition-colors"
        onClick={() => setIsDialogOpen(true)}
      >
        <Mail className="w-4 h-4" />
        <span>E-Mail senden</span>
      </button>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>E-Mail an {caseItem.customerName || 'Kunde'} senden</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Vorlage auswählen</h3>
              <select
                className="px-3 py-1 rounded-md border border-input bg-background text-sm"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
              {filteredTemplates.map(template => (
                <div
                  key={template.id}
                  className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedTemplate?.id === template.id
                      ? 'border-primary bg-primary/10'
                      : 'border-border hover:bg-muted/50'
                  }`}
                  onClick={() => handleSelectTemplate(template)}
                >
                  <h4 className="font-medium">{template.name}</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    {categories.find(c => c.id === template.category)?.name || 'Kategorie'}
                  </p>
                </div>
              ))}
            </div>
            
            {selectedTemplate && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="email-subject">
                    Betreff
                  </label>
                  <input
                    id="email-subject"
                    className="w-full px-3 py-2 border border-input rounded-md"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="email-body">
                    Nachricht
                  </label>
                  <textarea
                    id="email-body"
                    className="w-full px-3 py-2 border border-input rounded-md"
                    rows={12}
                    value={emailBody}
                    onChange={(e) => setEmailBody(e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <button
              className="px-4 py-2 rounded-lg border border-input hover:bg-muted transition-colors"
              onClick={() => setIsDialogOpen(false)}
            >
              Abbrechen
            </button>
            <button
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              onClick={handleSendEmail}
              disabled={!selectedTemplate}
            >
              E-Mail senden
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EmailTemplateSelector;
