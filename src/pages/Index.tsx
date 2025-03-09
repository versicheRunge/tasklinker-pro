import React, { useState, useEffect } from 'react';
import { FileText, Users, CheckSquare, ClipboardCheck, Archive, MessageSquare, ListChecks, Calendar, Clock, AlertTriangle } from 'lucide-react';
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
import { Badge } from '../components/ui/badge';
import { format, isToday, isPast, addDays, isAfter } from 'date-fns';
import { de } from 'date-fns/locale';

const Index: React.FC = () => {
  const navigate = useNavigate();
  const { isAdmin, currentUser } = useUser();
  const [allCases, setAllCases] = useState<CaseItem[]>([]);
  
  useEffect(() => {
    const storedCases = localStorage.getItem('cases');
    if (storedCases) {
      setAllCases(JSON.parse(storedCases));
    }
  }, []);
  
  const myCases = allCases.filter(c => 
    (currentUser && (c.assignee.id === currentUser.id || (c.creator && c.creator.id === currentUser.id))) && 
    !c.archived
  );
  
  const myActiveCases = myCases.filter(c => c.status !== 'completed');
  
  const myAssignedCases = allCases.filter(c => 
    currentUser && c.assignee.id === currentUser.id && !c.archived
  );

  const myUrgentCases = myAssignedCases.filter(c => 
    c.priority === 'urgent' || c.priority === 'high' || 
    (c.dueDate && (isToday(new Date(c.dueDate)) || isPast(new Date(c.dueDate))))
  );
  
  const mySoonDueCases = myAssignedCases.filter(c => {
    if (!c.dueDate || c.status === 'completed') return false;
    const dueDate = new Date(c.dueDate);
    const threeDaysFromNow = addDays(new Date(), 3);
    return isAfter(dueDate, new Date()) && !isAfter(dueDate, threeDaysFromNow);
  });
  
  const otherCases = allCases.filter(c => 
    currentUser && c.assignee.id !== currentUser.id && !c.archived && c.status !== 'completed'
  );
  
  const newCases = allCases.filter(c => c.status === 'new' && !c.archived);
  const inProgressCases = allCases.filter(c => c.status === 'in_progress' && !c.archived);
  const waitingCases = allCases.filter(c => c.status === 'waiting' && !c.archived);
  const completedCases = allCases.filter(c => c.status === 'completed' && !c.archived);
  const activeCases = allCases.filter(c => c.status !== 'completed' && !c.archived);
  
  const handleStatCardClick = (status?: CaseStatus) => {
    navigate('/cases');
  };

  const renderPriorityBadge = (priority?: string) => {
    if (!priority) return null;
    
    const colors: Record<string, string> = {
      'low': 'bg-green-100 text-green-800',
      'medium': 'bg-blue-100 text-blue-800',
      'high': 'bg-amber-100 text-amber-800',
      'urgent': 'bg-red-100 text-red-800',
    };
    
    const labels: Record<string, string> = {
      'low': 'Niedrig',
      'medium': 'Mittel',
      'high': 'Hoch',
      'urgent': 'Dringend',
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${colors[priority]}`}>
        Prio {labels[priority]}
      </span>
    );
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
      
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-medium">Team-Chat</h2>
          </div>
          <Button variant="outline" onClick={() => navigate('/chat')}>
            Zum Chat
          </Button>
        </div>
        
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-border p-4">
          <p className="text-muted-foreground mb-3">Kommunizieren Sie in Echtzeit mit Ihrem Team.</p>
          <Button onClick={() => navigate('/chat')}>
            <MessageSquare className="mr-2 h-4 w-4" />
            Chat öffnen
          </Button>
        </div>
      </div>
      
      {currentUser && myUrgentCases.length > 0 && (
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-500" />
              <h2 className="text-xl font-medium">Dringende Aufgaben</h2>
            </div>
            <Button variant="outline" onClick={() => navigate('/cases')}>
              Alle anzeigen
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {myUrgentCases.slice(0, 3).map(caseItem => (
              <div key={caseItem.id} className="relative">
                <CaseCard key={caseItem.id} caseItem={caseItem} />
                <div className="absolute top-2 right-2 flex gap-1">
                  {caseItem.priority === 'urgent' && (
                    <Badge className="bg-red-500">Prio Dringend</Badge>
                  )}
                  {caseItem.dueDate && isPast(new Date(caseItem.dueDate)) && (
                    <Badge variant="destructive">Überfällig</Badge>
                  )}
                  {caseItem.dueDate && isToday(new Date(caseItem.dueDate)) && (
                    <Badge variant="outline" className="border-amber-500 text-amber-500">Heute fällig</Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {currentUser && mySoonDueCases.length > 0 && (
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-500" />
              <h2 className="text-xl font-medium">Bald fällige Aufgaben</h2>
            </div>
            <Button variant="outline" onClick={() => navigate('/cases')}>
              Alle anzeigen
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mySoonDueCases.slice(0, 3).map(caseItem => (
              <div key={caseItem.id} className="relative">
                <CaseCard key={caseItem.id} caseItem={caseItem} />
                <div className="absolute top-2 right-2">
                  {caseItem.dueDate && (
                    <Badge variant="outline" className="border-amber-500 text-amber-500">
                      Fällig am {format(new Date(caseItem.dueDate), 'dd.MM.yyyy', {locale: de})}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {currentUser && myActiveCases.length > 0 && (
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <ListChecks className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-medium">Meine Vorgänge</h2>
            </div>
            <Button variant="outline" onClick={() => navigate('/cases')}>
              Alle anzeigen
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {myActiveCases.slice(0, 6).map(caseItem => (
              <div key={caseItem.id} className="relative">
                <CaseCard key={caseItem.id} caseItem={caseItem} />
                <div className="absolute top-2 right-2 flex gap-1 flex-wrap">
                  {renderPriorityBadge(caseItem.priority)}
                  {caseItem.dueDate && (
                    <Badge variant="outline" className="text-xs">
                      <Calendar className="h-3 w-3 mr-1" />
                      {format(new Date(caseItem.dueDate), 'dd.MM.yyyy', {locale: de})}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
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
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-border p-6 h-full animate-scale-in">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium">Neue Vorgänge</h2>
              <a href="/cases" className="text-sm text-primary hover:underline">
                Alle ansehen
              </a>
            </div>
            
            {newCases.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {newCases.slice(0, 4).map(caseItem => (
                  <div key={caseItem.id} className="relative">
                    <CaseCard key={caseItem.id} caseItem={caseItem} />
                    <div className="absolute top-2 right-2 flex gap-1 flex-wrap">
                      {renderPriorityBadge(caseItem.priority)}
                    </div>
                  </div>
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
      
      <div className="bg-white dark:bg-slate-800 border border-border rounded-xl p-6 animate-scale-in">
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
