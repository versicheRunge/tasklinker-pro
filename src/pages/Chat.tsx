
import React from 'react';
import { MessageSquare } from 'lucide-react';
import { AppLayout } from '../components/layout/AppLayout';
import { ChatInterface } from '../components/chat/ChatInterface';

const Chat: React.FC = () => {
  return (
    <AppLayout>
      <div className="mb-6 flex items-center gap-3">
        <div className="bg-primary/10 p-2 rounded-full">
          <MessageSquare className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Team-Chat</h1>
          <p className="text-muted-foreground">Kommunizieren Sie mit Ihrem Team in Echtzeit.</p>
        </div>
      </div>
      
      <div className="bg-card rounded-xl border border-border h-[calc(100vh-230px)]">
        <ChatInterface />
      </div>
    </AppLayout>
  );
};

export default Chat;
