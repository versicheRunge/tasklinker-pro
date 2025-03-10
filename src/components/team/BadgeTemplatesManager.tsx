import React, { useState, useEffect } from 'react';
import { toast } from "../../hooks/use-toast";
import { UserBadge } from '../../contexts/UserTypes';
import BadgeToolbar from './badge/BadgeToolbar';
import BadgeList from './badge/BadgeList';
import BadgeDialogs from './badge/BadgeDialogs';
import { generateDefaultBadges } from './badge/defaultBadges';

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

export default BadgeTemplatesManager;
