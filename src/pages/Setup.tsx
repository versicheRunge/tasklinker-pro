import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, User, Mail, Lock, Phone, Eye, EyeOff } from 'lucide-react';
import { supabase, supabaseAdmin } from '../lib/supabase';
import { toast } from '../hooks/use-toast';

const Setup: React.FC = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    agency_name: 'Itzehoer Versicherungen Till Streckenbach',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Passwörter stimmen nicht überein.');
      return;
    }
    if (form.password.length < 8) {
      setError('Passwort muss mindestens 8 Zeichen haben.');
      return;
    }

    setIsLoading(true);

    if (!supabaseAdmin) {
      setError('Service Role Key fehlt – bitte .env prüfen.');
      setIsLoading(false);
      return;
    }

    // 1. Auth-Nutzer anlegen – falls bereits vorhanden, bestehenden User verwenden
    let userId: string;
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: form.email,
      password: form.password,
      email_confirm: true,
    });

    if (authError) {
      if (authError.message.toLowerCase().includes('already')) {
        // User existiert bereits – ID suchen, Email bestätigen, Passwort aktualisieren
        const { data: list } = await supabaseAdmin.auth.admin.listUsers();
        const existing = list?.users.find(u => u.email === form.email);
        if (!existing) { setError('User gefunden, aber ID nicht ermittelbar.'); setIsLoading(false); return; }
        userId = existing.id;
        // Sicherstellen dass Email bestätigt und Passwort korrekt gesetzt ist
        await supabaseAdmin.auth.admin.updateUserById(userId, {
          email_confirm: true,
          password: form.password,
        });
      } else {
        setError(authError.message);
        setIsLoading(false);
        return;
      }
    } else if (!authData.user) {
      setError('Fehler beim Anlegen des Nutzers.');
      setIsLoading(false);
      return;
    } else {
      userId = authData.user.id;
    }

    // 2. Profil anlegen (upsert falls bereits vorhanden)
    const { error: profileError } = await supabaseAdmin.from('profiles').upsert({
      id: userId,
      full_name: form.full_name,
      email: form.email,
      phone: form.phone,
      role: 'admin',
      is_active: true,
    });

    if (profileError) {
      setError('Profil konnte nicht gespeichert werden: ' + profileError.message);
      setIsLoading(false);
      return;
    }

    // 3. Agenturname speichern
    await supabaseAdmin.from('agency_settings').upsert({ key: 'agency_name', value: form.agency_name });

    toast({ title: 'Einrichtung abgeschlossen', description: 'Admin-Konto wurde erstellt.' });
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-card rounded-xl shadow-lg border border-border p-8">
        <div className="text-center mb-8">
          <div className="mx-auto h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Shield className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-2xl font-bold">Ersteinrichtung</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Legen Sie das erste Administrator-Konto an
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Agenturname</label>
            <input
              name="agency_name"
              value={form.agency_name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background"
              placeholder="Name der Versicherungsagentur"
              required
            />
          </div>

          <hr className="border-border" />

          <div>
            <label className="block text-sm font-medium mb-1">Vollständiger Name</label>
            <div className="relative">
              <input
                name="full_name"
                value={form.full_name}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                placeholder="Vor- und Nachname"
                required
              />
              <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">E-Mail</label>
            <div className="relative">
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                placeholder="admin@agentur.de"
                required
              />
              <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Telefon (optional)</label>
            <div className="relative">
              <input
                name="phone"
                type="tel"
                value={form.phone}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                placeholder="+49 4821 ..."
              />
              <Phone className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Passwort</label>
            <div className="relative">
              <input
                name="password"
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={handleChange}
                className="w-full pl-10 pr-10 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                placeholder="Mindestens 8 Zeichen"
                required
              />
              <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-2.5">
                {showPassword ? <EyeOff className="h-5 w-5 text-muted-foreground" /> : <Eye className="h-5 w-5 text-muted-foreground" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Passwort bestätigen</label>
            <div className="relative">
              <input
                name="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                value={form.confirmPassword}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background"
                placeholder="Passwort wiederholen"
                required
              />
              <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
            </div>
          </div>

          {error && (
            <div className="text-destructive text-sm p-2 bg-destructive/10 rounded-md">{error}</div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 font-medium"
          >
            {isLoading ? 'Wird eingerichtet...' : 'Admin-Konto erstellen & starten'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Setup;
