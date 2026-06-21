import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '../../ui/input';
import { ChannelList } from '../channels/ChannelList';
import { ChatChannel } from '../../../types/chat';
import { AddEditChannelDialog, DeleteChannelDialog } from '../channels/ChannelDialog';
import { useAuth } from '../../../contexts/AuthContext';
import { supabase } from '../../../lib/supabase';
import { toast } from '../../../hooks/use-toast';

interface ChatSidebarProps {
  channels: ChatChannel[];
  activeChannel: ChatChannel;
  isAdmin: boolean;
  setChannels: (channels: ChatChannel[]) => void;
  setActiveChannel: (channel: ChatChannel) => void;
  onChannelSelect: (channel: ChatChannel) => void;
  onReload?: () => void;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  channels, activeChannel, isAdmin, setChannels, setActiveChannel, onChannelSelect, onReload,
}) => {
  const { profile } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [newChannelName, setNewChannelName] = useState('');
  const [channelToEdit, setChannelToEdit] = useState<ChatChannel | null>(null);
  const [editChannelName, setEditChannelName] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const handleAddChannel = async () => {
    if (!newChannelName.trim()) { toast({ title: 'Fehler', description: 'Kanalnamen eingeben.', variant: 'destructive' }); return; }
    const { data, error } = await supabase.from('chat_channels').insert({ name: newChannelName.trim(), type: 'channel', created_by: profile?.id }).select().single();
    if (error) { toast({ title: 'Fehler', description: error.message, variant: 'destructive' }); return; }
    setNewChannelName(''); setIsAddOpen(false);
    onReload?.();
    toast({ title: 'Kanal erstellt', description: `"${newChannelName}" wurde erstellt.` });
  };

  const handleEditChannel = async () => {
    if (!channelToEdit || !editChannelName.trim()) { toast({ title: 'Fehler', description: 'Namen eingeben.', variant: 'destructive' }); return; }
    const { error } = await supabase.from('chat_channels').update({ name: editChannelName.trim() }).eq('id', channelToEdit.id);
    if (error) { toast({ title: 'Fehler', description: error.message, variant: 'destructive' }); return; }
    if (activeChannel.id === channelToEdit.id) setActiveChannel({ ...activeChannel, name: editChannelName.trim() });
    setChannelToEdit(null); setEditChannelName(''); setIsEditOpen(false);
    onReload?.();
    toast({ title: 'Kanal bearbeitet' });
  };

  const handleDeleteChannel = async () => {
    if (!channelToEdit) return;
    const { error } = await supabase.from('chat_channels').delete().eq('id', channelToEdit.id);
    if (error) { toast({ title: 'Fehler', description: error.message, variant: 'destructive' }); return; }
    const remaining = channels.filter(c => c.id !== channelToEdit.id);
    if (activeChannel.id === channelToEdit.id && remaining.length > 0) setActiveChannel(remaining[0]);
    setChannelToEdit(null); setIsDeleteOpen(false);
    onReload?.();
    toast({ title: 'Kanal gelöscht' });
  };

  return (
    <div className="w-full md:w-64 flex flex-col h-full">
      <div className="p-3 border-b">
        <div className="mb-3"><h2 className="font-semibold">Chat</h2></div>
        <div className="relative">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Suchen..." className="pl-8" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
        </div>
      </div>

      <ChannelList
        channels={channels}
        activeChannelId={activeChannel?.id ?? ''}
        searchQuery={searchQuery}
        isAdmin={isAdmin}
        onAddChannel={() => setIsAddOpen(true)}
        onChannelSelect={onChannelSelect}
        onEditChannel={ch => { setChannelToEdit(ch); setEditChannelName(ch.name); setIsEditOpen(true); }}
        onDeleteChannel={ch => { setChannelToEdit(ch); setIsDeleteOpen(true); }}
      />

      <AddEditChannelDialog open={isAddOpen} onOpenChange={setIsAddOpen} channelName={newChannelName} setChannelName={setNewChannelName} onConfirm={handleAddChannel} title="Neuen Kanal erstellen" confirmLabel="Erstellen" />
      <AddEditChannelDialog open={isEditOpen} onOpenChange={setIsEditOpen} channelName={editChannelName} setChannelName={setEditChannelName} onConfirm={handleEditChannel} title="Kanal bearbeiten" confirmLabel="Speichern" />
      <DeleteChannelDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen} channelToDelete={channelToEdit} onConfirm={handleDeleteChannel} />
    </div>
  );
};
