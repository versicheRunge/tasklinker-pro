
import React from 'react';
import { FileText, Users, CheckSquare, ClipboardCheck, Archive } from 'lucide-react';
import { AppLayout } from '../components/layout/AppLayout';
import { StatCard } from '../components/dashboard/StatCard';
import { RecentActivity } from '../components/dashboard/RecentActivity';
import { CaseCard } from '../components/cases/CaseCard';
import { dashboardStats, cases } from '../data/mockData';
import { useUser } from '../contexts/UserContext';
import { toast } from "../hooks/use-toast";

const Index: React.FC = () => {
  const newCases = cases.filter(c => c.status === 'new');
  const completedCases = cases.filter(c => c.status === 'completed');
  const { isAdmin } = useUser();
  
  return (
    <AppLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Übersicht aller aktuellen Vorgänge und Aktivitäten.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Offene Vorgänge"
          value={dashboardStats.totalCases}
          icon={FileText}
          color="bg-blue-100 text-blue-600"
        />
        <StatCard 
          title="Neue Vorgänge"
          value={dashboardStats.newCases}
          icon={ClipboardCheck}
          color="bg-purple-100 text-purple-600"
        />
        <StatCard 
          title="In Bearbeitung"
          value={dashboardStats.inProgressCases}
          icon={CheckSquare}
          color="bg-amber-100 text-amber-600"
        />
        <StatCard 
          title="Abgeschlossene Vorgänge"
          value={completedCases.length}
          icon={Archive}
          color="bg-green-100 text-green-600"
        />
      </div>
      
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
                {newCases.map(caseItem => (
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
