
import React, { useState } from 'react';
import { ArrowUp, ArrowDown, Plus, Pencil, Trash2, Search } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { Input } from "../ui/input";
import { toast } from "../../hooks/use-toast";
import { useEmailTemplates, EmailTemplate } from '../../hooks/useEmailTemplates';

export const EmailTemplatesManager: React.FC = () => {
  const { templates, isLoading, categories, placeholders, addTemplate, updateTemplate, deleteTemplate, moveTemplate } = useEmailTemplates();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState<EmailTemplate | null>(null);
  const [newTemplate, setNewTemplate] = useState({ name: '', subject: '', body: '', category: 'damage' });

  const filteredTemplates = templates
    .filter(t => {
      const matchCat = selectedCategory === 'all' || t.category === selectedCategory;
      const q = searchTerm.toLowerCase();
      const matchSearch = !q || t.name.toLowerCase().includes(q) || t.subject.toLowerCase().includes(q) || t.body.toLowerCase().includes(q);
      return matchCat && matchSearch;
    })
    .sort((a, b) => a.order - b.order);

  const handleSaveEdit = async () => {
    if (!currentTemplate?.name.trim() || !currentTemplate?.subject.trim()) {
      toast({ title: 'Fehler', description: 'Name und Betreff sind Pflichtfelder.', variant: 'destructive' }); return;
    }
    await updateTemplate(currentTemplate.id, currentTemplate);
    setIsEditDialogOpen(false);
    toast({ title: 'Vorlage aktualisiert' });
  };

  const handleCreateTemplate = async () => {
    if (!newTemplate.name.trim() || !newTemplate.subject.trim()) {
      toast({ title: 'Fehler', description: 'Name und Betreff sind Pflichtfelder.', variant: 'destructive' }); return;
    }
    await addTemplate(newTemplate);
    setIsCreateDialogOpen(false);
    setNewTemplate({ name: '', subject: '', body: '', category: 'damage' });
    toast({ title: 'Vorlage erstellt' });
  };

  if (isLoading) return <div className="text-center py-8 text-muted-foreground">Lade Vorlagen…</div>;

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-3 justify-between mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Vorlagen durchsuchen..." className="pl-9" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
        <div className="flex gap-2">
          <select className="px-3 py-2 rounded-md border border-input bg-background text-sm" value={selectedCategory} onChange={e => setSelectedCategory(e.target.value)}>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors" onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="w-4 h-4" /><span>Neue Vorlage</span>
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {filteredTemplates.length === 0
          ? <div className="text-center py-8 text-muted-foreground">Keine Vorlagen gefunden.</div>
          : filteredTemplates.map((t, i) => (
            <div key={t.id} className="p-4 border border-border rounded-lg bg-card">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{t.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{categories.find(c => c.id === t.category)?.name}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button className="p-1.5 text-muted-foreground hover:text-foreground rounded-md hover:bg-muted transition-colors" onClick={() => moveTemplate(t.id, 'up')} disabled={i === 0}><ArrowUp className="w-4 h-4" /></button>
                  <button className="p-1.5 text-muted-foreground hover:text-foreground rounded-md hover:bg-muted transition-colors" onClick={() => moveTemplate(t.id, 'down')} disabled={i === filteredTemplates.length - 1}><ArrowDown className="w-4 h-4" /></button>
                  <button className="p-1.5 text-muted-foreground hover:text-foreground rounded-md hover:bg-muted transition-colors" onClick={() => { setCurrentTemplate({ ...t }); setIsEditDialogOpen(true); }}><Pencil className="w-4 h-4" /></button>
                  <button className="p-1.5 text-muted-foreground hover:text-destructive rounded-md hover:bg-muted transition-colors" onClick={async () => { await deleteTemplate(t.id); toast({ title: 'Vorlage gelöscht' }); }}><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-border">
                <p className="text-sm font-medium">Betreff:</p>
                <p className="text-sm">{t.subject}</p>
              </div>
              <div className="mt-2">
                <p className="text-sm font-medium">Text:</p>
                <p className="text-sm line-clamp-3">{t.body}</p>
              </div>
            </div>
          ))
        }
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[625px] max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Vorlage bearbeiten</DialogTitle></DialogHeader>
          {currentTemplate && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Name</label>
                  <Input value={currentTemplate.name} onChange={e => setCurrentTemplate({ ...currentTemplate, name: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Kategorie</label>
                  <select className="w-full px-3 py-2 rounded-md border border-input bg-background" value={currentTemplate.category} onChange={e => setCurrentTemplate({ ...currentTemplate, category: e.target.value })}>
                    {categories.filter(c => c.id !== 'all').map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Betreff</label>
                <Input value={currentTemplate.subject} onChange={e => setCurrentTemplate({ ...currentTemplate, subject: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Text</label>
                <textarea className="w-full px-3 py-2 rounded-md border border-input bg-background resize-y min-h-[150px]" rows={8} value={currentTemplate.body} onChange={e => setCurrentTemplate({ ...currentTemplate, body: e.target.value })} />
              </div>
              <div className="pt-3 border-t border-border">
                <h4 className="text-sm font-medium mb-2">Platzhalter:</h4>
                <div className="flex flex-wrap gap-2">{placeholders.map((p, i) => <div key={i} className="text-xs bg-muted px-2 py-1 rounded-md">{p}</div>)}</div>
              </div>
            </div>
          )}
          <DialogFooter>
            <button className="px-4 py-2 rounded-lg border border-input hover:bg-muted transition-colors" onClick={() => setIsEditDialogOpen(false)}>Abbrechen</button>
            <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors" onClick={handleSaveEdit}>Speichern</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[625px] max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Neue Vorlage erstellen</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Name</label>
                <Input value={newTemplate.name} onChange={e => setNewTemplate({ ...newTemplate, name: e.target.value })} placeholder="Name der Vorlage" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Kategorie</label>
                <select className="w-full px-3 py-2 rounded-md border border-input bg-background" value={newTemplate.category} onChange={e => setNewTemplate({ ...newTemplate, category: e.target.value })}>
                  {categories.filter(c => c.id !== 'all').map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Betreff</label>
              <Input value={newTemplate.subject} onChange={e => setNewTemplate({ ...newTemplate, subject: e.target.value })} placeholder="Betreff der E-Mail" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Text</label>
              <textarea className="w-full px-3 py-2 rounded-md border border-input bg-background resize-y min-h-[150px]" rows={8} value={newTemplate.body} onChange={e => setNewTemplate({ ...newTemplate, body: e.target.value })} placeholder="Text der E-Mail-Vorlage" />
            </div>
            <div className="pt-3 border-t border-border">
              <h4 className="text-sm font-medium mb-2">Platzhalter:</h4>
              <div className="flex flex-wrap gap-2">{placeholders.map((p, i) => <div key={i} className="text-xs bg-muted px-2 py-1 rounded-md">{p}</div>)}</div>
            </div>
          </div>
          <DialogFooter>
            <button className="px-4 py-2 rounded-lg border border-input hover:bg-muted transition-colors" onClick={() => setIsCreateDialogOpen(false)}>Abbrechen</button>
            <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors" onClick={handleCreateTemplate}>Erstellen</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmailTemplatesManager;
