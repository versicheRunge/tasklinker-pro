import React, { useState } from 'react';
import { Users, UserPlus, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useUser } from '../../contexts/UserContext';
import { insertNotification } from '../../hooks/useNotifications';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from '../../hooks/use-toast';

interface CaseCollaboratorsPanelProps {
  caseId: string;
  collaboratorIds: string[];
  onUpdated: () => void;
}

export const CaseCollaboratorsPanel: React.FC<CaseCollaboratorsPanelProps> = ({
  caseId, collaboratorIds, onUpdated,
}) => {
  const { users } = useUser();
  const { profile } = useAuth();
  const [adding, setAdding] = useState(false);
  const [selectedUser, setSelectedUser] = useState('');

  const available = users.filter(u => !collaboratorIds.includes(u.id));

  const handleAdd = async () => {
    if (!selectedUser || !profile) return;
    await supabase.from('case_collaborators').insert({ case_id: caseId, user_id: selectedUser });
    await insertNotification(selectedUser, 'mention', 'Sie wurden eingebunden', undefined, caseId);
    toast({ title: 'Kollege eingebunden', description: `@${users.find(u => u.id === selectedUser)?.name}` });
    setSelectedUser('');
    setAdding(false);
    onUpdated();
  };

  const handleRemove = async (userId: string) => {
    await supabase.from('case_collaborators').delete().eq('case_id', caseId).eq('user_id', userId);
    onUpdated();
  };

  if (collaboratorIds.length === 0 && !adding) {
    return (
      <div className="bg-card border rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-medium text-sm flex items-center gap-1.5"><Users className="w-4 h-4" /> Beteiligte</h3>
          <button
            className="text-xs text-primary hover:underline flex items-center gap-1"
            onClick={() => setAdding(true)}
          >
            <UserPlus className="w-3.5 h-3.5" /> Hinzufügen
          </button>
        </div>
        <p className="text-xs text-muted-foreground">Noch keine Kollegen eingebunden.</p>
      </div>
    );
  }

  return (
    <div className="bg-card border rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-sm flex items-center gap-1.5"><Users className="w-4 h-4" /> Beteiligte</h3>
        {!adding && available.length > 0 && (
          <button className="text-xs text-primary hover:underline flex items-center gap-1" onClick={() => setAdding(true)}>
            <UserPlus className="w-3.5 h-3.5" /> Hinzufügen
          </button>
        )}
      </div>

      <div className="space-y-1.5">
        {collaboratorIds.map(uid => {
          const user = users.find(u => u.id === uid);
          return (
            <div key={uid} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-primary text-xs font-medium">
                  {user?.name?.charAt(0) ?? '?'}
                </div>
                <span className="text-sm">{user?.name ?? 'Unbekannt'}</span>
              </div>
              <button
                className="p-1 text-muted-foreground hover:text-destructive rounded transition-colors"
                onClick={() => handleRemove(uid)}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>

      {adding && (
        <div className="mt-3 flex gap-2">
          <select
            className="flex-1 p-1.5 rounded border border-input bg-background text-sm"
            value={selectedUser}
            onChange={e => setSelectedUser(e.target.value)}
          >
            <option value="">Kollege auswählen…</option>
            {available.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
          </select>
          <button
            onClick={handleAdd}
            disabled={!selectedUser}
            className="px-2 py-1.5 bg-primary text-primary-foreground rounded text-sm disabled:opacity-50"
          >
            Hinzufügen
          </button>
          <button onClick={() => { setAdding(false); setSelectedUser(''); }} className="px-2 py-1.5 border rounded text-sm">
            ✕
          </button>
        </div>
      )}
    </div>
  );
};
