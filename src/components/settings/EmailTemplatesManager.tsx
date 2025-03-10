
import React, { useState, useEffect } from 'react';
import { 
  ArrowUp, ArrowDown, Plus, Pencil, Trash2, X, Check, ArrowUpDown, Search 
} from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { toast } from "../../hooks/use-toast";

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  category: string;
  order: number;
}

export const EmailTemplatesManager: React.FC = () => {
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState<EmailTemplate | null>(null);
  const [newTemplate, setNewTemplate] = useState({
    id: '',
    name: '',
    subject: '',
    body: '',
    category: 'damage',
    order: 0
  });

  // Categories for email templates
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

  // Load templates from localStorage
  useEffect(() => {
    const loadTemplates = () => {
      const storedTemplates = localStorage.getItem('emailTemplates');
      if (storedTemplates) {
        try {
          setTemplates(JSON.parse(storedTemplates));
        } catch (e) {
          console.error('Error parsing templates:', e);
          setTemplates([]);
        }
      } else {
        // Initialize with default templates if none exist
        const defaultTemplates = generateDefaultTemplates();
        localStorage.setItem('emailTemplates', JSON.stringify(defaultTemplates));
        setTemplates(defaultTemplates);
      }
    };

    loadTemplates();
  }, []);

  // Save templates to localStorage whenever they change
  useEffect(() => {
    if (templates.length > 0) {
      localStorage.setItem('emailTemplates', JSON.stringify(templates));
    }
  }, [templates]);

  // Filter templates based on category and search term
  const filteredTemplates = templates
    .filter(template => {
      const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
      const matchesSearch = 
        template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.body.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => a.order - b.order);

  const handleEditTemplate = (template: EmailTemplate) => {
    setCurrentTemplate({ ...template });
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (!currentTemplate || !currentTemplate.name.trim() || !currentTemplate.subject.trim()) {
      toast({
        title: "Fehler",
        description: "Alle erforderlichen Felder müssen ausgefüllt sein.",
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
    setTemplates(prev => prev.filter(template => template.id !== id));
    
    toast({
      title: "Vorlage gelöscht",
      description: "Die E-Mail-Vorlage wurde erfolgreich gelöscht."
    });
  };

  const handleCreateTemplate = () => {
    if (!newTemplate.name.trim() || !newTemplate.subject.trim()) {
      toast({
        title: "Fehler",
        description: "Alle erforderlichen Felder müssen ausgefüllt sein.",
        variant: "destructive"
      });
      return;
    }

    // Calculate next order value
    const nextOrder = templates.length > 0 
      ? Math.max(...templates.map(t => t.order)) + 1 
      : 0;

    const templateId = `template-${Date.now()}`;
    const createdTemplate = {
      ...newTemplate,
      id: templateId,
      order: nextOrder
    };
    
    setTemplates(prev => [...prev, createdTemplate]);
    setIsCreateDialogOpen(false);
    setNewTemplate({
      id: '',
      name: '',
      subject: '',
      body: '',
      category: 'damage',
      order: 0
    });
    
    toast({
      title: "Vorlage erstellt",
      description: "Die neue E-Mail-Vorlage wurde erfolgreich erstellt."
    });
  };

  const handleMoveTemplate = (id: string, direction: 'up' | 'down') => {
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
    
    toast({
      title: "Reihenfolge geändert",
      description: "Die Reihenfolge der Vorlagen wurde aktualisiert."
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-3 justify-between mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Vorlagen durchsuchen..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2">
          <select
            className="px-3 py-2 rounded-md border border-input bg-background text-sm"
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          
          <button
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            onClick={() => setIsCreateDialogOpen(true)}
          >
            <Plus className="w-4 h-4" />
            <span>Neue Vorlage</span>
          </button>
        </div>
      </div>
      
      <div className="space-y-3">
        {filteredTemplates.length > 0 ? (
          filteredTemplates.map((template, index) => (
            <div 
              key={template.id} 
              className="p-4 border border-border rounded-lg bg-card"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{template.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {categories.find(c => c.id === template.category)?.name || 'Kategorie'}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    className="p-1.5 text-muted-foreground hover:text-foreground rounded-md hover:bg-muted transition-colors"
                    onClick={() => handleMoveTemplate(template.id, 'up')}
                    disabled={index === 0}
                    title="Nach oben verschieben"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    className="p-1.5 text-muted-foreground hover:text-foreground rounded-md hover:bg-muted transition-colors"
                    onClick={() => handleMoveTemplate(template.id, 'down')}
                    disabled={index === filteredTemplates.length - 1}
                    title="Nach unten verschieben"
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
              
              <div className="mt-3 pt-3 border-t border-border">
                <p className="text-sm font-medium">Betreff:</p>
                <p className="text-sm">{template.subject}</p>
              </div>
              
              <div className="mt-2">
                <p className="text-sm font-medium">Text:</p>
                <p className="text-sm line-clamp-3">{template.body}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            Keine Vorlagen gefunden.
          </div>
        )}
      </div>
      
      {/* Edit Template Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[625px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Vorlage bearbeiten</DialogTitle>
          </DialogHeader>
          {currentTemplate && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    {categories.filter(c => c.id !== 'all').map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
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
                <div className="flex justify-between">
                  <label className="text-sm font-medium" htmlFor="template-body">
                    Text
                  </label>
                </div>
                <textarea
                  id="template-body"
                  className="w-full px-3 py-2 rounded-md border border-input bg-background resize-y min-h-[150px]"
                  rows={8}
                  value={currentTemplate.body}
                  onChange={(e) => setCurrentTemplate({...currentTemplate, body: e.target.value})}
                  placeholder="Text der E-Mail-Vorlage"
                />
              </div>
              
              <div className="pt-3 border-t border-border">
                <h4 className="text-sm font-medium mb-2">Platzhalter:</h4>
                <div className="flex flex-wrap gap-2">
                  {placeholders.map((placeholder, i) => (
                    <div key={i} className="text-xs bg-muted px-2 py-1 rounded-md">
                      {placeholder}
                    </div>
                  ))}
                </div>
              </div>
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
        <DialogContent className="sm:max-w-[625px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Neue Vorlage erstellen</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  {categories.filter(c => c.id !== 'all').map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
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
                Text
              </label>
              <textarea
                id="new-template-body"
                className="w-full px-3 py-2 rounded-md border border-input bg-background resize-y min-h-[150px]"
                rows={8}
                value={newTemplate.body}
                onChange={(e) => setNewTemplate({...newTemplate, body: e.target.value})}
                placeholder="Text der E-Mail-Vorlage"
              />
            </div>
            
            <div className="pt-3 border-t border-border">
              <h4 className="text-sm font-medium mb-2">Platzhalter:</h4>
              <div className="flex flex-wrap gap-2">
                {placeholders.map((placeholder, i) => (
                  <div key={i} className="text-xs bg-muted px-2 py-1 rounded-md">
                    {placeholder}
                  </div>
                ))}
              </div>
            </div>
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

export default EmailTemplatesManager;
