
import React, { useState } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { cases } from '../data/mockData';
import { CheckSquare, PlusCircle, Edit2, Trash, Save } from 'lucide-react';
import { toast } from "../hooks/use-toast";
import { useUser } from '../contexts/UserContext';

const Checklists: React.FC = () => {
  const { isAdmin } = useUser();
  
  // Group all checklists by type
  const initialTemplates = [
    {
      id: 'template-1',
      title: 'Schadenmeldung',
      type: 'damage',
      items: cases.find(c => c.type === 'damage')?.checklist || []
    },
    {
      id: 'template-2',
      title: 'eVB-Anfrage',
      type: 'evb',
      items: cases.find(c => c.type === 'evb')?.checklist || []
    },
    {
      id: 'template-3',
      title: 'Vertragsänderung',
      type: 'contract_change',
      items: cases.find(c => c.type === 'contract_change')?.checklist || []
    },
    {
      id: 'template-4',
      title: 'Kundenanfrage',
      type: 'inquiry',
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
    
    const newItem = {
      text: newItemText,
      description: newItemDescription || undefined,
      completed: false
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
            onClick={() => {
              // This would be expanded in a real app to create a new checklist template
              toast({
                title: "Funktion noch nicht verfügbar",
                description: "Diese Funktion wird in einem späteren Update hinzugefügt."
              });
            }}
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
          <div className="bg-card rounded-xl border border-border p-6 animate-fade-in">
            <div className="mb-6">
              <h2 className="text-xl font-semibold">{selectedTemplate.title}</h2>
              <p className="text-muted-foreground text-sm">
                Standard-Checkliste für {selectedTemplate.title} Vorgänge
              </p>
            </div>
            
            <div className="space-y-3">
              {selectedTemplate.items.map((item, index) => (
                <div key={index} className="flex items-start gap-3 p-3 border border-border rounded-lg">
                  {editingItemIndex === index ? (
                    <div className="flex-1">
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
                      <div className="mt-1">
                        <CheckSquare className={`w-5 h-5 ${item.completed ? 'text-primary' : 'text-muted-foreground'}`} />
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
        </div>
      </div>
    </AppLayout>
  );
};

export default Checklists;
