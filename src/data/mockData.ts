
import { CaseItem, User } from '../types/case';

// Mock Users
export const users: User[] = [
  {
    id: '1',
    name: 'Max Schmidt',
    role: 'Teamleiter',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg'
  },
  {
    id: '2',
    name: 'Anna Müller',
    role: 'Sachbearbeiter',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg'
  },
  {
    id: '3',
    name: 'Thomas Weber',
    role: 'Sachbearbeiter',
    avatar: 'https://randomuser.me/api/portraits/men/55.jpg'
  },
  {
    id: '4',
    name: 'Sarah Becker',
    role: 'Sachbearbeiter',
    avatar: 'https://randomuser.me/api/portraits/women/67.jpg'
  }
];

// Mock Cases
export const cases: CaseItem[] = [
  {
    id: 'case-001-2023',
    title: 'Wasserschaden in Wohnung, Rohrbuch im Bad',
    description: 'Kunde meldet Wasserschaden durch defektes Waschbeckenrohr im Badezimmer. Wasser ist ausgetreten und hat Parkett im Flur beschädigt.',
    status: 'in_progress',
    type: 'damage',
    createdAt: '2023-06-15T10:30:00Z',
    lastUpdated: '2023-06-16T14:45:00Z',
    assignee: users[1],
    activities: [
      {
        id: 'act-001',
        type: 'comment',
        content: 'Habe mit dem Kunden telefoniert. Er hat bereits einen Klempner kontaktiert, der den Schaden heute noch beheben wird.',
        timestamp: '2023-06-15T11:20:00Z',
        user: users[1]
      },
      {
        id: 'act-002',
        type: 'document',
        content: 'Hat Fotos vom Wasserschaden hochgeladen',
        timestamp: '2023-06-15T14:30:00Z',
        user: users[0],
        attachment: {
          name: 'Wasserschaden-Fotos.zip',
          size: '4.2 MB'
        }
      },
      {
        id: 'act-003',
        type: 'status',
        content: 'Status auf "In Bearbeitung" geändert',
        timestamp: '2023-06-16T09:15:00Z',
        user: users[1]
      },
      {
        id: 'act-004',
        type: 'checklist',
        content: 'Schadenmeldung an Versicherung gesendet',
        timestamp: '2023-06-16T14:45:00Z',
        user: users[1]
      }
    ],
    checklist: [
      {
        text: 'Erste Kontaktaufnahme mit Kunde',
        completed: true
      },
      {
        text: 'Schadenfotos anfordern',
        description: 'Fotos vom Schaden und Rechnungen anfordern',
        completed: true
      },
      {
        text: 'Schadenmeldung an Versicherung senden',
        completed: true
      },
      {
        text: 'Kostenvoranschlag prüfen',
        completed: false
      },
      {
        text: 'Schadenregulierung freigeben',
        completed: false
      }
    ],
    documents: [
      {
        id: 'doc-001',
        name: 'Wasserschaden-Fotos.zip',
        size: '4.2 MB',
        type: 'image/zip',
        uploadedAt: '2023-06-15T14:30:00Z',
        uploadedBy: users[0]
      },
      {
        id: 'doc-002',
        name: 'Schadenmeldung.pdf',
        size: '620 KB',
        type: 'application/pdf',
        uploadedAt: '2023-06-16T14:45:00Z',
        uploadedBy: users[1]
      }
    ]
  },
  {
    id: 'case-002-2023',
    title: 'eVB für Neuwagenkauf BMW X3',
    description: 'Herr Müller benötigt eine elektronische Versicherungsbestätigung für seinen Neuwagen (BMW X3), den er nächste Woche abholen möchte.',
    status: 'waiting',
    type: 'evb',
    createdAt: '2023-06-14T09:15:00Z',
    lastUpdated: '2023-06-14T16:30:00Z',
    assignee: users[2],
    activities: [
      {
        id: 'act-001',
        type: 'comment',
        content: 'Kundengespräch: Herr Müller wünscht Vollkasko mit 300€ SB, Haftpflicht und Assistanceleistungen',
        timestamp: '2023-06-14T09:20:00Z',
        user: users[2]
      },
      {
        id: 'act-002',
        type: 'document',
        content: 'Hat Fahrzeugschein hochgeladen',
        timestamp: '2023-06-14T10:45:00Z',
        user: users[2],
        attachment: {
          name: 'Fahrzeugschein.pdf',
          size: '1.2 MB'
        }
      },
      {
        id: 'act-003',
        type: 'status',
        content: 'Status auf "Wartet auf Rückmeldung" geändert - benötige Kundenbestätigung zum Angebot',
        timestamp: '2023-06-14T16:30:00Z',
        user: users[2]
      }
    ],
    checklist: [
      {
        text: 'Fahrzeugdaten erfassen',
        completed: true
      },
      {
        text: 'Versicherungsumfang besprechen',
        completed: true
      },
      {
        text: 'Angebot erstellen',
        completed: true
      },
      {
        text: 'Kundenbestätigung einholen',
        completed: false
      },
      {
        text: 'eVB erstellen und zusenden',
        completed: false
      }
    ],
    documents: [
      {
        id: 'doc-001',
        name: 'Fahrzeugschein.pdf',
        size: '1.2 MB',
        type: 'application/pdf',
        uploadedAt: '2023-06-14T10:45:00Z',
        uploadedBy: users[2]
      },
      {
        id: 'doc-002',
        name: 'Versicherungsangebot.pdf',
        size: '450 KB',
        type: 'application/pdf',
        uploadedAt: '2023-06-14T15:20:00Z',
        uploadedBy: users[2]
      }
    ]
  },
  {
    id: 'case-003-2023',
    title: 'Vertragsänderung Hausratversicherung',
    description: 'Frau Schmidt möchte ihre Hausratversicherung anpassen, da sie umgezogen ist. Neue Anschrift und höhere Versicherungssumme.',
    status: 'new',
    type: 'contract_change',
    createdAt: '2023-06-16T08:30:00Z',
    lastUpdated: '2023-06-16T08:30:00Z',
    assignee: users[3],
    activities: [
      {
        id: 'act-001',
        type: 'comment',
        content: 'Kundenanfrage per E-Mail eingegangen. Frau Schmidt ist umgezogen und möchte Vertrag anpassen.',
        timestamp: '2023-06-16T08:30:00Z',
        user: users[3]
      }
    ],
    checklist: [
      {
        text: 'Kundendaten prüfen',
        completed: false
      },
      {
        text: 'Neue Anschrift erfassen',
        completed: false
      },
      {
        text: 'Versicherungssumme anpassen',
        completed: false
      },
      {
        text: 'Änderung durchführen',
        completed: false
      },
      {
        text: 'Neue Versicherungspolice zusenden',
        completed: false
      }
    ]
  },
  {
    id: 'case-004-2023',
    title: 'KFZ-Schaden Parkrempler',
    description: 'Kunde meldet einen Parkschaden an seinem Fahrzeug. Stoßfänger hinten rechts beschädigt, verursacht durch unbekannten Dritten.',
    status: 'completed',
    type: 'damage',
    createdAt: '2023-06-10T14:20:00Z',
    lastUpdated: '2023-06-12T17:15:00Z',
    assignee: users[1],
    activities: [
      {
        id: 'act-001',
        type: 'comment',
        content: 'Kunde hat Schaden telefonisch gemeldet. Schaden entstand auf Supermarktparkplatz.',
        timestamp: '2023-06-10T14:25:00Z',
        user: users[1]
      },
      {
        id: 'act-002',
        type: 'document',
        content: 'Schadenfotos vom Kunden erhalten',
        timestamp: '2023-06-10T16:10:00Z',
        user: users[1],
        attachment: {
          name: 'Parkrempler-Fotos.zip',
          size: '3.8 MB'
        }
      },
      {
        id: 'act-003',
        type: 'status',
        content: 'Status auf "In Bearbeitung" geändert',
        timestamp: '2023-06-11T09:30:00Z',
        user: users[1]
      },
      {
        id: 'act-004',
        type: 'comment',
        content: 'Kostenvoranschlag der Werkstatt geprüft und freigegeben. Reparaturkosten: 1.250 €',
        timestamp: '2023-06-12T11:45:00Z',
        user: users[1]
      },
      {
        id: 'act-005',
        type: 'status',
        content: 'Status auf "Erledigt" geändert. Schadenzahlung veranlasst.',
        timestamp: '2023-06-12T17:15:00Z',
        user: users[1]
      }
    ],
    checklist: [
      {
        text: 'Schadenmeldung aufnehmen',
        completed: true
      },
      {
        text: 'Schadenfotos anfordern',
        completed: true
      },
      {
        text: 'Kostenvoranschlag prüfen',
        completed: true
      },
      {
        text: 'Schadenregulierung freigeben',
        completed: true
      },
      {
        text: 'Schadenzahlung veranlassen',
        completed: true
      }
    ],
    documents: [
      {
        id: 'doc-001',
        name: 'Parkrempler-Fotos.zip',
        size: '3.8 MB',
        type: 'image/zip',
        uploadedAt: '2023-06-10T16:10:00Z',
        uploadedBy: users[1]
      },
      {
        id: 'doc-002',
        name: 'Kostenvoranschlag-Werkstatt.pdf',
        size: '750 KB',
        type: 'application/pdf',
        uploadedAt: '2023-06-11T14:20:00Z',
        uploadedBy: users[1]
      },
      {
        id: 'doc-003',
        name: 'Schadenauszahlung.pdf',
        size: '420 KB',
        type: 'application/pdf',
        uploadedAt: '2023-06-12T17:15:00Z',
        uploadedBy: users[1]
      }
    ]
  },
  {
    id: 'case-005-2023',
    title: 'Anfrage Hundehaftpflicht',
    description: 'Familie Koch hat einen Welpen adoptiert und möchte Informationen zur Hundehaftpflichtversicherung.',
    status: 'new',
    type: 'inquiry',
    createdAt: '2023-06-16T11:45:00Z',
    lastUpdated: '2023-06-16T11:45:00Z',
    assignee: users[0],
    activities: [
      {
        id: 'act-001',
        type: 'comment',
        content: 'Anfrage per Online-Formular eingegangen. Kunde wünscht Rückruf zur Beratung.',
        timestamp: '2023-06-16T11:45:00Z',
        user: users[0]
      }
    ],
    checklist: [
      {
        text: 'Telefonische Beratung durchführen',
        completed: false
      },
      {
        text: 'Angebot erstellen',
        completed: false
      },
      {
        text: 'Angebot zusenden',
        completed: false
      },
      {
        text: 'Nachfassen',
        completed: false
      }
    ]
  },
  {
    id: 'case-006-2023',
    title: 'Beschwerde wegen Bearbeitungsdauer',
    description: 'Kunde Herr Berger beschwert sich über lange Bearbeitungsdauer seines Schadensfalls von März. Möchte schnellere Bearbeitung.',
    status: 'in_progress',
    type: 'other',
    createdAt: '2023-06-15T13:10:00Z',
    lastUpdated: '2023-06-16T10:20:00Z',
    assignee: users[0],
    activities: [
      {
        id: 'act-001',
        type: 'comment',
        content: 'Herr Berger hat sich telefonisch beschwert. Möchte zeitnahe Rückmeldung vom Teamleiter.',
        timestamp: '2023-06-15T13:15:00Z',
        user: users[3]
      },
      {
        id: 'act-002',
        type: 'status',
        content: 'Fall an Teamleiter eskaliert',
        timestamp: '2023-06-15T14:30:00Z',
        user: users[3]
      },
      {
        id: 'act-003',
        type: 'comment',
        content: 'Habe mit Herrn Berger telefoniert und mich für die Verzögerung entschuldigt. Ursache war fehlende Unterlagen vom Gutachter, die jetzt eingetroffen sind.',
        timestamp: '2023-06-16T10:20:00Z',
        user: users[0]
      }
    ],
    checklist: [
      {
        text: 'Kundenbeschwerde erfassen',
        completed: true
      },
      {
        text: 'Ursache der Verzögerung ermitteln',
        completed: true
      },
      {
        text: 'Kunden kontaktieren',
        completed: true
      },
      {
        text: 'Lösung anbieten',
        completed: false
      },
      {
        text: 'Fall priorisieren und abschließen',
        completed: false
      }
    ]
  }
];

// Dashboard stats
export const dashboardStats = {
  totalCases: cases.length,
  newCases: cases.filter(c => c.status === 'new').length,
  inProgressCases: cases.filter(c => c.status === 'in_progress').length,
  completedCases: cases.filter(c => c.status === 'completed').length,
  // Get all activities from all cases
  recentActivities: cases
    .flatMap(c => c.activities.map(a => ({ ...a, caseId: c.id })))
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 10)
};
