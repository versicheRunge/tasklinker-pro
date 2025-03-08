
import React, { useState } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { cases } from '../data/mockData';
import { CheckSquare, PlusCircle } from 'lucide-react';

const Checklists: React.FC = () => {
  // Group all checklists by type
  const checklistTemplates = [
    {
      id: 'template-1',
      title: 'Schadenmeldung',
      type: 'damage',
      items: cases.find(c => c.type === 'damage')?.checklist || []
    },
    {
      id: 'template-2',
      title: 'eVB-Anfrage',
      type: 'evb',
      items: cases.find(c => c.type === 'evb')?.checklist || []
    },
    {
      id: 'template-3',
      title: 'Vertragsänderung',
      type: 'contract_change',
      items: cases.find(c => c.type === 'contract_change')?.checklist || []
    },
    {
      id: 'template-4',
      title: 'Kundenanfrage',
      type: 'inquiry',
      items: cases.find(c => c.type === 'inquiry')?.checklist || []
    }
  ];

  const [selectedTemplate, setSelectedTemplate] = useState(checklistTemplates[0]);

  return (
    <AppLayout>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Checklisten</h1>
          <p className="text-muted-foreground">Standard-Checklisten für verschiedene Vorgangsarten.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
          <PlusCircle className="w-4 h-4" />
          <span>Neue Checkliste</span>
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-card rounded-xl border border-border p-4 sticky top-20">
            <h2 className="text-lg font-medium mb-4">Vorlagen</h2>
            <div className="space-y-2">
              {checklistTemplates.map(template => (
                <button
                  key={template.id}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg text-sm font-medium text-left transition-colors ${
                    selectedTemplate.id === template.id
                      ? 'bg-primary/10 text-primary'
                      : 'hover:bg-muted/70'
                  }`}
                  onClick={() => setSelectedTemplate(template)}
                >
                  <CheckSquare className="w-5 h-5" />
                  <span>{template.title}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
        
        <div className="lg:col-span-3">
          <div className="bg-card rounded-xl border border-border p-6 animate-fade-in">
            <div className="mb-6">
              <h2 className="text-xl font-semibold">{selectedTemplate.title}</h2>
              <p className="text-muted-foreground text-sm">
                Standard-Checkliste für {selectedTemplate.title} Vorgänge
              </p>
            </div>
            
            <div className="space-y-3">
              {selectedTemplate.items.map((item, index) => (
                <div key={index} className="flex items-start gap-3 p-3 border border-border rounded-lg">
                  <div className="mt-1">
                    <CheckSquare className={`w-5 h-5 ${item.completed ? 'text-primary' : 'text-muted-foreground'}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{item.text}</p>
                        {item.description && (
                          <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="text-sm text-primary hover:text-primary/70">
                          Bearbeiten
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              <button className="w-full flex items-center justify-center gap-2 p-3 border border-dashed border-muted-foreground/30 rounded-lg text-muted-foreground hover:border-primary/30 hover:text-primary transition-colors">
                <PlusCircle className="w-5 h-5" />
                <span>Schritt hinzufügen</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Checklists;
