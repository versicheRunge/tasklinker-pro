
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock } from 'lucide-react';
import { useUser } from '../../contexts/UserContext';
import { User as UserType } from '../../types/case';
import { CustomAvatar } from '../ui/CustomAvatar';
import { toast } from '../../hooks/use-toast';

export const LoginScreen: React.FC = () => {
  const navigate = useNavigate();
  const { users, setCurrentUser, validatePassword } = useUser();
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const passwordInputRef = useRef<HTMLInputElement>(null);
  
  const handleUserSelect = (user: UserType) => {
    setSelectedUser(user);
    setError('');
    // Set default password when selecting a user
    setPassword('password123');
    
    // Focus on password field after a short delay (to allow render to complete)
    setTimeout(() => {
      if (passwordInputRef.current) {
        passwordInputRef.current.focus();
        passwordInputRef.current.select();
      }
    }, 50);
  };
  
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedUser) {
      setError('Bitte wählen Sie einen Benutzer aus');
      return;
    }
    
    console.log('Attempting login for user:', selectedUser.name);
    console.log('With password:', password);
    
    // Validate the password
    const isValid = validatePassword(selectedUser.id, password);
    console.log('Password validation result:', isValid ? 'success' : 'failed');
    
    if (!isValid) {
      console.log('Password validation failed');
      setError('Falsches Passwort');
      return;
    }
    
    console.log('Password validation succeeded');
    setCurrentUser(selectedUser);
    toast({
      title: "Anmeldung erfolgreich",
      description: `Willkommen zurück, ${selectedUser.name}!`,
    });
    navigate('/');
  };
  
  const goBack = () => {
    setSelectedUser(null);
    setPassword('');
    setError('');
  };
  
  // Check if we have any stored user data in localStorage
  useEffect(() => {
    const storedUsers = localStorage.getItem('users');
    console.log('Stored users found:', storedUsers ? 'yes' : 'no');
  }, []);
  
  return (
    <div className="w-full max-w-md bg-card rounded-xl shadow-lg p-6 border border-border">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold mb-2">Vorgangsmanagement</h1>
        <p className="text-muted-foreground">Melden Sie sich an, um fortzufahren</p>
      </div>
      
      {!selectedUser ? (
        <div>
          <h2 className="text-lg font-medium mb-4">Benutzer auswählen</h2>
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {users.map(user => (
              <button
                key={user.id}
                className="w-full flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-accent transition-colors"
                onClick={() => handleUserSelect(user)}
              >
                <CustomAvatar name={user.name} imageSrc={user.avatar} size="md" />
                <div className="text-left">
                  <p className="font-medium">{user.name}</p>
                  <p className="text-sm text-muted-foreground">{user.role}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <form onSubmit={handleLogin}>
          <div className="flex items-center justify-center mb-6">
            <CustomAvatar name={selectedUser.name} imageSrc={selectedUser.avatar} size="lg" />
          </div>
          <h2 className="text-lg font-medium mb-2 text-center">{selectedUser.name}</h2>
          <p className="text-sm text-muted-foreground text-center mb-6">{selectedUser.role}</p>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1">
                Passwort
              </label>
              <div className="relative">
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Passwort eingeben"
                  autoFocus
                  ref={passwordInputRef}
                />
                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Standard-Passwort: password123
              </p>
            </div>
            
            {error && (
              <div className="text-destructive text-sm p-2 bg-destructive/10 rounded-md">
                {error}
              </div>
            )}
            
            <div className="flex gap-2">
              <button
                type="button"
                onClick={goBack}
                className="flex-1 px-4 py-2 border border-input rounded-md hover:bg-muted transition-colors"
              >
                Zurück
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                Anmelden
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};
