import { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../lib/utils';

const NAV_ITEMS = [
  { path: '/', label: 'Dashboard', icon: '◉' },
  { path: '/genome', label: 'Genome Lab', icon: '🧬' },
  { path: '/dark-matter', label: 'Dark Matter', icon: '◈' },
  { path: '/immune', label: 'Immune Center', icon: '🛡' },
  { path: '/metabolic', label: 'Metabolic Rate', icon: '⚡' },
];

export default function Layout({ children }: { children: ReactNode }) {
  const location = useLocation();

  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
        <div className="p-6 border-b border-gray-800">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full neuron-gradient neuron-glow flex items-center justify-center text-white text-sm font-bold">
              N
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight">NEURON</h1>
              <p className="text-xs text-gray-500">Org Intelligence</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const isActive = item.path === '/' ? location.pathname === '/' : location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-neuron-500/10 text-neuron-400 border border-neuron-500/20'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800',
                )}
              >
                <span className="text-lg">{item.icon}</span>
                {item.label}
                {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-neuron-400" />}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-800">
          <div className="text-xs text-gray-600">NEURON v0.1.0</div>
          <div className="text-xs text-gray-700">Hackathon Build</div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
