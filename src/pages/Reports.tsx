
import React, { useState, useEffect } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { BarChart3, FileBarChart, TrendingUp, Users, Download, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../components/ui/dialog";
import { toast } from "../hooks/use-toast";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useUser } from '../contexts/UserContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { CASE_TYPE_LABELS } from '../types/case';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

const STATUS_LABELS: Record<string, string> = {
  new: 'Neu', in_progress: 'In Bearbeitung', waiting: 'Wartet auf Rückmeldung', completed: 'Abgeschlossen',
};
const STATUS_COLORS: Record<string, string> = {
  new: 'bg-blue-500', in_progress: 'bg-amber-500', waiting: 'bg-purple-500', completed: 'bg-green-500',
};

const Reports = () => {
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const { users } = useUser();
  const { profile } = useAuth();
  const [cases, setCases] = useState<any[]>([]);
  const lastUpdated = format(new Date(), 'dd.MM.yyyy', { locale: de });

  useEffect(() => {
    if (!profile) return;
    supabase.from('cases').select('id,title,status,type,assignee_id,created_at,updated_at,customer_name,priority')
      .eq('archived', false).then(({ data }) => { if (data) setCases(data); });
  }, [profile]);

  const casesByType = cases.reduce((acc, c) => { acc[c.type] = (acc[c.type] || 0) + 1; return acc; }, {} as Record<string, number>);
  const casesByStatus = cases.reduce((acc, c) => { acc[c.status] = (acc[c.status] || 0) + 1; return acc; }, {} as Record<string, number>);
  const casesByAssignee = cases.reduce((acc, c) => { acc[c.assignee_id] = (acc[c.assignee_id] || 0) + 1; return acc; }, {} as Record<string, number>);
  const completedByAssignee = cases.filter(c => c.status === 'completed').reduce((acc, c) => { acc[c.assignee_id] = (acc[c.assignee_id] || 0) + 1; return acc; }, {} as Record<string, number>);

  const translateType = (t: string) => (CASE_TYPE_LABELS as any)[t] ?? t;
  const translateStatus = (s: string) => STATUS_LABELS[s] ?? s;

  const allMembers = Object.entries(casesByAssignee).map(([id, count]) => ({
    id, name: users.find(u => u.id === id)?.name ?? 'Unbekannt',
    count: count as number, completed: completedByAssignee[id] ?? 0,
  })).sort((a, b) => b.count - a.count);

  const topMembers = allMembers.slice(0, 3);
  const maxTypeCount = Math.max(...Object.values(casesByType), 1);

  const exportData = (fmt: 'json' | 'csv' | 'pdf') => {
    const rows = cases.map(c => ({
      id: c.id, titel: c.title, status: translateStatus(c.status), typ: translateType(c.type),
      erstelltAm: new Date(c.created_at).toLocaleDateString('de-DE'),
      zugewiesenAn: users.find(u => u.id === c.assignee_id)?.name ?? 'Unbekannt',
    }));

    if (fmt === 'json') {
      const a = document.createElement('a');
      a.href = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(rows, null, 2));
      a.download = 'vorgaenge_export.json'; document.body.appendChild(a); a.click(); a.remove();
    } else if (fmt === 'csv') {
      const headers = ['ID','Titel','Status','Typ','Erstellt am','Zugewiesen an'];
      const csv = [headers, ...rows.map(r => Object.values(r).map(v => `"${String(v).replace(/"/g,'""')}"`))].map(r => r.join(',')).join('\n');
      const a = document.createElement('a');
      a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
      a.download = 'vorgaenge_export.csv'; document.body.appendChild(a); a.click(); a.remove();
    } else {
      const pdf = new jsPDF();
      pdf.setFontSize(20); pdf.text('Vorgänge - Export', 14, 22);
      pdf.setFontSize(12); pdf.text(`Erstellt: ${new Date().toLocaleDateString('de-DE')}`, 14, 32);
      autoTable(pdf, {
        head: [['Titel','Status','Typ','Erstellt am','Zugewiesen an']],
        body: rows.map(r => [r.titel, r.status, r.typ, r.erstelltAm, r.zugewiesenAn]),
        startY: 40, styles: { fontSize: 9 }, headStyles: { fillColor: [60,60,60] },
      });
      pdf.save('vorgaenge_export.pdf');
    }
    setIsExportDialogOpen(false);
    toast({ title: 'Export erfolgreich', description: `Export als ${fmt.toUpperCase()} gestartet.` });
  };

  const exportReportPdf = (id: string) => {
    const pdf = new jsPDF();
    const titles: Record<string, string> = {
      categories: 'Vorgänge nach Sparten', performance: 'Performance-Analyse',
      monthly: 'Zusammenfassung', team: 'Team-Performance',
    };
    const title = titles[id] ?? 'Bericht';
    pdf.setFontSize(22); pdf.text(title, 14, 20);
    pdf.setFontSize(12); pdf.text(`Erstellt: ${format(new Date(), 'dd.MM.yyyy', { locale: de })}`, 14, 30);
    let data: string[][] = [], head: string[] = [];
    if (id === 'categories') { head = ['Sparte','Anzahl']; data = Object.entries(casesByType).map(([t,c]) => [translateType(t), String(c)]); }
    if (id === 'performance') { head = ['Status','Anzahl']; data = Object.entries(casesByStatus).map(([s,c]) => [translateStatus(s), String(c)]); }
    if (id === 'monthly') { head = ['Metrik','Wert']; data = [['Gesamt',String(cases.length)],['Abgeschlossen',String(casesByStatus['completed']??0)],['Offen',String(cases.length-(casesByStatus['completed']??0))]]; }
    if (id === 'team') {
      head = ['Mitarbeiter','Vorgänge','Abgeschlossen','Rate'];
      data = allMembers.map(m => [m.name, String(m.count), String(m.completed), `${m.count>0?Math.round((m.completed/m.count)*100):0}%`]);
    }
    autoTable(pdf, { head: [head], body: data, startY: 40, styles:{fontSize:10}, headStyles:{fillColor:[60,60,60]} });
    pdf.save(`${title.toLowerCase().replace(/\s+/g,'_')}.pdf`);
    toast({ title: 'PDF exportiert', description: title });
  };

  const toggleExpand = (id: string) => setExpandedCard(prev => prev === id ? null : id);

  return (
    <AppLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Berichte</h1>
          <p className="text-muted-foreground">Statistische Übersicht aller Vorgänge.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors" onClick={() => setIsExportDialogOpen(true)}>
          <Download className="w-4 h-4" /><span>Daten exportieren</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Vorgänge nach Sparten */}
        <div className="bg-card rounded-xl border overflow-hidden">
          <button className="w-full p-6 text-left hover:bg-muted/30 transition-colors" onClick={() => toggleExpand('categories')}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-primary/10 p-3 rounded-lg"><BarChart3 className="w-5 h-5 text-primary" /></div>
                <h3 className="font-semibold text-lg">Vorgänge nach Sparten</h3>
              </div>
              {expandedCard === 'categories' ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </div>
          </button>
          <div className="px-6 pb-4 space-y-2">
            {Object.entries(casesByType).slice(0, expandedCard === 'categories' ? undefined : 4).map(([t,c]) => (
              <div key={t}>
                <div className="flex justify-between text-sm mb-1">
                  <span>{translateType(t)}</span>
                  <span className="font-medium">{c}</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full">
                  <div className="h-1.5 bg-primary rounded-full transition-all" style={{ width: `${((c as number) / maxTypeCount) * 100}%` }} />
                </div>
              </div>
            ))}
            {Object.keys(casesByType).length === 0 && <p className="text-sm text-muted-foreground">Keine Daten</p>}
          </div>
          {expandedCard === 'categories' && (
            <div className="px-6 pb-4 flex justify-end border-t pt-3">
              <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground" onClick={() => exportReportPdf('categories')}>
                <Download className="w-3.5 h-3.5" /> PDF exportieren
              </button>
            </div>
          )}
          {expandedCard !== 'categories' && <div className="px-6 pb-3 flex justify-end"><span className="text-xs text-muted-foreground">Stand: {lastUpdated}</span></div>}
        </div>

        {/* Performance-Analyse */}
        <div className="bg-card rounded-xl border overflow-hidden">
          <button className="w-full p-6 text-left hover:bg-muted/30 transition-colors" onClick={() => toggleExpand('performance')}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-amber-100 p-3 rounded-lg"><TrendingUp className="w-5 h-5 text-amber-600" /></div>
                <h3 className="font-semibold text-lg">Performance-Analyse</h3>
              </div>
              {expandedCard === 'performance' ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </div>
          </button>
          <div className="px-6 pb-4 space-y-2">
            {Object.entries(casesByStatus).map(([s,c]) => {
              const pct = cases.length > 0 ? Math.round(((c as number) / cases.length) * 100) : 0;
              return (
                <div key={s}>
                  <div className="flex justify-between text-sm mb-1">
                    <span>{translateStatus(s)}</span>
                    <span className="font-medium">{c} <span className="text-muted-foreground text-xs">({pct}%)</span></span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full">
                    <div className={`h-1.5 rounded-full transition-all ${STATUS_COLORS[s] ?? 'bg-primary'}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
            {Object.keys(casesByStatus).length === 0 && <p className="text-sm text-muted-foreground">Keine Daten</p>}
          </div>
          {expandedCard === 'performance' && (
            <div className="px-6 pb-4 border-t pt-3 flex justify-end">
              <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground" onClick={() => exportReportPdf('performance')}>
                <Download className="w-3.5 h-3.5" /> PDF exportieren
              </button>
            </div>
          )}
          {expandedCard !== 'performance' && <div className="px-6 pb-3 flex justify-end"><span className="text-xs text-muted-foreground">Stand: {lastUpdated}</span></div>}
        </div>

        {/* Zusammenfassung */}
        <div className="bg-card rounded-xl border overflow-hidden">
          <button className="w-full p-6 text-left hover:bg-muted/30 transition-colors" onClick={() => toggleExpand('monthly')}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-blue-100 p-3 rounded-lg"><FileBarChart className="w-5 h-5 text-blue-600" /></div>
                <h3 className="font-semibold text-lg">Zusammenfassung</h3>
              </div>
              {expandedCard === 'monthly' ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </div>
          </button>
          <div className="px-6 pb-4">
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold">{cases.length}</div>
                <div className="text-xs text-muted-foreground mt-0.5">Gesamt</div>
              </div>
              <div className="bg-green-50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-green-700">{casesByStatus['completed'] ?? 0}</div>
                <div className="text-xs text-green-600 mt-0.5">Abgeschlossen</div>
              </div>
              <div className="bg-blue-50 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-blue-700">{cases.length - (casesByStatus['completed'] ?? 0)}</div>
                <div className="text-xs text-blue-600 mt-0.5">Offen</div>
              </div>
            </div>
            {expandedCard === 'monthly' && (
              <div className="space-y-2 border-t pt-3">
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Neu</span><span>{casesByStatus['new'] ?? 0}</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">In Bearbeitung</span><span>{casesByStatus['in_progress'] ?? 0}</span></div>
                <div className="flex justify-between text-sm"><span className="text-muted-foreground">Wartend</span><span>{casesByStatus['waiting'] ?? 0}</span></div>
                <div className="flex justify-between text-sm font-medium"><span>Abschlussquote</span><span>{cases.length > 0 ? Math.round(((casesByStatus['completed'] ?? 0) / cases.length) * 100) : 0}%</span></div>
              </div>
            )}
          </div>
          {expandedCard === 'monthly' && (
            <div className="px-6 pb-4 border-t pt-3 flex justify-end">
              <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground" onClick={() => exportReportPdf('monthly')}>
                <Download className="w-3.5 h-3.5" /> PDF exportieren
              </button>
            </div>
          )}
          {expandedCard !== 'monthly' && <div className="px-6 pb-3 flex justify-end"><span className="text-xs text-muted-foreground">Stand: {lastUpdated}</span></div>}
        </div>

        {/* Team-Performance */}
        <div className="bg-card rounded-xl border overflow-hidden md:col-span-2 xl:col-span-3">
          <button className="w-full p-6 text-left hover:bg-muted/30 transition-colors" onClick={() => toggleExpand('team')}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="bg-purple-100 p-3 rounded-lg"><Users className="w-5 h-5 text-purple-600" /></div>
                <h3 className="font-semibold text-lg">Team-Performance</h3>
              </div>
              {expandedCard === 'team' ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </div>
          </button>
          <div className="px-6 pb-4">
            <div className="space-y-3">
              {(expandedCard === 'team' ? allMembers : topMembers).map(m => (
                <div key={m.id} className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-semibold text-sm shrink-0">
                    {m.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium">{m.name}</span>
                      <div className="flex gap-3 text-xs text-muted-foreground">
                        <span>{m.count} Vorgänge</span>
                        <span>{m.completed} abgeschlossen</span>
                        <span className="font-medium text-foreground">{m.count > 0 ? Math.round((m.completed / m.count) * 100) : 0}%</span>
                      </div>
                    </div>
                    <div className="h-2 bg-muted rounded-full">
                      <div className="h-2 bg-purple-500 rounded-full" style={{ width: `${m.count > 0 ? (m.completed / m.count) * 100 : 0}%` }} />
                    </div>
                  </div>
                </div>
              ))}
              {allMembers.length === 0 && <p className="text-sm text-muted-foreground">Keine Daten</p>}
            </div>
          </div>
          {expandedCard === 'team' && (
            <div className="px-6 pb-4 border-t pt-3 flex justify-end">
              <button className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground" onClick={() => exportReportPdf('team')}>
                <Download className="w-3.5 h-3.5" /> PDF exportieren
              </button>
            </div>
          )}
          {expandedCard !== 'team' && <div className="px-6 pb-3 flex justify-end"><span className="text-xs text-muted-foreground">Stand: {lastUpdated} · {allMembers.length > 3 ? 'Top 3 angezeigt — zum Aufklappen klicken' : ''}</span></div>}
        </div>
      </div>

      <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader><DialogTitle>Daten exportieren</DialogTitle></DialogHeader>
          <div className="py-4">
            <p className="text-muted-foreground mb-4">Format auswählen:</p>
            <div className="grid grid-cols-3 gap-4">
              <button className="p-4 border rounded-lg flex flex-col items-center gap-2 hover:bg-primary/5 transition-colors" onClick={() => exportData('json')}>
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center"><FileBarChart className="w-6 h-6 text-primary" /></div>
                <span className="font-medium">JSON</span><span className="text-xs text-muted-foreground">Datenverarbeitung</span>
              </button>
              <button className="p-4 border rounded-lg flex flex-col items-center gap-2 hover:bg-green-50 transition-colors" onClick={() => exportData('csv')}>
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center"><Download className="w-6 h-6 text-green-600" /></div>
                <span className="font-medium">CSV</span><span className="text-xs text-muted-foreground">Für Tabellen</span>
              </button>
              <button className="p-4 border rounded-lg flex flex-col items-center gap-2 hover:bg-blue-50 transition-colors" onClick={() => exportData('pdf')}>
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center"><FileText className="w-6 h-6 text-blue-600" /></div>
                <span className="font-medium">PDF</span><span className="text-xs text-muted-foreground">Zum Drucken</span>
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default Reports;
