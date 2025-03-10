
import { useState, useEffect } from 'react';

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  category: string;
  order: number;
}

export const useEmailTemplates = () => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const categories = [
    { id: 'all', name: 'Alle Kategorien' },
    { id: 'damage', name: 'Schadensmeldung' },
    { id: 'evb', name: 'eVB-Anfrage' },
    { id: 'contract_change', name: 'Vertragsänderung' },
    { id: 'inquiry', name: 'Kundenanfrage' },
    { id: 'confirmation', name: 'Bestätigung' },
    { id: 'other', name: 'Sonstiges' }
  ];

  // Placeholder variables for templates
  const placeholders = [
    "{{customerName}} - Name des Kunden",
    "{{caseNumber}} - Vorgangsnummer",
    "{{caseTitle}} - Vorgangstitel",
    "{{userName}} - Ihr Name",
    "{{userEmail}} - Ihre E-Mail-Adresse",
    "{{userPhone}} - Ihre Telefonnummer",
    "{{date}} - Aktuelles Datum"
  ];

  useEffect(() => {
    const loadTemplates = () => {
      setIsLoading(true);
      const storedTemplates = localStorage.getItem('emailTemplates');
      if (storedTemplates) {
        try {
          setTemplates(JSON.parse(storedTemplates));
        } catch (e) {
          console.error('Error parsing email templates:', e);
          const defaultTemplates = generateDefaultTemplates();
          setTemplates(defaultTemplates);
          localStorage.setItem('emailTemplates', JSON.stringify(defaultTemplates));
        }
      } else {
        const defaultTemplates = generateDefaultTemplates();
        setTemplates(defaultTemplates);
        localStorage.setItem('emailTemplates', JSON.stringify(defaultTemplates));
      }
      setIsLoading(false);
    };

    loadTemplates();
  }, []);

  // Save templates whenever they change
  useEffect(() => {
    if (templates.length > 0 && !isLoading) {
      localStorage.setItem('emailTemplates', JSON.stringify(templates));
    }
  }, [templates, isLoading]);

  const addTemplate = (template: Omit<EmailTemplate, 'id' | 'order'>) => {
    const nextOrder = templates.length > 0 
      ? Math.max(...templates.map(t => t.order)) + 1 
      : 0;
      
    const newTemplate: EmailTemplate = {
      ...template,
      id: `template-${Date.now()}`,
      order: nextOrder
    };
    
    setTemplates(prev => [...prev, newTemplate]);
    return newTemplate;
  };

  const updateTemplate = (id: string, templateData: Partial<EmailTemplate>) => {
    setTemplates(prev => 
      prev.map(template => template.id === id ? { ...template, ...templateData } : template)
    );
  };

  const deleteTemplate = (id: string) => {
    setTemplates(prev => prev.filter(template => template.id !== id));
  };

  const moveTemplate = (id: string, direction: 'up' | 'down') => {
    const templateIndex = templates.findIndex(t => t.id === id);
    if (templateIndex === -1) return;
    
    const currentTemplate = templates[templateIndex];
    const newTemplates = [...templates];
    
    if (direction === 'up' && templateIndex > 0) {
      // Swap order values with the template above
      const prevTemplate = newTemplates[templateIndex - 1];
      const tempOrder = currentTemplate.order;
      newTemplates[templateIndex].order = prevTemplate.order;
      newTemplates[templateIndex - 1].order = tempOrder;
    } else if (direction === 'down' && templateIndex < templates.length - 1) {
      // Swap order values with the template below
      const nextTemplate = newTemplates[templateIndex + 1];
      const tempOrder = currentTemplate.order;
      newTemplates[templateIndex].order = nextTemplate.order;
      newTemplates[templateIndex + 1].order = tempOrder;
    } else {
      return; // No change needed
    }
    
    // Sort templates by their new order values
    setTemplates(newTemplates.sort((a, b) => a.order - b.order));
  };

  return {
    templates,
    isLoading,
    categories,
    placeholders,
    addTemplate,
    updateTemplate,
    deleteTemplate,
    moveTemplate
  };
};

