
import React, { useState, useEffect } from 'react';
import { Edit2, Save, X, Plus, Trash2 } from 'lucide-react';
import { CaseDefaultTitle, CaseType } from '../../types/case';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { toast } from "../../hooks/use-toast";
import { UserBadge } from '../../contexts/UserTypes';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";

export const TitleManager: React.FC = () => {
  const [defaultTitles, setDefaultTitles] = useState<CaseDefaultTitle[]>([]);
  const [newDefaultTitle, setNewDefaultTitle] = useState({ title: '', type: 'damage' as CaseType });
  const [editingTitleId, setEditingTitleId] = useState<string | null>(null);
  const [editingTitleText, setEditingTitleText] = useState('');
  
  // Badge management states
  const [badges, setBadges] = useState<UserBadge[]>([]);
  const [newBadge, setNewBadge] = useState<Omit<UserBadge, 'id'>>({ name: '', icon: '🏆', category: 'achievement' });
  const [isBadgeDialogOpen, setIsBadgeDialogOpen] = useState(false);
  const [editingBadgeId, setEditingBadgeId] = useState<string | null>(null);

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
    
    // Load badges
    const storedBadges = localStorage.getItem('userBadges');
    if (storedBadges) {
      setBadges(JSON.parse(storedBadges));
    } else {
      // Default badges will be loaded from UserTypes.ts
      const availableBadges = getDefaultBadges();
      setBadges(availableBadges);
      localStorage.setItem('userBadges', JSON.stringify(availableBadges));
    }
  }, []);

  // Helper function to get default badges
  const getDefaultBadges = (): UserBadge[] => {
    return [
      // Just a few examples here - the rest come from UserTypes.ts
      { id: 'badge-1', name: 'Top Performer', category: 'achievement', icon: '🏆' },
      { id: 'badge-2', name: 'Kundenmagnet', category: 'achievement', icon: '🧲' },
      { id: 'badge-3', name: 'Problemlöser', category: 'achievement', icon: '🔧' },
    ];
  };

  // Speichere Titel bei Änderungen
  useEffect(() => {
    if (defaultTitles.length > 0) {
      localStorage.setItem('defaultTitles', JSON.stringify(defaultTitles));
    }
  }, [defaultTitles]);
  
  // Save badges when they change
  useEffect(() => {
    if (badges.length > 0) {
      localStorage.setItem('userBadges', JSON.stringify(badges));
    }
  }, [badges]);

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

  // Badge Management Functions
  const handleAddBadge = () => {
    if (!newBadge.name.trim() || !newBadge.icon.trim()) {
      toast({
        title: "Fehler",
        description: "Bitte geben Sie einen Namen und ein Icon für das Badge ein.",
        variant: "destructive"
      });
      return;
    }

    const badgeToAdd: UserBadge = {
      id: `badge-${Date.now()}`,
      name: newBadge.name,
      icon: newBadge.icon,
      category: newBadge.category
    };

    setBadges(prev => [...prev, badgeToAdd]);
    setNewBadge({ name: '', icon: '🏆', category: 'achievement' });
    setIsBadgeDialogOpen(false);

    toast({
      title: "Badge hinzugefügt",
      description: "Das neue Badge wurde erfolgreich hinzugefügt."
    });
  };

  const handleEditBadge = (badge: UserBadge) => {
    setEditingBadgeId(badge.id);
    setNewBadge({
      name: badge.name,
      icon: badge.icon,
      category: badge.category
    });
    setIsBadgeDialogOpen(true);
  };

  const handleSaveEditedBadge = () => {
    if (!editingBadgeId || !newBadge.name.trim() || !newBadge.icon.trim()) return;

    setBadges(prev => 
      prev.map(badge => 
        badge.id === editingBadgeId 
          ? { ...badge, name: newBadge.name, icon: newBadge.icon, category: newBadge.category }
          : badge
      )
    );

    setEditingBadgeId(null);
    setNewBadge({ name: '', icon: '🏆', category: 'achievement' });
    setIsBadgeDialogOpen(false);

    toast({
      title: "Badge aktualisiert",
      description: "Das Badge wurde erfolgreich aktualisiert."
    });
  };

  const handleDeleteBadge = (id: string) => {
    setBadges(prev => prev.filter(badge => badge.id !== id));

    toast({
      title: "Badge gelöscht",
      description: "Das Badge wurde erfolgreich gelöscht."
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
  
  // Translate badge categories
  const translateBadgeCategory = (category: string): string => {
    switch (category) {
      case 'achievement': return 'Leistung';
      case 'skill': return 'Kompetenz';
      case 'tenure': return 'Zugehörigkeit';
      case 'certification': return 'Zertifizierung';
      case 'special': return 'Besondere Auszeichnung';
      default: return category;
    }
  };

  // Badge categories for dropdown
  const badgeCategories = [
    { id: 'achievement', name: 'Leistung' },
    { id: 'skill', name: 'Kompetenz' },
    { id: 'tenure', name: 'Zugehörigkeit' },
    { id: 'certification', name: 'Zertifizierung' },
    { id: 'special', name: 'Besondere Auszeichnung' }
  ];

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
        
        {/* Badge Management Section */}
        <div className="mt-8 pt-8 border-t border-border">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="text-xl font-bold">Mitarbeiter-Badges verwalten</h2>
              <p className="text-muted-foreground">
                Hier können Sie Badges für Mitarbeiter hinzufügen, bearbeiten oder löschen.
              </p>
            </div>
            <Button 
              onClick={() => {
                setEditingBadgeId(null);
                setNewBadge({ name: '', icon: '🏆', category: 'achievement' });
                setIsBadgeDialogOpen(true);
              }}
              size="sm"
            >
              <Plus className="w-4 h-4 mr-2" />
              Neues Badge
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto">
            {badges.map(badge => (
              <div key={badge.id} className="flex items-center justify-between p-3 border rounded-md">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{badge.icon}</span>
                  <div>
                    <p className="font-medium">{badge.name}</p>
                    <p className="text-xs text-muted-foreground">{translateBadgeCategory(badge.category)}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => handleEditBadge(badge)}
                    className="p-1 text-blue-600 hover:text-blue-800"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => handleDeleteBadge(badge.id)}
                    className="p-1 text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Badge Edit Dialog */}
      <Dialog open={isBadgeDialogOpen} onOpenChange={setIsBadgeDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingBadgeId ? "Badge bearbeiten" : "Neues Badge erstellen"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="badge-name">
                Badge Name*
              </label>
              <input
                id="badge-name"
                className="w-full p-2 rounded-md border border-input"
                value={newBadge.name}
                onChange={(e) => setNewBadge({...newBadge, name: e.target.value})}
                placeholder="z.B. Top Performer"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="badge-icon">
                Emoji/Icon*
              </label>
              <input
                id="badge-icon"
                className="w-full p-2 rounded-md border border-input"
                value={newBadge.icon}
                onChange={(e) => setNewBadge({...newBadge, icon: e.target.value})}
                placeholder="z.B. 🏆"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="badge-category">
                Kategorie
              </label>
              <select
                id="badge-category"
                className="w-full p-2 rounded-md border border-input"
                value={newBadge.category}
                onChange={(e) => setNewBadge({...newBadge, category: e.target.value})}
              >
                {badgeCategories.map(category => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsBadgeDialogOpen(false)}
            >
              Abbrechen
            </Button>
            <Button 
              onClick={editingBadgeId ? handleSaveEditedBadge : handleAddBadge}
            >
              {editingBadgeId ? "Speichern" : "Hinzufügen"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
