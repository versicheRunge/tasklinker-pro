import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from '../../hooks/use-toast';

export const LoginScreen: React.FC = () => {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      setError('E-Mail oder Passwort falsch.');
      setIsLoading(false);
      return;
    }

    toast({ title: 'Anmeldung erfolgreich', description: 'Willkommen zurück!' });
    navigate('/');
  };

  return (
    <div className="w-full max-w-md bg-card rounded-xl shadow-lg p-8 border border-border">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold mb-1">TaskLinker Pro</h1>
        <p className="text-muted-foreground text-sm">Bitte melden Sie sich an</p>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">E-Mail</label>
          <div className="relative">
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background"
              placeholder="name@agentur.de"
              autoFocus
              required
            />
            <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium mb-1">Passwort</label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-10 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary bg-background"
              placeholder="Passwort eingeben"
              required
            />
            <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-2.5"
            >
              {showPassword
                ? <EyeOff className="h-5 w-5 text-muted-foreground" />
                : <Eye className="h-5 w-5 text-muted-foreground" />}
            </button>
          </div>
        </div>

        {error && (
          <div className="text-destructive text-sm p-2 bg-destructive/10 rounded-md">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2 px-4 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {isLoading ? 'Anmelden...' : 'Anmelden'}
        </button>
      </form>
    </div>
  );
};
