import React from 'react';
import { Bell, BellOff, CheckCircle2, Info } from 'lucide-react';
import { usePushNotifications } from '../../hooks/usePushNotifications';

export const PushNotificationSettings: React.FC = () => {
  const { isSupported, permission, isSubscribed, loading, subscribe, unsubscribe } = usePushNotifications();

  if (!isSupported) {
    return (
      <div className="flex items-start gap-2 p-3 bg-muted/50 rounded-xl text-xs text-muted-foreground">
        <Info className="w-4 h-4 shrink-0 mt-0.5" />
        Dein Browser unterstützt keine Push-Benachrichtigungen. Bitte Chrome, Firefox oder Edge verwenden.
      </div>
    );
  }

  if (permission === 'denied') {
    return (
      <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 rounded-xl text-xs text-amber-800 dark:text-amber-300">
        <Info className="w-4 h-4 shrink-0 mt-0.5" />
        Push-Benachrichtigungen sind in den Browser-Einstellungen blockiert. Bitte dort entsperren und Seite neu laden.
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between p-4 bg-card border border-border rounded-xl">
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isSubscribed ? 'bg-green-100 text-green-600' : 'bg-muted text-muted-foreground'}`}>
          {isSubscribed ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
        </div>
        <div>
          <p className="text-sm font-medium">Desktop-Benachrichtigungen</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isSubscribed
              ? 'Aktiv — du erhältst Hinweise auch wenn die App nicht offen ist'
              : 'WVL, überfällige Aufgaben & Wochenübersicht als Desktop-Notification'}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {isSubscribed && <CheckCircle2 className="w-4 h-4 text-green-500" />}
        <button
          onClick={isSubscribed ? unsubscribe : subscribe}
          disabled={loading}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-40 ${
            isSubscribed
              ? 'border border-input hover:bg-muted'
              : 'bg-primary text-primary-foreground hover:bg-primary/90'
          }`}
        >
          {loading ? '…' : isSubscribed ? 'Deaktivieren' : 'Aktivieren'}
        </button>
      </div>
    </div>
  );
};
