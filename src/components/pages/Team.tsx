import React from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { users } from '../data/mockData';
import { Avatar } from '../components/ui/avatar';
import { Mail, Phone, Award, PlusCircle } from 'lucide-react';

const Team: React.FC = () => {
  // Extended user data with more details
  const extendedUsers = [
    {
      ...users[0],
      email: 'max.schmidt@beispiel.de',
      phone: '+49 123 4567890',
      department: 'Leitung',
      stats: {
        casesHandled: 45,
        completing: 12,
        completed: 37
      }
    },
    {
      ...users[1],
      email: 'anna.mueller@beispiel.de',
      phone: '+49 123 4567891',
      department: 'Schaden',
      stats: {
        casesHandled: 78,
        completing: 8,
        completed: 52
      }
    },
    {
      ...users[2],
      email: 'thomas.weber@beispiel.de',
      phone: '+49 123 4567892',
      department: 'Vertrag',
      stats: {
        casesHandled: 63,
        completing: 5,
        completed: 41
      }
    },
    {
      ...users[3],
      email: 'sarah.becker@beispiel.de',
      phone: '+49 123 4567893',
      department: 'Kundenservice',
      stats: {
        casesHandled: 82,
        completing: 9,
        completed: 58
      }
    }
  ];

  return (
    <AppLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Team</h1>
          <p className="text-muted-foreground">Übersicht aller Teammitglieder und deren Aktivitäten.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
          <PlusCircle className="w-4 h-4" />
          <span>Teammitglied hinzufügen</span>
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {extendedUsers.map(user => (
          <div key={user.id} className="bg-card rounded-xl border border-border overflow-hidden animate-scale-in">
            <div className="h-24 bg-gradient-to-r from-primary/10 to-primary/5"></div>
            <div className="p-6 pt-0 -mt-12">
              <Avatar name={user.name} imageSrc={user.avatar} size="lg" />
              
              <h2 className="text-xl font-semibold mt-4 mb-1">{user.name}</h2>
              <p className="text-muted-foreground text-sm">{user.role}</p>
              
              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{user.email}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{user.phone}</span>
                </div>
              </div>
              
              <div className="mt-5 pt-5 border-t border-border">
                <div className="flex justify-between mb-3">
                  <div className="text-center">
                    <p className="text-2xl font-semibold">{user.stats.casesHandled}</p>
                    <p className="text-xs text-muted-foreground">Vorgänge</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-semibold">{user.stats.completing}</p>
                    <p className="text-xs text-muted-foreground">In Bearbeitung</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-semibold">{user.stats.completed}</p>
                    <p className="text-xs text-muted-foreground">Abgeschlossen</p>
                  </div>
                </div>
                
                {user.id === '3' && (
                  <div className="flex items-center gap-2 p-2 bg-amber-50 text-amber-700 rounded-lg text-xs mt-4">
                    <Award className="w-4 h-4" />
                    <span>Top-Performer des Monats</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </AppLayout>
  );
};

export default Team;
