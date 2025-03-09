
import React, { useState } from 'react';
import { MessageSquare, Hash, Users, Search, Plus } from 'lucide-react';
import { AppLayout } from '../components/layout/AppLayout';
import { TeamChat } from '../components/chat/TeamChat';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { ScrollArea } from '../components/ui/scroll-area';
import { Separator } from '../components/ui/separator';
import { cn } from '../lib/utils';
import { useUser } from '../contexts/UserContext';

interface ChatChannel {
  id: string;
  name: string;
  type: 'channel' | 'direct' | 'group';
  participants?: string[];
  unread?: boolean;
}

const Chat: React.FC = () => {
  const { users, currentUser } = useUser();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeChannel, setActiveChannel] = useState<ChatChannel>({
    id: 'general',
    name: 'Allgemein',
    type: 'channel'
  });
  
  // Mock-Daten für Kanäle und Direktnachrichten 
  const [channels] = useState<ChatChannel[]>([
    { id: 'general', name: 'Allgemein', type: 'channel' },
    { id: 'announcements', name: 'Ankündigungen', type: 'channel' },
    { id: 'support', name: 'Support', type: 'channel' },
    { id: 'random', name: 'Zufällig', type: 'channel' },
  ]);
  
  // Direktnachrichten-Kontakte
  const directMessages: ChatChannel[] = users
    .filter(user => user.id !== currentUser?.id)
    .map(user => ({
      id: `dm-${user.id}`,
      name: user.name,
      type: 'direct',
      participants: [currentUser?.id || '', user.id],
      unread: Math.random() > 0.7 // Zufällige ungelesene Nachrichten für einige Benutzer
    }));
  
  // Gefilterte Kanäle basierend auf der Suche
  const filteredChannels = channels.filter(channel => 
    channel.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Gefilterte Direktnachrichten basierend auf der Suche
  const filteredDirectMessages = directMessages.filter(dm => 
    dm.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  return (
    <AppLayout>
      <div className="flex h-[calc(100vh-130px)]">
        {/* Linke Seitenleiste mit Kanälen und Benutzern */}
        <div className="w-64 border-r flex flex-col">
          <div className="p-3 border-b">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="font-semibold">Chat</h2>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <Plus className="h-4 w-4" />
              </Button>
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
                  <button
                    key={channel.id}
                    className={cn(
                      "w-full text-left px-2 py-1.5 rounded-md flex items-center gap-2 text-sm",
                      channel.id === activeChannel.id
                        ? "bg-primary/10 text-primary font-medium"
                        : "hover:bg-accent"
                    )}
                    onClick={() => setActiveChannel(channel)}
                  >
                    <Hash className="h-4 w-4" />
                    <span>{channel.name}</span>
                  </button>
                ))}
              </div>
              
              <Separator className="my-3" />
              
              <h3 className="px-2 py-1 text-xs font-semibold text-muted-foreground">Direktnachrichten</h3>
              <div className="mt-1 space-y-[2px]">
                {filteredDirectMessages.map(dm => (
                  <button
                    key={dm.id}
                    className={cn(
                      "w-full text-left px-2 py-1.5 rounded-md flex items-center justify-between text-sm",
                      dm.id === activeChannel.id
                        ? "bg-primary/10 text-primary font-medium"
                        : "hover:bg-accent"
                    )}
                    onClick={() => setActiveChannel(dm)}
                  >
                    <div className="flex items-center gap-2">
                      <div className="bg-primary/10 text-primary h-5 w-5 rounded-full flex items-center justify-center text-xs">
                        {dm.name.charAt(0)}
                      </div>
                      <span>{dm.name}</span>
                    </div>
                    {dm.unread && (
                      <div className="h-2 w-2 rounded-full bg-primary"></div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </ScrollArea>
        </div>
        
        {/* Hauptchat-Bereich */}
        <div className="flex-1 flex flex-col">
          <div className="border-b p-3 flex items-center gap-3">
            {activeChannel.type === 'channel' ? (
              <>
                <div className="bg-primary/10 p-1.5 rounded-md">
                  <Hash className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-medium">{activeChannel.name}</h2>
                  <p className="text-xs text-muted-foreground">Chat-Kanal für allgemeine Diskussionen</p>
                </div>
              </>
            ) : (
              <>
                <div className="bg-primary/10 p-1.5 rounded-md">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="font-medium">{activeChannel.name}</h2>
                  <p className="text-xs text-muted-foreground">Direktnachrichten</p>
                </div>
              </>
            )}
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
