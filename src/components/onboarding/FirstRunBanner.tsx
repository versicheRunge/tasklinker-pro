import React, { useState, useEffect } from 'react';
import { X, ExternalLink, FolderOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useHints } from '../../hooks/useHints';

const STORAGE_KEY = 'setup_banner_dismissed';

export const FirstRunBanner: React.FC = () => {
  const navigate = useNavigate();
  const { hintsEnabled } = useHints();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const isWindows = navigator.platform?.startsWith('Win') || navigator.userAgent?.includes('Windows');
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (isWindows && !dismissed) setVisible(true);
  }, []);

  if (!hintsEnabled) return null;

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, '1');
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="flex items-start gap-3 px-4 py-3 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl mb-5 text-sm">
      <FolderOpen className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-blue-800 dark:text-blue-300 font-medium">Tipp: Ordnerpfade mit einem Klick öffnen</p>
        <p className="text-blue-700 dark:text-blue-400 text-xs mt-0.5">
          Richte das tasklinker://-Protokoll ein, um Kundenordner direkt aus der App zu öffnen.
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => { navigate('/settings'); dismiss(); }}
          className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded-lg text-xs hover:bg-blue-700 transition-colors"
        >
          <ExternalLink className="w-3 h-3" /> Einrichten
        </button>
        <button onClick={dismiss} className="p-1 rounded text-blue-500 hover:text-blue-700 hover:bg-blue-100 transition-colors" aria-label="Schließen">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
