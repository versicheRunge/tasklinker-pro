
import React, { useState, useEffect } from 'react';
import { Hash } from 'lucide-react';
import { AppLayout } from '../components/layout/AppLayout';
import { TeamChat } from '../components/chat/TeamChat';
import { Button } from '../components/ui/button';
import { useUser } from '../contexts/UserContext';
import { ChatChannel } from '../types/chat';
import { Sheet, SheetContent, SheetTrigger } from '../components/ui/sheet';
import { useIsMobile } from '../hooks/use-mobile';
import { ChatSidebar } from '../components/chat/sidebar/ChatSidebar';
import { Menu } from 'lucide-react';

const Chat: React.FC = () => {
  const { currentUser, isAdmin } = useUser();
  const isMobile = useIsMobile();
  const [activeChannel, setActiveChannel] = useState<ChatChannel>({
    id: 'general',
    name: 'Allgemein',
    type: 'channel'
  });
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [channels, setChannels] = useState<ChatChannel[]>([]);
  
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
  
  // Change active channel and close sidebar on mobile
  const handleChannelSelect = (channel: ChatChannel) => {
    setActiveChannel(channel);
    if (isMobile) {
      setSidebarOpen(false);
    }
  };
  
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
              <ChatSidebar
                channels={channels}
                activeChannel={activeChannel}
                isAdmin={isAdmin}
                setChannels={setChannels}
                setActiveChannel={setActiveChannel}
                onChannelSelect={handleChannelSelect}
              />
            </SheetContent>
          </Sheet>
        )}
        
        {/* Desktop sidebar */}
        {!isMobile && (
          <div className="w-64 border-r flex flex-col">
            <ChatSidebar
              channels={channels}
              activeChannel={activeChannel}
              isAdmin={isAdmin}
              setChannels={setChannels}
              setActiveChannel={setActiveChannel}
              onChannelSelect={handleChannelSelect}
            />
          </div>
        )}
        
        {/* Main chat area */}
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
