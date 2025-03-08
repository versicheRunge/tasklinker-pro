
import React from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { BarChart3, FileBarChart, ArrowUpDown, TrendingUp, Users } from 'lucide-react';

const Reports = () => {
  return (
    <AppLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Berichte</h1>
          <p className="text-muted-foreground">Übersicht aller statistischen Daten und Auswertungen.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        <div className="bg-card rounded-xl border border-border p-6 hover:shadow-md transition-all duration-300 hover:-translate-y-1 cursor-pointer animate-scale-in">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-primary/10 p-3 rounded-lg">
              <BarChart3 className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-semibold text-lg">Vorgänge nach Kategorien</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">Verteilung aller Vorgänge nach Kategorien und Status.</p>
          <div className="flex justify-end">
            <span className="text-xs text-muted-foreground">Letzte Aktualisierung: Heute</span>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-6 hover:shadow-md transition-all duration-300 hover:-translate-y-1 cursor-pointer animate-scale-in">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-amber-100 p-3 rounded-lg">
              <TrendingUp className="w-5 h-5 text-amber-600" />
            </div>
            <h3 className="font-semibold text-lg">Performance-Analyse</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">Bearbeitungszeiten und Effizienz-Kennzahlen für alle Vorgänge.</p>
          <div className="flex justify-end">
            <span className="text-xs text-muted-foreground">Letzte Aktualisierung: Gestern</span>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-6 hover:shadow-md transition-all duration-300 hover:-translate-y-1 cursor-pointer animate-scale-in">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <FileBarChart className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="font-semibold text-lg">Monatliche Zusammenfassung</h3>
          </div>
          <p className="text-sm text-muted-foreground mb-4">Übersicht aller Aktivitäten des letzten Monats im Vergleich.</p>
          <div className="flex justify-end">
            <span className="text-xs text-muted-foreground">Letzte Aktualisierung: 01.03.2025</span>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-6 hover:shadow-md transition-all duration-300 hover:-translate-y-1 cursor-pointer animate-scale-in">
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

        <div className="bg-card rounded-xl border border-border p-6 hover:shadow-md transition-all duration-300 hover:-translate-y-1 cursor-pointer animate-scale-in">
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
    </AppLayout>
  );
};

export default Reports;
