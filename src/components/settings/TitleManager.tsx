
import React, { useState, useEffect } from 'react';
import { Edit2, Save, X, Plus } from 'lucide-react';
import { CaseDefaultTitle, CaseType } from '../../types/case';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { toast } from "../../hooks/use-toast";
import { supabase } from '../../lib/supabase';

const TITLE_KEY = 'default_titles';
const DEFAULT_TITLES: CaseDefaultTitle[] = [
  { id: 'title-1', title: 'Schadenmeldung', type: 'damage' },
  { id: 'title-2', title: 'eVB-Anforderung', type: 'evb' },
  { id: 'title-3', title: 'Rückrufbitte', type: 'inquiry' },
  { id: 'title-4', title: 'Vertragsänderung', type: 'contract_change' },
];

const translateCaseType = (type: string) => {
  const map: Record<string, string> = { damage: 'Schadenmeldung', evb: 'eVB-Anfrage', contract_change: 'Vertragsänderung', inquiry: 'Kundenanfrage' };
  return map[type] ?? type;
};

export const TitleManager: React.FC = () => {
  const [defaultTitles, setDefaultTitles] = useState<CaseDefaultTitle[]>([]);
  const [newDefaultTitle, setNewDefaultTitle] = useState({ title: '', type: 'damage' as CaseType });
  const [editingTitleId, setEditingTitleId] = useState<string | null>(null);
  const [editingTitleText, setEditingTitleText] = useState('');

  const load = async () => {
    const { data } = await supabase.from('agency_settings').select('value').eq('key', TITLE_KEY).maybeSingle();
    if (data?.value) {
      setDefaultTitles(JSON.parse(data.value));
    } else {
      setDefaultTitles(DEFAULT_TITLES);
      await supabase.from('agency_settings').upsert({ key: TITLE_KEY, value: JSON.stringify(DEFAULT_TITLES) }, { onConflict: 'key' });
    }
  };

  const save = async (titles: CaseDefaultTitle[]) => {
    await supabase.from('agency_settings').upsert({ key: TITLE_KEY, value: JSON.stringify(titles) }, { onConflict: 'key' });
    setDefaultTitles(titles);
  };

  useEffect(() => { load(); }, []);

  const handleAddDefaultTitle = async () => {
    if (!newDefaultTitle.title.trim()) {
      toast({ title: 'Fehler', description: 'Bitte geben Sie einen Titel ein.', variant: 'destructive' }); return;
    }
    const updated = [...defaultTitles, { id: `title-${Date.now()}`, title: newDefaultTitle.title, type: newDefaultTitle.type }];
    await save(updated);
    setNewDefaultTitle({ title: '', type: 'damage' });
    toast({ title: 'Titel hinzugefügt' });
  };

  const handleSaveEditedTitle = async () => {
    if (!editingTitleId || !editingTitleText.trim()) return;
    await save(defaultTitles.map(t => t.id === editingTitleId ? { ...t, title: editingTitleText } : t));
    setEditingTitleId(null);
    toast({ title: 'Titel aktualisiert' });
  };

  const handleDeleteDefaultTitle = async (id: string) => {
    await save(defaultTitles.filter(t => t.id !== id));
    toast({ title: 'Titel gelöscht' });
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <h2 className="text-xl font-bold mb-4">Standardtitel verwalten</h2>
      <p className="text-muted-foreground mb-6">Hier können Sie Standardtitel für neue Vorgänge hinzufügen, bearbeiten oder löschen.</p>
      <div className="space-y-6">
        <div>
          <h3 className="text-sm font-medium mb-2">Bestehende Titel</h3>
          <div className="space-y-2 max-h-[300px] overflow-y-auto mb-4">
            {defaultTitles.length > 0 ? defaultTitles.map(title => (
              <div key={title.id} className="flex items-center justify-between p-2 border rounded-md">
                {editingTitleId === title.id
                  ? <input type="text" className="flex-1 p-1 border rounded mr-2" value={editingTitleText} onChange={e => setEditingTitleText(e.target.value)} autoFocus />
                  : <span className="flex-1">{title.title}</span>
                }
                <div className="flex items-center gap-1">
                  <Badge variant="outline" className="mr-2 border-amber-500 text-amber-500">{translateCaseType(title.type)}</Badge>
                  {editingTitleId === title.id ? (
                    <>
                      <button onClick={handleSaveEditedTitle} className="p-1 text-green-600 hover:text-green-800"><Save className="w-4 h-4" /></button>
                      <button onClick={() => setEditingTitleId(null)} className="p-1 text-gray-500 hover:text-gray-700"><X className="w-4 h-4" /></button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => { setEditingTitleId(title.id); setEditingTitleText(title.title); }} className="p-1 text-blue-600 hover:text-blue-800"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => handleDeleteDefaultTitle(title.id)} className="p-1 text-red-600 hover:text-red-800"><X className="w-4 h-4" /></button>
                    </>
                  )}
                </div>
              </div>
            )) : <p className="text-muted-foreground text-center py-4">Keine Standardtitel vorhanden.</p>}
          </div>
        </div>
        <div className="bg-muted/30 p-4 rounded-md">
          <h3 className="text-sm font-medium mb-3">Neuen Titel hinzufügen</h3>
          <div className="space-y-3">
            <input type="text" className="w-full p-2 rounded-md border" value={newDefaultTitle.title} onChange={e => setNewDefaultTitle({ ...newDefaultTitle, title: e.target.value })} placeholder="Titelbeschreibung" />
            <select className="w-full p-2 rounded-md border" value={newDefaultTitle.type} onChange={e => setNewDefaultTitle({ ...newDefaultTitle, type: e.target.value as CaseType })}>
              <option value="damage">Schadenmeldung</option>
              <option value="evb">eVB-Anfrage</option>
              <option value="contract_change">Vertragsänderung</option>
              <option value="inquiry">Kundenanfrage</option>
              <option value="sonstiges">Sonstiges</option>
            </select>
            <Button onClick={handleAddDefaultTitle} className="w-full"><Plus className="w-4 h-4 mr-2" />Hinzufügen</Button>
          </div>
        </div>
      </div>
    </div>
  );
};
