
import React, { useState, useEffect } from 'react';
import { FileText, Users, CheckSquare, ClipboardCheck, Archive, MessageSquare, ListChecks } from 'lucide-react';
import { AppLayout } from '../components/layout/AppLayout';
import { StatCard } from '../components/dashboard/StatCard';
import { RecentActivity } from '../components/dashboard/RecentActivity';
import { CaseCard } from '../components/cases/CaseCard';
import { dashboardStats } from '../data/mockData';
import { useUser } from '../contexts/UserContext';
import { toast } from "../hooks/use-toast";
import { useNavigate } from 'react-router-dom';
import { CaseStatus, CaseItem } from '../types/case';
import { Button } from '../components/ui/button';

const Index: React.FC = () => {
  const navigate = useNavigate();
  const { isAdmin, currentUser } = useUser();
  const [allCases, setAllCases] = useState<CaseItem[]>([]);
  
  // Load cases from localStorage
  useEffect(() => {
    const storedCases = localStorage.getItem('cases');
    if (storedCases) {
      setAllCases(JSON.parse(storedCases));
    }
  }, []);
  
  // Filter cases for the current user
  const myCases = allCases.filter(c => 
    (currentUser && (c.assignee.id === currentUser.id || (c.creator && c.creator.id === currentUser.id))) && 
    !c.archived
  );
  
  // Meine offenen Vorgänge (nicht abgeschlossen)
  const myActiveCases = myCases.filter(c => c.status !== 'completed');
  
  // Zugewiesene Aufgaben (Todo-Liste)
  const myAssignedCases = allCases.filter(c => 
    currentUser && c.assignee.id === currentUser.id && !c.archived
  );
  
  // Alle Fälle, die nicht von diesem Benutzer sind
  const otherCases = allCases.filter(c => 
    currentUser && c.assignee.id !== currentUser.id && !c.archived && c.status !== 'completed'
  );
  
  // Status-spezifische Filter
  const myNewCases = myCases.filter(c => c.status === 'new');
  const myInProgressCases = myCases.filter(c => c.status === 'in_progress');
  const myWaitingCases = myCases.filter(c => c.status === 'waiting');
  const myCompletedCases = myCases.filter(c => c.status === 'completed');
  
  // All cases (for all users)
  const newCases = allCases.filter(c => c.status === 'new' && !c.archived);
  const inProgressCases = allCases.filter(c => c.status === 'in_progress' && !c.archived);
  const waitingCases = allCases.filter(c => c.status === 'waiting' && !c.archived);
  const completedCases = allCases.filter(c => c.status === 'completed' && !c.archived);
  const activeCases = allCases.filter(c => c.status !== 'completed' && !c.archived);
  
  const handleStatCardClick = (status?: CaseStatus) => {
    navigate('/cases');
  };
  
  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Übersicht aller aktuellen Vorgänge und Aktivitäten.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div onClick={() => handleStatCardClick()}>
          <StatCard 
            title="Offene Vorgänge"
            value={activeCases.length}
            icon={FileText}
            color="bg-blue-100 text-blue-600"
            className="cursor-pointer hover:shadow-md transition-shadow"
          />
        </div>
        <div onClick={() => handleStatCardClick('new')}>
          <StatCard 
            title="Neue Vorgänge"
            value={newCases.length}
            icon={ClipboardCheck}
            color="bg-purple-100 text-purple-600"
            className="cursor-pointer hover:shadow-md transition-shadow"
          />
        </div>
        <div onClick={() => handleStatCardClick('in_progress')}>
          <StatCard 
            title="In Bearbeitung"
            value={inProgressCases.length}
            icon={CheckSquare}
            color="bg-amber-100 text-amber-600"
            className="cursor-pointer hover:shadow-md transition-shadow"
          />
        </div>
        <div onClick={() => handleStatCardClick()}>
          <StatCard 
            title="Abgeschlossene Vorgänge"
            value={completedCases.length}
            icon={Archive}
            color="bg-green-100 text-green-600"
            className="cursor-pointer hover:shadow-md transition-shadow"
          />
        </div>
      </div>
      
      {/* To-Do Liste (Zugewiesene Aufgaben) */}
      {currentUser && myAssignedCases.length > 0 && (
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <ListChecks className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-medium">Meine To-Do Liste</h2>
            </div>
            <Button variant="outline" onClick={() => navigate('/cases')}>
              Alle anzeigen
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {myAssignedCases.slice(0, 3).map(caseItem => (
              <CaseCard key={caseItem.id} caseItem={caseItem} />
            ))}
          </div>
        </div>
      )}
      
      {/* Meine Vorgänge (Eigene + Zugewiesene) */}
      {currentUser && (
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-medium">Meine Vorgänge</h2>
            <Button variant="outline" onClick={() => navigate('/cases')}>
              Alle anzeigen
            </Button>
          </div>
          
          {myActiveCases.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {myActiveCases.slice(0, 6).map(caseItem => (
                <CaseCard key={caseItem.id} caseItem={caseItem} />
              ))}
            </div>
          ) : (
            <div className="text-center py-10 bg-muted/20 rounded-lg">
              <p className="text-muted-foreground">Keine aktiven Vorgänge für Sie</p>
            </div>
          )}
        </div>
      )}
      
      {/* Alle anderen Vorgänge (von anderen Mitarbeitern) */}
      {currentUser && otherCases.length > 0 && (
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-medium">Vorgänge von Kollegen</h2>
            <Button variant="outline" onClick={() => navigate('/cases')}>
              Alle anzeigen
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {otherCases.slice(0, 3).map(caseItem => (
              <CaseCard key={caseItem.id} caseItem={caseItem} />
            ))}
          </div>
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <div className="bg-card rounded-xl border border-border p-6 h-full animate-scale-in">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium">Neue Vorgänge</h2>
              <a href="/cases" className="text-sm text-primary hover:underline">
                Alle ansehen
              </a>
            </div>
            
            {newCases.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {newCases.slice(0, 4).map(caseItem => (
                  <CaseCard key={caseItem.id} caseItem={caseItem} />
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-muted-foreground">Keine neuen Vorgänge</p>
              </div>
            )}
          </div>
        </div>
        
        <div>
          <RecentActivity activities={dashboardStats.recentActivities} />
        </div>
      </div>
      
      {isAdmin && (
        <div className="flex gap-4 mb-8">
          <button 
            className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
            onClick={() => {
              toast({
                title: "Export gestartet",
                description: "Der Export der abgeschlossenen Vorgänge wurde gestartet.",
              });
              
              // In a real app, we would trigger an actual export here
              const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(completedCases));
              const downloadAnchorNode = document.createElement('a');
              downloadAnchorNode.setAttribute("href", dataStr);
              downloadAnchorNode.setAttribute("download", "abgeschlossene_vorgaenge.json");
              document.body.appendChild(downloadAnchorNode);
              downloadAnchorNode.click();
              downloadAnchorNode.remove();
            }}
          >
            <Archive className="w-4 h-4" />
            <span>Abgeschlossene Vorgänge exportieren</span>
          </button>
        </div>
      )}
      
      <div className="bg-muted/30 border border-border rounded-xl p-6 animate-scale-in">
        <div className="flex items-start gap-4">
          <div className="bg-blue-100 p-3 rounded-lg text-blue-600">
            <ClipboardCheck className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-medium mb-1">Tipp des Tages</h3>
            <p className="text-muted-foreground">
              Nutze die Checklisten für wiederholende Vorgänge, um keine wichtigen Schritte zu vergessen und den Fortschritt im Team transparent zu halten.
            </p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Index;
