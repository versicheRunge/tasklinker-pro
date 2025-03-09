
import React, { useState, useEffect } from 'react';
import { Edit2, Save, X, Plus } from 'lucide-react';
import { CaseDefaultTitle, CaseType } from '../../types/case';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { toast } from "../../hooks/use-toast";

export const TitleManager: React.FC = () => {
  const [defaultTitles, setDefaultTitles] = useState<CaseDefaultTitle[]>([]);
  const [newDefaultTitle, setNewDefaultTitle] = useState({ title: '', type: 'damage' as CaseType });
  const [editingTitleId, setEditingTitleId] = useState<string | null>(null);
  const [editingTitleText, setEditingTitleText] = useState('');

  // Lade Titel beim Start
  useEffect(() => {
    const storedTitles = localStorage.getItem('defaultTitles');
    if (storedTitles) {
      setDefaultTitles(JSON.parse(storedTitles));
    } else {
      // Initial default titles
      const initialTitles = [
        { id: 'title-1', title: 'Schadenmeldung', type: 'damage' },
        { id: 'title-2', title: 'eVB-Anforderung', type: 'evb' },
        { id: 'title-3', title: 'Rückrufbitte', type: 'inquiry' },
        { id: 'title-4', title: 'Vertragsänderung', type: 'contract_change' }
      ];
      setDefaultTitles(initialTitles);
      localStorage.setItem('defaultTitles', JSON.stringify(initialTitles));
    }
  }, []);

  // Speichere Titel bei Änderungen
  useEffect(() => {
    if (defaultTitles.length > 0) {
      localStorage.setItem('defaultTitles', JSON.stringify(defaultTitles));
    }
  }, [defaultTitles]);

  const handleAddDefaultTitle = () => {
    if (!newDefaultTitle.title.trim()) {
      toast({
        title: "Fehler",
        description: "Bitte geben Sie einen Titel ein.",
        variant: "destructive"
      });
      return;
    }

    const newTitle: CaseDefaultTitle = {
      id: `title-${Date.now()}`,
      title: newDefaultTitle.title,
      type: newDefaultTitle.type
    };

    setDefaultTitles(prev => [...prev, newTitle]);
    setNewDefaultTitle({ title: '', type: 'damage' });

    toast({
      title: "Titel hinzugefügt",
      description: "Der neue Standardtitel wurde erfolgreich hinzugefügt."
    });
  };

  const handleEditDefaultTitle = (id: string) => {
    const title = defaultTitles.find(t => t.id === id);
    if (title) {
      setEditingTitleId(id);
      setEditingTitleText(title.title);
    }
  };

  const handleSaveEditedTitle = () => {
    if (!editingTitleId || !editingTitleText.trim()) return;

    setDefaultTitles(prev => 
      prev.map(title => 
        title.id === editingTitleId 
          ? { ...title, title: editingTitleText }
          : title
      )
    );

    setEditingTitleId(null);
    setEditingTitleText('');

    toast({
      title: "Titel aktualisiert",
      description: "Der Standardtitel wurde erfolgreich aktualisiert."
    });
  };

  const handleDeleteDefaultTitle = (id: string) => {
    setDefaultTitles(prev => prev.filter(title => title.id !== id));

    toast({
      title: "Titel gelöscht",
      description: "Der Standardtitel wurde erfolgreich gelöscht."
    });
  };

  // Funktion zum Übersetzen der Vorgangstypen
  const translateCaseType = (type: string): string => {
    switch (type) {
      case 'damage': return 'Schadenmeldung';
      case 'evb': return 'eVB-Anfrage';
      case 'contract_change': return 'Vertragsänderung';
      case 'inquiry': return 'Kundenanfrage';
      default: return type;
    }
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <h2 className="text-xl font-bold mb-4">Standardtitel verwalten</h2>
      <p className="text-muted-foreground mb-6">
        Hier können Sie Standardtitel für neue Vorgänge hinzufügen, bearbeiten oder löschen.
      </p>

      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-medium mb-2">Bestehende Titel</h3>
          <div className="space-y-2 max-h-[300px] overflow-y-auto mb-4">
            {defaultTitles.length > 0 ? (
              defaultTitles.map(title => (
                <div key={title.id} className="flex items-center justify-between p-2 border rounded-md">
                  {editingTitleId === title.id ? (
                    <input
                      type="text"
                      className="flex-1 p-1 border rounded mr-2"
                      value={editingTitleText}
                      onChange={(e) => setEditingTitleText(e.target.value)}
                      autoFocus
                    />
                  ) : (
                    <span className="flex-1">{title.title}</span>
                  )}
                  <div className="flex items-center gap-1">
                    <Badge variant="outline" className="mr-2 border-amber-500 text-amber-500">
                      {translateCaseType(title.type)}
                    </Badge>
                    
                    {editingTitleId === title.id ? (
                      <>
                        <button 
                          onClick={handleSaveEditedTitle}
                          className="p-1 text-green-600 hover:text-green-800"
                        >
                          <Save className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => {
                            setEditingTitleId(null);
                            setEditingTitleText('');
                          }}
                          className="p-1 text-gray-500 hover:text-gray-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button 
                          onClick={() => handleEditDefaultTitle(title.id)}
                          className="p-1 text-blue-600 hover:text-blue-800"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteDefaultTitle(title.id)}
                          className="p-1 text-red-600 hover:text-red-800"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-center py-4">Keine Standardtitel vorhanden.</p>
            )}
          </div>
        </div>

        <div className="bg-muted/30 p-4 rounded-md">
          <h3 className="text-sm font-medium mb-3">Neuen Titel hinzufügen</h3>
          <div className="space-y-3">
            <div>
              <input
                type="text"
                className="w-full p-2 rounded-md border"
                value={newDefaultTitle.title}
                onChange={(e) => setNewDefaultTitle({...newDefaultTitle, title: e.target.value})}
                placeholder="Titelbeschreibung"
              />
            </div>
            <div>
              <select
                className="w-full p-2 rounded-md border"
                value={newDefaultTitle.type}
                onChange={(e) => setNewDefaultTitle({...newDefaultTitle, type: e.target.value as CaseType})}
              >
                <option value="damage">Schadenmeldung</option>
                <option value="evb">eVB-Anfrage</option>
                <option value="contract_change">Vertragsänderung</option>
                <option value="inquiry">Kundenanfrage</option>
                <option value="other">Sonstiges</option>
              </select>
            </div>
            <Button onClick={handleAddDefaultTitle} className="w-full">
              <Plus className="w-4 h-4 mr-2" />
              Hinzufügen
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
