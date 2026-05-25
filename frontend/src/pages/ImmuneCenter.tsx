import { useInfections, useAnalyzeInfections, useTreatInfection } from '../hooks/useImmune';
import InfectionCard from '../components/InfectionCard';
import AlertBanner from '../components/AlertBanner';
import LoadingSkeleton from '../components/LoadingSkeleton';

export default function ImmuneCenter() {
  const { data: infections, isLoading, error } = useInfections();
  const analyze = useAnalyzeInfections();
  const treat = useTreatInfection();

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Immune Center</h1>
          <p className="text-gray-400 mt-1">Organizational infection detection & treatment</p>
        </div>
        <button
          onClick={() => analyze.mutate()}
          disabled={analyze.isPending}
          className="py-2 px-5 bg-neuron-500 hover:bg-neuron-600 disabled:opacity-50 text-white rounded-lg font-medium text-sm transition-colors"
        >
          {analyze.isPending ? 'Scanning...' : 'Scan for Infections'}
        </button>
      </div>

      {error && (
        <AlertBanner type="info">
          No infections detected yet. Click <strong>"Scan for Infections"</strong> to analyze your organization.
        </AlertBanner>
      )}

      {isLoading ? (
        <LoadingSkeleton lines={6} />
      ) : infections && infections.length > 0 ? (
        <>
          <div className="flex items-center gap-3">
            <AlertBanner type="error" className="flex-1">
              {infections.length} active infection{infections.length > 1 ? 's' : ''} detected
            </AlertBanner>
            <span className="text-sm text-gray-500">
              Severity: {
                infections.filter(i => i.severity === 'high').length > 0 ? '⚠ High' :
                infections.filter(i => i.severity === 'medium').length > 0 ? '◆ Medium' : '● Low'
              }
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {infections.map((inf) => (
              <InfectionCard
                key={inf.id}
                type={inf.infection_type}
                severity={inf.severity}
                description={inf.description}
                spreadCount={inf.spread_count}
                treatment={inf.treatment}
                onTreat={inf.treatment ? () => treat.mutate(inf.id) : undefined}
              />
            ))}
          </div>
        </>
      ) : (
        <AlertBanner type="success">
          No infections detected. Your organization appears healthy.
        </AlertBanner>
      )}
    </div>
  );
}
