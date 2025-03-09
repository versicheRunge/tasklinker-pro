
import React, { useState } from 'react';
import { Lock, Key } from 'lucide-react';
import { Button } from '../ui/button';
import { useAccessControl } from '../../hooks/useAccessControl';

export const MasterPasswordPrompt: React.FC = () => {
  const [password, setPassword] = useState('');
  const { validateAccess, error } = useAccessControl();
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    validateAccess(password);
  };
  
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-card rounded-xl shadow-lg p-6 border border-border">
        <div className="text-center mb-6">
          <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Key className="h-6 w-6 text-primary" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Zugriff Beschränkt</h1>
          <p className="text-muted-foreground">Bitte geben Sie das Master-Passwort ein, um fortzufahren</p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label htmlFor="master-password" className="block text-sm font-medium mb-1">
                Master-Passwort
              </label>
              <div className="relative">
                <input
                  id="master-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Master-Passwort eingeben"
                  autoFocus
                />
                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Standard: admin123
              </p>
            </div>
            
            {error && (
              <div className="text-destructive text-sm p-2 bg-destructive/10 rounded-md">
                {error}
              </div>
            )}
            
            <Button
              type="submit"
              className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              Zugriff erhalten
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
