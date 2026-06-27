import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Search, FileText, Users, X } from 'lucide-react';
import { CASE_TYPE_LABELS } from '../../types/case';

interface Result {
  type: 'case' | 'customer';
  id: string;
  title: string;
  sub: string;
  path: string;
}

export const GlobalSearch: React.FC = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Result[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

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
        type: 'case',
        id: c.id,
        title: c.title,
        sub: [c.customer_name, CASE_TYPE_LABELS[c.type] ?? c.type].filter(Boolean).join(' · '),
        path: `/cases/${c.id}`,
      }));
      const customerResults: Result[] = (customersRes.data ?? []).map(c => ({
        type: 'customer',
        id: c.id,
        title: c.name,
        sub: [c.phone, c.email].filter(Boolean).join(' · '),
        path: `/customers`,
      }));

      setResults([...caseResults, ...customerResults]);
      setLoading(false);
    }, 200);
    return () => clearTimeout(timer);
  }, [query, profile]);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const go = (path: string) => {
    navigate(path);
    setQuery('');
    setResults([]);
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative hidden md:block">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <input
          ref={inputRef}
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder="Suchen…"
          className="w-56 pl-9 pr-8 py-1.5 text-sm border border-border rounded-lg bg-muted/50 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
        />
        {query && (
          <button onClick={() => { setQuery(''); setResults([]); }} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {open && (results.length > 0 || loading) && (
        <div className="absolute top-full mt-1 left-0 w-80 bg-popover border border-border rounded-xl shadow-lg z-50 overflow-hidden">
          {loading && <div className="px-4 py-3 text-sm text-muted-foreground">Suche…</div>}
          {!loading && results.length > 0 && (
            <ul>
              {results.map(r => (
                <li key={`${r.type}-${r.id}`}>
                  <button onClick={() => go(r.path)}
                    className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-muted/70 transition-colors text-left">
                    {r.type === 'case'
                      ? <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                      : <Users className="w-4 h-4 text-muted-foreground shrink-0" />}
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{r.title}</p>
                      {r.sub && <p className="text-xs text-muted-foreground truncate">{r.sub}</p>}
                    </div>
                    <span className="text-xs text-muted-foreground ml-auto shrink-0">
                      {r.type === 'case' ? 'Vorgang' : 'Kunde'}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          {!loading && results.length === 0 && query.length >= 2 && (
            <div className="px-4 py-3 text-sm text-muted-foreground">Keine Ergebnisse</div>
          )}
        </div>
      )}
    </div>
  );
};
