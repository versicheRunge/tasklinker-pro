
import React, { useState } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { useEmailTemplates } from '../hooks/useEmailTemplates';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '../components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../components/ui/card';
import { ArrowUp, ArrowDown, Pencil, Trash, Tag, Plus, Mail, Info } from 'lucide-react';
import { EmailTemplate } from '../types/email';
import { ScrollArea } from '../components/ui/scroll-area';

const EmailTemplates: React.FC = () => {
  const {
    templates,
    addTemplate,
    updateTemplate,
    deleteTemplate,
    moveTemplateUp,
    moveTemplateDown
  } = useEmailTemplates();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);
  const [formData, setFormData] = useState<Partial<EmailTemplate>>({
    title: '',
    subject: '',
    content: '',
    category: 'general',
    tags: []
  });
  const [newTag, setNewTag] = useState('');

  const handleOpenDialog = (template?: EmailTemplate) => {
    if (template) {
      setEditingTemplate(template);
      setFormData({
        title: template.title,
        subject: template.subject,
        content: template.content,
        category: template.category,
        tags: [...template.tags]
      });
    } else {
      setEditingTemplate(null);
      setFormData({
        title: '',
        subject: '',
        content: '',
        category: 'general',
        tags: []
      });
    }
    setIsDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setEditingTemplate(null);
  };

  const handleAddTag = () => {
    if (!newTag.trim()) return;
    
    setFormData(prev => ({
      ...prev,
      tags: [...(prev.tags || []), newTag.trim()]
    }));
    
    setNewTag('');
  };

  const handleRemoveTag = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: (prev.tags || []).filter(t => t !== tag)
    }));
  };

  const handleSubmit = () => {
    // Validate form
    if (!formData.title || !formData.subject || !formData.content || !formData.category) {
      return;
    }
    
    if (editingTemplate) {
      updateTemplate(editingTemplate.id, formData);
    } else {
      // Set order to be after the last template
      const order = templates.length > 0 
        ? Math.max(...templates.map(t => t.order)) + 1 
        : 1;
      
      addTemplate({
        ...formData as Omit<EmailTemplate, 'id' | 'createdAt' | 'updatedAt'>,
        order
      });
    }
    
    handleCloseDialog();
  };

  const handleDeleteTemplate = (id: string) => {
    if (confirm('Sind Sie sicher, dass Sie diese Vorlage löschen möchten?')) {
      deleteTemplate(id);
    }
  };

  const categoryLabels: Record<EmailTemplate['category'], string> = {
    general: 'Allgemein',
    damage: 'Schadenmeldung',
    contract: 'Vertragsänderung',
    inquiry: 'Kundenanfrage',
    evb: 'eVB-Anfrage',
    other: 'Sonstiges'
  };

  // Sort templates by order
  const sortedTemplates = [...templates].sort((a, b) => a.order - b.order);

  return (
    <AppLayout>
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">E-Mail-Vorlagen</h1>
            <p className="text-muted-foreground">Verwalten Sie E-Mail-Vorlagen für Vorgänge</p>
          </div>
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="mr-2 h-4 w-4" />
            Neue Vorlage
          </Button>
        </div>

        <div className="grid gap-6">
          {sortedTemplates.length === 0 ? (
            <div className="text-center py-12 bg-muted/30 rounded-lg">
              <Mail className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Keine E-Mail-Vorlagen vorhanden</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => handleOpenDialog()}
              >
                Erste Vorlage erstellen
              </Button>
            </div>
          ) : (
            sortedTemplates.map((template, index) => (
              <Card key={template.id}>
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{template.title}</CardTitle>
                      <CardDescription>
                        Kategorie: {categoryLabels[template.category]}
                      </CardDescription>
                    </div>
                    <div className="flex gap-1">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        disabled={index === 0}
                        onClick={() => moveTemplateUp(template.id)}
                      >
                        <ArrowUp className="h-4 w-4" />
                        <span className="sr-only">Nach oben</span>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        disabled={index === sortedTemplates.length - 1}
                        onClick={() => moveTemplateDown(template.id)}
                      >
                        <ArrowDown className="h-4 w-4" />
                        <span className="sr-only">Nach unten</span>
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pb-3">
                  <div className="space-y-2">
                    <div>
                      <Label className="text-xs text-muted-foreground">Betreff</Label>
                      <p className="text-sm font-medium">{template.subject}</p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Inhalt</Label>
                      <p className="text-sm whitespace-pre-wrap line-clamp-3">{template.content}</p>
                    </div>
                    {template.tags.length > 0 && (
                      <div>
                        <Label className="text-xs text-muted-foreground">Platzhalter</Label>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {template.tags.map(tag => (
                            <span 
                              key={tag} 
                              className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-primary/10 text-primary"
                            >
                              <Tag className="h-3 w-3 mr-1" />
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-2 pt-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleOpenDialog(template)}
                  >
                    <Pencil className="h-4 w-4 mr-2" />
                    Bearbeiten
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDeleteTemplate(template.id)}
                  >
                    <Trash className="h-4 w-4 mr-2" />
                    Löschen
                  </Button>
                </CardFooter>
              </Card>
            ))
          )}
        </div>

        {/* Edit Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>
                {editingTemplate ? 'E-Mail-Vorlage bearbeiten' : 'Neue E-Mail-Vorlage'}
              </DialogTitle>
            </DialogHeader>
            
            <ScrollArea className="max-h-[70vh]">
              <div className="space-y-4 py-2 px-1">
                <div className="grid gap-2">
                  <Label htmlFor="title">Titel</Label>
                  <Input
                    id="title"
                    value={formData.title || ''}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Titel der Vorlage"
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="category">Kategorie</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value as EmailTemplate['category'] })}
                  >
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Kategorie auswählen" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(categoryLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="subject">Betreff</Label>
                  <Input
                    id="subject"
                    value={formData.subject || ''}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    placeholder="Betreff der E-Mail"
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="content">Inhalt</Label>
                  <Textarea
                    id="content"
                    value={formData.content || ''}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Inhalt der E-Mail"
                    rows={10}
                  />
                  <p className="text-xs text-muted-foreground">
                    Verwenden Sie Platzhalter wie {'{{'}}customerName{{'}}'} oder {'{{'}}caseId{{'}}'}, um dynamische Inhalte einzufügen.
                  </p>
                </div>
                
                <div className="grid gap-2">
                  <Label>Platzhalter</Label>
                  <div className="flex gap-2">
                    <Input
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Neuen Platzhalter hinzufügen"
                    />
                    <Button type="button" onClick={handleAddTag}>
                      Hinzufügen
                    </Button>
                  </div>
                  
                  {formData.tags && formData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.tags.map(tag => (
                        <span 
                          key={tag} 
                          className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-primary/10 text-primary"
                        >
                          {tag}
                          <button 
                            type="button" 
                            className="ml-1 text-primary hover:text-primary/70"
                            onClick={() => handleRemoveTag(tag)}
                          >
                            &times;
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
                
                <div className="bg-blue-50 dark:bg-blue-950/50 p-3 rounded-md">
                  <div className="flex gap-2 items-start">
                    <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                    <div className="text-sm">
                      <p className="font-medium text-blue-700 dark:text-blue-300">Verfügbare Platzhalter</p>
                      <ul className="mt-1 space-y-1 text-blue-600 dark:text-blue-400">
                        <li><strong>{{'{{'}}customerName{{'}}'}}</strong> - Name des Kunden</li>
                        <li><strong>{{'{{'}}caseId{{'}}'}}</strong> - Vorgangsnummer</li>
                        <li><strong>{{'{{'}}caseTitle{{'}}'}}</strong> - Titel des Vorgangs</li>
                        <li><strong>{{'{{'}}caseDescription{{'}}'}}</strong> - Beschreibung des Vorgangs</li>
                        <li><strong>{{'{{'}}userName{{'}}'}}</strong> - Ihr Name</li>
                        <li><strong>{{'{{'}}userEmail{{'}}'}}</strong> - Ihre E-Mail-Adresse</li>
                        <li><strong>{{'{{'}}userPhone{{'}}'}}</strong> - Ihre Telefonnummer</li>
                        <li><strong>{{'{{'}}userDepartment{{'}}'}}</strong> - Ihre Abteilung</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>
            
            <DialogFooter>
              <Button variant="outline" onClick={handleCloseDialog}>
                Abbrechen
              </Button>
              <Button onClick={handleSubmit}>
                {editingTemplate ? 'Speichern' : 'Erstellen'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
};

export default EmailTemplates;
