import React, { useState, useEffect } from 'react';
import { supabase, supabaseAdmin } from '../../lib/supabase';
import { Profile } from '../../contexts/AuthContext';
import { toast } from '../../hooks/use-toast';
import { UserPlus, Pencil, UserX, UserCheck, Key, Building2, Save } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

type Role = 'admin' | 'staff' | 'field';

const ROLE_LABELS: Record<Role, string> = {
  admin: 'Administrator',
  staff: 'Innendienst',
  field: 'Außendienst',
};

interface NewUserForm {
  full_name: string;
  email: string;
  password: string;
  phone: string;
  role: Role;
  department: string;
}

const emptyForm: NewUserForm = {
  full_name: '',
  email: '',
  password: '',
  phone: '',
  role: 'staff',
  department: '',
};

export const AdminBoard: React.FC = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [agencyName, setAgencyName] = useState('');
  const [agencyNameSaved, setAgencyNameSaved] = useState('');
  const [form, setForm] = useState<NewUserForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [tab, setTab] = useState<'users' | 'agency'>('users');

  useEffect(() => {
    loadProfiles();
    loadAgencyName();
  }, []);

  const loadProfiles = async () => {
    const { data } = await supabase.from('profiles').select('*').order('full_name');
    if (data) setProfiles(data as Profile[]);
  };

  const loadAgencyName = async () => {
    const { data } = await supabase.from('agency_settings').select('value').eq('key', 'agency_name').single();
    if (data) { setAgencyName(data.value); setAgencyNameSaved(data.value); }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const openNew = () => { setForm(emptyForm); setEditingId(null); setShowForm(true); };
  const openEdit = (p: Profile) => {
    setForm({ full_name: p.full_name, email: p.email, password: '', phone: p.phone ?? '', role: p.role, department: p.department ?? '' });
    setEditingId(p.id);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (editingId) {
      // Profil aktualisieren
      const { error } = await supabase.from('profiles').update({
        full_name: form.full_name,
        phone: form.phone,
        role: form.role,
        department: form.department,
        updated_at: new Date().toISOString(),
      }).eq('id', editingId);

      if (error) { toast({ title: 'Fehler', description: error.message, variant: 'destructive' }); }
      else { toast({ title: 'Gespeichert', description: `${form.full_name} wurde aktualisiert.` }); setShowForm(false); loadProfiles(); }
    } else {
      // Neuen User anlegen
      if (!supabaseAdmin) {
        toast({ title: 'Fehler', description: 'Service Role Key fehlt in .env (VITE_SUPABASE_SERVICE_KEY)', variant: 'destructive' });
        setIsLoading(false);
        return;
      }

      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: form.email,
        password: form.password,
        email_confirm: true,
      });

      if (authError || !authData.user) {
        toast({ title: 'Fehler', description: authError?.message ?? 'User konnte nicht erstellt werden.', variant: 'destructive' });
        setIsLoading(false);
        return;
      }

      const { error: profileError } = await supabase.from('profiles').insert({
        id: authData.user.id,
        full_name: form.full_name,
        email: form.email,
        phone: form.phone,
        role: form.role,
        department: form.department,
        is_active: true,
      });

      if (profileError) { toast({ title: 'Fehler', description: profileError.message, variant: 'destructive' }); }
      else { toast({ title: 'Mitarbeiter angelegt', description: `${form.full_name} kann sich jetzt einloggen.` }); setShowForm(false); setForm(emptyForm); loadProfiles(); }
    }

    setIsLoading(false);
  };

  const toggleActive = async (p: Profile) => {
    await supabase.from('profiles').update({ is_active: !p.is_active }).eq('id', p.id);
    loadProfiles();
    toast({ title: p.is_active ? 'Deaktiviert' : 'Aktiviert', description: `${p.full_name} wurde ${p.is_active ? 'deaktiviert' : 'reaktiviert'}.` });
  };

  const resetPassword = async (p: Profile) => {
    if (!supabaseAdmin) { toast({ title: 'Fehler', description: 'Service Role Key fehlt.', variant: 'destructive' }); return; }
    const newPw = Math.random().toString(36).slice(-10);
    await supabaseAdmin.auth.admin.updateUserById(p.id, { password: newPw });
    toast({ title: 'Passwort zurückgesetzt', description: `Neues Passwort für ${p.full_name}: ${newPw}` });
  };

  const saveAgencyName = async () => {
    await supabase.from('agency_settings').upsert({ key: 'agency_name', value: agencyName });
    setAgencyNameSaved(agencyName);
    toast({ title: 'Gespeichert', description: 'Agenturname wurde aktualisiert.' });
  };

  return (
    <div className="space-y-6">
      {/* ── Mitarbeiter-Tab ── */}
      {(
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Mitarbeiter ({profiles.length})</h2>
            <Button onClick={openNew} size="sm"><UserPlus className="h-4 w-4 mr-2" />Neu anlegen</Button>
          </div>

          {/* Formular */}
          {showForm && (
            <form onSubmit={handleSubmit} className="border border-border rounded-lg p-4 space-y-3 bg-muted/30">
              <h3 className="font-medium">{editingId ? 'Mitarbeiter bearbeiten' : 'Neuen Mitarbeiter anlegen'}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium mb-1 block">Vollständiger Name *</label>
                  <Input name="full_name" value={form.full_name} onChange={handleFormChange} placeholder="Vor- und Nachname" required />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">E-Mail *</label>
                  <Input name="email" type="email" value={form.email} onChange={handleFormChange} placeholder="name@agentur.de" required disabled={!!editingId} />
                </div>
                {!editingId && (
                  <div>
                    <label className="text-sm font-medium mb-1 block">Passwort *</label>
                    <Input name="password" type="password" value={form.password} onChange={handleFormChange} placeholder="Mindestens 8 Zeichen" required minLength={8} />
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium mb-1 block">Telefon</label>
                  <Input name="phone" value={form.phone} onChange={handleFormChange} placeholder="+49 4821 ..." />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Rolle *</label>
                  <select name="role" value={form.role} onChange={handleFormChange} className="w-full px-3 py-2 border border-input rounded-md bg-background text-sm">
                    <option value="staff">Innendienst</option>
                    <option value="field">Außendienst</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Abteilung</label>
                  <Input name="department" value={form.department} onChange={handleFormChange} placeholder="z.B. Schadensabteilung" />
                </div>
              </div>
              <div className="flex gap-2 justify-end pt-1">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Abbrechen</Button>
                <Button type="submit" disabled={isLoading}>{isLoading ? 'Wird gespeichert...' : (editingId ? 'Speichern' : 'Anlegen')}</Button>
              </div>
            </form>
          )}

          {/* Mitarbeiterliste */}
          <div className="space-y-2">
            {profiles.map(p => (
              <div key={p.id} className={`flex items-center justify-between p-3 rounded-lg border ${p.is_active ? 'border-border bg-card' : 'border-border bg-muted/40 opacity-60'}`}>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{p.full_name}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">{ROLE_LABELS[p.role]}</span>
                    {!p.is_active && <span className="text-xs text-muted-foreground">(inaktiv)</span>}
                  </div>
                  <div className="text-sm text-muted-foreground">{p.email}{p.phone ? ` · ${p.phone}` : ''}</div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="icon" title="Bearbeiten" onClick={() => openEdit(p)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" title="Passwort zurücksetzen" onClick={() => resetPassword(p)}><Key className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" title={p.is_active ? 'Deaktivieren' : 'Reaktivieren'} onClick={() => toggleActive(p)}>
                    {p.is_active ? <UserX className="h-4 w-4 text-destructive" /> : <UserCheck className="h-4 w-4 text-green-600" />}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
