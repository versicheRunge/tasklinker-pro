import React, { useState, useEffect } from 'react';
import { MessageSquare, Hash, Search, Plus, Edit, Trash2, Menu } from 'lucide-react';
import { AppLayout } from '../components/layout/AppLayout';
import { TeamChat } from '../components/chat/TeamChat';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { ScrollArea } from '../components/ui/scroll-area';
import { cn } from '../lib/utils';
import { useUser } from '../contexts/UserContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { toast } from '../hooks/use-toast';
import { ChatChannel } from '../types/chat';
import { Sheet, SheetContent, SheetTrigger } from '../components/ui/sheet';
import { useIsMobile } from '../hooks/use-mobile';

const Chat: React.FC = () => {
  const { users, currentUser, isAdmin } = useUser();
  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeChannel, setActiveChannel] = useState<ChatChannel>({
    id: 'general',
    name: 'Allgemein',
    type: 'channel'
  });
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  
  // State for channel management
  const [channels, setChannels] = useState<ChatChannel[]>([]);
  const [newChannelName, setNewChannelName] = useState('');
  const [channelToEdit, setChannelToEdit] = useState<ChatChannel | null>(null);
  const [editChannelName, setEditChannelName] = useState('');
  const [isAddChannelDialogOpen, setIsAddChannelDialogOpen] = useState(false);
  const [isEditChannelDialogOpen, setIsEditChannelDialogOpen] = useState(false);
  const [isDeleteChannelDialogOpen, setIsDeleteChannelDialogOpen] = useState(false);
  
  // Load channels from localStorage
  useEffect(() => {
    const storedChannels = localStorage.getItem('chatChannels');
    if (storedChannels) {
      try {
        setChannels(JSON.parse(storedChannels));
      } catch (error) {
        console.error('Fehler beim Laden der Kanäle:', error);
        // Set default channels if parsing fails
        setDefaultChannels();
      }
    } else {
      // Set default channels if none exist
      setDefaultChannels();
    }
  }, []);
  
  // Handle sidebar visibility on mobile/desktop
  useEffect(() => {
    setSidebarOpen(!isMobile);
  }, [isMobile]);
  
  // Set default channels
  const setDefaultChannels = () => {
    const defaultChannels: ChatChannel[] = [
      { id: 'general', name: 'Allgemein', type: 'channel' },
      { id: 'announcements', name: 'Ankündigungen', type: 'channel' },
    ];
    setChannels(defaultChannels);
    localStorage.setItem('chatChannels', JSON.stringify(defaultChannels));
  };
  
  // Save channels to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('chatChannels', JSON.stringify(channels));
  }, [channels]);
  
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
    
    setChannels(prev => [...prev, newChannel]);
    setNewChannelName('');
    setIsAddChannelDialogOpen(false);
    
    toast({
      title: "Kanal erstellt",
      description: `Der Kanal "${newChannelName}" wurde erfolgreich erstellt.`
    });
  };
  
  // Change active channel and close sidebar on mobile
  const handleChannelSelect = (channel: ChatChannel) => {
    setActiveChannel(channel);
    if (isMobile) {
      setSidebarOpen(false);
    }
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
    
    setChannels(prev => 
      prev.map(channel => 
        channel.id === channelToEdit.id 
          ? { ...channel, name: editChannelName.trim() } 
          : channel
      )
    );
    
    if (activeChannel.id === channelToEdit.id) {
      setActiveChannel(prev => ({ ...prev, name: editChannelName.trim() }));
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
    
    setChannels(prev => prev.filter(channel => channel.id !== channelToEdit.id));
    
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
  
  // Gefilterte Kanäle basierend auf der Suche
  const filteredChannels = channels.filter(channel => 
    channel.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Render the channels sidebar
  const renderChannelsSidebar = () => (
    <div className="w-full md:w-64 flex flex-col h-full">
      <div className="p-3 border-b">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold">Chat</h2>
          {isAdmin && (
            <Dialog open={isAddChannelDialogOpen} onOpenChange={setIsAddChannelDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <Plus className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Neuen Kanal erstellen</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                  <Label htmlFor="channel-name">Kanalname</Label>
                  <Input
                    id="channel-name"
                    value={newChannelName}
                    onChange={(e) => setNewChannelName(e.target.value)}
                    placeholder="Neuer Kanalname"
                    className="mt-2"
                  />
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddChannelDialogOpen(false)}>Abbrechen</Button>
                  <Button onClick={handleAddChannel}>Erstellen</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
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
      
      <ScrollArea className="flex-1">
        <div className="p-2">
          <h3 className="px-2 py-1 text-xs font-semibold text-muted-foreground">Kanäle</h3>
          <div className="mt-1 space-y-[2px]">
            {filteredChannels.map(channel => (
              <div key={channel.id} className="flex items-center group">
                <button
                  className={cn(
                    "w-full text-left px-2 py-1.5 rounded-md flex items-center gap-2 text-sm",
                    channel.id === activeChannel.id
                      ? "bg-primary/10 text-primary font-medium"
                      : "hover:bg-accent"
                  )}
                  onClick={() => handleChannelSelect(channel)}
                >
                  <Hash className="h-4 w-4" />
                  <span>{channel.name}</span>
                </button>
                
                {isAdmin && channel.id !== 'general' && channel.id !== 'announcements' && (
                  <div className="flex space-x-1 opacity-0 group-hover:opacity-100">
                    <Dialog open={isEditChannelDialogOpen && channelToEdit?.id === channel.id} 
                            onOpenChange={(open) => {
                              setIsEditChannelDialogOpen(open);
                              if (!open) setChannelToEdit(null);
                            }}>
                      <DialogTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6"
                          onClick={(e) => {
                            e.stopPropagation();
                            setChannelToEdit(channel);
                            setEditChannelName(channel.name);
                          }}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Kanal bearbeiten</DialogTitle>
                        </DialogHeader>
                        <div className="py-4">
                          <Label htmlFor="edit-channel-name">Kanalname</Label>
                          <Input
                            id="edit-channel-name"
                            value={editChannelName}
                            onChange={(e) => setEditChannelName(e.target.value)}
                            className="mt-2"
                          />
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsEditChannelDialogOpen(false)}>Abbrechen</Button>
                          <Button onClick={handleEditChannel}>Speichern</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                    
                    <Dialog open={isDeleteChannelDialogOpen && channelToEdit?.id === channel.id}
                            onOpenChange={(open) => {
                              setIsDeleteChannelDialogOpen(open);
                              if (!open) setChannelToEdit(null);
                            }}>
                      <DialogTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6"
                          onClick={(e) => {
                            e.stopPropagation();
                            setChannelToEdit(channel);
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Kanal löschen</DialogTitle>
                        </DialogHeader>
                        <div className="py-4">
                          Möchten Sie den Kanal "{channel.name}" wirklich löschen?
                        </div>
                        <DialogFooter>
                          <Button variant="outline" onClick={() => setIsDeleteChannelDialogOpen(false)}>Abbrechen</Button>
                          <Button variant="destructive" onClick={handleDeleteChannel}>Löschen</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
  
  return (
    <AppLayout>
      <div className="flex h-[calc(100vh-130px)]">
        {/* Mobile sidebar toggle */}
        {isMobile && (
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="fixed left-4 top-16 z-10 md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-[280px]">
              {renderChannelsSidebar()}
            </SheetContent>
          </Sheet>
        )}
        
        {/* Desktop sidebar */}
        {!isMobile && (
          <div className="w-64 border-r flex flex-col">
            {renderChannelsSidebar()}
          </div>
        )}
        
        {/* Hauptchat-Bereich */}
        <div className="flex-1 flex flex-col">
          <div className="border-b p-3 flex items-center gap-3">
            <div className="bg-primary/10 p-1.5 rounded-md">
              <Hash className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="font-medium">{activeChannel.name}</h2>
              <p className="text-xs text-muted-foreground">Chat-Kanal für allgemeine Diskussionen</p>
            </div>
          </div>
          
          <div className="flex-1 bg-card border rounded-xl m-3 overflow-hidden">
            <TeamChat groupId={activeChannel.id} />
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Chat;
