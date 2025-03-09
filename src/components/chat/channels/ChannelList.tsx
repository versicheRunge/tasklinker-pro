
import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '../../ui/button';
import { ScrollArea } from '../../ui/scroll-area';
import { ChatChannel } from '../../../types/chat';
import { ChannelListItem } from './ChannelListItem';

interface ChannelListProps {
  channels: ChatChannel[];
  activeChannelId: string;
  searchQuery: string;
  isAdmin: boolean;
  onAddChannel: () => void;
  onChannelSelect: (channel: ChatChannel) => void;
  onEditChannel: (channel: ChatChannel) => void;
  onDeleteChannel: (channel: ChatChannel) => void;
}

export const ChannelList: React.FC<ChannelListProps> = ({
  channels,
  activeChannelId,
  searchQuery,
  isAdmin,
  onAddChannel,
  onChannelSelect,
  onEditChannel,
  onDeleteChannel
}) => {
  // Filter channels based on search query
  const filteredChannels = channels.filter(channel => 
    channel.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <ScrollArea className="flex-1">
      <div className="p-2">
        <div className="flex items-center justify-between px-2 py-1">
          <h3 className="text-xs font-semibold text-muted-foreground">Kanäle</h3>
          {isAdmin && (
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onAddChannel}>
              <Plus className="h-4 w-4" />
            </Button>
          )}
        </div>
        <div className="mt-1 space-y-[2px]">
          {filteredChannels.map(channel => (
            <ChannelListItem
              key={channel.id}
              channel={channel}
              activeChannelId={activeChannelId}
              isAdmin={isAdmin}
              onChannelSelect={onChannelSelect}
              onEditChannel={onEditChannel}
              onDeleteChannel={onDeleteChannel}
            />
          ))}
        </div>
      </div>
    </ScrollArea>
  );
};
