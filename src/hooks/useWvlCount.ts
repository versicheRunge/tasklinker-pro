import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

// Returns count of follow-up cases that are overdue or due today, for the current user.
export function useWvlCount() {
  const { profile } = useAuth();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!profile) return;
    const today = new Date().toISOString().slice(0, 10);
    supabase
      .from('cases')
      .select('id', { count: 'exact', head: true })
      .eq('assignee_id', profile.id)
      .eq('archived', false)
      .neq('status', 'completed')
      .lte('follow_up_date', today)
      .not('follow_up_date', 'is', null)
      .then(({ count: c }) => setCount(c ?? 0));
  }, [profile]);

  return count;
}
