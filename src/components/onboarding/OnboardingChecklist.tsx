import React, { useState, useEffect } from 'react';
import { CheckCircle2, Circle, ChevronDown, ChevronUp, X, FileText, RefreshCw, BookUser, ClipboardList, FolderOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

const STORAGE_KEY = 'onboarding_dismissed';
const PROGRESS_KEY = 'onboarding_progress';

interface Step {
  id: string;
  label: string;
  description: string;
  icon: any;
  path: string;
  check: () => Promise<boolean>;
}

export const OnboardingChecklist: React.FC = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState(false);
  const [open, setOpen] = useState(true);
  const [done, setDone] = useState<Record<string, boolean>>({});
  const [checked, setChecked] = useState(false);

  const steps: Step[] = [
    {
      id: 'case',
      label: 'Ersten Vorgang anlegen',
      description: 'Lege einen Versicherungsvorgang für einen Kunden an.',
      icon: FileText,
      path: '/cases',
      check: async () => {
        const { count } = await supabase.from('cases').select('id', { count: 'exact', head: true });
        return (count ?? 0) > 0;
      },
    },
    {
      id: 'wvl',
      label: 'Wiedervorlage setzen',
      description: 'Öffne einen Vorgang und setze ein Wiedervorlagedatum.',
      icon: RefreshCw,
      path: '/wiedervorlagen',
      check: async () => {
        const { count } = await supabase.from('cases').select('id', { count: 'exact', head: true }).not('follow_up_date', 'is', null);
        return (count ?? 0) > 0;
      },
    },
    {
      id: 'customer',
      label: 'Kunden anlegen',
      description: 'Lege Kunden mit Telefon, E-Mail und Netzlaufwerk-Pfad an.',
      icon: BookUser,
      path: '/customers',
      check: async () => {
        const { count } = await supabase.from('customers').select('id', { count: 'exact', head: true });
        return (count ?? 0) > 0;
      },
    },
    {
      id: 'task',
      label: 'Aufgabe vergeben',
      description: 'Erstelle eine Aufgabe für dich oder weise sie einem Kollegen zu.',
      icon: ClipboardList,
      path: '/tasks',
      check: async () => {
        const { count } = await supabase.from('user_tasks').select('id', { count: 'exact', head: true });
        return (count ?? 0) > 0;
      },
    },
    {
      id: 'explorer',
      label: 'Explorer-Links einrichten',
      description: 'Öffne Einstellungen → Integrationen, um Ordnerpfade klickbar zu machen.',
      icon: FolderOpen,
      path: '/settings',
      check: async () => !!localStorage.getItem('setup_banner_dismissed'),
    },
  ];

  useEffect(() => {
    if (localStorage.getItem(STORAGE_KEY)) { setDismissed(true); return; }
    if (!profile) return;

    // Load cached progress
    const cached = localStorage.getItem(PROGRESS_KEY);
    if (cached) {
      try { setDone(JSON.parse(cached)); } catch {}
    }

    // Check real progress
    Promise.all(steps.map(async s => ({ id: s.id, done: await s.check() })))
      .then(results => {
        const newDone: Record<string, boolean> = {};
        results.forEach(r => { newDone[r.id] = r.done; });
        setDone(newDone);
        localStorage.setItem(PROGRESS_KEY, JSON.stringify(newDone));
        setChecked(true);

        // Auto-dismiss if all done
        if (results.every(r => r.done)) {
          localStorage.setItem(STORAGE_KEY, '1');
          setDismissed(true);
        }
      });
  }, [profile]);

  if (dismissed) return null;

  const completedCount = Object.values(done).filter(Boolean).length;
  const totalCount = steps.length;
  const allDone = completedCount === totalCount;
  const progressPct = Math.round((completedCount / totalCount) * 100);

  return (
    <div className="bg-card border border-border rounded-xl overflow-hidden mb-6">
      {/* Header */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center gap-3 px-5 py-3.5 hover:bg-muted/30 transition-colors text-left"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-sm">Erste Schritte</span>
            <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-medium">
              {completedCount}/{totalCount}
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {open ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
          <button
            onClick={e => { e.stopPropagation(); localStorage.setItem(STORAGE_KEY, '1'); setDismissed(true); }}
            className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Checkliste ausblenden"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </button>

      {/* Steps */}
      {open && (
        <div className="border-t border-border divide-y divide-border/50">
          {steps.map(step => {
            const isDone = done[step.id] ?? false;
            const Icon = step.icon;
            return (
              <button
                key={step.id}
                onClick={() => navigate(step.path)}
                className={`w-full flex items-center gap-3 px-5 py-3 hover:bg-muted/40 transition-colors text-left ${isDone ? 'opacity-60' : ''}`}
              >
                {isDone
                  ? <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0" />
                  : <Circle className="w-5 h-5 text-muted-foreground shrink-0" />}
                <Icon className={`w-4 h-4 shrink-0 ${isDone ? 'text-muted-foreground' : 'text-primary'}`} />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${isDone ? 'line-through text-muted-foreground' : ''}`}>{step.label}</p>
                  {!isDone && <p className="text-xs text-muted-foreground truncate">{step.description}</p>}
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
