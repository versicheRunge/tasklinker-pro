import React, { useState, useEffect } from 'react';
import { toast } from "../../hooks/use-toast";
import { UserBadge } from '../../contexts/UserTypes';
import BadgeToolbar from './badge/BadgeToolbar';
import BadgeList from './badge/BadgeList';
import BadgeDialogs from './badge/BadgeDialogs';
import { generateDefaultBadges } from './badge/defaultBadges';
import { supabase } from '../../lib/supabase';

const BADGE_KEY = 'badge_templates';

interface BadgeTemplatesManagerProps {
  badgeCategories: { id: string; name: string }[];
  onBadgesUpdated: () => void;
}

const BadgeTemplatesManager: React.FC<BadgeTemplatesManagerProps> = ({ badgeCategories, onBadgesUpdated }) => {
  const [templates, setTemplates] = useState<UserBadge[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [currentBadge, setCurrentBadge] = useState<UserBadge | null>(null);
  const [newBadge, setNewBadge] = useState({ id: '', name: '', icon: '🏆', category: 'achievement' });

  const categoryCountMap = templates.reduce((acc, b) => { acc[b.category] = (acc[b.category] || 0) + 1; return acc; }, {} as Record<string, number>);

  const load = async () => {
    const { data } = await supabase.from('agency_settings').select('value').eq('key', BADGE_KEY).maybeSingle();
    if (data?.value) {
      const parsed = JSON.parse(data.value);
      if (Array.isArray(parsed) && parsed.length > 0) { setTemplates(parsed); onBadgesUpdated(); return; }
    }
    const defaults = generateDefaultBadges();
    await supabase.from('agency_settings').upsert({ key: BADGE_KEY, value: JSON.stringify(defaults) }, { onConflict: 'key' });
    setTemplates(defaults);
    onBadgesUpdated();
  };

  const persist = async (updated: UserBadge[]) => {
    await supabase.from('agency_settings').upsert({ key: BADGE_KEY, value: JSON.stringify(updated) }, { onConflict: 'key' });
    setTemplates(updated);
    onBadgesUpdated();
  };

  useEffect(() => { load(); }, []);

  const handleEditBadge = (badge: UserBadge) => { setCurrentBadge({ ...badge }); setIsEditDialogOpen(true); };

  const handleSaveEdit = async () => {
    if (!currentBadge?.name.trim() || !currentBadge?.icon.trim()) {
      toast({ title: 'Fehler', description: 'Alle Felder müssen ausgefüllt sein.', variant: 'destructive' }); return;
    }
    await persist(templates.map(b => b.id === currentBadge.id ? currentBadge : b));
    setIsEditDialogOpen(false);
    toast({ title: 'Auszeichnung aktualisiert' });
  };

  const handleDeleteBadge = async (id: string) => {
    await persist(templates.filter(b => b.id !== id));
    toast({ title: 'Auszeichnung gelöscht' });
  };

  const handleCreateBadge = async () => {
    if (!newBadge.name.trim() || !newBadge.icon.trim()) {
      toast({ title: 'Fehler', description: 'Alle Felder müssen ausgefüllt sein.', variant: 'destructive' }); return;
    }
    await persist([...templates, { ...newBadge, id: `badge-${Date.now()}` }]);
    setIsCreateDialogOpen(false);
    setNewBadge({ id: '', name: '', icon: '🏆', category: 'achievement' });
    toast({ title: 'Auszeichnung erstellt' });
  };

  return (
    <div className="space-y-4">
      <BadgeToolbar searchTerm={searchTerm} setSearchTerm={setSearchTerm} selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} badgeCategories={badgeCategories} badgeCount={templates.length} categoryCountMap={categoryCountMap} onCreateClick={() => setIsCreateDialogOpen(true)} />
      <BadgeList badges={templates} searchTerm={searchTerm} selectedCategory={selectedCategory} badgeCategories={badgeCategories} onEdit={handleEditBadge} onDelete={handleDeleteBadge} />
      <BadgeDialogs isEditDialogOpen={isEditDialogOpen} setIsEditDialogOpen={setIsEditDialogOpen} isCreateDialogOpen={isCreateDialogOpen} setIsCreateDialogOpen={setIsCreateDialogOpen} currentBadge={currentBadge} setCurrentBadge={setCurrentBadge} newBadge={newBadge} setNewBadge={setNewBadge} badgeCategories={badgeCategories} onSaveEdit={handleSaveEdit} onCreateBadge={handleCreateBadge} />
    </div>
  );
};

export default BadgeTemplatesManager;
