import { ReactNode, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '../lib/utils';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../api/client';
import Icon from './Icon';

const NAV_ITEMS = [
  { path: '/', label: 'Dashboard', icon: 'dashboard' },
  { path: '/genome', label: 'Genome', icon: 'genetics' },
  { path: '/dark-matter', label: 'Dark Matter', icon: 'radar' },
  { path: '/metabolic', label: 'Metabolic', icon: 'speed' },
  { path: '/cognitive-load', label: 'Cognitive', icon: 'psychiatry' },
  { path: '/immune', label: 'Immune', icon: 'shield' },
  { path: '/ripple', label: 'Simulate', icon: 'water_drop' },
  { path: '/fossil', label: 'Fossil', icon: 'layers' },
  { path: '/activity', label: 'Activity', icon: 'monitoring' },
  { path: '/vulnerability', label: 'Vulnerability', icon: 'warning' },
  { path: '/decisions', label: 'Decisions', icon: 'list_alt' },
  { path: '/settings', label: 'Settings', icon: 'settings' },
];

export default function Layout({ children }: { children: ReactNode }) {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dark, setDark] = useState(() => localStorage.getItem('neuron-dark') === 'true');
  const [orgs, setOrgs] = useState<{id: string; name: string}[]>([]);
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    api.get<{id: string; name: string}[]>('/orgs').then(setOrgs).catch(() => {});
  }, []);

  useEffect(() => {
    localStorage.setItem('neuron-dark', String(dark));
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 60000);
    return () => clearInterval(t);
  }, []);

  const currentPage = NAV_ITEMS.find(i => i.path === '/' ? location.pathname === '/' : location.pathname.startsWith(i.path));

  return (
    <div className="flex h-screen overflow-hidden bg-surface-container-low">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-30 bg-black/30 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={cn(
        'w-[72px] bg-surface-container-lowest border-r border-neutral-80/50 flex flex-col shrink-0 items-center py-3 gap-3 transition-transform duration-200 z-40',
        'lg:relative lg:translate-x-0 fixed h-full',
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
      )}>
        <Link to="/" className="w-10 h-10 rounded-xl bg-primary-20 flex items-center justify-center text-white font-display font-bold text-lg hover:bg-primary-30 transition-colors" onClick={() => setSidebarOpen(false)}>
          N
        </Link>

        <nav className="flex-1 flex flex-col items-center gap-1 w-full px-2">
          {NAV_ITEMS.map((item) => {
            const isActive = item.path === '/' ? location.pathname === '/' : location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  'w-12 h-12 rounded-xl flex items-center justify-center transition-all relative group overflow-hidden',
                  isActive
                    ? 'bg-primary-95 text-primary-40'
                    : 'text-neutral-60 hover:bg-surface-container hover:text-neutral-30',
                )}
                title={item.label}
              >
                <Icon name={item.icon} size={20} weight={isActive ? 500 : 400} fill={isActive} />
                {isActive && <span className="absolute left-[-10px] top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full bg-primary-40" />}
                <span className="absolute left-full ml-3 px-2 py-1 bg-neutral-30 text-white text-xs rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-elevated z-50">
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        <div className="flex flex-col items-center gap-1">
          <button onClick={() => setDark(!dark)} className="w-10 h-10 rounded-xl flex items-center justify-center text-neutral-50 hover:bg-surface-container hover:text-neutral-30 transition-all" title={dark ? 'Light mode' : 'Dark mode'}>
            <Icon name={dark ? 'light_mode' : 'dark_mode'} size={20} />
          </button>
          {user && (
            <button onClick={logout} className="w-10 h-10 rounded-xl flex items-center justify-center text-neutral-50 hover:bg-surface-container hover:text-health-critical transition-all" title="Logout">
              <Icon name="logout" size={20} />
            </button>
          )}
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-14 bg-surface-container-lowest/90 backdrop-blur-md border-b border-neutral-80/50 flex items-center justify-between px-5 shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="lg:hidden w-8 h-8 rounded-lg flex items-center justify-center text-neutral-50 hover:bg-surface-container">
              <Icon name="menu" size={20} />
            </button>
            <h1 className="text-base font-display font-semibold text-neutral-20">{currentPage?.label || 'Dashboard'}</h1>
            <span className="text-xs text-neutral-50 font-mono">
              {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          <div className="flex items-center gap-2">
            {orgs.length > 1 && (
              <select
                value={user?.org_id || ''}
                onChange={async (e) => {
                  localStorage.setItem('neuron-org-override', e.target.value);
                  window.location.reload();
                }}
                className="bg-surface-container border border-neutral-80/50 rounded-lg px-2.5 py-1.5 text-xs text-neutral-40 focus:outline-none focus:border-primary-40"
              >
                {orgs.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
              </select>
            )}
            {user && (
              <div className="flex items-center gap-1">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-container">
                  <div className="w-6 h-6 rounded-full bg-primary-40 flex items-center justify-center text-white text-[10px] font-bold">
                    {user.name?.charAt(0).toUpperCase() || 'U'}
                  </div>
                  <span className="text-xs text-neutral-50">{user.name}</span>
                </div>
                <button onClick={logout} className="p-1.5 rounded-lg text-neutral-50 hover:bg-surface-container hover:text-health-critical transition-all" title="Logout">
                  <Icon name="logout" size={18} />
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-[1440px] mx-auto p-5 lg:p-8 animate-fade-in">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
