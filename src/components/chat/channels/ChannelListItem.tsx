
import React from 'react';
import { Hash, Edit, Trash2 } from 'lucide-react';
import { Button } from '../../ui/button';
import { cn } from '../../../lib/utils';
import { ChatChannel } from '../../../types/chat';

interface ChannelListItemProps {
  channel: ChatChannel;
  activeChannelId: string;
  isAdmin: boolean;
  onChannelSelect: (channel: ChatChannel) => void;
  onEditChannel: (channel: ChatChannel) => void;
  onDeleteChannel: (channel: ChatChannel) => void;
}

export const ChannelListItem: React.FC<ChannelListItemProps> = ({
  channel,
  activeChannelId,
  isAdmin,
  onChannelSelect,
  onEditChannel,
  onDeleteChannel
}) => {
  const isDefaultChannel = channel.id === 'general' || channel.id === 'announcements';
  
  return (
    <div className="flex items-center group">
      <button
        className={cn(
          "w-full text-left px-2 py-1.5 rounded-md flex items-center gap-2 text-sm",
          channel.id === activeChannelId
            ? "bg-primary/10 text-primary font-medium"
            : "hover:bg-accent"
        )}
        onClick={() => onChannelSelect(channel)}
      >
        <Hash className="h-4 w-4" />
        <span>{channel.name}</span>
      </button>
      
      {isAdmin && !isDefaultChannel && (
        <div className="flex space-x-1 opacity-0 group-hover:opacity-100">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6"
            onClick={(e) => {
              e.stopPropagation();
              onEditChannel(channel);
            }}
          >
            <Edit className="h-3 w-3" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-6 w-6"
            onClick={(e) => {
              e.stopPropagation();
              onDeleteChannel(channel);
            }}
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      )}
    </div>
  );
};
