
import React, { useState, useEffect } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { cases } from '../data/mockData';
import { BarChart3, FileBarChart, ArrowUpDown, TrendingUp, Users, Download, FileText } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { toast } from "../hooks/use-toast";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useUser } from '../contexts/UserContext';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

const Reports = () => {
  const [selectedReport, setSelectedReport] = useState<string | null>(null);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const { users } = useUser();
  const [lastUpdated, setLastUpdated] = useState<string>(format(new Date(), 'dd.MM.yyyy', { locale: de }));
  
  // Auto-update lastUpdated date
  useEffect(() => {
    setLastUpdated(format(new Date(), 'dd.MM.yyyy', { locale: de }));
  }, []);

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
  
  // Count cases by assignee
  const casesByAssignee = cases.reduce((acc, curr) => {
    const assigneeId = curr.assignee.id;
    acc[assigneeId] = (acc[assigneeId] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  // Count completed cases by assignee
  const completedCasesByAssignee = cases
    .filter(c => c.status === 'completed')
    .reduce((acc, curr) => {
      const assigneeId = curr.assignee.id;
      acc[assigneeId] = (acc[assigneeId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  
  // Calculate average resolution time by case type (mock data for demonstration)
  const avgResolutionByType = {
    'damage': '3.2 Tage',
    'evb': '1.5 Tage',
    'contract_change': '2.8 Tage',
    'inquiry': '1.2 Tage',
    'other': '2.0 Tage'
  };

  // Function to translate case types
  const translateCaseType = (type: string): string => {
    switch (type) {
      case 'damage': return 'Schadenmeldung';
      case 'evb': return 'eVB-Anfrage';
      case 'contract_change': return 'Vertragsänderung';
      case 'inquiry': return 'Kundenanfrage';
      default: return 'Sonstiges';
    }
  };

  // Function to translate case status
  const translateCaseStatus = (status: string): string => {
    switch (status) {
      case 'new': return 'Neu';
      case 'in_progress': return 'In Bearbeitung';
      case 'waiting': return 'Wartet auf Rückmeldung';
      case 'completed': return 'Abgeschlossen';
      default: return status;
    }
  };

  const handleExportData = (format: 'json' | 'csv' | 'pdf') => {
    if (format === 'json') {
      const dataToExport = cases.map(c => ({
        id: c.id,
        titel: c.title,
        status: translateCaseStatus(c.status),
        typ: translateCaseType(c.type),
        erstelltAm: c.createdAt,
        letzteAktualisierung: c.lastUpdated,
        zugewiesenAn: c.assignee.name
      }));
      
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dataToExport, null, 2));
      const filename = "vorgaenge_export.json";
      
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", filename);
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
    } 
    else if (format === 'csv') {
      // CSV erstellen
      const headers = ['ID', 'Titel', 'Status', 'Typ', 'Erstellt am', 'Letzte Aktualisierung', 'Zugewiesen an'];
      const rows = cases.map(c => [
        c.id,
        c.title,
        translateCaseStatus(c.status),
        translateCaseType(c.type),
        new Date(c.createdAt).toLocaleDateString('de-DE'),
        new Date(c.lastUpdated).toLocaleDateString('de-DE'),
        c.assignee.name
      ]);
      
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      ].join('\n');
      
      const dataStr = "data:text/csv;charset=utf-8," + encodeURIComponent(csvContent);
      const filename = "vorgaenge_export.csv";
      
      const downloadAnchorNode = document.createElement('a');
      downloadAnchorNode.setAttribute("href", dataStr);
      downloadAnchorNode.setAttribute("download", filename);
      document.body.appendChild(downloadAnchorNode);
      downloadAnchorNode.click();
      downloadAnchorNode.remove();
    }
    else if (format === 'pdf') {
      // PDF erstellen mit jsPDF
      const pdf = new jsPDF();
      
      // Titel
      pdf.setFontSize(20);
      pdf.text('Vorgänge - Exportbericht', 14, 22);
      pdf.setFontSize(12);
      pdf.text(`Erstellt am: ${new Date().toLocaleDateString('de-DE')}`, 14, 32);
      
      // Tabellendaten vorbereiten
      const tableColumn = ['ID', 'Titel', 'Status', 'Typ', 'Erstellt am', 'Zugewiesen an'];
      const tableRows = cases.map(c => [
        c.id,
        c.title,
        translateCaseStatus(c.status),
        translateCaseType(c.type),
        new Date(c.createdAt).toLocaleDateString('de-DE'),
        c.assignee.name
      ]);
      
      // Tabelle erstellen
      autoTable(pdf, {
        head: [tableColumn],
        body: tableRows,
        startY: 40,
        styles: { 
          fontSize: 9,
          cellPadding: 3
        },
        headStyles: {
          fillColor: [60, 60, 60],
          textColor: [255, 255, 255],
          fontStyle: 'bold'
        }
      });
      
      // PDF speichern
      pdf.save('vorgaenge_export.pdf');
    }
    
    setIsExportDialogOpen(false);
    toast({
      title: "Export erfolgreich",
      description: `Die Daten wurden erfolgreich als ${format.toUpperCase()} exportiert.`,
    });
  };

  const exportReportToPdf = (reportId: string) => {
    const pdf = new jsPDF();
    let currentY = 20;
    
    // Report title based on ID
    let title = "Bericht";
    let reportData: any[] = [];
    
    switch(reportId) {
      case 'categories':
        title = "Vorgänge nach Kategorien";
        reportData = Object.entries(casesByType).map(([type, count]) => 
          [translateCaseType(type), count.toString()]);
        break;
      case 'performance':
        title = "Performance-Analyse";
        reportData = Object.entries(casesByStatus).map(([status, count]) =>
          [translateCaseStatus(status), count.toString()]);
        break;
      case 'monthly':
        title = "Monatliche Zusammenfassung";
        reportData = [
          ["Neu erstellte Vorgänge", cases.length.toString()],
          ["Abgeschlossene Vorgänge", (casesByStatus['completed'] || 0).toString()],
          ["Ausstehende Vorgänge", (cases.length - (casesByStatus['completed'] || 0)).toString()]
        ];
        break;
      case 'comparison':
        title = "Vergleichsanalyse - Bearbeitungszeiten";
        reportData = Object.entries(avgResolutionByType).map(([type, time]) => 
          [translateCaseType(type), time]);
        break;
      case 'team':
        title = "Team-Performance";
        reportData = Object.entries(casesByAssignee)
          .map(([userId, count]) => {
            const user = users.find(u => u.id === userId);
            const completedCount = completedCasesByAssignee[userId] || 0;
            const completionRate = count > 0 ? Math.round((completedCount / count) * 100) : 0;
            
            return [
              user?.name || 'Unbekannt',
              `${count} Vorgänge`,
              `${completedCount} abgeschlossen`,
              `${completionRate}% Abschlussrate`
            ];
          });
        break;
    }
    
    // Title
    pdf.setFontSize(22);
    pdf.text(title, 14, currentY);
    currentY += 10;
    
    // Date
    pdf.setFontSize(12);
    pdf.text(`Bericht erstellt am: ${format(new Date(), 'dd.MM.yyyy', { locale: de })}`, 14, currentY);
    currentY += 15;
    
    // Table headers
    let headers: string[] = [];
    
    switch(reportId) {
      case 'categories':
      case 'performance':
        headers = ['Kategorie', 'Anzahl'];
        break;
      case 'monthly':
        headers = ['Metrik', 'Wert'];
        break;
      case 'comparison':
        headers = ['Vorgangstyp', 'Durchschnittliche Bearbeitungszeit'];
        break;
      case 'team':
        headers = ['Mitarbeiter', 'Anzahl Vorgänge', 'Abgeschlossen', 'Abschlussrate'];
        break;
    }
    
    // Table data
    autoTable(pdf, {
      head: [headers],
      body: reportData,
      startY: currentY,
      styles: { fontSize: 10, cellPadding: 5 },
      headStyles: {
        fillColor: [60, 60, 60],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      }
    });
    
    // Save PDF
    pdf.save(`${title.toLowerCase().replace(/\s+/g, '_')}_export.pdf`);
    
    toast({
      title: "PDF Export erfolgreich",
      description: `Der Bericht "${title}" wurde als PDF exportiert.`
    });
  };

  const openReport = (reportId: string) => {
    setSelectedReport(reportId);
    
    // PDF-Export for the selected report
    exportReportToPdf(reportId);
  };

  // Get top 3 team members by case count
  const getTopTeamMembers = () => {
    return Object.entries(casesByAssignee)
      .map(([userId, count]) => ({
        userId,
        name: users.find(u => u.id === userId)?.name || 'Unbekannt',
        count,
        completed: completedCasesByAssignee[userId] || 0
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);
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
                <span className="text-sm">{translateCaseType(type)}</span>
                <span className="font-medium">{count}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-end">
            <span className="text-xs text-muted-foreground">Letzte Aktualisierung: {lastUpdated}</span>
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
                <span className="text-sm">{translateCaseStatus(status)}</span>
                <span className="font-medium">{count}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-end">
            <span className="text-xs text-muted-foreground">Letzte Aktualisierung: {lastUpdated}</span>
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
            <span className="text-xs text-muted-foreground">Letzte Aktualisierung: {lastUpdated}</span>
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
          <div className="space-y-3 mb-4">
            {Object.entries(avgResolutionByType).map(([type, time]) => (
              <div key={type} className="flex justify-between items-center">
                <span className="text-sm">{translateCaseType(type)}</span>
                <span className="font-medium">{time}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-end">
            <span className="text-xs text-muted-foreground">Letzte Aktualisierung: {lastUpdated}</span>
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
          <p className="text-sm text-muted-foreground mb-4">Performance-Analyse nach Team-Mitgliedern.</p>
          <div className="space-y-3 mb-4">
            {getTopTeamMembers().map(member => (
              <div key={member.userId} className="border-b pb-2">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm font-medium">{member.name}</span>
                  <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
                    {member.count} Vorgänge
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div 
                    className="bg-purple-600 h-1.5 rounded-full" 
                    style={{ width: `${member.count > 0 ? (member.completed / member.count) * 100 : 0}%` }}
                  ></div>
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-muted-foreground">{member.completed} abgeschlossen</span>
                  <span className="text-xs text-muted-foreground">
                    {member.count > 0 ? Math.round((member.completed / member.count) * 100) : 0}% Abschlussrate
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-end">
            <span className="text-xs text-muted-foreground">Letzte Aktualisierung: {lastUpdated}</span>
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
            <div className="grid grid-cols-3 gap-4">
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
                <span className="text-xs text-muted-foreground">Für Tabellen</span>
              </button>
              
              <button
                className="p-4 border rounded-lg flex flex-col items-center gap-2 hover:bg-blue-50 hover:border-blue-200 transition-colors"
                onClick={() => handleExportData('pdf')}
              >
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <span className="font-medium">PDF Format</span>
                <span className="text-xs text-muted-foreground">Zum Ausdrucken</span>
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default Reports;
