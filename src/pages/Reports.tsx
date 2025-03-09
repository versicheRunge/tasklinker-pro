
import React, { useState } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { BarChart3, FileBarChart, ArrowUpDown, TrendingUp, Users, Download } from 'lucide-react';
import { cases } from '../data/mockData';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { toast } from "../hooks/use-toast";

const Reports = () => {
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);

  // Count cases by type
  const casesByType = cases.reduce((acc, curr) => {
    acc[curr.type] = (acc[curr.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Count cases by status
  const casesByStatus = cases.reduce((acc, curr) => {
    acc[curr.status] = (acc[curr.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const handleExportData = (format: 'json' | 'csv') => {
    let dataStr;
    let filename;

    if (format === 'json') {
      const dataToExport = cases.map(c => ({
        id: c.id,
        title: c.title,
        status: c.status,
        type: c.type,
        createdAt: c.createdAt,
        lastUpdated: c.lastUpdated,
        assignee: c.assignee.name
      }));
      
      dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dataToExport, null, 2));
      filename = "vorgaenge_export.json";
    } else {
      // Create CSV
      const headers = ['ID', 'Titel', 'Status', 'Typ', 'Erstellt am', 'Letzte Aktualisierung', 'Zugewiesen an'];
      const rows = cases.map(c => [
        c.id,
        c.title,
        c.status,
        c.type,
        new Date(c.createdAt).toLocaleDateString('de-DE'),
        new Date(c.lastUpdated).toLocaleDateString('de-DE'),
        c.assignee.name
      ]);
      
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      ].join('\n');
      
      dataStr = "data:text/csv;charset=utf-8," + encodeURIComponent(csvContent);
      filename = "vorgaenge_export.csv";
    }

    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", filename);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
    
    setIsExportDialogOpen(false);
    toast({
      title: "Export erfolgreich",
      description: `Die Daten wurden erfolgreich als ${format.toUpperCase()} exportiert.`,
    });
  };

  const openReport = (reportId: string) => {
    setSelectedReport(reportId);
    
    // In a real app, this would load the actual report
    // For now, we'll show an export dialog
    setIsExportDialogOpen(true);
  };

  return (
    <AppLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Berichte</h1>
          <p className="text-muted-foreground">Übersicht aller statistischen Daten und Auswertungen.</p>
        </div>
        <button 
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          onClick={() => setIsExportDialogOpen(true)}
        >
          <Download className="w-4 h-4" />
          <span>Daten exportieren</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <div 
          className="bg-card rounded-xl border border-border p-6 hover:shadow-md transition-all duration-300 hover:-translate-y-1 cursor-pointer animate-scale-in"
          onClick={() => openReport('categories')}
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-primary/10 p-3 rounded-lg">
              <BarChart3 className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-semibold text-lg">Vorgänge nach Kategorien</h3>
          </div>
          <div className="space-y-3 mb-4">
            {Object.entries(casesByType).map(([type, count]) => (
              <div key={type} className="flex justify-between items-center">
                <span className="text-sm">
                  {type === 'damage' ? 'Schadenmeldung' : 
                   type === 'evb' ? 'eVB-Anfrage' :
                   type === 'contract_change' ? 'Vertragsänderung' :
                   type === 'inquiry' ? 'Kundenanfrage' : 'Sonstiges'}
                </span>
                <span className="font-medium">{count}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-end">
            <span className="text-xs text-muted-foreground">Letzte Aktualisierung: Heute</span>
          </div>
        </div>

        <div 
          className="bg-card rounded-xl border border-border p-6 hover:shadow-md transition-all duration-300 hover:-translate-y-1 cursor-pointer animate-scale-in"
          onClick={() => openReport('performance')}
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-amber-100 p-3 rounded-lg">
              <TrendingUp className="w-5 h-5 text-amber-600" />
            </div>
            <h3 className="font-semibold text-lg">Performance-Analyse</h3>
          </div>
          <div className="space-y-3 mb-4">
            {Object.entries(casesByStatus).map(([status, count]) => (
              <div key={status} className="flex justify-between items-center">
                <span className="text-sm">
                  {status === 'new' ? 'Neu' : 
                   status === 'in_progress' ? 'In Bearbeitung' :
                   status === 'waiting' ? 'Wartet auf Rückmeldung' : 'Abgeschlossen'}
                </span>
                <span className="font-medium">{count}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-end">
            <span className="text-xs text-muted-foreground">Letzte Aktualisierung: Gestern</span>
          </div>
        </div>

        <div 
          className="bg-card rounded-xl border border-border p-6 hover:shadow-md transition-all duration-300 hover:-translate-y-1 cursor-pointer animate-scale-in"
          onClick={() => openReport('monthly')}
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <FileBarChart className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="font-semibold text-lg">Monatliche Zusammenfassung</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">Übersicht aller Aktivitäten des letzten Monats im Vergleich.</p>
          <div className="p-3 bg-blue-50 rounded-lg mb-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-blue-700">Neu erstellte Vorgänge</span>
              <span className="font-medium text-blue-700">{cases.length}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-blue-700">Abgeschlossene Vorgänge</span>
              <span className="font-medium text-blue-700">{casesByStatus['completed'] || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-blue-700">Ausstehende Vorgänge</span>
              <span className="font-medium text-blue-700">{cases.length - (casesByStatus['completed'] || 0)}</span>
            </div>
          </div>
          <div className="flex justify-end">
            <span className="text-xs text-muted-foreground">Letzte Aktualisierung: 01.03.2025</span>
          </div>
        </div>

        <div 
          className="bg-card rounded-xl border border-border p-6 hover:shadow-md transition-all duration-300 hover:-translate-y-1 cursor-pointer animate-scale-in"
          onClick={() => openReport('comparison')}
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-green-100 p-3 rounded-lg">
              <ArrowUpDown className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="font-semibold text-lg">Vergleichsanalyse</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">Vergleich von Bearbeitungszeiten nach Vorgangstypen.</p>
          <div className="flex justify-end">
            <span className="text-xs text-muted-foreground">Letzte Aktualisierung: 28.02.2025</span>
          </div>
        </div>

        <div 
          className="bg-card rounded-xl border border-border p-6 hover:shadow-md transition-all duration-300 hover:-translate-y-1 cursor-pointer animate-scale-in"
          onClick={() => openReport('team')}
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-purple-100 p-3 rounded-lg">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="font-semibold text-lg">Team-Performance</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">Performance-Analyse nach Team-Mitgliedern und Abteilungen.</p>
          <div className="flex justify-end">
            <span className="text-xs text-muted-foreground">Letzte Aktualisierung: 25.02.2025</span>
          </div>
        </div>
      </div>

      <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Daten exportieren</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-muted-foreground mb-4">Wählen Sie das Format für den Export der Daten:</p>
            <div className="grid grid-cols-2 gap-4">
              <button
                className="p-4 border rounded-lg flex flex-col items-center gap-2 hover:bg-primary/5 hover:border-primary/50 transition-colors"
                onClick={() => handleExportData('json')}
              >
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <FileBarChart className="w-6 h-6 text-primary" />
                </div>
                <span className="font-medium">JSON Format</span>
                <span className="text-xs text-muted-foreground">Für Datenverarbeitung</span>
              </button>
              
              <button
                className="p-4 border rounded-lg flex flex-col items-center gap-2 hover:bg-green-50 hover:border-green-200 transition-colors"
                onClick={() => handleExportData('csv')}
              >
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Download className="w-6 h-6 text-green-600" />
                </div>
                <span className="font-medium">CSV Format</span>
                <span className="text-xs text-muted-foreground">Für Excel/Tabellen</span>
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default Reports;
