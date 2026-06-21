
import React, { useState, useEffect } from 'react';
import { Mail } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { toast } from "../../hooks/use-toast";
import { CaseItem, User } from '../../types/case';
import { useEmailTemplates } from '../../hooks/useEmailTemplates';

interface EmailTemplateSelectorProps {
  caseItem: CaseItem;
  currentUser: User | null;
}

const EmailTemplateSelector: React.FC<EmailTemplateSelectorProps> = ({ caseItem, currentUser }) => {
  const { templates, categories } = useEmailTemplates();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');

  const filteredTemplates = selectedCategory === 'all'
    ? templates
    : templates.filter(t => t.category === selectedCategory);

  const selectedTemplate = templates.find(t => t.id === selectedTemplateId) ?? null;

  const replacePlaceholders = (text: string) =>
    text
      .replace(/\{\{customerName\}\}/g, caseItem.customerName || 'Kunde')
      .replace(/\{\{caseNumber\}\}/g, caseItem.id || '')
      .replace(/\{\{caseTitle\}\}/g, caseItem.title || '')
      .replace(/\{\{userName\}\}/g, currentUser?.name || '')
      .replace(/\{\{userEmail\}\}/g, currentUser?.email || '')
      .replace(/\{\{userPhone\}\}/g, currentUser?.phone || '')
      .replace(/\{\{date\}\}/g, new Date().toLocaleDateString('de-DE'));

  useEffect(() => {
    if (selectedTemplate) {
      setEmailSubject(replacePlaceholders(selectedTemplate.subject));
      setEmailBody(replacePlaceholders(selectedTemplate.body));
    }
  }, [selectedTemplateId]);

  const handleSendEmail = () => {
    if (!emailSubject || !emailBody) {
      toast({ title: 'Fehler', description: 'Betreff und Inhalt dürfen nicht leer sein.', variant: 'destructive' }); return;
    }
    const mailtoLink = `mailto:${caseItem.customerEmail || ''}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    window.open(mailtoLink, '_blank');
    setIsDialogOpen(false);
    toast({ title: 'E-Mail wird vorbereitet', description: 'Ihr E-Mail-Programm wurde geöffnet.' });
  };

  if (templates.length === 0) return null;

  return (
    <>
      <button className="flex items-center gap-2 px-4 py-2 bg-card text-card-foreground border border-border rounded-lg hover:bg-muted transition-colors" onClick={() => setIsDialogOpen(true)}>
        <Mail className="w-4 h-4" /><span>E-Mail senden</span>
      </button>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>E-Mail an {caseItem.customerName || 'Kunde'} senden</DialogTitle></DialogHeader>
          <div className="py-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Vorlage auswählen</h3>
              <select className="px-3 py-1 rounded-md border border-input bg-background text-sm" value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
              {filteredTemplates.map(t => (
                <div key={t.id} className={`p-3 border rounded-lg cursor-pointer transition-colors ${selectedTemplateId === t.id ? 'border-primary bg-primary/10' : 'border-border hover:bg-muted/50'}`} onClick={() => setSelectedTemplateId(t.id)}>
                  <h4 className="font-medium">{t.name}</h4>
                  <p className="text-xs text-muted-foreground mt-1">{categories.find(c => c.id === t.category)?.name}</p>
                </div>
              ))}
            </div>
            {selectedTemplate && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Betreff</label>
                  <input className="w-full px-3 py-2 border border-input rounded-md" value={emailSubject} onChange={e => setEmailSubject(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nachricht</label>
                  <textarea className="w-full px-3 py-2 border border-input rounded-md" rows={12} value={emailBody} onChange={e => setEmailBody(e.target.value)} />
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <button className="px-4 py-2 rounded-lg border border-input hover:bg-muted transition-colors" onClick={() => setIsDialogOpen(false)}>Abbrechen</button>
            <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors" onClick={handleSendEmail} disabled={!selectedTemplate}>E-Mail senden</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default EmailTemplateSelector;
