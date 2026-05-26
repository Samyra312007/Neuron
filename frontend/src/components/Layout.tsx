import { ReactNode, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../lib/utils';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../api/client';

const NAV_ITEMS = [
  { path: '/', label: 'Dashboard', icon: '◉' },
  { path: '/genome', label: 'Genome Lab', icon: '🧬' },
  { path: '/dark-matter', label: 'Dark Matter', icon: '◈' },
  { path: '/immune', label: 'Immune Center', icon: '🛡' },
  { path: '/metabolic', label: 'Metabolic Rate', icon: '⚡' },
  { path: '/cognitive-load', label: 'Cognitive Load', icon: '🧠' },
  { path: '/ripple', label: 'Ripple Simulator', icon: '〰' },
  { path: '/fossil', label: 'Fossil Record', icon: '🪨' },
  { path: '/activity', label: 'Activity', icon: '📡' },
  { path: '/vulnerability', label: 'Vulnerability', icon: '⚠' },
  { path: '/decisions', label: 'Decisions', icon: '📋' },
  { path: '/settings', label: 'Settings', icon: '⚙' },
];

export default function Layout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dark, setDark] = useState(() => localStorage.getItem('neuron-dark') !== 'false');
  const [orgs, setOrgs] = useState<{id: string; name: string}[]>([]);

  useEffect(() => {
    api.get<{id: string; name: string}[]>('/orgs').then(setOrgs).catch(() => {});
  }, []);

  useEffect(() => {
    localStorage.setItem('neuron-dark', String(dark));
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  return (
    <div className="flex h-screen overflow-hidden">
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 w-10 h-10 rounded-lg bg-gray-900 border border-gray-800 flex items-center justify-center text-gray-400"
      >
        {sidebarOpen ? '✕' : '☰'}
      </button>

      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-30 bg-black/50" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={cn(
        'w-64 bg-gray-900 border-r border-gray-800 flex flex-col shrink-0 transition-transform duration-200',
        'lg:relative lg:translate-x-0 fixed z-40 h-full',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
      )}>
        <div className="p-6 border-b border-gray-800">
          <Link to="/" className="flex items-center gap-3" onClick={() => setSidebarOpen(false)}>
            <div className="w-8 h-8 rounded-full neuron-gradient neuron-glow flex items-center justify-center text-white text-sm font-bold">
              N
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight">NEURON</h1>
              <p className="text-xs text-gray-500">Org Intelligence</p>
            </div>
          </Link>
          {orgs.length > 1 && (
            <select
              value={user?.org_id || ''}
              onChange={async (e) => {
                const newOrgId = e.target.value;
                localStorage.setItem('neuron-org-override', newOrgId);
                window.location.reload();
              }}
              className="mt-2 w-full bg-gray-800 border border-gray-700 rounded px-2 py-1 text-xs text-gray-300"
            >
              {orgs.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
            </select>
          )}
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = item.path === '/' ? location.pathname === '/' : location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
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
          <div className="flex items-center justify-between mb-1">
            <div>
              <div className="text-xs text-gray-600">NEURON v0.1.0</div>
              <div className="text-xs text-gray-700">Hackathon Build</div>
              {user && <div className="text-xs text-gray-500 mt-0.5">{user.name}</div>}
            </div>
            <div className="flex gap-1">
              <button onClick={() => setDark(!dark)} className="text-xs px-2 py-1 rounded bg-gray-800 text-gray-400 hover:text-gray-200" title="Toggle theme">{dark ? '☀' : '☾'}</button>
              {user && <button onClick={logout} className="text-xs px-2 py-1 rounded bg-gray-800 text-red-400 hover:text-red-300" title="Logout">✕</button>}
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto lg:pl-0 pl-0">
        <div className="max-w-7xl mx-auto p-4 sm:p-8 pt-16 lg:pt-8">
          {children}
        </div>
      </main>
    </div>
  );
}
