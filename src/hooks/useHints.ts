import { useState, useEffect } from 'react';

const KEY = 'hints_enabled';

export function useHints() {
  const [enabled, setEnabled] = useState(() => localStorage.getItem(KEY) !== 'false');

  const toggle = () => {
    const next = !enabled;
    setEnabled(next);
    localStorage.setItem(KEY, next ? 'true' : 'false');
  };

  return { hintsEnabled: enabled, toggleHints: toggle };
}
