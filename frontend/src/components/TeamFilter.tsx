import { useTeams } from '../hooks/useTeams';

interface TeamFilterProps {
  value: string;
  onChange: (teamId: string) => void;
}

export default function TeamFilter({ value, onChange }: TeamFilterProps) {
  const { data: teams } = useTeams();

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-xs text-gray-300 focus:outline-none focus:border-neuron-500"
    >
      <option value="">All Teams</option>
      {teams?.map((t) => (
        <option key={t.id} value={t.id}>{t.name} ({t.department})</option>
      ))}
    </select>
  );
}