// Function to generate default email templates
const generateDefaultTemplates = (): EmailTemplate[] => {
  return [
    {
      id: 'template-1',
      name: 'Schadensmeldung Bestätigung',
      subject: 'Bestätigung Ihrer Schadensmeldung',
      body: `Sehr geehrte(r) {{customerName}},\n\nvielen Dank für Ihre Schadensmeldung (Vorgangsnummer: {{caseNumber}}).\n\nWir haben Ihre Meldung erhalten und bearbeiten diese schnellstmöglich. Ein Mitarbeiter wird sich in Kürze mit Ihnen in Verbindung setzen, um weitere Details zu besprechen.\n\nBei Rückfragen erreichen Sie mich gerne unter:\nTel: {{userPhone}}\nE-Mail: {{userEmail}}\n\nMit freundlichen Grüßen\n{{userName}}`,
      category: 'damage',
      order: 0
    },
    {
      id: 'template-2',
      name: 'eVB-Anfrage Bestätigung',
      subject: 'Ihre Anfrage zur elektronischen Versicherungsbestätigung',
      body: `Sehr geehrte(r) {{customerName}},\n\nvielen Dank für Ihre Anfrage bezüglich einer elektronischen Versicherungsbestätigung (eVB).\n\nWir bearbeiten Ihre Anfrage unter der Vorgangsnummer {{caseNumber}} und werden Ihnen die eVB schnellstmöglich zukommen lassen.\n\nBei Rückfragen stehe ich Ihnen gerne zur Verfügung:\nTel: {{userPhone}}\nE-Mail: {{userEmail}}\n\nMit freundlichen Grüßen\n{{userName}}`,
      category: 'evb',
      order: 1
    },
    {
      id: 'template-3',
      name: 'Vertragsänderung Bestätigung',
      subject: 'Bestätigung Ihrer Vertragsänderung',
      body: `Sehr geehrte(r) {{customerName}},\n\nvielen Dank für Ihren Auftrag zur Änderung Ihres Vertrages.\n\nWir haben Ihre Anfrage unter der Vorgangsnummer {{caseNumber}} erfasst und werden die gewünschten Änderungen vornehmen. Sie erhalten in Kürze eine Bestätigung mit allen Details.\n\nBei Rückfragen kontaktieren Sie mich gerne unter:\nTel: {{userPhone}}\nE-Mail: {{userEmail}}\n\nMit freundlichen Grüßen\n{{userName}}`,
      category: 'contract_change',
      order: 2
    },
    {
      id: 'template-4',
      name: 'Allgemeine Kundenanfrage',
      subject: 'Ihre Anfrage vom {{date}}',
      body: `Sehr geehrte(r) {{customerName}},\n\nvielen Dank für Ihre Anfrage, die wir unter der Nummer {{caseNumber}} bearbeiten.\n\nWir werden uns in Kürze mit einer Antwort bei Ihnen melden. Sollten weitere Informationen benötigt werden, kontaktieren wir Sie umgehend.\n\nBei weiteren Fragen erreichen Sie mich unter:\nTel: {{userPhone}}\nE-Mail: {{userEmail}}\n\nMit freundlichen Grüßen\n{{userName}}`,
      category: 'inquiry',
      order: 3
    },
    {
      id: 'template-5',
      name: 'Abschlussbestätigung',
      subject: 'Bestätigung Ihres Versicherungsabschlusses',
      body: `Sehr geehrte(r) {{customerName}},\n\nvielen Dank für Ihr Vertrauen. Wir freuen uns, Ihnen mitteilen zu können, dass Ihr Versicherungsabschluss erfolgreich bearbeitet wurde.\n\nIn den kommenden Tagen erhalten Sie Ihre Versicherungspolice per Post. Eine digitale Kopie wird Ihnen ebenfalls per E-Mail zugesandt.\n\nBei Fragen zu Ihrem Vertrag kontaktieren Sie mich gerne:\nTel: {{userPhone}}\nE-Mail: {{userEmail}}\n\nMit freundlichen Grüßen\n{{userName}}`,
      category: 'confirmation',
      order: 4
    }
  ];
};
