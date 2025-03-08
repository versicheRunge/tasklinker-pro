
import React from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { User, Shield, Bell, Eye, Globe, Database, Lock } from 'lucide-react';

const Settings = () => {
  return (
    <AppLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Einstellungen</h1>
          <p className="text-muted-foreground">Verwalte deine persönlichen und Anwendungseinstellungen.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <nav className="space-y-1">
            {[
              { icon: User, label: 'Profil' },
              { icon: Bell, label: 'Benachrichtigungen' },
              { icon: Eye, label: 'Darstellung' },
              { icon: Shield, label: 'Sicherheit' },
              { icon: Globe, label: 'Sprache & Region' },
              { icon: Database, label: 'Daten & Speicher' },
              { icon: Lock, label: 'Datenschutz' },
            ].map((item, index) => (
              <button
                key={index}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  index === 0
                    ? 'bg-primary/10 text-primary'
                    : 'text-foreground/70 hover:bg-muted hover:text-foreground'
                }`}
              >
                <item.icon className={`w-5 h-5 ${index === 0 ? 'text-primary' : 'text-foreground/70'}`} />
                <span>{item.label}</span>
                {index === 0 && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary" />
                )}
              </button>
            ))}
          </nav>
        </div>

        <div className="lg:col-span-3 bg-card rounded-xl border border-border p-6">
          <h2 className="text-xl font-semibold mb-4">Profil</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="name">
                Name
              </label>
              <input
                id="name"
                type="text"
                className="w-full p-2 rounded-md border border-input"
                defaultValue="Max Schmidt"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="email">
                E-Mail
              </label>
              <input
                id="email"
                type="email"
                className="w-full p-2 rounded-md border border-input"
                defaultValue="max.schmidt@beispiel.de"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="role">
                Rolle
              </label>
              <select id="role" className="w-full p-2 rounded-md border border-input">
                <option>Administrator</option>
                <option>Team-Leiter</option>
                <option>Mitarbeiter</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="department">
                Abteilung
              </label>
              <select id="department" className="w-full p-2 rounded-md border border-input">
                <option>Leitung</option>
                <option>Schaden</option>
                <option>Vertrag</option>
                <option>Kundenservice</option>
              </select>
            </div>
            
            <div className="pt-4">
              <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                Speichern
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Settings;
