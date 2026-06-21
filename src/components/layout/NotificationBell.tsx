
import React, { useState, useRef, useEffect } from 'react';
import { Bell, Check, CheckCheck, MessageSquare, UserCheck, RefreshCw, Info } from 'lucide-react';
import { useNotifications, AppNotification } from '../../hooks/useNotifications';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { de } from 'date-fns/locale';

const TYPE_ICON: Record<string, React.ReactNode> = {
  mention:    <MessageSquare className="w-3.5 h-3.5 text-blue-500" />,
  assignment: <UserCheck className="w-3.5 h-3.5 text-green-500" />,
  follow_up:  <RefreshCw className="w-3.5 h-3.5 text-purple-500" />,
  system:     <Info className="w-3.5 h-3.5 text-muted-foreground" />,
};

export const NotificationBell: React.FC = () => {
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleClick = (n: AppNotification) => {
    if (!n.read) markRead(n.id);
    setOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(v => !v)}
        className="relative p-2 rounded-lg hover:bg-muted transition-colors"
        aria-label="Benachrichtigungen"
      >
        <Bell className="w-5 h-5 text-muted-foreground" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center px-1">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-11 w-80 bg-popover border border-border rounded-xl shadow-xl z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <span className="font-semibold text-sm">Benachrichtigungen</span>
            {unreadCount > 0 && (
              <button onClick={markAllRead} className="flex items-center gap-1 text-xs text-primary hover:underline">
                <CheckCheck className="w-3.5 h-3.5" /> Alle gelesen
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-[400px] overflow-y-auto divide-y divide-border/50">
            {notifications.length === 0 ? (
              <div className="py-10 text-center text-sm text-muted-foreground">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                Keine Benachrichtigungen
              </div>
            ) : notifications.map(n => {
              const content = (
                <div
                  className={`flex gap-3 px-4 py-3 hover:bg-muted/50 transition-colors cursor-pointer ${!n.read ? 'bg-primary/5' : ''}`}
                  onClick={() => handleClick(n)}
                >
                  <div className="mt-0.5 shrink-0">{TYPE_ICON[n.type] ?? TYPE_ICON.system}</div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs leading-snug mb-0.5 ${!n.read ? 'font-semibold' : ''}`}>{n.title}</p>
                    {n.body && <p className="text-xs text-muted-foreground line-clamp-2">{n.body}</p>}
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true, locale: de })}
                    </p>
                  </div>
                  {!n.read && <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />}
                </div>
              );

              return n.caseId
                ? <Link key={n.id} to={`/cases/${n.caseId}`}>{content}</Link>
                : <div key={n.id}>{content}</div>;
            })}
          </div>
        </div>
      )}
    </div>
  );
};
