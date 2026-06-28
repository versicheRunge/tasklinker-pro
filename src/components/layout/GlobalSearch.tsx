import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Search, FileText, Users, X, ArrowLeft } from 'lucide-react';
import { CASE_TYPE_LABELS } from '../../types/case';

interface Result {
  type: 'case' | 'customer';
  id: string;
  title: string;
  sub: string;
  path: string;
}

function useSearchLogic() {
  const { profile } = useAuth();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim() || query.length < 2) { setResults([]); return; }
    const timer = setTimeout(async () => {
      if (!profile) return;
      setLoading(true);
      const term = `%${query}%`;
      const [casesRes, customersRes] = await Promise.all([
        supabase.from('cases').select('id,title,customer_name,type,status')
          .or(`title.ilike.${term},customer_name.ilike.${term}`)
          .eq('archived', false).limit(6),
        supabase.from('customers').select('id,name,phone,email')
          .or(`name.ilike.${term},phone.ilike.${term},email.ilike.${term}`)
          .limit(4),
      ]);
      const caseResults: Result[] = (casesRes.data ?? []).map(c => ({
        type: 'case', id: c.id, title: c.title,
        sub: [c.customer_name, CASE_TYPE_LABELS[c.type] ?? c.type].filter(Boolean).join(' · '),
        path: `/cases/${c.id}`,
      }));
      const customerResults: Result[] = (customersRes.data ?? []).map(c => ({
        type: 'customer', id: c.id, title: c.name,
        sub: [c.phone, c.email].filter(Boolean).join(' · '),
        path: `/customers?search=${encodeURIComponent(c.name)}`,
      }));
      setResults([...caseResults, ...customerResults]);
      setLoading(false);
    }, 200);
    return () => clearTimeout(timer);
  }, [query, profile]);

  const clear = () => { setQuery(''); setResults([]); };
  return { query, setQuery, results, loading, clear };
}

function ResultList({ results, loading, query, onSelect }: {
  results: Result[]; loading: boolean; query: string;
  onSelect: (path: string) => void;
}) {
  if (loading) return <div className="px-4 py-3 text-sm text-muted-foreground">Suche…</div>;
  if (results.length === 0 && query.length >= 2)
    return <div className="px-4 py-3 text-sm text-muted-foreground">Keine Ergebnisse für „{query}"</div>;
  return (
    <ul>
      {results.map(r => (
        <li key={`${r.type}-${r.id}`}>
          <button onClick={() => onSelect(r.path)}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/70 transition-colors text-left">
            {r.type === 'case'
              ? <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
              : <Users className="w-4 h-4 text-muted-foreground shrink-0" />}
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{r.title}</p>
              {r.sub && <p className="text-xs text-muted-foreground truncate">{r.sub}</p>}
            </div>
            <span className="text-xs text-muted-foreground ml-auto shrink-0 bg-muted px-1.5 py-0.5 rounded">
              {r.type === 'case' ? 'Vorgang' : 'Kunde'}
            </span>
          </button>
        </li>
      ))}
    </ul>
  );
}

export const GlobalSearch: React.FC = () => {
  const navigate = useNavigate();
  const { query, setQuery, results, loading, clear } = useSearchLogic();
  const [open, setOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);

  // Close desktop dropdown on outside click
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  // Focus mobile input when overlay opens
  useEffect(() => {
    if (mobileOpen) setTimeout(() => mobileInputRef.current?.focus(), 50);
  }, [mobileOpen]);

  const go = (path: string) => {
    navigate(path); clear(); setOpen(false); setMobileOpen(false);
  };

  const openMobile = () => { clear(); setMobileOpen(true); };
  const closeMobile = () => { clear(); setMobileOpen(false); };

  return (
    <>
      {/* Desktop search */}
      <div ref={containerRef} className="relative hidden md:block">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={query}
            onChange={e => { setQuery(e.target.value); setOpen(true); }}
            onFocus={() => setOpen(true)}
            placeholder="Suchen…"
            className="w-56 pl-9 pr-8 py-1.5 text-sm border border-border rounded-lg bg-muted/50 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
          {query && (
            <button onClick={() => { clear(); setOpen(false); }} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        {open && (results.length > 0 || loading || query.length >= 2) && (
          <div className="absolute top-full mt-1 left-0 w-80 bg-popover border border-border rounded-xl shadow-lg z-50 overflow-hidden">
            <ResultList results={results} loading={loading} query={query} onSelect={go} />
          </div>
        )}
      </div>

      {/* Mobile search trigger button */}
      <button
        onClick={openMobile}
        className="md:hidden p-2 rounded-md text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
        aria-label="Suchen"
      >
        <Search className="h-5 w-5" />
      </button>

      {/* Mobile full-screen overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 bg-background flex flex-col md:hidden">
          {/* Header */}
          <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
            <button onClick={closeMobile} className="p-2 -ml-2 rounded-md text-muted-foreground hover:text-foreground">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                ref={mobileInputRef}
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder="Vorgänge, Kunden suchen…"
                className="w-full pl-9 pr-8 py-2 text-sm border border-border rounded-lg bg-muted/50 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              {query && (
                <button onClick={clear} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Results */}
          <div className="flex-1 overflow-auto">
            {query.length < 2 ? (
              <div className="px-4 py-8 text-center text-muted-foreground">
                <Search className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">Mindestens 2 Zeichen eingeben</p>
              </div>
            ) : (
              <ResultList results={results} loading={loading} query={query} onSelect={go} />
            )}
          </div>
        </div>
      )}
    </>
  );
};
