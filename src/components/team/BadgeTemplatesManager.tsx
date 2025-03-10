import React, { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, Check, ArrowUpDown, Search } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../ui/dialog";
import { Input } from "../ui/input";
import { CustomBadge } from '../ui/CustomBadge';
import { UserBadge } from '../../contexts/UserTypes';
import { Badge } from '../ui/badge';
import { toast } from "../../hooks/use-toast";

interface BadgeTemplatesManagerProps {
  badgeCategories: { id: string; name: string }[];
  onBadgesUpdated: () => void;
}

const BadgeTemplatesManager: React.FC<BadgeTemplatesManagerProps> = ({
  badgeCategories,
  onBadgesUpdated
}) => {
  const [templates, setTemplates] = useState<UserBadge[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [currentBadge, setCurrentBadge] = useState<UserBadge | null>(null);
  const [newBadge, setNewBadge] = useState({
    id: '',
    name: '',
    icon: '🏆',
    category: 'achievement'
  });

  useEffect(() => {
    loadTemplates();
    
    const handleFocus = () => loadTemplates();
    window.addEventListener('focus', handleFocus);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const loadTemplates = () => {
    try {
      const storedBadges = localStorage.getItem('userBadges');
      if (storedBadges) {
        const parsedBadges = JSON.parse(storedBadges);
        if (Array.isArray(parsedBadges) && parsedBadges.length > 0) {
          console.log(`Loaded ${parsedBadges.length} badges from storage`);
          setTemplates(parsedBadges);
        } else {
          console.log('No badges found in storage, initializing defaults');
          initializeDefaultBadges();
        }
      } else {
        console.log('No badges in storage, initializing defaults');
        initializeDefaultBadges();
      }
    } catch (e) {
      console.error('Error parsing badges:', e);
      initializeDefaultBadges();
    }
  };

  const initializeDefaultBadges = () => {
    const defaultBadges = generateDefaultBadges();
    localStorage.setItem('userBadges', JSON.stringify(defaultBadges));
    setTemplates(defaultBadges);
    onBadgesUpdated();
  };

  useEffect(() => {
    if (templates.length > 0) {
      localStorage.setItem('userBadges', JSON.stringify(templates));
      onBadgesUpdated();
    }
  }, [templates, onBadgesUpdated]);

  const handleEditBadge = (badge: UserBadge) => {
    setCurrentBadge({ ...badge });
    setIsEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (!currentBadge || !currentBadge.name.trim() || !currentBadge.icon.trim()) {
      toast({
        title: "Fehler",
        description: "Alle Felder müssen ausgefüllt sein.",
        variant: "destructive"
      });
      return;
    }

    const updatedTemplates = templates.map(badge => 
      badge.id === currentBadge.id ? currentBadge : badge
    );
    
    setTemplates(updatedTemplates);
    setIsEditDialogOpen(false);
    setCurrentBadge(null);
    
    toast({
      title: "Auszeichnung aktualisiert",
      description: "Die Auszeichnung wurde erfolgreich aktualisiert."
    });
  };

  const handleDeleteBadge = (id: string) => {
    const updatedTemplates = templates.filter(badge => badge.id !== id);
    setTemplates(updatedTemplates);
    
    toast({
      title: "Auszeichnung gelöscht",
      description: "Die Auszeichnung wurde erfolgreich gelöscht."
    });
  };

  const handleCreateBadge = () => {
    if (!newBadge.name.trim() || !newBadge.icon.trim()) {
      toast({
        title: "Fehler",
        description: "Alle Felder müssen ausgefüllt sein.",
        variant: "destructive"
      });
      return;
    }

    const newId = `badge-${Date.now()}`;
    const createdBadge = {
      ...newBadge,
      id: newId
    };
    
    setTemplates([...templates, createdBadge]);
    setIsCreateDialogOpen(false);
    setNewBadge({
      id: '',
      name: '',
      icon: '🏆',
      category: 'achievement'
    });
    
    toast({
      title: "Auszeichnung erstellt",
      description: "Die neue Auszeichnung wurde erfolgreich erstellt."
    });
  };

  const filteredBadges = templates.filter(badge => {
    const matchesSearch = badge.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                           badge.icon.includes(searchTerm);
    const matchesCategory = selectedCategory === 'all' || badge.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-3 justify-between mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Auszeichnungen suchen..."
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
            <option value="all">Alle Kategorien</option>
            {badgeCategories.map(category => (
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
            <span>Neue Auszeichnung</span>
          </button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {filteredBadges.map(badge => (
          <div key={badge.id} className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{badge.icon}</span>
              <div>
                <h3 className="font-medium">{badge.name}</h3>
                <p className="text-xs text-muted-foreground">
                  {badgeCategories.find(c => c.id === badge.category)?.name || 'Kategorie'}
                </p>
              </div>
            </div>
            <div className="flex gap-1">
              <button
                className="p-1.5 text-muted-foreground hover:text-foreground rounded-md hover:bg-muted transition-colors"
                onClick={() => handleEditBadge(badge)}
                title="Bearbeiten"
              >
                <Pencil className="w-4 h-4" />
              </button>
              <button
                className="p-1.5 text-muted-foreground hover:text-destructive rounded-md hover:bg-muted transition-colors"
                onClick={() => handleDeleteBadge(badge.id)}
                title="Löschen"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
      
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Auszeichnung bearbeiten</DialogTitle>
          </DialogHeader>
          {currentBadge && (
            <div className="space-y-4 py-4">
              <div className="flex justify-center mb-4">
                <div className="text-6xl">{currentBadge.icon}</div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="badge-icon">
                  Emoji
                </label>
                <Input
                  id="badge-icon"
                  value={currentBadge.icon}
                  onChange={(e) => setCurrentBadge({...currentBadge, icon: e.target.value})}
                  placeholder="🏆"
                />
                <p className="text-xs text-muted-foreground">
                  Emoji einfügen oder kopieren (z.B. 🏆, 🎯, 🌟)
                </p>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="badge-name">
                  Name
                </label>
                <Input
                  id="badge-name"
                  value={currentBadge.name}
                  onChange={(e) => setCurrentBadge({...currentBadge, name: e.target.value})}
                  placeholder="Name der Auszeichnung"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium" htmlFor="badge-category">
                  Kategorie
                </label>
                <select
                  id="badge-category"
                  className="w-full px-3 py-2 rounded-md border border-input bg-background"
                  value={currentBadge.category}
                  onChange={(e) => setCurrentBadge({...currentBadge, category: e.target.value})}
                >
                  {badgeCategories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mt-6">
                <h4 className="text-sm font-medium mb-2">Vorschau:</h4>
                <div className="flex items-center gap-2 p-2 border border-border rounded-md">
                  <span className="text-xl">{currentBadge.icon}</span>
                  <span>{currentBadge.name}</span>
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
      
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Neue Auszeichnung erstellen</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex justify-center mb-4">
              <div className="text-6xl">{newBadge.icon}</div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="new-badge-icon">
                Emoji
              </label>
              <Input
                id="new-badge-icon"
                value={newBadge.icon}
                onChange={(e) => setNewBadge({...newBadge, icon: e.target.value})}
                placeholder="🏆"
              />
              <p className="text-xs text-muted-foreground">
                Emoji einfügen oder kopieren (z.B. 🏆, 🎯, 🌟)
              </p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="new-badge-name">
                Name
              </label>
              <Input
                id="new-badge-name"
                value={newBadge.name}
                onChange={(e) => setNewBadge({...newBadge, name: e.target.value})}
                placeholder="Name der Auszeichnung"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium" htmlFor="new-badge-category">
                Kategorie
              </label>
              <select
                id="new-badge-category"
                className="w-full px-3 py-2 rounded-md border border-input bg-background"
                value={newBadge.category}
                onChange={(e) => setNewBadge({...newBadge, category: e.target.value})}
              >
                {badgeCategories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="mt-6">
              <h4 className="text-sm font-medium mb-2">Vorschau:</h4>
              <div className="flex items-center gap-2 p-2 border border-border rounded-md">
                <CustomBadge 
                  icon={newBadge.icon} 
                  label={newBadge.name}
                  variant="outline"
                />
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
              onClick={handleCreateBadge}
            >
              Erstellen
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const generateDefaultBadges = (): UserBadge[] => {
  return [
    { id: 'badge-1', name: 'Top Performer', icon: '🏆', category: 'achievement' },
    { id: 'badge-2', name: 'Überstunden-Held', icon: '⏱️', category: 'achievement' },
    { id: 'badge-3', name: 'Innovator', icon: '💡', category: 'achievement' },
    { id: 'badge-4', name: 'Team-Player', icon: '🤝', category: 'achievement' },
    { id: 'badge-5', name: 'Kundenservice-Ass', icon: '🌟', category: 'achievement' },
    { id: 'badge-6', name: 'Problemlöser', icon: '🧩', category: 'achievement' },
    { id: 'badge-7', name: 'Effizienz-Champion', icon: '⚡', category: 'achievement' },
    { id: 'badge-8', name: 'Qualitäts-Garant', icon: '✓', category: 'achievement' },
    { id: 'badge-9', name: 'Sonderaufgaben-Meister', icon: '🎯', category: 'achievement' },
    { id: 'badge-10', name: 'Vertriebs-Champion', icon: '📈', category: 'achievement' },
    
    { id: 'badge-11', name: 'Excel-Profi', icon: '📊', category: 'skill' },
    { id: 'badge-12', name: 'Präsentationstalent', icon: '🎤', category: 'skill' },
    { id: 'badge-13', name: 'Verhandlungsexperte', icon: '🤔', category: 'skill' },
    { id: 'badge-14', name: 'Projektmanagement-Profi', icon: '📋', category: 'skill' },
    { id: 'badge-15', name: 'IT-Experte', icon: '💻', category: 'skill' },
    { id: 'badge-16', name: 'Kommunikationstalent', icon: '💬', category: 'skill' },
    { id: 'badge-17', name: 'Designtalent', icon: '🎨', category: 'skill' },
    { id: 'badge-18', name: 'Fremdsprachenprofi', icon: '🌍', category: 'skill' },
    { id: 'badge-19', name: 'Recherche-Spezialist', icon: '🔍', category: 'skill' },
    { id: 'badge-20', name: 'Strategieexperte', icon: '♟️', category: 'skill' },
    
    { id: 'badge-21', name: '1 Jahr Betriebszugehörigkeit', icon: '🎂', category: 'tenure' },
    { id: 'badge-22', name: '5 Jahre Betriebszugehörigkeit', icon: '🎂', category: 'tenure' },
    { id: 'badge-23', name: '10 Jahre Betriebszugehörigkeit', icon: '🎂', category: 'tenure' },
    { id: 'badge-24', name: '15 Jahre Betriebszugehörigkeit', icon: '🎂', category: 'tenure' },
    { id: 'badge-25', name: '20 Jahre Betriebszugehörigkeit', icon: '🎂', category: 'tenure' },
    { id: 'badge-26', name: '25 Jahre Betriebszugehörigkeit', icon: '🎂', category: 'tenure' },
    { id: 'badge-27', name: 'Gründungsmitglied', icon: '🏛️', category: 'tenure' },
    { id: 'badge-28', name: 'Senior-Status', icon: '👑', category: 'tenure' },
    { id: 'badge-29', name: 'Mentor', icon: '👨‍🏫', category: 'tenure' },
    { id: 'badge-30', name: 'Veteranenstatus', icon: '🦸', category: 'tenure' },
    
    { id: 'badge-31', name: 'Business-Zertifizierung', icon: '📜', category: 'certification' },
    { id: 'badge-32', name: 'Technische Zertifizierung', icon: '🔧', category: 'certification' },
    { id: 'badge-33', name: 'Management-Zertifizierung', icon: '👔', category: 'certification' },
    { id: 'badge-34', name: 'Spezialistenzertifizierung', icon: '🎓', category: 'certification' },
    { id: 'badge-35', name: 'Sicherheitsschulung', icon: '🔒', category: 'certification' },
    { id: 'badge-36', name: 'Datenschutzexperte', icon: '🛡️', category: 'certification' },
    { id: 'badge-37', name: 'Versicherungsfachwirt', icon: '📝', category: 'certification' },
    { id: 'badge-38', name: 'Vertriebstraining', icon: '🤝', category: 'certification' },
    { id: 'badge-39', name: 'Führungskräftetraining', icon: '🏅', category: 'certification' },
    { id: 'badge-40', name: 'Compliance-Schulung', icon: '⚖️', category: 'certification' },
    
    { id: 'badge-41', name: 'Ideengeber', icon: '💭', category: 'special' },
    { id: 'badge-42', name: 'Soziales Engagement', icon: '❤️', category: 'special' },
    { id: 'badge-43', name: 'Umweltbewusstsein', icon: '🌱', category: 'special' },
    { id: 'badge-44', name: 'Beste Teamarbeit', icon: '👥', category: 'special' },
    { id: 'badge-45', name: 'Besondere Leistung', icon: '🌠', category: 'special' },
    { id: 'badge-46', name: 'Führungskompetenz', icon: '🚩', category: 'special' },
    { id: 'badge-47', name: 'Außergewöhnlicher Einsatz', icon: '🔥', category: 'special' },
    { id: 'badge-48', name: 'Bestes Feedback', icon: '👍', category: 'special' },
    { id: 'badge-49', name: 'Innovationspreis', icon: '🚀', category: 'special' },
    { id: 'badge-50', name: 'Mitarbeiter des Jahres', icon: '👑', category: 'special' },

    { id: 'badge-51', name: 'Produktivitätschampion', icon: '⚙️', category: 'achievement' },
    { id: 'badge-52', name: 'Umsatzrekord', icon: '💰', category: 'achievement' },
    { id: 'badge-53', name: 'Kundenakquise-Experte', icon: '🤵', category: 'achievement' },
    { id: 'badge-54', name: 'Kundenbindungsmeister', icon: '🔄', category: 'achievement' },
    { id: 'badge-55', name: 'Kostenoptimierer', icon: '📉', category: 'achievement' },
    
    { id: 'badge-56', name: 'Datenanalyse-Experte', icon: '📊', category: 'skill' },
    { id: 'badge-57', name: 'Content-Creation', icon: '✍️', category: 'skill' },
    { id: 'badge-58', name: 'Change-Management', icon: '🔄', category: 'skill' },
    { id: 'badge-59', name: 'Agile-Coach', icon: '🏃', category: 'skill' },
    { id: 'badge-60', name: 'UX-Design', icon: '🖌️', category: 'skill' },

    { id: 'badge-61', name: '30 Jahre Betriebszugehörigkeit', icon: '🎖️', category: 'tenure' },
    { id: 'badge-62', name: 'Firmenerbe', icon: '🏛️', category: 'tenure' },
    { id: 'badge-63', name: 'Treuer Begleiter', icon: '🔗', category: 'tenure' },
    
    { id: 'badge-64', name: 'ISO-Zertifizierung', icon: '📋', category: 'certification' },
    { id: 'badge-65', name: 'Digital Marketing', icon: '📱', category: 'certification' },
    { id: 'badge-66', name: 'Projektmanagement', icon: '📅', category: 'certification' },
    { id: 'badge-67', name: 'Software-Entwicklung', icon: '👨‍💻', category: 'certification' },
    { id: 'badge-68', name: 'Leadership-Training', icon: '👩‍💼', category: 'certification' },
    
    { id: 'badge-69', name: 'Krisenmanager', icon: '🧯', category: 'special' },
    { id: 'badge-70', name: 'Inklusions-Champion', icon: '♿', category: 'special' },
    { id: 'badge-71', name: 'Diversitätsbeauftragter', icon: '🌈', category: 'special' },
    { id: 'badge-72', name: 'Querdenker', icon: '🧠', category: 'special' },
    { id: 'badge-73', name: 'Change-Maker', icon: '🦋', category: 'special' },
    { id: 'badge-74', name: 'Digitaler Pionier', icon: '🔌', category: 'special' },
    { id: 'badge-75', name: 'Nachhaltigkeits-Botschafter', icon: '🌿', category: 'special' }
  ];
};

export default BadgeTemplatesManager;
