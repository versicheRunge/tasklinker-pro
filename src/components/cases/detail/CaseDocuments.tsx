import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { useAuth } from '../../../contexts/AuthContext';
import { toast } from '../../../hooks/use-toast';
import { FolderOpen, Plus, Copy, Trash2, Check, Paperclip, Upload, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { openLocalPath } from '../../../lib/pathProtocol';

interface Doc {
  id: string;
  file_path: string;
  description: string | null;
  created_at: string;
}

interface Props {
  caseId: string;
}

// Converts file:///Z:/Kunden/Mustermann/file.pdf → Z:\Kunden\Mustermann\file.pdf
// Also handles UNC: file://server/share/... → \\server\share\...
function uriToWindowsPath(uri: string): string {
  if (uri.startsWith('file:///')) {
    const decoded = decodeURIComponent(uri.slice(8));
    return decoded.replace(/\//g, '\\');
  }
  if (uri.startsWith('file://')) {
    const decoded = decodeURIComponent(uri.slice(5));
    return '\\' + decoded.replace(/\//g, '\\');
  }
  return uri;
}

function extractPaths(dataTransfer: DataTransfer): string[] {
  // Primary: text/uri-list (Windows Explorer drag → Chrome/Edge/Firefox)
  const uriList = dataTransfer.getData('text/uri-list');
  if (uriList) {
    const paths = uriList
      .split(/\r?\n/)
      .filter(line => line.startsWith('file://') && !line.startsWith('#'))
      .map(uriToWindowsPath)
      .filter(Boolean);
    if (paths.length > 0) return paths;
  }

  // Fallback: text/plain may contain paths on some browsers
  const plain = dataTransfer.getData('text/plain');
  if (plain && (plain.includes(':\\') || plain.startsWith('\\\\'))) {
    return plain.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
  }

  // Last resort: files array — only filename available, no full path
  if (dataTransfer.files.length > 0) {
    return Array.from(dataTransfer.files).map(f => f.name);
  }

  return [];
}

export const CaseDocuments: React.FC<Props> = ({ caseId }) => {
  const { profile } = useAuth();
  const [docs, setDocs] = useState<Doc[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [path, setPath] = useState('');
  const [desc, setDesc] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    const { data } = await supabase.from('case_documents').select('*').eq('case_id', caseId).order('created_at');
    if (data) setDocs(data);
  };

  useEffect(() => { load(); }, [caseId]);

  const addPaths = async (paths: string[], descriptions?: string[]) => {
    if (paths.length === 0) return;
    setSaving(true);
    const rows = paths.map((p, i) => ({
      case_id: caseId,
      file_path: p,
      description: descriptions?.[i] ?? null,
      added_by: profile!.id,
    }));
    const { error } = await supabase.from('case_documents').insert(rows);
    if (error) {
      toast({ title: 'Fehler', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: paths.length === 1 ? 'Datei-Verweis hinzugefügt' : `${paths.length} Verweise hinzugefügt` });
      load();
    }
    setSaving(false);
  };

  const addManual = async () => {
    if (!path.trim()) { toast({ title: 'Pfad erforderlich', variant: 'destructive' }); return; }
    await addPaths([path.trim()], [desc.trim() || undefined]);
    setPath(''); setDesc(''); setShowForm(false);
  };

  const remove = async (id: string) => {
    await supabase.from('case_documents').delete().eq('id', id);
    setDocs(prev => prev.filter(d => d.id !== id));
    toast({ title: 'Verweis gelöscht' });
  };

  const copy = (docPath: string, id: string) => {
    navigator.clipboard.writeText(docPath);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
    toast({ title: 'Pfad kopiert' });
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const onDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOver(false);

    const paths = extractPaths(e.dataTransfer);
    if (paths.length === 0) {
      toast({ title: 'Keine Pfade erkannt', description: 'Ziehe Dateien direkt aus dem Windows Explorer.', variant: 'destructive' });
      return;
    }
    await addPaths(paths);
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4 mt-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-sm flex items-center gap-2">
          <Paperclip className="w-4 h-4 text-muted-foreground" />
          Datei-Verweise ({docs.length})
        </h3>
        <button onClick={() => setShowForm(s => !s)}
          className="flex items-center gap-1 text-xs text-primary hover:underline">
          <Plus className="w-3.5 h-3.5" /> Pfad eingeben
        </button>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`mb-3 border-2 border-dashed rounded-lg px-4 py-3 text-center text-xs transition-colors cursor-default ${
          dragOver
            ? 'border-primary bg-primary/5 text-primary'
            : 'border-border text-muted-foreground hover:border-primary/40'
        }`}
      >
        <Upload className={`w-4 h-4 mx-auto mb-1 ${dragOver ? 'text-primary' : 'text-muted-foreground'}`} />
        {saving
          ? 'Wird gespeichert…'
          : dragOver
          ? 'Loslassen zum Hinzufügen'
          : 'Dateien aus dem Explorer hier reinziehen — auch mehrere gleichzeitig'}
      </div>

      {/* Manual input form */}
      {showForm && (
        <div className="mb-3 p-3 bg-muted/40 rounded-lg space-y-2">
          <input
            autoFocus
            value={path}
            onChange={e => setPath(e.target.value)}
            placeholder="Z:\Kunden\Mustermann\Police.pdf"
            className="w-full px-3 py-1.5 border border-border rounded-lg bg-background text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <div className="flex gap-2">
            <input
              value={desc}
              onChange={e => setDesc(e.target.value)}
              placeholder="Beschreibung (optional)"
              className="flex-1 px-3 py-1.5 border border-border rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <button onClick={addManual} className="px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm hover:bg-primary/90">
              Hinzufügen
            </button>
            <button onClick={() => setShowForm(false)} className="px-3 py-1.5 border border-border rounded-lg text-sm hover:bg-muted">
              ✕
            </button>
          </div>
        </div>
      )}

      {docs.length === 0 && !showForm ? (
        <p className="text-xs text-muted-foreground text-center py-1">Noch keine Verweise</p>
      ) : (
        <div className="space-y-1.5">
          {docs.map(doc => (
            <div key={doc.id} className="flex items-start gap-2 p-2 rounded-lg hover:bg-muted/40 group">
              <FolderOpen className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-mono text-foreground break-all">{doc.file_path}</p>
                {doc.description && <p className="text-xs text-muted-foreground">{doc.description}</p>}
                <p className="text-xs text-muted-foreground opacity-60">{format(new Date(doc.created_at), 'dd.MM.yyyy', { locale: de })}</p>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                <button onClick={() => openLocalPath(doc.file_path)}
                  className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-blue-600" title="Im Explorer öffnen">
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => copy(doc.file_path, doc.id)}
                  className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground" title="Pfad kopieren">
                  {copiedId === doc.id ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                <button onClick={() => remove(doc.id)}
                  className="p-1 rounded hover:bg-red-50 text-muted-foreground hover:text-red-500" title="Löschen">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
