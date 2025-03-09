
import { useState, useEffect } from 'react';
import { EmailTemplate, EmailSignature } from '../types/email';
import { CaseItem, User } from '../types/case';
import { toast } from './use-toast';

export const useEmailTemplates = () => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [signatures, setSignatures] = useState<Record<string, EmailSignature>>({});
  const [isLoading, setIsLoading] = useState(true);

  // Load templates from localStorage
  useEffect(() => {
    const loadTemplates = () => {
      setIsLoading(true);
      const storedTemplates = localStorage.getItem('emailTemplates');
      if (storedTemplates) {
        try {
          const parsedTemplates = JSON.parse(storedTemplates);
          setTemplates(parsedTemplates);
        } catch (e) {
          console.error('Error parsing stored email templates:', e);
          initializeDefaultTemplates();
        }
      } else {
        initializeDefaultTemplates();
      }

      const storedSignatures = localStorage.getItem('emailSignatures');
      if (storedSignatures) {
        try {
          const parsedSignatures = JSON.parse(storedSignatures);
          setSignatures(parsedSignatures);
        } catch (e) {
          console.error('Error parsing stored email signatures:', e);
          setSignatures({});
        }
      }
      
      setIsLoading(false);
    };
    
    loadTemplates();
  }, []);

  // Initialize default templates if none exist
  const initializeDefaultTemplates = () => {
    const defaultTemplates: EmailTemplate[] = [
      {
        id: 'template-1',
        title: 'Allgemeine Anfrage - Bestätigung',
        subject: 'Ihre Anfrage bei uns',
        content: 'Sehr geehrte(r) {{customerName}},\n\nvielen Dank für Ihre Anfrage. Wir werden uns schnellstmöglich damit befassen und melden uns in Kürze bei Ihnen.\n\nMit freundlichen Grüßen,\n{{userName}}',
        order: 1,
        category: 'general',
        tags: ['customerName', 'userName'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'template-2',
        title: 'Schadenmeldung - Eingangsbestätigung',
        subject: 'Ihre Schadenmeldung',
        content: 'Sehr geehrte(r) {{customerName}},\n\nvielen Dank für Ihre Schadenmeldung. Wir haben Ihren Schaden unter der Nummer {{caseId}} erfasst und werden diesen umgehend bearbeiten.\n\nBei Rückfragen können Sie sich jederzeit an uns wenden.\n\nMit freundlichen Grüßen,\n{{userName}}',
        order: 2,
        category: 'damage',
        tags: ['customerName', 'caseId', 'userName'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'template-3',
        title: 'Vertragsänderung - Bestätigung',
        subject: 'Ihre Vertragsänderung',
        content: 'Sehr geehrte(r) {{customerName}},\n\nwir bestätigen den Eingang Ihrer gewünschten Vertragsänderung. Diese wird unter der Vorgangsnummer {{caseId}} bearbeitet.\n\nSobald die Änderung umgesetzt wurde, erhalten Sie von uns eine separate Bestätigung.\n\nMit freundlichen Grüßen,\n{{userName}}',
        order: 3,
        category: 'contract',
        tags: ['customerName', 'caseId', 'userName'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];
    
    setTemplates(defaultTemplates);
    localStorage.setItem('emailTemplates', JSON.stringify(defaultTemplates));
  };

  // Save templates to localStorage
  useEffect(() => {
    if (templates.length > 0) {
      localStorage.setItem('emailTemplates', JSON.stringify(templates));
    }
  }, [templates]);

  // Save signatures to localStorage
  useEffect(() => {
    if (Object.keys(signatures).length > 0) {
      localStorage.setItem('emailSignatures', JSON.stringify(signatures));
    }
  }, [signatures]);

  // Add a new template
  const addTemplate = (template: Omit<EmailTemplate, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTemplate: EmailTemplate = {
      ...template,
      id: `template-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const updatedTemplates = [...templates, newTemplate];
    setTemplates(updatedTemplates);
    
    toast({
      title: "Vorlage erstellt",
      description: `Die E-Mail-Vorlage "${template.title}" wurde erfolgreich erstellt.`
    });
    
    return newTemplate;
  };

  // Update an existing template
  const updateTemplate = (id: string, templateData: Partial<EmailTemplate>) => {
    const updatedTemplates = templates.map(template => {
      if (template.id === id) {
        return {
          ...template,
          ...templateData,
          updatedAt: new Date().toISOString()
        };
      }
      return template;
    });
    
    setTemplates(updatedTemplates);
    
    toast({
      title: "Vorlage aktualisiert",
      description: "Die E-Mail-Vorlage wurde erfolgreich aktualisiert."
    });
  };

  // Delete a template
  const deleteTemplate = (id: string) => {
    const updatedTemplates = templates.filter(template => template.id !== id);
    setTemplates(updatedTemplates);
    
    toast({
      title: "Vorlage gelöscht",
      description: "Die E-Mail-Vorlage wurde erfolgreich gelöscht."
    });
  };

  // Save or update a signature
  const saveSignature = (userId: string, signatureData: Omit<EmailSignature, 'userId' | 'updatedAt'>) => {
    const newSignature: EmailSignature = {
      ...signatureData,
      userId,
      updatedAt: new Date().toISOString()
    };
    
    setSignatures(prev => ({
      ...prev,
      [userId]: newSignature
    }));
    
    toast({
      title: "Signatur gespeichert",
      description: "Ihre E-Mail-Signatur wurde erfolgreich gespeichert."
    });
  };

  // Get signature for a specific user
  const getUserSignature = (userId: string): EmailSignature | null => {
    return signatures[userId] || null;
  };

  // Move template up in order
  const moveTemplateUp = (id: string) => {
    const index = templates.findIndex(t => t.id === id);
    if (index <= 0) return; // Already at the top
    
    const newTemplates = [...templates];
    const temp = newTemplates[index];
    newTemplates[index] = newTemplates[index - 1];
    newTemplates[index - 1] = temp;
    
    // Update order properties
    newTemplates[index].order = index + 1;
    newTemplates[index - 1].order = index;
    
    setTemplates(newTemplates);
  };

  // Move template down in order
  const moveTemplateDown = (id: string) => {
    const index = templates.findIndex(t => t.id === id);
    if (index >= templates.length - 1) return; // Already at the bottom
    
    const newTemplates = [...templates];
    const temp = newTemplates[index];
    newTemplates[index] = newTemplates[index + 1];
    newTemplates[index + 1] = temp;
    
    // Update order properties
    newTemplates[index].order = index + 1;
    newTemplates[index + 1].order = index + 2;
    
    setTemplates(newTemplates);
  };

  // Get filtered templates by category
  const getTemplatesByCategory = (category: EmailTemplate['category'] | 'all') => {
    if (category === 'all') {
      return [...templates].sort((a, b) => a.order - b.order);
    }
    
    return templates
      .filter(t => t.category === category)
      .sort((a, b) => a.order - b.order);
  };

  // Replace placeholders in template content with actual data
  const fillTemplate = (template: EmailTemplate, caseData: CaseItem, currentUser: User): string => {
    let content = template.content;
    
    // Replace case-related placeholders
    if (caseData) {
      content = content.replace(/{{caseId}}/g, caseData.id);
      content = content.replace(/{{caseTitle}}/g, caseData.title);
      content = content.replace(/{{caseType}}/g, caseData.type);
      content = content.replace(/{{customerName}}/g, caseData.customerName || 'Kunde');
      content = content.replace(/{{caseDescription}}/g, caseData.description);
    }
    
    // Replace user-related placeholders
    if (currentUser) {
      content = content.replace(/{{userName}}/g, currentUser.name);
      content = content.replace(/{{userEmail}}/g, currentUser.email || '');
      content = content.replace(/{{userPhone}}/g, currentUser.phone || '');
      content = content.replace(/{{userDepartment}}/g, currentUser.department || '');
    }
    
    // Add signature if available
    const signature = getUserSignature(currentUser.id);
    if (signature) {
      content += '\n\n' + signature.content;
      
      if (signature.includeUserDetails) {
        content += '\n\n';
        content += currentUser.name;
        if (currentUser.department) content += '\n' + currentUser.department;
        if (currentUser.email) content += '\n' + currentUser.email;
        if (currentUser.phone) content += '\n' + currentUser.phone;
      }
    }
    
    return content;
  };

  // Get subject with placeholders replaced
  const fillSubject = (subject: string, caseData: CaseItem): string => {
    let filledSubject = subject;
    
    if (caseData) {
      filledSubject = filledSubject.replace(/{{caseId}}/g, caseData.id);
      filledSubject = filledSubject.replace(/{{caseTitle}}/g, caseData.title);
      filledSubject = filledSubject.replace(/{{customerName}}/g, caseData.customerName || 'Kunde');
    }
    
    return filledSubject;
  };

  return {
    templates,
    signatures,
    isLoading,
    addTemplate,
    updateTemplate,
    deleteTemplate,
    saveSignature,
    getUserSignature,
    moveTemplateUp,
    moveTemplateDown,
    getTemplatesByCategory,
    fillTemplate,
    fillSubject
  };
};
