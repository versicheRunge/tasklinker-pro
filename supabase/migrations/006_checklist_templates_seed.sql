-- Seed real insurance checklist templates
-- Only inserts if the table is empty to avoid duplicates

INSERT INTO checklist_templates (title, type, items)
SELECT * FROM (VALUES

  ('KFZ-Schadenmeldung', 'kfz'::case_type, '[
    {"text":"Schadenanzeige vom Kunden erhalten","completed":false,"subItems":[]},
    {"text":"Unfallbericht / Polizeiprotokoll prüfen","completed":false,"subItems":[
      {"text":"Polizeinummer notiert","completed":false},
      {"text":"Unfallgegner-Daten vollständig","completed":false}
    ]},
    {"text":"Fotos vom Schaden angefordert / erhalten","completed":false,"subItems":[]},
    {"text":"KFZ-Schein und Führerschein vorhanden","completed":false,"subItems":[]},
    {"text":"Schadensmeldung an Versicherer übermittelt","completed":false,"subItems":[]},
    {"text":"Schadennummer vom Versicherer erhalten","completed":false,"subItems":[]},
    {"text":"Kostenvoranschlag / Reparaturrechnung erhalten","completed":false,"subItems":[]},
    {"text":"Regulierung bestätigt / Zahlung eingegangen","completed":false,"subItems":[]},
    {"text":"Kunden über Ergebnis informiert","completed":false,"subItems":[]},
    {"text":"Vorgang abschließen","completed":false,"subItems":[]}
  ]'::jsonb),

  ('Hausrat-Schadenmeldung', 'hr'::case_type, '[
    {"text":"Schadenanzeige vom Kunden erhalten","completed":false,"subItems":[]},
    {"text":"Schadenshergang dokumentieren","completed":false,"subItems":[
      {"text":"Datum und Uhrzeit festgehalten","completed":false},
      {"text":"Einbruch: Polizeibericht angefordert","completed":false}
    ]},
    {"text":"Schadenliste / Inventar vom Kunden erhalten","completed":false,"subItems":[]},
    {"text":"Fotos vom Schaden angefordert / erhalten","completed":false,"subItems":[]},
    {"text":"Schadensmeldung an Versicherer übermittelt","completed":false,"subItems":[]},
    {"text":"Schadennummer notiert","completed":false,"subItems":[]},
    {"text":"Gutachtertermin abgestimmt (falls erforderlich)","completed":false,"subItems":[]},
    {"text":"Regulierungsangebot erhalten und mit Kunden besprochen","completed":false,"subItems":[]},
    {"text":"Zahlung bestätigt","completed":false,"subItems":[]},
    {"text":"Vorgang abschließen","completed":false,"subItems":[]}
  ]'::jsonb),

  ('Haftpflichtschaden', 'phv'::case_type, '[
    {"text":"Schadensmeldung des Kunden erhalten","completed":false,"subItems":[]},
    {"text":"Sachverhalt dokumentieren","completed":false,"subItems":[
      {"text":"Schädigenden Vorgang beschrieben","completed":false},
      {"text":"Geschädigter bekannt","completed":false}
    ]},
    {"text":"Anspruchsschreiben des Geschädigten erhalten","completed":false,"subItems":[]},
    {"text":"Kunden über Verhaltensregeln informiert (keine Schuldanerkennung)","completed":false,"subItems":[]},
    {"text":"Schadenmeldung an Versicherer übermittelt","completed":false,"subItems":[]},
    {"text":"Versicherer prüft Deckung und Haftung","completed":false,"subItems":[]},
    {"text":"Regulierungsentscheidung erhalten","completed":false,"subItems":[]},
    {"text":"Kunden über Ergebnis informiert","completed":false,"subItems":[]},
    {"text":"Vorgang abschließen","completed":false,"subItems":[]}
  ]'::jsonb),

  ('Neuantrag Versicherung', 'sonstiges'::case_type, '[
    {"text":"Beratungsgespräch durchgeführt","completed":false,"subItems":[
      {"text":"Bedarfsanalyse ausgefüllt","completed":false},
      {"text":"Vorversicherung geprüft","completed":false}
    ]},
    {"text":"Antragsunterlagen vorbereitet","completed":false,"subItems":[]},
    {"text":"Antrag vom Kunden unterschrieben","completed":false,"subItems":[]},
    {"text":"Antrag an Versicherer eingereicht","completed":false,"subItems":[]},
    {"text":"Risikoprüfung durch Versicherer abgewartet","completed":false,"subItems":[]},
    {"text":"Policen-/Annahmeschreiben erhalten","completed":false,"subItems":[]},
    {"text":"Unterlagen an Kunden übermittelt","completed":false,"subItems":[]},
    {"text":"Erstbeitrag / SEPA-Einzug bestätigt","completed":false,"subItems":[]},
    {"text":"Vorgang abschließen","completed":false,"subItems":[]}
  ]'::jsonb),

  ('BU-Leistungsmeldung', 'bu'::case_type, '[
    {"text":"Leistungsfall vom Kunden gemeldet","completed":false,"subItems":[]},
    {"text":"Diagnose-/Arztunterlagen angefordert","completed":false,"subItems":[
      {"text":"Attest / Diagnose vom behandelnden Arzt","completed":false},
      {"text":"Krankenhausberichte (falls vorhanden)","completed":false}
    ]},
    {"text":"Leistungsantrag des Versicherers ausgefüllt","completed":false,"subItems":[]},
    {"text":"Unterlagen an Versicherer übermittelt","completed":false,"subItems":[]},
    {"text":"Nachforderungen des Versicherers bearbeitet","completed":false,"subItems":[]},
    {"text":"Prüfung durch Versicherer abgewartet","completed":false,"subItems":[]},
    {"text":"Leistungsentscheid erhalten","completed":false,"subItems":[]},
    {"text":"Kunden über Ergebnis informiert","completed":false,"subItems":[]},
    {"text":"Bei Ablehnung: Widerspruch prüfen","completed":false,"subItems":[]},
    {"text":"Vorgang abschließen","completed":false,"subItems":[]}
  ]'::jsonb),

  ('Vertragsänderung', 'sonstiges'::case_type, '[
    {"text":"Änderungswunsch des Kunden aufgenommen","completed":false,"subItems":[]},
    {"text":"Auswirkungen der Änderung geprüft","completed":false,"subItems":[
      {"text":"Prämienänderung kalkuliert","completed":false},
      {"text":"Deckungsänderungen erläutert","completed":false}
    ]},
    {"text":"Änderungsantrag ausgefüllt und unterschrieben","completed":false,"subItems":[]},
    {"text":"Änderungsauftrag an Versicherer übermittelt","completed":false,"subItems":[]},
    {"text":"Bestätigung / geänderte Police erhalten","completed":false,"subItems":[]},
    {"text":"Unterlagen an Kunden weitergeleitet","completed":false,"subItems":[]},
    {"text":"Vorgang abschließen","completed":false,"subItems":[]}
  ]'::jsonb),

  ('Wohngebäude-Schadenmeldung', 'wgb'::case_type, '[
    {"text":"Schadenanzeige erhalten","completed":false,"subItems":[]},
    {"text":"Art des Schadens festgehalten","completed":false,"subItems":[
      {"text":"Leitungswasser / Sturm / Einbruch / Feuer","completed":false},
      {"text":"Datum des Schadens","completed":false}
    ]},
    {"text":"Sofortmaßnahmen veranlasst (Notreparatur etc.)","completed":false,"subItems":[]},
    {"text":"Fotos und Kostenvoranschläge angefordert","completed":false,"subItems":[]},
    {"text":"Schadensmeldung an Versicherer übermittelt","completed":false,"subItems":[]},
    {"text":"Gutachtertermin koordiniert","completed":false,"subItems":[]},
    {"text":"Regulierungsangebot erhalten","completed":false,"subItems":[]},
    {"text":"Reparatur abgeschlossen, Rechnung eingereicht","completed":false,"subItems":[]},
    {"text":"Zahlung bestätigt","completed":false,"subItems":[]},
    {"text":"Vorgang abschließen","completed":false,"subItems":[]}
  ]'::jsonb)

) AS t(title, type, items)
WHERE NOT EXISTS (SELECT 1 FROM checklist_templates LIMIT 1);
