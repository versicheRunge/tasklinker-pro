import React, { useState } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { cases } from '../data/mockData';
import { CheckSquare, PlusCircle, Edit2, Trash, Save, ChevronDown, ChevronRight, Plus } from 'lucide-react';
import { toast } from "../hooks/use-toast";
import { useUser } from '../contexts/UserContext';
import { ChecklistItemType, CaseType, SubChecklistItem } from '../types/case';

const Checklists: React.FC = () => {
  const { isAdmin } = useUser();
  
  // Group all checklists by type
  const initialTemplates = [
    {
      id: 'template-1',
      title: 'Schadenmeldung',
      type: 'damage' as CaseType,
      items: cases.find(c => c.type === 'damage')?.checklist || []
    },
    {
      id: 'template-2',
      title: 'eVB-Anfrage',
      type: 'evb' as CaseType,
      items: cases.find(c => c.type === 'evb')?.checklist || []
    },
    {
      id: 'template-3',
      title: 'Vertragsänderung',
      type: 'contract_change' as CaseType,
      items: cases.find(c => c.type === 'contract_change')?.checklist || []
    },
    {
      id: 'template-4',
      title: 'Kundenanfrage',
      type: 'inquiry' as CaseType,
      items: cases.find(c => c.type === 'inquiry')?.checklist || []
    }
  ];

  const [checklistTemplates, setChecklistTemplates] = useState(initialTemplates);
  const [selectedTemplate, setSelectedTemplate] = useState(checklistTemplates[0]);
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
  const [isCustomType, setIsCustomType] = useState(false);
  const [customType, setCustomType] = useState('');

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

  const handleSaveItem = () => {
    if (editingItemIndex === null) return;
    
    const updatedTemplates = checklistTemplates.map(template => {
      if (template.id === selectedTemplate.id) {
        const updatedItems = [...template.items];
        updatedItems[editingItemIndex] = {
          ...updatedItems[editingItemIndex],
          text: editingText,
          description: editingDescription || undefined
        };
        return { ...template, items: updatedItems };
      }
      return template;
    });
    
    setChecklistTemplates(updatedTemplates);
    setSelectedTemplate(updatedTemplates.find(t => t.id === selectedTemplate.id)!);
    setEditingItemIndex(null);
    setEditingText('');
    setEditingDescription('');
    
    toast({
      title: "Checkliste aktualisiert",
      description: "Der Eintrag wurde erfolgreich gespeichert."
    });
  };

  const handleDeleteItem = (index: number) => {
    if (!isAdmin) return;
    
    const updatedTemplates = checklistTemplates.map(template => {
      if (template.id === selectedTemplate.id) {
        const updatedItems = template.items.filter((_, i) => i !== index);
        return { ...template, items: updatedItems };
      }
      return template;
    });
    
    setChecklistTemplates(updatedTemplates);
    setSelectedTemplate(updatedTemplates.find(t => t.id === selectedTemplate.id)!);
    
    toast({
      title: "Eintrag gelöscht",
      description: "Der Eintrag wurde erfolgreich aus der Checkliste entfernt."
    });
  };

  const handleAddItem = () => {
    if (!newItemText.trim()) return;
    
    const newItem: ChecklistItemType = {
      text: newItemText,
      description: newItemDescription || undefined,
      completed: false,
      subItems: []
    };
    
    const updatedTemplates = checklistTemplates.map(template => {
      if (template.id === selectedTemplate.id) {
        return { ...template, items: [...template.items, newItem] };
      }
      return template;
    });
    
    setChecklistTemplates(updatedTemplates);
    setSelectedTemplate(updatedTemplates.find(t => t.id === selectedTemplate.id)!);
    setNewItemText('');
    setNewItemDescription('');
    setIsAddingItem(false);
    
    toast({
      title: "Eintrag hinzugefügt",
      description: "Der neue Eintrag wurde erfolgreich zur Checkliste hinzugefügt."
    });
  };

  const handleAddTemplate = () => {
    if (!newTemplate.title.trim()) {
      toast({
        title: "Fehler",
        description: "Bitte geben Sie einen Titel für die Checkliste ein.",
        variant: "destructive"
      });
      return;
    }

    let typeValue: CaseType;
    if (isCustomType) {
      if (!customType.trim()) {
        toast({
          title: "Fehler",
          description: "Bitte geben Sie einen Typ für die Checkliste ein.",
          variant: "destructive"
        });
        return;
      }
      typeValue = customType.trim();
    } else {
      typeValue = newTemplate.type;
    }

    const newTemplateId = `template-${Date.now()}`;
    const newChecklistTemplate = {
      id: newTemplateId,
      title: newTemplate.title,
      type: typeValue,
      items: []
    };

    setChecklistTemplates(prev => [...prev, newChecklistTemplate]);
    setSelectedTemplate(newChecklistTemplate);
    setIsAddingTemplate(false);
    setNewTemplate({
      title: '',
      type: ''
    });
    setIsCustomType(false);
    setCustomType('');

    toast({
      title: "Checkliste erstellt",
      description: "Die neue Checkliste wurde erfolgreich erstellt."
    });
  };

  const handleEditSubItem = (parentIndex: number, subIndex: number) => {
    if (!isAdmin) return;
    
    const subItem = selectedTemplate.items[parentIndex].subItems?.[subIndex];
    if (subItem) {
      setEditingSubItem({ parentIndex, subIndex });
      setEditingSubItemText(subItem.text);
    }
  };

  const handleSaveSubItem = () => {
    if (!editingSubItem) return;
    
    const updatedTemplates = checklistTemplates.map(template => {
      if (template.id === selectedTemplate.id) {
        const updatedItems = [...template.items];
        const parentItem = {...updatedItems[editingSubItem.parentIndex]};
        const subItems = [...(parentItem.subItems || [])];
        
        subItems[editingSubItem.subIndex] = {
          ...subItems[editingSubItem.subIndex],
          text: editingSubItemText
        };
        
        parentItem.subItems = subItems;
        updatedItems[editingSubItem.parentIndex] = parentItem;
        
        return { ...template, items: updatedItems };
      }
      return template;
    });
    
    setChecklistTemplates(updatedTemplates);
    setSelectedTemplate(updatedTemplates.find(t => t.id === selectedTemplate.id)!);
    setEditingSubItem(null);
    setEditingSubItemText('');
    
    toast({
      title: "Unterpunkt aktualisiert",
      description: "Der Unterpunkt wurde erfolgreich gespeichert."
    });
  };

  const handleDeleteSubItem = (parentIndex: number, subIndex: number) => {
    if (!isAdmin) return;
    
    const updatedTemplates = checklistTemplates.map(template => {
      if (template.id === selectedTemplate.id) {
        const updatedItems = [...template.items];
        const parentItem = {...updatedItems[parentIndex]};
        
        if (parentItem.subItems) {
          parentItem.subItems = parentItem.subItems.filter((_, i) => i !== subIndex);
          updatedItems[parentIndex] = parentItem;
        }
        
        return { ...template, items: updatedItems };
      }
      return template;
    });
    
    setChecklistTemplates(updatedTemplates);
    setSelectedTemplate(updatedTemplates.find(t => t.id === selectedTemplate.id)!);
    
    toast({
      title: "Unterpunkt gelöscht",
      description: "Der Unterpunkt wurde erfolgreich entfernt."
    });
  };

  const handleAddSubItem = (parentIndex: number) => {
    if (!newSubItemText.trim()) return;
    
    const newSubItem: SubChecklistItem = {
      text: newSubItemText,
      completed: false
    };
    
    const updatedTemplates = checklistTemplates.map(template => {
      if (template.id === selectedTemplate.id) {
        const updatedItems = [...template.items];
        const parentItem = {...updatedItems[parentIndex]};
        
        parentItem.subItems = [...(parentItem.subItems || []), newSubItem];
        updatedItems[parentIndex] = parentItem;
        
        return { ...template, items: updatedItems };
      }
      return template;
    });
    
    setChecklistTemplates(updatedTemplates);
    setSelectedTemplate(updatedTemplates.find(t => t.id === selectedTemplate.id)!);
    setIsAddingSubItem(null);
    setNewSubItemText('');
    
    toast({
      title: "Unterpunkt hinzugefügt",
      description: "Der neue Unterpunkt wurde erfolgreich hinzugefügt."
    });
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
                  {!isCustomType ? (
                    <>
                      <select
                        id="templateType"
                        className="w-full p-2 rounded-md border border-input"
                        value={newTemplate.type}
                        onChange={(e) => setNewTemplate({...newTemplate, type: e.target.value as CaseType})}
                      >
                        <option value="">Bitte wählen</option>
                        <option value="damage">Schadenmeldung</option>
                        <option value="evb">eVB-Anfrage</option>
                        <option value="contract_change">Vertragsänderung</option>
                        <option value="inquiry">Kundenanfrage</option>
                        <option value="other">Sonstiges</option>
                      </select>
                      <div className="mt-2">
                        <button 
                          type="button" 
                          className="text-primary text-sm hover:underline"
                          onClick={() => setIsCustomType(true)}
                        >
                          + Eigenen Typ hinzufügen
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <input
                        id="customType"
                        type="text"
                        className="w-full p-2 rounded-md border border-input"
                        value={customType}
                        onChange={(e) => setCustomType(e.target.value)}
                        placeholder="Eigener Vorgangstyp"
                      />
                      <div className="mt-2">
                        <button 
                          type="button" 
                          className="text-muted-foreground text-sm hover:underline"
                          onClick={() => {
                            setIsCustomType(false);
                            setCustomType('');
                          }}
                        >
                          Zurück zu Standard-Typen
                        </button>
                      </div>
                    </>
                  )}
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
          ) : (
            <div className="bg-card rounded-xl border border-border p-6 animate-fade-in">
              <div className="mb-6">
                <h2 className="text-xl font-semibold">{selectedTemplate.title}</h2>
                <p className="text-muted-foreground text-sm">
                  Standard-Checkliste für {selectedTemplate.title} Vorgänge
                </p>
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
    </AppLayout>
  );
};

export default Checklists;
