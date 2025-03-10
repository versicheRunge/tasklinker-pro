
import React, { useState } from 'react';
import { Lock, Key } from 'lucide-react';
import { Button } from '../ui/button';
import { useAccessControl } from '../../hooks/useAccessControl';

interface MasterPasswordPromptProps {
  onSubmit?: (oldPassword: string, newPassword: string) => void;
  onCancel?: () => void;
  mode?: 'change' | 'access';
}

export const MasterPasswordPrompt: React.FC<MasterPasswordPromptProps> = ({ 
  onSubmit, 
  onCancel,
  mode = 'access'
}) => {
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const { validateAccess, error: accessError } = useAccessControl();
  const [error, setError] = useState<string | null>(null);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (mode === 'access') {
      validateAccess(password);
    } else if (mode === 'change') {
      // Validate passwords match for password change
      if (newPassword !== confirmPassword) {
        setError("Die Passwörter stimmen nicht überein.");
        return;
      }
      
      if (newPassword.length < 6) {
        setError("Das neue Passwort muss mindestens 6 Zeichen lang sein.");
        return;
      }
      
      if (onSubmit) {
        onSubmit(password, newPassword);
      }
    }
  };
  
  return (
    <div className="bg-background p-6 rounded-xl border border-border max-w-md mx-auto">
      <div className="text-center mb-6">
        <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
          <Key className="h-6 w-6 text-primary" />
        </div>
        <h1 className="text-2xl font-bold mb-2">
          {mode === 'access' ? 'Zugriff Beschränkt' : 'Passwort ändern'}
        </h1>
        <p className="text-muted-foreground">
          {mode === 'access' 
            ? 'Bitte geben Sie das Master-Passwort ein, um fortzufahren' 
            : 'Geben Sie Ihr aktuelles Passwort und ein neues Passwort ein'}
        </p>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label htmlFor="current-password" className="block text-sm font-medium mb-1">
              {mode === 'access' ? 'Master-Passwort' : 'Aktuelles Passwort'}
            </label>
            <div className="relative">
              <input
                id="current-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder={mode === 'access' ? 'Master-Passwort eingeben' : 'Aktuelles Passwort eingeben'}
                autoFocus
              />
              <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
            </div>
          </div>
          
          {mode === 'change' && (
            <>
              <div>
                <label htmlFor="new-password" className="block text-sm font-medium mb-1">
                  Neues Passwort
                </label>
                <div className="relative">
                  <input
                    id="new-password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Neues Passwort eingeben"
                  />
                  <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                </div>
              </div>
              
              <div>
                <label htmlFor="confirm-password" className="block text-sm font-medium mb-1">
                  Passwort bestätigen
                </label>
                <div className="relative">
                  <input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Neues Passwort bestätigen"
                  />
                  <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                </div>
              </div>
            </>
          )}
          
          {(error || accessError) && (
            <div className="text-destructive text-sm p-2 bg-destructive/10 rounded-md">
              {error || accessError}
            </div>
          )}
          
          <div className="flex gap-2 justify-end">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
              >
                Abbrechen
              </Button>
            )}
            
            <Button
              type="submit"
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              {mode === 'access' ? 'Zugriff erhalten' : 'Passwort ändern'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};
