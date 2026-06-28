import React, { useState, useEffect } from 'react';
import { Bell, X, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const DISMISSED_KEY = 'push_prompt_dismissed';

export const PushPromptBanner: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const supported = 'serviceWorker' in navigator && 'PushManager' in window;
    const dismissed = localStorage.getItem(DISMISSED_KEY);
    const alreadyGranted = Notification.permission === 'granted';
    setVisible(supported && !dismissed && !alreadyGranted);
  }, []);

  const dismiss = () => {
    localStorage.setItem(DISMISSED_KEY, '1');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="flex items-center gap-3 px-4 py-3 mb-4 bg-primary/5 border border-primary/20 rounded-xl">
      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
        <Bell className="w-4 h-4 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">Desktop-Benachrichtigungen aktivieren</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          Erhalte Hinweise zu Wiedervorlagen, überfälligen Aufgaben und der Wochenübersicht — auch wenn die App gerade nicht offen ist.
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => { dismiss(); navigate('/settings'); }}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-medium hover:bg-primary/90 transition-colors"
        >
          Aktivieren <ArrowRight className="w-3 h-3" />
        </button>
        <button onClick={dismiss} className="p-1 text-muted-foreground hover:text-foreground transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
