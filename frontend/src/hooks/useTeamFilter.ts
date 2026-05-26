import { useState, useCallback } from 'react';

export function useTeamFilter() {
  const [teamId, setTeamId] = useState(() => localStorage.getItem('neuron-team') || '');

  const handleChange = useCallback((id: string) => {
    setTeamId(id);
    localStorage.setItem('neuron-team', id);
  }, []);

  return { teamId, setTeamId: handleChange };
}
