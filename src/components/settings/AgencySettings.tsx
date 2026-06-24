
import React, { useState, useEffect } from 'react';
import { Building2, Phone, Mail, Globe, MapPin, Save } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { toast } from '../../hooks/use-toast';

interface AgencyData {
  name: string;
  address: string;
  city: string;
  zip: string;
  phone: string;
  email: string;
  website: string;
  iban: string;
  taxId: string;
  registrationNumber: string;
  opening_hours: string;
}

const DEFAULT: AgencyData = {
  name: 'Itzehoer Versicherungen Till Streckenbach',
  address: '',
  city: '',
  zip: '',
  phone: '',
  email: '',
  website: '',
  iban: '',
  taxId: '',
  registrationNumber: '',
  opening_hours: 'Mo–Fr: 08:30–17:00 Uhr',
};

const AGENCY_KEY = 'agency_data';

export const AgencySettings: React.FC = () => {
  const [data, setData] = useState<AgencyData>(DEFAULT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      const { data: row } = await supabase.from('agency_settings').select('value').eq('key', AGENCY_KEY).maybeSingle();
      if (row?.value) {
        try { setData({ ...DEFAULT, ...JSON.parse(row.value) }); } catch {}
      }
      setLoading(false);
    };
    load();
  }, []);

  const set = (field: keyof AgencyData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setData(prev => ({ ...prev, [field]: e.target.value }));

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase.from('agency_settings')
      .upsert({ key: AGENCY_KEY, value: JSON.stringify(data) }, { onConflict: 'key' });
    if (error) toast({ title: 'Fehler', description: error.message, variant: 'destructive' });
    else toast({ title: 'Stammdaten gespeichert' });
    setSaving(false);
  };

  if (loading) return <p className="text-muted-foreground text-sm">Lade…</p>;

  const Field = ({ label, field, icon, type = 'text', placeholder = '' }: {
    label: string; field: keyof AgencyData; icon?: React.ReactNode; type?: string; placeholder?: string;
  }) => (
    <div>
      <label className="text-xs font-semibold text-muted-foreground block mb-1">{label}</label>
      <div className="relative">
        {icon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">{icon}</span>}
        <input
          type={type}
          value={data[field]}
          onChange={set(field)}
          placeholder={placeholder}
          className={`w-full ${icon ? 'pl-9' : 'pl-3'} pr-3 py-2 text-sm rounded-md border border-input bg-background focus:outline-none focus:ring-1 focus:ring-primary`}
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="bg-card border border-border rounded-xl p-6 space-y-5">
        <h3 className="font-semibold text-sm flex items-center gap-2"><Building2 className="w-4 h-4 text-primary" /> Agenturprofil</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Field label="Agenturname" field="name" icon={<Building2 className="w-3.5 h-3.5" />} placeholder="Itzehoer Versicherungen …" />
          </div>

          <Field label="Straße & Hausnummer" field="address" icon={<MapPin className="w-3.5 h-3.5" />} placeholder="Musterstraße 1" />
          <div className="flex gap-2">
            <div className="w-28">
              <Field label="PLZ" field="zip" placeholder="25524" />
            </div>
            <div className="flex-1">
              <Field label="Stadt" field="city" placeholder="Itzehoe" />
            </div>
          </div>

          <Field label="Telefon" field="phone" icon={<Phone className="w-3.5 h-3.5" />} placeholder="+49 4821 …" />
          <Field label="E-Mail" field="email" icon={<Mail className="w-3.5 h-3.5" />} type="email" placeholder="info@…" />
          <Field label="Website" field="website" icon={<Globe className="w-3.5 h-3.5" />} placeholder="https://…" />
          <Field label="Öffnungszeiten" field="opening_hours" placeholder="Mo–Fr: 08:30–17:00 Uhr" />
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 space-y-5">
        <h3 className="font-semibold text-sm">Bankverbindung & steuerliche Angaben</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="IBAN" field="iban" placeholder="DE…" />
          <Field label="Steuernummer" field="taxId" placeholder="12/345/67890" />
          <div className="md:col-span-2">
            <Field label="Handelsnummer / Vermittlerregistrierung" field="registrationNumber" placeholder="D-…" />
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium disabled:opacity-60"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Speichert…' : 'Stammdaten speichern'}
        </button>
      </div>
    </div>
  );
};
