
import React, { useState, useEffect } from 'react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../../ui/select';
import { Button } from '../../ui/button';
import { Textarea } from '../../ui/textarea';
import { Input } from '../../ui/input';
import { Mail } from 'lucide-react';
import { Label } from '../../ui/label';
import { EmailTemplate } from '../../../types/email';
import { CaseItem, User } from '../../../types/case';
import { useEmailTemplates } from '../../../hooks/useEmailTemplates';
import { toast } from '../../../hooks/use-toast';

interface EmailTemplateSelectorProps {
  caseData: CaseItem;
  currentUser: User | null;
}

export const EmailTemplateSelector: React.FC<EmailTemplateSelectorProps> = ({ 
  caseData, 
  currentUser 
}) => {
  const { 
    templates, 
    getTemplatesByCategory,
    fillTemplate,
    fillSubject
  } = useEmailTemplates();
  
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [emailSubject, setEmailSubject] = useState<string>('');
  const [emailBody, setEmailBody] = useState<string>('');
  const [toEmail, setToEmail] = useState<string>('');
  
  // Get appropriate templates for case type
  const caseType = caseData.type;
  let emailCategory: EmailTemplate['category'] = 'general';
  
  if (caseType === 'damage') emailCategory = 'damage';
  else if (caseType === 'contract_change') emailCategory = 'contract';
  else if (caseType === 'inquiry') emailCategory = 'inquiry';
  else if (caseType === 'evb') emailCategory = 'evb';
  else if (caseType === 'other') emailCategory = 'other';
  
  const relevantTemplates = getTemplatesByCategory(emailCategory);
  const allTemplates = getTemplatesByCategory('all');
  
  // Update email content when template changes
  useEffect(() => {
    if (selectedTemplateId) {
      const template = allTemplates.find(t => t.id === selectedTemplateId);
      if (template && currentUser) {
        setEmailSubject(fillSubject(template.subject, caseData));
        setEmailBody(fillTemplate(template, caseData, currentUser));
      }
    }
  }, [selectedTemplateId, currentUser]);
  
  const handleSendEmail = () => {
    // In a real application, this would send the email
    // For now, we'll just show a success message
    toast({
      title: "E-Mail versendet",
      description: `Die E-Mail wurde erfolgreich an ${toEmail} versendet.`
    });
    
    // Add activity to case
    const newActivity = {
      id: `act-${Date.now()}`,
      type: 'other' as const,
      content: `E-Mail versendet: "${emailSubject}"`,
      timestamp: new Date().toISOString(),
      user: currentUser!,
      caseId: caseData.id
    };
    
    // Here we would update the case with the new activity
    console.log("Email sent activity:", newActivity);
  };
  
  if (!currentUser) return null;
  
  return (
    <div className="bg-card p-4 rounded-lg border border-border shadow-sm space-y-4">
      <h3 className="text-lg font-medium flex items-center gap-2">
        <Mail className="w-5 h-5" />
        E-Mail versenden
      </h3>
      
      <div className="space-y-3">
        <div className="grid gap-2">
          <Label htmlFor="email-template">E-Mail-Vorlage</Label>
          <Select
            value={selectedTemplateId}
            onValueChange={setSelectedTemplateId}
          >
            <SelectTrigger>
              <SelectValue placeholder="Vorlage auswählen" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Keine Vorlage</SelectItem>
              {relevantTemplates.length > 0 && (
                <>
                  <p className="px-2 text-xs text-muted-foreground py-1 font-medium">
                    Passende Vorlagen
                  </p>
                  {relevantTemplates.map(template => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.title}
                    </SelectItem>
                  ))}
                </>
              )}
              <p className="px-2 text-xs text-muted-foreground py-1 font-medium mt-1">
                Alle Vorlagen
              </p>
              {allTemplates
                .filter(t => !relevantTemplates.some(rt => rt.id === t.id))
                .map(template => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.title}
                  </SelectItem>
                ))
              }
            </SelectContent>
          </Select>
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="to-email">Empfänger</Label>
          <Input
            id="to-email"
            placeholder="E-Mail-Adresse des Empfängers"
            value={toEmail}
            onChange={(e) => setToEmail(e.target.value)}
          />
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="email-subject">Betreff</Label>
          <Input
            id="email-subject"
            placeholder="Betreff"
            value={emailSubject}
            onChange={(e) => setEmailSubject(e.target.value)}
          />
        </div>
        
        <div className="grid gap-2">
          <Label htmlFor="email-body">Nachricht</Label>
          <Textarea
            id="email-body"
            placeholder="Inhalt der E-Mail"
            value={emailBody}
            onChange={(e) => setEmailBody(e.target.value)}
            rows={10}
            className="resize-y"
          />
        </div>
        
        <Button 
          type="button" 
          onClick={handleSendEmail}
          disabled={!toEmail || !emailSubject || !emailBody}
          className="w-full"
        >
          <Mail className="w-4 h-4 mr-2" />
          E-Mail senden
        </Button>
      </div>
    </div>
  );
};
