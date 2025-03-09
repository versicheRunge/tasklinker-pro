
import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '../../ui/input';
import { ChannelList } from '../channels/ChannelList';
import { ChatChannel } from '../../../types/chat';
import { 
  AddEditChannelDialog, 
  DeleteChannelDialog 
} from '../channels/ChannelDialog';
import { toast } from '../../../hooks/use-toast';

interface ChatSidebarProps {
  channels: ChatChannel[];
  activeChannel: ChatChannel;
  isAdmin: boolean;
  setChannels: (channels: ChatChannel[]) => void;
  setActiveChannel: (channel: ChatChannel) => void;
  onChannelSelect: (channel: ChatChannel) => void;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  channels,
  activeChannel,
  isAdmin,
  setChannels,
  setActiveChannel,
  onChannelSelect
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [newChannelName, setNewChannelName] = useState('');
  const [channelToEdit, setChannelToEdit] = useState<ChatChannel | null>(null);
  const [editChannelName, setEditChannelName] = useState('');
  const [isAddChannelDialogOpen, setIsAddChannelDialogOpen] = useState(false);
  const [isEditChannelDialogOpen, setIsEditChannelDialogOpen] = useState(false);
  const [isDeleteChannelDialogOpen, setIsDeleteChannelDialogOpen] = useState(false);

  // Add a new channel
  const handleAddChannel = () => {
    if (!newChannelName.trim()) {
      toast({
        title: "Fehler",
        description: "Bitte geben Sie einen Kanalnamen ein.",
        variant: "destructive"
      });
      return;
    }
    
    const channelId = `channel-${Date.now()}`;
    const newChannel: ChatChannel = {
      id: channelId,
      name: newChannelName.trim(),
      type: 'channel'
    };
    
    setChannels([...channels, newChannel]);
    setNewChannelName('');
    setIsAddChannelDialogOpen(false);
    
    toast({
      title: "Kanal erstellt",
      description: `Der Kanal "${newChannelName}" wurde erfolgreich erstellt.`
    });
  };
  
  // Edit a channel
  const handleEditChannel = () => {
    if (!channelToEdit) return;
    if (!editChannelName.trim()) {
      toast({
        title: "Fehler",
        description: "Bitte geben Sie einen Kanalnamen ein.",
        variant: "destructive"
      });
      return;
    }
    
    const updatedChannels = channels.map(channel => 
      channel.id === channelToEdit.id 
        ? { ...channel, name: editChannelName.trim() } 
        : channel
    );
    
    setChannels(updatedChannels);
    
    if (activeChannel.id === channelToEdit.id) {
      setActiveChannel({ ...activeChannel, name: editChannelName.trim() });
    }
    
    setChannelToEdit(null);
    setEditChannelName('');
    setIsEditChannelDialogOpen(false);
    
    toast({
      title: "Kanal bearbeitet",
      description: `Der Kanal wurde erfolgreich in "${editChannelName}" umbenannt.`
    });
  };
  
  // Delete a channel
  const handleDeleteChannel = () => {
    if (!channelToEdit) return;
    
    // Don't allow deleting the default channels
    if (channelToEdit.id === 'general' || channelToEdit.id === 'announcements') {
      toast({
        title: "Fehler",
        description: "Standardkanäle können nicht gelöscht werden.",
        variant: "destructive"
      });
      return;
    }
    
    const filteredChannels = channels.filter(channel => channel.id !== channelToEdit.id);
    setChannels(filteredChannels);
    
    if (activeChannel.id === channelToEdit.id) {
      setActiveChannel({
        id: 'general',
        name: 'Allgemein',
        type: 'channel'
      });
    }
    
    setChannelToEdit(null);
    setIsDeleteChannelDialogOpen(false);
    
    toast({
      title: "Kanal gelöscht",
      description: `Der Kanal "${channelToEdit.name}" wurde erfolgreich gelöscht.`
    });
  };

  return (
    <div className="w-full md:w-64 flex flex-col h-full">
      <div className="p-3 border-b">
        <div className="mb-3">
          <h2 className="font-semibold">Chat</h2>
        </div>
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Suchen..." 
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      <ChannelList
        channels={channels}
        activeChannelId={activeChannel.id}
        searchQuery={searchQuery}
        isAdmin={isAdmin}
        onAddChannel={() => setIsAddChannelDialogOpen(true)}
        onChannelSelect={onChannelSelect}
        onEditChannel={(channel) => {
          setChannelToEdit(channel);
          setEditChannelName(channel.name);
          setIsEditChannelDialogOpen(true);
        }}
        onDeleteChannel={(channel) => {
          setChannelToEdit(channel);
          setIsDeleteChannelDialogOpen(true);
        }}
      />

      {/* Dialogs for adding, editing, and deleting channels */}
      <AddEditChannelDialog
        open={isAddChannelDialogOpen}
        onOpenChange={setIsAddChannelDialogOpen}
        channelName={newChannelName}
        setChannelName={setNewChannelName}
        onConfirm={handleAddChannel}
        title="Neuen Kanal erstellen"
        confirmLabel="Erstellen"
      />
      
      <AddEditChannelDialog
        open={isEditChannelDialogOpen}
        onOpenChange={setIsEditChannelDialogOpen}
        channelName={editChannelName}
        setChannelName={setEditChannelName}
        onConfirm={handleEditChannel}
        title="Kanal bearbeiten"
        confirmLabel="Speichern"
      />
      
      <DeleteChannelDialog
        open={isDeleteChannelDialogOpen}
        onOpenChange={setIsDeleteChannelDialogOpen}
        channelToDelete={channelToEdit}
        onConfirm={handleDeleteChannel}
      />
    </div>
  );
};
