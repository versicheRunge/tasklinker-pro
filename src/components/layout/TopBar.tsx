
import React from 'react';
import { Bell, Search, MessageSquare } from 'lucide-react';

export const TopBar: React.FC = () => {
  return (
    <header className="h-16 border-b border-border px-6 flex items-center justify-between sticky top-0 z-10 bg-background/80 backdrop-blur-sm">
      <div className="flex-1">
        <div className="relative w-72">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <input
            type="text"
            placeholder="Suchen..."
            className="pl-10 pr-4 py-2 rounded-lg bg-muted/50 border border-border w-full focus:outline-none focus:ring-1 focus:ring-primary/50 focus:border-primary/50 text-sm"
          />
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <button className="w-9 h-9 flex items-center justify-center rounded-full bg-muted/50 hover:bg-muted transition-colors relative">
          <Bell className="w-5 h-5 text-foreground/70" />
          <span className="absolute top-0 right-0 w-2.5 h-2.5 rounded-full bg-primary border-2 border-background"></span>
        </button>
        
        <button className="w-9 h-9 flex items-center justify-center rounded-full bg-muted/50 hover:bg-muted transition-colors">
          <MessageSquare className="w-5 h-5 text-foreground/70" />
        </button>
        
        <div className="flex items-center space-x-3 ml-2">
          <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-medium">
            MS
          </div>
          <div className="hidden md:block">
            <div className="text-sm font-medium">Max Schmidt</div>
            <div className="text-xs text-muted-foreground">Teamleiter</div>
          </div>
        </div>
      </div>
    </header>
  );
};
