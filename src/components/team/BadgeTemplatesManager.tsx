import React, { useState, useEffect } from 'react';
import { toast } from "../../hooks/use-toast";
import { UserBadge } from '../../contexts/UserTypes';
import BadgeToolbar from './badge/BadgeToolbar';
import BadgeList from './badge/BadgeList';
import BadgeDialogs from './badge/BadgeDialogs';

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

  const categoryCountMap = templates.reduce((acc, badge) => {
    acc[badge.category] = (acc[badge.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  useEffect(() => {
    console.log("Checking for badges in localStorage...");
    const storedBadges = localStorage.getItem('userBadges');
    console.log("Stored badges:", storedBadges ? JSON.parse(storedBadges).length : 0);
    
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
          onBadgesUpdated();
        } else {
          console.log('No badges found in storage or empty array, initializing defaults');
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
    console.log(`Generated ${defaultBadges.length} default badges`);
    localStorage.setItem('userBadges', JSON.stringify(defaultBadges));
    setTemplates(defaultBadges);
    onBadgesUpdated();
  };

  useEffect(() => {
    if (templates.length > 0) {
      console.log(`Saving ${templates.length} badges to localStorage`);
      localStorage.setItem('userBadges', JSON.stringify(templates));
      onBadgesUpdated();
    }
  }, [templates, onBadgesUpdated]);

  useEffect(() => {
    if (templates.length > 0 && templates.length < 10) {
      console.log(`Only ${templates.length} badges found, reinitializing defaults...`);
      initializeDefaultBadges();
    }
  }, [templates]);

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

  return (
    <div className="space-y-4">
      <BadgeToolbar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        badgeCategories={badgeCategories}
        badgeCount={templates.length}
        categoryCountMap={categoryCountMap}
        onCreateClick={() => setIsCreateDialogOpen(true)}
      />
      
      <BadgeList
        badges={templates}
        searchTerm={searchTerm}
        selectedCategory={selectedCategory}
        badgeCategories={badgeCategories}
        onEdit={handleEditBadge}
        onDelete={handleDeleteBadge}
      />
      
      <BadgeDialogs
        isEditDialogOpen={isEditDialogOpen}
        setIsEditDialogOpen={setIsEditDialogOpen}
        isCreateDialogOpen={isCreateDialogOpen}
        setIsCreateDialogOpen={setIsCreateDialogOpen}
        currentBadge={currentBadge}
        setCurrentBadge={setCurrentBadge}
        newBadge={newBadge}
        setNewBadge={setNewBadge}
        badgeCategories={badgeCategories}
        onSaveEdit={handleSaveEdit}
        onCreateBadge={handleCreateBadge}
      />
    </div>
  );
};

export const generateDefaultBadges = (): UserBadge[] => {
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
