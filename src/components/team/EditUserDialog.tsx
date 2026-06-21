
import React, { useState } from 'react';
import { DialogContent, DialogHeader, DialogTitle, DialogFooter } from "../../components/ui/dialog";
import { User } from '../../types/case';
import { supabaseAdmin } from '../../lib/supabase';
import { toast } from '../../hooks/use-toast';
import { KeyRound, Eye, EyeOff, RotateCcw, CheckCircle2 } from 'lucide-react';

const DEFAULT_PASSWORD = 'itzehoer01';

interface EditUserDialogProps {
  editingUser: User;
  setEditingUser: React.Dispatch<React.SetStateAction<User>>;
  currentUserId?: string;
  onCancel: () => void;
  onSave: () => void;
}

export const EditUserDialog: React.FC<EditUserDialogProps> = ({
  editingUser, setEditingUser, currentUserId, onCancel, onSave
}) => {
  const [pwMode, setPwMode] = useState<'none' | 'set' | 'reset'>('none');
  const [newPassword, setNewPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);
  const [pwDone, setPwDone] = useState(false);

  const isOwnAccount = editingUser.id === currentUserId;

  const handleSetPassword = async () => {
    if (!supabaseAdmin || !newPassword || newPassword.length < 6) {
      toast({ title: 'Mindestens 6 Zeichen erforderlich', variant: 'destructive' });
      return;
    }
    setPwLoading(true);
    const { error } = await supabaseAdmin.auth.admin.updateUserById(editingUser.id, { password: newPassword });
    if (error) {
      toast({ title: 'Fehler', description: error.message, variant: 'destructive' });
    } else {
      setPwDone(true);
      toast({ title: 'Passwort gesetzt', description: `Passwort für ${editingUser.name} wurde geändert.` });
    }
    setPwLoading(false);
  };

  const handleResetToDefault = async () => {
    if (!supabaseAdmin) return;
    setPwLoading(true);
    const { error } = await supabaseAdmin.auth.admin.updateUserById(editingUser.id, { password: DEFAULT_PASSWORD });
    if (error) {
      toast({ title: 'Fehler', description: error.message, variant: 'destructive' });
    } else {
      setPwDone(true);
      toast({ title: 'Passwort zurückgesetzt', description: `Passwort auf "${DEFAULT_PASSWORD}" zurückgesetzt.` });
    }
    setPwLoading(false);
  };

  return (
    <DialogContent className="sm:max-w-[500px]">
      <DialogHeader>
        <DialogTitle>Benutzer bearbeiten</DialogTitle>
      </DialogHeader>
      <div className="space-y-4 py-4">
        <div>
          <label className="block text-sm font-medium mb-1">Name*</label>
          <input
            className="w-full p-2 rounded-md border border-input"
            value={editingUser.name}
            onChange={(e) => setEditingUser({...editingUser, name: e.target.value})}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">E-Mail</label>
          <input
            type="email"
            className="w-full p-2 rounded-md border border-input bg-muted text-muted-foreground cursor-not-allowed"
            value={editingUser.email}
            readOnly
          />
          <p className="text-xs text-muted-foreground mt-1">E-Mail kann nur über Supabase Admin geändert werden.</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Abteilung</label>
            <select
              className="w-full p-2 rounded-md border border-input bg-background"
              value={editingUser.department ?? 'innendienst'}
              onChange={(e) => setEditingUser({...editingUser, department: e.target.value})}
            >
              <option value="innendienst">Innendienst</option>
              <option value="aussendienst">Außendienst</option>
              <option value="leitung">Agenturleitung</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Telefon</label>
            <input
              className="w-full p-2 rounded-md border border-input"
              value={editingUser.phone ?? ''}
              onChange={(e) => setEditingUser({...editingUser, phone: e.target.value})}
              placeholder="+49123456789"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Systemrolle</label>
          <select
            className="w-full p-2 rounded-md border border-input"
            value={editingUser.userRole}
            onChange={(e) => setEditingUser({ ...editingUser, userRole: e.target.value as 'admin' | 'staff' })}
            disabled={isOwnAccount}
          >
            <option value="staff">Mitarbeiter (eingeschränkter Zugriff)</option>
            <option value="admin">Administrator (voller Zugriff)</option>
          </select>
        </div>

        {/* Password management — only shown for other users, not own account */}
        {!isOwnAccount && (
          <div className="border border-border rounded-lg overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 bg-muted/40">
              <div className="flex items-center gap-2 text-sm font-medium">
                <KeyRound className="w-4 h-4 text-muted-foreground" />
                Passwort verwalten
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => { setPwMode(pwMode === 'set' ? 'none' : 'set'); setPwDone(false); setNewPassword(''); }}
                  className={`text-xs px-2.5 py-1 rounded-md transition-colors ${pwMode === 'set' ? 'bg-primary text-primary-foreground' : 'hover:bg-muted border border-input'}`}
                >
                  Passwort setzen
                </button>
                <button
                  onClick={() => { setPwMode(pwMode === 'reset' ? 'none' : 'reset'); setPwDone(false); }}
                  className={`text-xs px-2.5 py-1 rounded-md transition-colors ${pwMode === 'reset' ? 'bg-amber-500 text-white' : 'hover:bg-muted border border-input'}`}
                >
                  <RotateCcw className="w-3 h-3 inline mr-1" />
                  Auf Standard zurücksetzen
                </button>
              </div>
            </div>

            {pwDone && (
              <div className="flex items-center gap-2 px-4 py-3 text-sm text-green-700 bg-green-50 border-t border-border">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                Passwort wurde erfolgreich geändert.
              </div>
            )}

            {pwMode === 'set' && !pwDone && (
              <div className="px-4 py-3 space-y-2 border-t border-border">
                <p className="text-xs text-muted-foreground">Neues Passwort für {editingUser.name} festlegen (mind. 6 Zeichen):</p>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type={showPw ? 'text' : 'password'}
                      className="w-full p-2 pr-9 rounded-md border border-input text-sm"
                      value={newPassword}
                      onChange={e => setNewPassword(e.target.value)}
                      placeholder="Neues Passwort…"
                      onKeyDown={e => e.key === 'Enter' && handleSetPassword()}
                    />
                    <button
                      type="button"
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
                      onClick={() => setShowPw(!showPw)}
                    >
                      {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <button
                    onClick={handleSetPassword}
                    disabled={pwLoading || newPassword.length < 6}
                    className="px-3 py-2 bg-primary text-primary-foreground rounded-md text-sm disabled:opacity-50"
                  >
                    {pwLoading ? 'Setze…' : 'Setzen'}
                  </button>
                </div>
                <button
                  className="text-xs text-primary hover:underline"
                  onClick={() => setNewPassword(DEFAULT_PASSWORD)}
                >
                  Standardpasswort "{DEFAULT_PASSWORD}" einfügen
                </button>
              </div>
            )}

            {pwMode === 'reset' && !pwDone && (
              <div className="px-4 py-3 space-y-2 border-t border-border">
                <p className="text-sm text-muted-foreground">
                  Das Passwort von <strong>{editingUser.name}</strong> wird auf <code className="bg-muted px-1 rounded">{DEFAULT_PASSWORD}</code> zurückgesetzt.
                </p>
                <button
                  onClick={handleResetToDefault}
                  disabled={pwLoading}
                  className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded-lg text-sm hover:bg-amber-600 disabled:opacity-50"
                >
                  <RotateCcw className={`w-4 h-4 ${pwLoading ? 'animate-spin' : ''}`} />
                  {pwLoading ? 'Wird zurückgesetzt…' : `Auf "${DEFAULT_PASSWORD}" zurücksetzen`}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <DialogFooter>
        <button className="px-4 py-2 rounded-lg border border-input hover:bg-muted transition-colors" onClick={onCancel}>
          Abbrechen
        </button>
        <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors" onClick={onSave}>
          Änderungen speichern
        </button>
      </DialogFooter>
    </DialogContent>
  );
};
