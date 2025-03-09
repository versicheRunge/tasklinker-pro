
import React from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { ChatInterface } from '../components/chat/ChatInterface';

const Chat: React.FC = () => {
  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Team-Chat</h1>
        <p className="text-muted-foreground">Kommunizieren Sie mit Ihrem Team in Echtzeit.</p>
      </div>
      
      <div className="bg-card rounded-xl border border-border h-[calc(100vh-230px)]">
        <ChatInterface />
      </div>
    </AppLayout>
  );
};

export default Chat;
