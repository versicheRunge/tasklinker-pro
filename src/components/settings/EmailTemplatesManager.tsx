
import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Save, X, ArrowUp, ArrowDown } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { Input } from "../ui/input";
import { toast } from "../../hooks/use-toast";

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  category: string;
}

export const EmailTemplatesManager: React.FC = () => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState<EmailTemplate | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  const categories = [
    { id: 'damage', name: 'Schadensmeldung' },
    { id: 'evb', name: 'eVB-Anfrage' },
    { id: 'contract_change', name: 'Vertragsänderung' },
    { id: 'inquiry', name: 'Kundenanfrage' },
    { id: 'confirmation', name: 'Bestätigung' },
    { id: 'other', name: 'Sonstiges' }
  ];

  const [newTemplate, setNewTemplate] = useState<Omit<EmailTemplate, 'id'>>({
    name: '',
    subject: '',
    body: '',
    category: 'other'
  });

  // Load templates from localStorage
  useEffect(() => {
    const storedTemplates = localStorage.getItem('emailTemplates');
    if (storedTemplates) {
      try {
        setTemplates(JSON.parse(storedTemplates));
      } catch (e) {
        console.error('Error parsing email templates:', e);
        setTemplates([]);
      }
    } else {
      // Initialize with default templates
      const defaultTemplates = generateDefaultTemplates();
      localStorage.setItem('emailTemplates', JSON.stringify(defaultTemplates));
      setTemplates(defaultTemplates);
    }
  }, []);

  // Save templates whenever they change
  useEffect(() => {
    if (templates.length > 0) {
      localStorage.setItem('emailTemplates', JSON.stringify(templates));
    }
  }, [templates]);

  const handleEditTemplate = (template: EmailTemplate) => {
    setCurrentTemplate({ ...template });
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (!currentTemplate) return;
    
    if (!currentTemplate.name.trim() || !currentTemplate.subject.trim() || !currentTemplate.body.trim()) {
      toast({
        title: "Fehler",
        description: "Alle Felder müssen ausgefüllt sein.",
        variant: "destructive"
      });
      return;
    }
    
    const updatedTemplates = templates.map(template => 
      template.id === currentTemplate.id ? currentTemplate : template
    );
    
    setTemplates(updatedTemplates);
    setIsEditDialogOpen(false);
    setCurrentTemplate(null);
    
    toast({
      title: "Vorlage aktualisiert",
      description: "Die E-Mail-Vorlage wurde erfolgreich aktualisiert."
    });
  };

  const handleDeleteTemplate = (id: string) => {
    const updatedTemplates = templates.filter(template => template.id !== id);
    setTemplates(updatedTemplates);
    
    toast({
      title: "Vorlage gelöscht",
      description: "Die E-Mail-Vorlage wurde erfolgreich gelöscht."
    });
  };

  const handleCreateTemplate = () => {
    if (!newTemplate.name.trim() || !newTemplate.subject.trim() || !newTemplate.body.trim()) {
      toast({
        title: "Fehler",
        description: "Alle Felder müssen ausgefüllt sein.",
        variant: "destructive"
      });
      return;
    }
    
    const newId = `template-${Date.now()}`;
    const createdTemplate = {
      ...newTemplate,
      id: newId
    };
    
    setTemplates([...templates, createdTemplate]);
    setIsCreateDialogOpen(false);
    setNewTemplate({
      name: '',
      subject: '',
      body: '',
      category: 'other'
    });
    
    toast({
      title: "Vorlage erstellt",
      description: "Die neue E-Mail-Vorlage wurde erfolgreich erstellt."
    });
  };

  const moveTemplate = (id: string, direction: 'up' | 'down') => {
    const index = templates.findIndex(template => template.id === id);
    if (index === -1) return;
    
    // Can't move up if already at the top
    if (direction === 'up' && index === 0) return;
    
    // Can't move down if already at the bottom
    if (direction === 'down' && index === templates.length - 1) return;
    
    const newTemplates = [...templates];
    const template = newTemplates[index];
    
    if (direction === 'up') {
      newTemplates[index] = newTemplates[index - 1];
      newTemplates[index - 1] = template;
    } else {
      newTemplates[index] = newTemplates[index + 1];
      newTemplates[index + 1] = template;
    }
    
    setTemplates(newTemplates);
  };

  const getPlaceholderInfo = () => (
    <div className="bg-muted/50 p-4 rounded-md mt-4 text-sm">
      <h4 className="font-medium mb-2">Verfügbare Platzhalter:</h4>
      <ul className="space-y-1 list-disc list-inside text-muted-foreground">
        <li>{{customerName}} - Name des Kunden</li>
        <li>{{caseNumber}} - Vorgangsnummer</li>
        <li>{{caseTitle}} - Titel des Vorgangs</li>
        <li>{{userName}} - Name des Mitarbeiters</li>
        <li>{{userEmail}} - E-Mail des Mitarbeiters</li>
        <li>{{userPhone}} - Telefonnummer des Mitarbeiters</li>
        <li>{{date}} - Aktuelles Datum</li>
      </ul>
    </div>
  );

  const filteredTemplates = templates.filter(template => {
    return selectedCategory === 'all' || template.category === selectedCategory;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-3 justify-between mb-6">
        <div className="flex-1">
          <select
            className="px-3 py-2 rounded-md border border-input bg-background text-sm"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="all">Alle Kategorien</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>
        
        <button
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          onClick={() => setIsCreateDialogOpen(true)}
        >
          <Plus className="w-4 h-4" />
          <span>Neue Vorlage</span>
        </button>
      </div>
      
      <div className="space-y-3">
        {filteredTemplates.length > 0 ? (
          filteredTemplates.map(template => (
            <div key={template.id} className="p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{template.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {categories.find(c => c.id === template.category)?.name || 'Kategorie'}
                  </p>
                  <p className="text-sm font-medium mt-2">
                    Betreff: {template.subject}
                  </p>
                </div>
                <div className="flex gap-1">
                  <button
                    className="p-1.5 text-muted-foreground hover:text-foreground rounded-md hover:bg-muted transition-colors"
                    onClick={() => moveTemplate(template.id, 'up')}
                    title="Nach oben"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    className="p-1.5 text-muted-foreground hover:text-foreground rounded-md hover:bg-muted transition-colors"
                    onClick={() => moveTemplate(template.id, 'down')}
                    title="Nach unten"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                  <button
                    className="p-1.5 text-muted-foreground hover:text-foreground rounded-md hover:bg-muted transition-colors"
                    onClick={() => handleEditTemplate(template)}
                    title="Bearbeiten"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    className="p-1.5 text-muted-foreground hover:text-destructive rounded-md hover:bg-muted transition-colors"
                    onClick={() => handleDeleteTemplate(template.id)}
                    title="Löschen"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="mt-3 text-sm text-muted-foreground">
                <div className="line-clamp-3 whitespace-pre-wrap">
                  {template.body}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            Keine E-Mail-Vorlagen gefunden.
          </div>
        )}
      </div>
      
      {/* Edit Template Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>E-Mail-Vorlage bearbeiten</DialogTitle>
          </DialogHeader>
          {currentTemplate && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="template-name">
                  Name
                </label>
                <Input
                  id="template-name"
                  value={currentTemplate.name}
                  onChange={(e) => setCurrentTemplate({...currentTemplate, name: e.target.value})}
                  placeholder="Name der Vorlage"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="template-category">
                  Kategorie
                </label>
                <select
                  id="template-category"
                  className="w-full px-3 py-2 rounded-md border border-input bg-background"
                  value={currentTemplate.category}
                  onChange={(e) => setCurrentTemplate({...currentTemplate, category: e.target.value})}
                >
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="template-subject">
                  Betreff
                </label>
                <Input
                  id="template-subject"
                  value={currentTemplate.subject}
                  onChange={(e) => setCurrentTemplate({...currentTemplate, subject: e.target.value})}
                  placeholder="Betreff der E-Mail"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="template-body">
                  Inhalt
                </label>
                <textarea
                  id="template-body"
                  className="w-full px-3 py-2 border border-input rounded-md"
                  rows={10}
                  value={currentTemplate.body}
                  onChange={(e) => setCurrentTemplate({...currentTemplate, body: e.target.value})}
                  placeholder="Inhalt der E-Mail"
                />
              </div>
              
              {getPlaceholderInfo()}
            </div>
          )}
          <DialogFooter>
            <button
              className="px-4 py-2 rounded-lg border border-input hover:bg-muted transition-colors"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Abbrechen
            </button>
            <button
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              onClick={handleSaveEdit}
            >
              Speichern
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Create Template Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Neue E-Mail-Vorlage erstellen</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="new-template-name">
                Name
              </label>
              <Input
                id="new-template-name"
                value={newTemplate.name}
                onChange={(e) => setNewTemplate({...newTemplate, name: e.target.value})}
                placeholder="Name der Vorlage"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="new-template-category">
                Kategorie
              </label>
              <select
                id="new-template-category"
                className="w-full px-3 py-2 rounded-md border border-input bg-background"
                value={newTemplate.category}
                onChange={(e) => setNewTemplate({...newTemplate, category: e.target.value})}
              >
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="new-template-subject">
                Betreff
              </label>
              <Input
                id="new-template-subject"
                value={newTemplate.subject}
                onChange={(e) => setNewTemplate({...newTemplate, subject: e.target.value})}
                placeholder="Betreff der E-Mail"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="new-template-body">
                Inhalt
              </label>
              <textarea
                id="new-template-body"
                className="w-full px-3 py-2 border border-input rounded-md"
                rows={10}
                value={newTemplate.body}
                onChange={(e) => setNewTemplate({...newTemplate, body: e.target.value})}
                placeholder="Inhalt der E-Mail"
              />
            </div>
            
            {getPlaceholderInfo()}
          </div>
          <DialogFooter>
            <button
              className="px-4 py-2 rounded-lg border border-input hover:bg-muted transition-colors"
              onClick={() => setIsCreateDialogOpen(false)}
            >
              Abbrechen
            </button>
            <button
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              onClick={handleCreateTemplate}
            >
              Erstellen
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Function to generate default email templates
const generateDefaultTemplates = (): EmailTemplate[] => {
  return [
    {
      id: 'template-1',
      name: 'Schadensmeldung Bestätigung',
      subject: 'Bestätigung Ihrer Schadensmeldung',
      body: `Sehr geehrte/r {{customerName}},

vielen Dank für Ihre Schadensmeldung. Wir haben Ihren Vorgang unter der Nummer {{caseNumber}} erfasst.

Wir werden uns schnellstmöglich mit der Bearbeitung Ihres Anliegens befassen. Bei Rückfragen stehe ich Ihnen gerne zur Verfügung.

Mit freundlichen Grüßen,
{{userName}}
{{userEmail}}
{{userPhone}}`,
      category: 'damage'
    },
    {
      id: 'template-2',
      name: 'eVB-Anfrage Bestätigung',
      subject: 'Ihre eVB-Anfrage',
      body: `Sehr geehrte/r {{customerName}},

vielen Dank für Ihre Anfrage zur elektronischen Versicherungsbestätigung (eVB). Wir haben Ihren Vorgang unter der Nummer {{caseNumber}} erfasst.

Im Anhang finden Sie die gewünschte eVB. Bitte beachten Sie, dass diese maximal 6 Monate gültig ist.

Bei weiteren Fragen stehe ich Ihnen gerne zur Verfügung.

Mit freundlichen Grüßen,
{{userName}}
{{userEmail}}
{{userPhone}}`,
      category: 'evb'
    },
    {
      id: 'template-3',
      name: 'Vertragsänderung Bestätigung',
      subject: 'Bestätigung Ihrer Vertragsänderung',
      body: `Sehr geehrte/r {{customerName}},

hiermit bestätigen wir die Änderung Ihres Vertrags gemäß Ihrer Anfrage vom {{date}}. Die Änderungen werden zum gewünschten Termin wirksam.

Die aktualisierte Versicherungspolice erhalten Sie in den nächsten Tagen per Post.

Bei Fragen zu Ihrem Vertrag stehe ich Ihnen gerne zur Verfügung.

Mit freundlichen Grüßen,
{{userName}}
{{userEmail}}
{{userPhone}}`,
      category: 'contract_change'
    },
    {
      id: 'template-4',
      name: 'Allgemeine Anfrage Antwort',
      subject: 'Ihre Anfrage: {{caseTitle}}',
      body: `Sehr geehrte/r {{customerName}},

vielen Dank für Ihre Anfrage. Wir haben diese unter der Vorgangsnummer {{caseNumber}} erfasst.

[Hier individuelle Antwort einfügen]

Ich hoffe, diese Information hilft Ihnen weiter. Sollten Sie weitere Fragen haben, kontaktieren Sie mich gerne.

Mit freundlichen Grüßen,
{{userName}}
{{userEmail}}
{{userPhone}}`,
      category: 'inquiry'
    },
    {
      id: 'template-5',
      name: 'Rückrufbitte',
      subject: 'Rückrufbitte zu Ihrem Anliegen',
      body: `Sehr geehrte/r {{customerName}},

ich habe versucht, Sie telefonisch zu erreichen, konnte Sie jedoch leider nicht erreichen.

Bitte rufen Sie mich bezüglich Ihres Anliegens ({{caseTitle}}) zurück oder teilen Sie mir mit, wann ich Sie am besten erreichen kann.

Vielen Dank für Ihre Unterstützung.

Mit freundlichen Grüßen,
{{userName}}
{{userEmail}}
{{userPhone}}`,
      category: 'other'
    }
  ];
};

export default EmailTemplatesManager;
