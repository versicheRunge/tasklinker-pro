
import React, { useState, useEffect } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { CheckSquare, PlusCircle, Edit2, Trash, Save, ChevronDown, ChevronRight, Plus, AlertTriangle } from 'lucide-react';
import { toast } from "../hooks/use-toast";
import { useUser } from '../contexts/UserContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { ChecklistItemType, CaseType, SubChecklistItem, CASE_TYPE_LABELS } from '../types/case';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from "../components/ui/dialog";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";

const Checklists: React.FC = () => {
  const { isAdmin } = useUser();
  const { profile } = useAuth();
  const [checklistTemplates, setChecklistTemplates] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<any | null>(null);
  const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);
  const [editingText, setEditingText] = useState('');
  const [editingDescription, setEditingDescription] = useState('');
  const [newItemText, setNewItemText] = useState('');
  const [newItemDescription, setNewItemDescription] = useState('');
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [isAddingTemplate, setIsAddingTemplate] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    title: '',
    type: '' as CaseType
  });
  const [expandedItems, setExpandedItems] = useState<number[]>([]);
  const [editingSubItem, setEditingSubItem] = useState<{parentIndex: number, subIndex: number} | null>(null);
  const [editingSubItemText, setEditingSubItemText] = useState('');
  const [isAddingSubItem, setIsAddingSubItem] = useState<number | null>(null);
  const [newSubItemText, setNewSubItemText] = useState('');
  const [isEditingTemplate, setIsEditingTemplate] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<{
    id: string;
    title: string;
    type: CaseType | string;
  }>({ id: '', title: '', type: '' });
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null);

  const loadTemplates = async () => {
    const { data } = await supabase.from('checklist_templates').select('*').order('created_at');
    if (data) {
      setChecklistTemplates(data);
      if (!selectedTemplate && data.length > 0) setSelectedTemplate(data[0]);
    }
  };

  useEffect(() => { if (profile) loadTemplates(); }, [profile]);

  const toggleItemExpanded = (index: number) => {
    setExpandedItems(prev => {
      if (prev.includes(index)) {
        return prev.filter(i => i !== index);
      } else {
        return [...prev, index];
      }
    });
  };

  const handleEditItem = (index: number) => {
    if (!isAdmin) return;
    
    const item = selectedTemplate.items[index];
    setEditingItemIndex(index);
    setEditingText(item.text);
    setEditingDescription(item.description || '');
  };

  const saveTemplateItems = async (items: any[]) => {
    if (!selectedTemplate) return;
    const { error } = await supabase.from('checklist_templates').update({ items }).eq('id', selectedTemplate.id);
    if (error) { toast({ title: 'Fehler', description: error.message, variant: 'destructive' }); return; }
    await loadTemplates();
    const fresh = await supabase.from('checklist_templates').select('*').eq('id', selectedTemplate.id).single();
    if (fresh.data) setSelectedTemplate(fresh.data);
  };

  const handleSaveItem = async () => {
    if (editingItemIndex === null || !selectedTemplate) return;
    const updatedItems = [...selectedTemplate.items];
    updatedItems[editingItemIndex] = { ...updatedItems[editingItemIndex], text: editingText, description: editingDescription || undefined };
    await saveTemplateItems(updatedItems);
    setEditingItemIndex(null); setEditingText(''); setEditingDescription('');
    toast({ title: 'Checkliste aktualisiert', description: 'Eintrag gespeichert.' });
  };

  const handleDeleteItem = async (index: number) => {
    if (!isAdmin || !selectedTemplate) return;
    const updatedItems = selectedTemplate.items.filter((_: any, i: number) => i !== index);
    await saveTemplateItems(updatedItems);
    toast({ title: 'Eintrag gelöscht' });
  };

  const handleAddItem = async () => {
    if (!newItemText.trim() || !selectedTemplate) return;
    const newItem: ChecklistItemType = { text: newItemText, description: newItemDescription || undefined, completed: false, subItems: [] };
    await saveTemplateItems([...selectedTemplate.items, newItem]);
    setNewItemText(''); setNewItemDescription(''); setIsAddingItem(false);
    toast({ title: 'Eintrag hinzugefügt' });
  };

  const handleAddTemplate = async () => {
    if (!newTemplate.title.trim()) { toast({ title: 'Fehler', description: 'Titel eingeben.', variant: 'destructive' }); return; }
    if (!newTemplate.type) { toast({ title: 'Fehler', description: 'Typ auswählen.', variant: 'destructive' }); return; }
    const { data, error } = await supabase.from('checklist_templates').insert({
      title: newTemplate.title, type: newTemplate.type, items: [], created_by: profile?.id,
    }).select().single();
    if (error || !data) { toast({ title: 'Fehler', description: error?.message, variant: 'destructive' }); return; }
    setIsAddingTemplate(false); setNewTemplate({ title: '', type: '' as CaseType });
    await loadTemplates();
    setSelectedTemplate(data);
    toast({ title: 'Checkliste erstellt' });
  };

  const handleEditSubItem = (parentIndex: number, subIndex: number) => {
    if (!isAdmin) return;
    
    const subItem = selectedTemplate.items[parentIndex].subItems?.[subIndex];
    if (subItem) {
      setEditingSubItem({ parentIndex, subIndex });
      setEditingSubItemText(subItem.text);
    }
  };

  const handleSaveSubItem = async () => {
    if (!editingSubItem || !selectedTemplate) return;
    const updatedItems = [...selectedTemplate.items];
    const parentItem = { ...updatedItems[editingSubItem.parentIndex] };
    const subItems = [...(parentItem.subItems || [])];
    subItems[editingSubItem.subIndex] = { ...subItems[editingSubItem.subIndex], text: editingSubItemText };
    parentItem.subItems = subItems;
    updatedItems[editingSubItem.parentIndex] = parentItem;
    await saveTemplateItems(updatedItems);
    setEditingSubItem(null); setEditingSubItemText('');
    toast({ title: 'Unterpunkt aktualisiert' });
  };

  const handleDeleteSubItem = async (parentIndex: number, subIndex: number) => {
    if (!isAdmin || !selectedTemplate) return;
    const updatedItems = [...selectedTemplate.items];
    const parentItem = { ...updatedItems[parentIndex] };
    if (parentItem.subItems) { parentItem.subItems = parentItem.subItems.filter((_: any, i: number) => i !== subIndex); }
    updatedItems[parentIndex] = parentItem;
    await saveTemplateItems(updatedItems);
    toast({ title: 'Unterpunkt gelöscht' });
  };

  const handleAddSubItem = async (parentIndex: number) => {
    if (!newSubItemText.trim() || !selectedTemplate) return;
    const updatedItems = [...selectedTemplate.items];
    const parentItem = { ...updatedItems[parentIndex] };
    parentItem.subItems = [...(parentItem.subItems || []), { text: newSubItemText, completed: false }];
    updatedItems[parentIndex] = parentItem;
    await saveTemplateItems(updatedItems);
    setIsAddingSubItem(null); setNewSubItemText('');
    toast({ title: 'Unterpunkt hinzugefügt' });
  };

  const handleOpenEditDialog = () => {
    if (!selectedTemplate || !isAdmin) return;
    
    setEditingTemplate({
      id: selectedTemplate.id,
      title: selectedTemplate.title,
      type: selectedTemplate.type
    });
    setIsEditingTemplate(true);
  };

  const handleSaveTemplateEdit = async () => {
    if (!editingTemplate.title.trim()) { toast({ title: 'Fehler', description: 'Titel eingeben.', variant: 'destructive' }); return; }
    const { error } = await supabase.from('checklist_templates').update({ title: editingTemplate.title }).eq('id', editingTemplate.id);
    if (error) { toast({ title: 'Fehler', description: error.message, variant: 'destructive' }); return; }
    setIsEditingTemplate(false);
    await loadTemplates();
    const fresh = await supabase.from('checklist_templates').select('*').eq('id', editingTemplate.id).single();
    if (fresh.data) setSelectedTemplate(fresh.data);
    toast({ title: 'Checkliste aktualisiert' });
  };

  const handleOpenDeleteDialog = () => {
    if (!selectedTemplate || !isAdmin) return;
    setTemplateToDelete(selectedTemplate.id);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteTemplate = async () => {
    if (!templateToDelete) return;
    const { error } = await supabase.from('checklist_templates').delete().eq('id', templateToDelete);
    if (error) { toast({ title: 'Fehler', description: error.message, variant: 'destructive' }); return; }
    setTemplateToDelete(null); setIsDeleteDialogOpen(false);
    const remaining = checklistTemplates.filter(t => t.id !== templateToDelete);
    setSelectedTemplate(remaining.length > 0 ? remaining[0] : null);
    await loadTemplates();
    toast({ title: 'Checkliste gelöscht' });
  };

  return (
    <AppLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Checklisten</h1>
          <p className="text-muted-foreground">Standard-Checklisten für verschiedene Vorgangsarten.</p>
        </div>
        {isAdmin && (
          <button 
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            onClick={() => setIsAddingTemplate(true)}
          >
            <PlusCircle className="w-4 h-4" />
            <span>Neue Checkliste</span>
          </button>
        )}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-card rounded-xl border border-border p-4 sticky top-20">
            <h2 className="text-lg font-medium mb-4">Vorlagen</h2>
            <div className="space-y-2">
              {checklistTemplates.map(template => (
                <button
                  key={template.id}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg text-sm font-medium text-left transition-colors ${
                    selectedTemplate.id === template.id
                      ? 'bg-primary/10 text-primary'
                      : 'hover:bg-muted/70'
                  }`}
                  onClick={() => setSelectedTemplate(template)}
                >
                  <CheckSquare className="w-5 h-5" />
                  <span>{template.title}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
        
        <div className="lg:col-span-3">
          {isAddingTemplate ? (
            <div className="bg-card rounded-xl border border-border p-6 animate-fade-in">
              <h2 className="text-xl font-semibold mb-4">Neue Checkliste erstellen</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="templateTitle">
                    Titel
                  </label>
                  <input
                    id="templateTitle"
                    type="text"
                    className="w-full p-2 rounded-md border border-input"
                    value={newTemplate.title}
                    onChange={(e) => setNewTemplate({...newTemplate, title: e.target.value})}
                    placeholder="Titel der Checkliste"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1" htmlFor="templateType">
                    Vorgangstyp
                  </label>
                  <select
                    id="templateType"
                    className="w-full p-2 rounded-md border border-input"
                    value={newTemplate.type}
                    onChange={(e) => setNewTemplate({...newTemplate, type: e.target.value as CaseType})}
                  >
                    <option value="">Bitte wählen</option>
                    {(Object.entries(CASE_TYPE_LABELS) as [CaseType, string][]).map(([val, label]) => (
                      <option key={val} value={val}>{label}</option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    className="px-4 py-2 rounded-lg border border-input hover:bg-muted/50 transition-colors"
                    onClick={() => {
                      setIsAddingTemplate(false);
                      setIsCustomType(false);
                      setCustomType('');
                    }}
                  >
                    Abbrechen
                  </button>
                  <button
                    className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                    onClick={handleAddTemplate}
                  >
                    Checkliste erstellen
                  </button>
                </div>
              </div>
            </div>
          ) : !selectedTemplate ? (
            <div className="bg-card rounded-xl border border-border p-12 text-center text-muted-foreground">
              {isAdmin ? 'Keine Checklisten vorhanden. Erstellen Sie eine neue mit dem Button oben rechts.' : 'Keine Checklisten vorhanden.'}
            </div>
          ) : (
            <div className="bg-card rounded-xl border border-border p-6 animate-fade-in">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-semibold">{selectedTemplate.title}</h2>
                  <p className="text-muted-foreground text-sm">
                    Standard-Checkliste für {selectedTemplate.title} Vorgänge
                  </p>
                </div>
                {isAdmin && (
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex items-center gap-1"
                      onClick={handleOpenEditDialog}
                    >
                      <Edit2 className="h-4 w-4" />
                      <span>Bearbeiten</span>
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      className="flex items-center gap-1"
                      onClick={handleOpenDeleteDialog}
                    >
                      <Trash className="h-4 w-4" />
                      <span>Löschen</span>
                    </Button>
                  </div>
                )}
              </div>
              
              <div className="space-y-3">
                {selectedTemplate.items.map((item, index) => (
                  <div key={index} className="border border-border rounded-lg">
                    {editingItemIndex === index ? (
                      <div className="p-4">
                        <input
                          type="text"
                          className="w-full p-2 mb-2 rounded-md border border-input"
                          value={editingText}
                          onChange={(e) => setEditingText(e.target.value)}
                          placeholder="Aufgabentext"
                        />
                        <textarea
                          className="w-full p-2 rounded-md border border-input resize-none"
                          value={editingDescription}
                          onChange={(e) => setEditingDescription(e.target.value)}
                          placeholder="Beschreibung (optional)"
                          rows={2}
                        />
                        <div className="flex justify-end mt-2">
                          <button 
                            className="flex items-center gap-1 px-3 py-1 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm"
                            onClick={handleSaveItem}
                          >
                            <Save className="w-4 h-4" />
                            <span>Speichern</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-start p-4">
                          <div 
                            className="mt-1 mr-2 cursor-pointer" 
                            onClick={() => toggleItemExpanded(index)}
                          >
                            {item.subItems && item.subItems.length > 0 ? (
                              expandedItems.includes(index) ? (
                                <ChevronDown className="w-5 h-5 text-muted-foreground" />
                              ) : (
                                <ChevronRight className="w-5 h-5 text-muted-foreground" />
                              )
                            ) : (
                              <CheckSquare className={`w-5 h-5 ${item.completed ? 'text-primary' : 'text-muted-foreground'}`} />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-start justify-between">
                              <div>
                                <p className="font-medium">{item.text}</p>
                                {item.description && (
                                  <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                                )}
                              </div>
                              {isAdmin && (
                                <div className="flex items-center gap-2">
                                  <button 
                                    className="text-sm text-primary hover:text-primary/70"
                                    onClick={() => handleEditItem(index)}
                                  >
                                    <Edit2 className="w-4 h-4" />
                                  </button>
                                  <button 
                                    className="text-sm text-red-500 hover:text-red-700"
                                    onClick={() => handleDeleteItem(index)}
                                  >
                                    <Trash className="w-4 h-4" />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {expandedItems.includes(index) && item.subItems && (
                          <div className="border-t border-border p-2 pl-10 space-y-2">
                            {item.subItems.map((subItem, subIndex) => (
                              <div key={subIndex} className="flex items-center justify-between p-2 rounded-md hover:bg-muted/30">
                                {editingSubItem && editingSubItem.parentIndex === index && editingSubItem.subIndex === subIndex ? (
                                  <div className="flex-1 flex items-center gap-2">
                                    <input
                                      type="text"
                                      className="flex-1 p-1.5 rounded-md border border-input text-sm"
                                      value={editingSubItemText}
                                      onChange={(e) => setEditingSubItemText(e.target.value)}
                                    />
                                    <button 
                                      className="text-primary hover:text-primary/70"
                                      onClick={handleSaveSubItem}
                                    >
                                      <Save className="w-4 h-4" />
                                    </button>
                                  </div>
                                ) : (
                                  <>
                                    <div className="flex items-center gap-2">
                                      <CheckSquare className={`w-4 h-4 ${subItem.completed ? 'text-primary' : 'text-muted-foreground'}`} />
                                      <span className="text-sm">{subItem.text}</span>
                                    </div>
                                    {isAdmin && (
                                      <div className="flex items-center gap-2">
                                        <button 
                                          className="text-xs text-primary hover:text-primary/70"
                                          onClick={() => handleEditSubItem(index, subIndex)}
                                        >
                                          <Edit2 className="w-3.5 h-3.5" />
                                        </button>
                                        <button 
                                          className="text-xs text-red-500 hover:text-red-700"
                                          onClick={() => handleDeleteSubItem(index, subIndex)}
                                        >
                                          <Trash className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    )}
                                  </>
                                )}
                              </div>
                            ))}
                            
                            {isAddingSubItem === index ? (
                              <div className="flex items-center gap-2 p-2">
                                <input
                                  type="text"
                                  className="flex-1 p-1.5 rounded-md border border-input text-sm"
                                  value={newSubItemText}
                                  onChange={(e) => setNewSubItemText(e.target.value)}
                                  placeholder="Neuer Unterpunkt"
                                />
                                <button 
                                  className="text-primary hover:text-primary/70"
                                  onClick={() => handleAddSubItem(index)}
                                >
                                  <Save className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                              isAdmin && (
                                <button 
                                  className="w-full flex items-center justify-center gap-1 p-2 border border-dashed border-muted-foreground/30 rounded-md text-muted-foreground text-sm hover:border-primary/30 hover:text-primary transition-colors"
                                  onClick={() => setIsAddingSubItem(index)}
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                  <span>Unterpunkt hinzufügen</span>
                                </button>
                              )
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ))}
                
                {isAddingItem ? (
                  <div className="p-4 border border-dashed border-primary/50 rounded-lg">
                    <input
                      type="text"
                      className="w-full p-2 mb-2 rounded-md border border-input"
                      value={newItemText}
                      onChange={(e) => setNewItemText(e.target.value)}
                      placeholder="Neuer Aufgabentext"
                    />
                    <textarea
                      className="w-full p-2 mb-3 rounded-md border border-input resize-none"
                      value={newItemDescription}
                      onChange={(e) => setNewItemDescription(e.target.value)}
                      placeholder="Beschreibung (optional)"
                      rows={2}
                    />
                    <div className="flex justify-between">
                      <button
                        className="px-3 py-1.5 text-muted-foreground rounded-md hover:bg-muted transition-colors text-sm"
                        onClick={() => setIsAddingItem(false)}
                      >
                        Abbrechen
                      </button>
                      <button
                        className="px-3 py-1.5 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors text-sm"
                        onClick={handleAddItem}
                      >
                        Hinzufügen
                      </button>
                    </div>
                  </div>
                ) : (
                  isAdmin && (
                    <button 
                      className="w-full flex items-center justify-center gap-2 p-3 border border-dashed border-muted-foreground/30 rounded-lg text-muted-foreground hover:border-primary/30 hover:text-primary transition-colors"
                      onClick={() => setIsAddingItem(true)}
                    >
                      <PlusCircle className="w-5 h-5" />
                      <span>Schritt hinzufügen</span>
                    </button>
                  )
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      
      <Dialog open={isEditingTemplate} onOpenChange={setIsEditingTemplate}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Checkliste bearbeiten</DialogTitle>
            <DialogDescription>
              Ändern Sie den Titel oder Typ dieser Checkliste.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-template-title">Titel</Label>
              <Input
                id="edit-template-title"
                value={editingTemplate.title}
                onChange={(e) => setEditingTemplate({
                  ...editingTemplate,
                  title: e.target.value
                })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-template-type">Vorgangstyp</Label>
              <Input
                id="edit-template-type"
                value={editingTemplate.type}
                onChange={(e) => setEditingTemplate({
                  ...editingTemplate,
                  type: e.target.value
                })}
                disabled
              />
              <p className="text-xs text-muted-foreground">Der Vorgangstyp kann nicht geändert werden.</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditingTemplate(false)}>
              Abbrechen
            </Button>
            <Button onClick={handleSaveTemplateEdit}>
              Speichern
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Checkliste löschen
            </AlertDialogTitle>
            <AlertDialogDescription>
              Sind Sie sicher, dass Sie diese Checkliste löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={handleDeleteTemplate}
            >
              Löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
};

export default Checklists;
