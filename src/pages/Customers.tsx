import React, { useState, useEffect } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { toast } from '../hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, FolderOpen, Copy, Pencil, Trash2, Phone, Mail, Check, Users, Upload, ExternalLink } from 'lucide-react';
import { Button } from '../components/ui/button';
import { openLocalPath } from '../lib/pathProtocol';

function uriToWindowsPath(uri: string): string {
  if (uri.startsWith('file:///')) return decodeURIComponent(uri.slice(8)).replace(/\//g, '\\');
  if (uri.startsWith('file://'))  return '\\' + decodeURIComponent(uri.slice(5)).replace(/\//g, '\\');
  return uri;
}

function extractFirstPath(dataTransfer: DataTransfer): string | null {
  const uriList = dataTransfer.getData('text/uri-list');
  if (uriList) {
    const first = uriList.split(/\r?\n/).find(l => l.startsWith('file://') && !l.startsWith('#'));
    if (first) return uriToWindowsPath(first);
  }
  const plain = dataTransfer.getData('text/plain');
  if (plain && (plain.includes(':\\') || plain.startsWith('\\\\'))) return plain.trim();
  return null;
}

interface Customer {
  id: string;
  name: string;
  folder_path: string | null;
  phone: string | null;
  email: string | null;
  notes: string | null;
  created_at: string;
}

const EMPTY: Omit<Customer, 'id' | 'created_at'> = {
  name: '', folder_path: '', phone: '', email: '', notes: '',
};

export default function Customers() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...EMPTY });
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [folderDragOver, setFolderDragOver] = useState(false);

  const load = async () => {
    setIsLoading(true);
    const { data } = await supabase.from('customers').select('*').order('name');
    if (data) setCustomers(data);
    setIsLoading(false);
  };

  useEffect(() => { if (profile) load(); }, [profile]);

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.phone ?? '').includes(search) ||
    (c.email ?? '').toLowerCase().includes(search.toLowerCase())
  );

  const openNew = () => { setForm({ ...EMPTY }); setEditId(null); setShowForm(true); };
  const openEdit = (c: Customer) => {
    setForm({ name: c.name, folder_path: c.folder_path ?? '', phone: c.phone ?? '', email: c.email ?? '', notes: c.notes ?? '' });
    setEditId(c.id);
    setShowForm(true);
  };

  const save = async () => {
    if (!form.name.trim()) { toast({ title: 'Name erforderlich', variant: 'destructive' }); return; }
    if (editId) {
      const { error } = await supabase.from('customers').update({ ...form, updated_at: new Date().toISOString() }).eq('id', editId);
      if (error) { toast({ title: 'Fehler', description: error.message, variant: 'destructive' }); return; }
      toast({ title: 'Kunde gespeichert' });
    } else {
      const { error } = await supabase.from('customers').insert({ ...form, created_by: profile?.id });
      if (error) { toast({ title: 'Fehler', description: error.message, variant: 'destructive' }); return; }
      toast({ title: 'Kunde angelegt' });
    }
    setShowForm(false);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm('Kunden wirklich löschen?')) return;
    await supabase.from('customers').delete().eq('id', id);
    setCustomers(prev => prev.filter(c => c.id !== id));
    toast({ title: 'Kunde gelöscht' });
  };

  const copyPath = (path: string, id: string) => {
    navigator.clipboard.writeText(path);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
    toast({ title: 'Pfad kopiert' });
  };

  const searchCases = (name: string) => {
    navigate(`/cases?customer=${encodeURIComponent(name)}`);
  };

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Kundenstamm</h1>
            <p className="text-muted-foreground text-sm mt-1">Netzlaufwerk-Verweise zu Kundenordnern</p>
          </div>
          <Button onClick={openNew} className="flex items-center gap-2">
            <Plus className="w-4 h-4" /> Kunde anlegen
          </Button>
        </div>

        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Name, Telefon oder E-Mail suchen…"
            className="w-full pl-9 pr-4 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* Form */}
        {showForm && (
          <div className="bg-card border border-border rounded-xl p-5 mb-6 space-y-3">
            <h2 className="font-semibold text-base">{editId ? 'Kunde bearbeiten' : 'Neuer Kunde'}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Name *</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Max Mustermann"
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Telefon</label>
                <input value={form.phone ?? ''} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  placeholder="04821 12345"
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">E-Mail</label>
                <input value={form.email ?? ''} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="max@mustermann.de"
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Netzlaufwerk-Pfad</label>
                <div
                  onDragOver={e => { e.preventDefault(); setFolderDragOver(true); }}
                  onDragLeave={() => setFolderDragOver(false)}
                  onDrop={e => {
                    e.preventDefault();
                    setFolderDragOver(false);
                    const p = extractFirstPath(e.dataTransfer);
                    if (p) setForm(f => ({ ...f, folder_path: p }));
                    else toast({ title: 'Pfad nicht erkannt', description: 'Ordner direkt aus dem Windows Explorer ziehen.', variant: 'destructive' });
                  }}
                  className={`relative rounded-lg border transition-colors ${folderDragOver ? 'border-primary bg-primary/5' : 'border-border'}`}
                >
                  <input value={form.folder_path ?? ''} onChange={e => setForm(f => ({ ...f, folder_path: e.target.value }))}
                    placeholder="Z:\Kunden\Mustermann Max — oder Ordner reinziehen"
                    className="w-full px-3 py-2 bg-background text-sm font-mono focus:outline-none rounded-lg" />
                  {folderDragOver && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-lg pointer-events-none">
                      <span className="text-primary text-xs font-medium flex items-center gap-1"><Upload className="w-3.5 h-3.5" /> Ordner loslassen</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs text-muted-foreground mb-1 block">Notiz</label>
                <input value={form.notes ?? ''} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  placeholder="Freitext…"
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <Button onClick={save}>Speichern</Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Abbrechen</Button>
            </div>
          </div>
        )}

        {/* List */}
        {isLoading ? (
          <div className="space-y-2 animate-pulse">
            {[1,2,3].map(i => <div key={i} className="h-16 bg-muted rounded-xl" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="font-medium">{search ? 'Kein Kunde gefunden' : 'Noch keine Kunden angelegt'}</p>
            {!search && <p className="text-sm mt-1">Klicke auf "Kunde anlegen" um zu beginnen.</p>}
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(c => (
              <div key={c.id} className="bg-card border border-border rounded-xl px-4 py-3 flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-primary font-bold text-sm">{c.name[0]?.toUpperCase()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{c.name}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5 flex-wrap">
                    {c.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{c.phone}</span>}
                    {c.email && <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{c.email}</span>}
                    {c.folder_path && (
                      <span className="flex items-center gap-1 font-mono text-xs bg-muted px-1.5 py-0.5 rounded max-w-xs truncate">
                        <FolderOpen className="w-3 h-3 shrink-0" />{c.folder_path}
                      </span>
                    )}
                    {c.notes && <span className="italic truncate max-w-xs">{c.notes}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {c.folder_path && (
                    <>
                      <button onClick={() => openLocalPath(c.folder_path!)}
                        className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-blue-600 transition-colors"
                        title="Im Explorer öffnen">
                        <ExternalLink className="w-4 h-4" />
                      </button>
                      <button onClick={() => copyPath(c.folder_path!, c.id)}
                        className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                        title="Pfad kopieren">
                        {copiedId === c.id ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </>
                  )}
                  <button onClick={() => searchCases(c.name)}
                    className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                    title="Vorgänge anzeigen">
                    <Search className="w-4 h-4" />
                  </button>
                  <button onClick={() => openEdit(c)}
                    className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                    title="Bearbeiten">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => remove(c.id)}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-red-600 transition-colors"
                    title="Löschen">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
