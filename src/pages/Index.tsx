
import React, { useState, useEffect } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { Card } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { useNavigate } from 'react-router-dom';
import { RecentActivity } from '../components/dashboard/RecentActivity';
import { StatCard } from '../components/dashboard/StatCard';
import { useUser } from '../contexts/UserContext';
import { BarChart3, Users, FileText, CalendarClock } from 'lucide-react';
import { useCasesManager } from '../hooks/useCasesManager';

const Index: React.FC = () => {
  const navigate = useNavigate();
  const { cases } = useCasesManager();
  const { users, currentUser } = useUser();

  // Count cases assigned to the current user
  const assignedToMeCount = cases.filter(c => 
    c.assignee && c.assignee.id === currentUser?.id && c.status !== 'archived'
  ).length;

  // Count total active cases
  const activeCasesCount = cases.filter(c => c.status !== 'archived').length;

  // Count high priority cases
  const highPriorityCount = cases.filter(c => c.priority === 'high' && c.status !== 'archived').length;

  // Count team members
  const teamCount = users.length;

  return (
    <AppLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Willkommen zurück, {currentUser?.name}.</p>
        </div>
        <Button onClick={() => navigate('/cases')}>Alle Vorgänge anzeigen</Button>
      </div>
      
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatCard 
          title="Meine Vorgänge" 
          value={assignedToMeCount.toString()}
          description="Dir zugewiesene Vorgänge"
          icon={FileText}
          onClick={() => navigate('/cases')}
        />
        <StatCard 
          title="Aktive Vorgänge" 
          value={activeCasesCount.toString()}
          description="Aktuell offene Vorgänge"
          icon={BarChart3}
          onClick={() => navigate('/cases')}
        />
        <StatCard 
          title="Hohe Priorität" 
          value={highPriorityCount.toString()}
          description="Vorgänge mit hoher Priorität"
          icon={CalendarClock}
          onClick={() => navigate('/cases')}
        />
        <StatCard 
          title="Teammitglieder" 
          value={teamCount.toString()}
          description="Aktive Teammitglieder"
          icon={Users}
          onClick={() => navigate('/team')}
        />
      </div>
      
      <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
        <Card className="col-span-2 p-4">
          <h2 className="text-xl font-semibold mb-4">Letzte Aktivitäten</h2>
          <RecentActivity />
        </Card>
        <Card className="p-4">
          <h2 className="text-xl font-semibold mb-4">Schnellzugriff</h2>
          <div className="space-y-2">
            <Button 
              variant="outline" 
              className="w-full justify-start" 
              onClick={() => navigate('/cases')}
            >
              <FileText className="mr-2 h-4 w-4" />
              Vorgänge verwalten
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start" 
              onClick={() => navigate('/calendar')}
            >
              <CalendarClock className="mr-2 h-4 w-4" />
              Kalender öffnen
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start" 
              onClick={() => navigate('/team')}
            >
              <Users className="mr-2 h-4 w-4" />
              Team anzeigen
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start" 
              onClick={() => navigate('/chat')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-4 w-4">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              Chat öffnen
            </Button>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Index;
