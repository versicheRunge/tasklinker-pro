import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const DEFAULT = 'TruTeam';
let cached: string | null = null;

export function useAgencyName() {
  const [name, setName] = useState<string>(cached ?? DEFAULT);

  useEffect(() => {
    if (cached) return;
    supabase
      .from('agency_settings')
      .select('value')
      .eq('key', 'agency_data')
      .maybeSingle()
      .then(({ data }) => {
        if (data?.value) {
          try {
            const parsed = JSON.parse(data.value);
            if (parsed?.name) {
              cached = parsed.name;
              setName(parsed.name);
              return;
            }
          } catch {}
        }
        // Fallback: try plain agency_name key
        return supabase
          .from('agency_settings')
          .select('value')
          .eq('key', 'agency_name')
          .maybeSingle();
      })
      .then((res: any) => {
        if (res?.data?.value) {
          cached = res.data.value;
          setName(res.data.value);
        }
      });
  }, []);

  return name;
}
