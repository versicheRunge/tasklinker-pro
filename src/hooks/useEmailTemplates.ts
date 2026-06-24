import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
  category: string;
  order: number;
}

const DEFAULT_TEMPLATES: Omit<EmailTemplate, 'id'>[] = [
  { name: 'Schadensmeldung Bestätigung', subject: 'Bestätigung Ihrer Schadensmeldung', category: 'damage', order: 0,
    body: `Sehr geehrte(r) {{customerName}},\n\nvielen Dank für Ihre Schadensmeldung (Vorgangsnummer: {{caseNumber}}).\n\nWir haben Ihre Meldung erhalten und bearbeiten diese schnellstmöglich.\n\nBei Rückfragen erreichen Sie mich unter:\nTel: {{userPhone}}\nE-Mail: {{userEmail}}\n\nMit freundlichen Grüßen\n{{userName}}` },
  { name: 'eVB-Anfrage Bestätigung', subject: 'Ihre Anfrage zur elektronischen Versicherungsbestätigung', category: 'evb', order: 1,
    body: `Sehr geehrte(r) {{customerName}},\n\nvielen Dank für Ihre eVB-Anfrage (Vorgang: {{caseNumber}}).\n\nWir bearbeiten Ihre Anfrage schnellstmöglich.\n\nBei Fragen:\nTel: {{userPhone}}\nE-Mail: {{userEmail}}\n\nMit freundlichen Grüßen\n{{userName}}` },
  { name: 'Vertragsänderung Bestätigung', subject: 'Bestätigung Ihrer Vertragsänderung', category: 'contract_change', order: 2,
    body: `Sehr geehrte(r) {{customerName}},\n\nvielen Dank für Ihren Auftrag zur Vertragsänderung (Vorgang: {{caseNumber}}).\n\nWir werden die gewünschten Änderungen vornehmen und Sie informieren.\n\nBei Fragen:\nTel: {{userPhone}}\nE-Mail: {{userEmail}}\n\nMit freundlichen Grüßen\n{{userName}}` },
  { name: 'Allgemeine Kundenanfrage', subject: 'Ihre Anfrage vom {{date}}', category: 'inquiry', order: 3,
    body: `Sehr geehrte(r) {{customerName}},\n\nvielen Dank für Ihre Anfrage (Vorgang: {{caseNumber}}).\n\nWir melden uns in Kürze bei Ihnen.\n\nBei Fragen:\nTel: {{userPhone}}\nE-Mail: {{userEmail}}\n\nMit freundlichen Grüßen\n{{userName}}` },
  { name: 'Abschlussbestätigung', subject: 'Bestätigung Ihres Versicherungsabschlusses', category: 'confirmation', order: 4,
    body: `Sehr geehrte(r) {{customerName}},\n\nvielen Dank für Ihr Vertrauen. Ihr Versicherungsabschluss wurde erfolgreich bearbeitet.\n\nIn Kürze erhalten Sie Ihre Police.\n\nBei Fragen:\nTel: {{userPhone}}\nE-Mail: {{userEmail}}\n\nMit freundlichen Grüßen\n{{userName}}` },
];

const rowToTemplate = (row: any): EmailTemplate => ({
  id: row.id,
  name: row.name,
  subject: row.subject,
  body: row.body,
  category: row.category,
  order: row.sort_order ?? 0,
});

export const useEmailTemplates = () => {
  const { profile } = useAuth();
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const categories = [
    { id: 'all', name: 'Alle Kategorien' },
    { id: 'damage', name: 'Schadensmeldung' },
    { id: 'evb', name: 'eVB-Anfrage' },
    { id: 'contract_change', name: 'Vertragsänderung' },
    { id: 'inquiry', name: 'Kundenanfrage' },
    { id: 'confirmation', name: 'Bestätigung' },
    { id: 'other', name: 'Sonstiges' },
  ];

  const placeholders = [
    '{{customerName}} - Name des Kunden',
    '{{caseNumber}} - Vorgangsnummer',
    '{{caseTitle}} - Vorgangstitel',
    '{{userName}} - Ihr Name',
    '{{userEmail}} - Ihre E-Mail-Adresse',
    '{{userPhone}} - Ihre Telefonnummer',
    '{{date}} - Aktuelles Datum',
  ];

  const load = async () => {
    if (!profile) return;
    setIsLoading(true);
    const { data } = await supabase.from('email_templates').select('*').order('sort_order');
    if (data && data.length > 0) {
      setTemplates(data.map(rowToTemplate));
    } else {
      // Seed defaults
      for (const t of DEFAULT_TEMPLATES) {
        await supabase.from('email_templates').insert({ ...t, sort_order: t.order, created_by: profile.id });
      }
      const { data: seeded } = await supabase.from('email_templates').select('*').order('sort_order');
      if (seeded) setTemplates(seeded.map(rowToTemplate));
    }
    setIsLoading(false);
  };

  useEffect(() => { if (profile) load(); }, [profile]);

  const addTemplate = async (t: Omit<EmailTemplate, 'id' | 'order'>) => {
    const maxOrder = templates.length > 0 ? Math.max(...templates.map(x => x.order)) + 1 : 0;
    const { data } = await supabase.from('email_templates').insert({ name: t.name, subject: t.subject, body: t.body, category: t.category, sort_order: maxOrder, created_by: profile?.id }).select().single();
    if (data) { await load(); return rowToTemplate(data); }
  };

  const updateTemplate = async (id: string, t: Partial<EmailTemplate>) => {
    const update: any = {};
    if (t.name !== undefined) update.name = t.name;
    if (t.subject !== undefined) update.subject = t.subject;
    if (t.body !== undefined) update.body = t.body;
    if (t.category !== undefined) update.category = t.category;
    if (t.order !== undefined) update.sort_order = t.order;
    await supabase.from('email_templates').update(update).eq('id', id);
    await load();
  };

  const deleteTemplate = async (id: string) => {
    await supabase.from('email_templates').delete().eq('id', id);
    setTemplates(prev => prev.filter(t => t.id !== id));
  };

  const moveTemplate = async (id: string, direction: 'up' | 'down') => {
    const idx = templates.findIndex(t => t.id === id);
    if (idx === -1) return;
    const other = direction === 'up' ? idx - 1 : idx + 1;
    if (other < 0 || other >= templates.length) return;
    const a = templates[idx], b = templates[other];
    await supabase.from('email_templates').update({ sort_order: b.order }).eq('id', a.id);
    await supabase.from('email_templates').update({ sort_order: a.order }).eq('id', b.id);
    await load();
  };

  return { templates, isLoading, categories, placeholders, addTemplate, updateTemplate, deleteTemplate, moveTemplate };
};
