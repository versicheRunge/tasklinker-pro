
import React, { useState, useEffect } from 'react';
import { Hash } from 'lucide-react';
import { AppLayout } from '../components/layout/AppLayout';
import { TeamChat } from '../components/chat/TeamChat';
import { Button } from '../components/ui/button';
import { useUser } from '../contexts/UserContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { ChatChannel } from '../types/chat';
import { Sheet, SheetContent, SheetTrigger } from '../components/ui/sheet';
import { useIsMobile } from '../hooks/use-mobile';
import { ChatSidebar } from '../components/chat/sidebar/ChatSidebar';
import { Menu } from 'lucide-react';

const DEFAULT_CHANNELS = [
  { name: 'Allgemein', type: 'channel' as const },
  { name: 'Ankündigungen', type: 'channel' as const },
];

const Chat: React.FC = () => {
  const { currentUser, isAdmin } = useUser();
  const { profile } = useAuth();
  const isMobile = useIsMobile();
  const [activeChannel, setActiveChannel] = useState<ChatChannel | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [channels, setChannels] = useState<ChatChannel[]>([]);

  const loadChannels = async () => {
    if (!profile) return;
    const { data } = await supabase.from('chat_channels').select('*').eq('type', 'channel').order('created_at');
    if (data && data.length > 0) {
      const mapped: ChatChannel[] = data.map((c: any) => ({ id: c.id, name: c.name, type: c.type }));
      setChannels(mapped);
      if (!activeChannel) setActiveChannel(mapped[0]);
    } else {
      // Seed default channels
      for (const ch of DEFAULT_CHANNELS) {
        await supabase.from('chat_channels').insert({ ...ch, created_by: profile.id });
      }
      loadChannels();
    }
  };

  useEffect(() => { if (profile) loadChannels(); }, [profile]);
  useEffect(() => { setSidebarOpen(!isMobile); }, [isMobile]);

  const handleChannelSelect = (channel: ChatChannel) => {
    setActiveChannel(channel);
    if (isMobile) setSidebarOpen(false);
  };
  
  return (
    <AppLayout>
      <div className="flex h-[calc(100vh-130px)]">
        {isMobile && (
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="fixed left-4 top-16 z-10 md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-[280px]">
              <ChatSidebar channels={channels} activeChannel={activeChannel ?? channels[0]} isAdmin={isAdmin} setChannels={setChannels} setActiveChannel={setActiveChannel as any} onChannelSelect={handleChannelSelect} onReload={loadChannels} />
            </SheetContent>
          </Sheet>
        )}
        {!isMobile && (
          <div className="w-64 border-r flex flex-col">
            <ChatSidebar channels={channels} activeChannel={activeChannel ?? channels[0]} isAdmin={isAdmin} setChannels={setChannels} setActiveChannel={setActiveChannel as any} onChannelSelect={handleChannelSelect} onReload={loadChannels} />
          </div>
        )}
        <div className="flex-1 flex flex-col">
          {activeChannel && <>
            <div className="border-b p-3 flex items-center gap-3">
              <div className="bg-primary/10 p-1.5 rounded-md"><Hash className="h-5 w-5 text-primary" /></div>
              <div>
                <h2 className="font-medium">{activeChannel.name}</h2>
                <p className="text-xs text-muted-foreground">Team-Chat-Kanal</p>
              </div>
            </div>
            <div className="flex-1 bg-card border rounded-xl m-3 overflow-hidden">
              <TeamChat groupId={activeChannel.id} />
            </div>
          </>}
        </div>
      </div>
    </AppLayout>
  );
};

export default Chat;
