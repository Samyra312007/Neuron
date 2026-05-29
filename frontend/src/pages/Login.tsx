import { useState } from 'react';
import { API_BASE } from '../api/client';
import { useToast } from '../components/Toast';
import Icon from '../components/Icon';

interface LoginProps { onLogin: (token: string) => void; }

export default function Login({ onLogin }: LoginProps) {
  const { addToast } = useToast();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const url = `${API_BASE}/api/v1/auth/${mode === 'login' ? 'login' : 'register'}`;
      const body = mode === 'login' ? { email, password } : { email, password, name, org_name: 'My Organization' };
      const res = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      localStorage.setItem('neuron-token', data.token);
      localStorage.setItem('neuron-user', JSON.stringify(data.user));
      onLogin(data.token, data.user);
      addToast(mode === 'login' ? 'Logged in' : 'Registered', 'success');
    } catch (e: any) {
      addToast(e.message || 'Auth failed', 'error');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-95/50 to-surface-container-low">
      <div className="w-full max-w-sm p-8 space-y-6">
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl bg-primary-20 flex items-center justify-center text-white text-2xl font-bold font-display mx-auto mb-4 shadow-elevated">
            N
          </div>
          <h1 className="text-2xl font-bold font-display text-neutral-20">NEURON</h1>
          <p className="text-neutral-50 text-sm mt-1">Organizational Intelligence</p>
        </div>

        <div className="card space-y-4">
          <div className="flex bg-surface-container rounded-xl p-1">
            <button onClick={() => setMode('login')}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${mode === 'login' ? 'bg-surface-container-lowest text-primary-40 shadow-sm' : 'text-neutral-50 hover:text-neutral-30'}`}>Login</button>
            <button onClick={() => setMode('register')}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${mode === 'register' ? 'bg-surface-container-lowest text-primary-40 shadow-sm' : 'text-neutral-50 hover:text-neutral-30'}`}>Register</button>
          </div>

          {mode === 'register' && (
            <div className="relative">
              <Icon name="person" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-60" />
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Full name"
                className="w-full bg-surface-container border border-neutral-80/50 rounded-xl pl-9 pr-4 py-2.5 text-sm text-neutral-20 placeholder-neutral-60 focus:outline-none focus:border-primary-40" />
            </div>
          )}
          <div className="relative">
            <Icon name="email" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-60" />
            <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="Email"
              className="w-full bg-surface-container border border-neutral-80/50 rounded-xl pl-9 pr-4 py-2.5 text-sm text-neutral-20 placeholder-neutral-60 focus:outline-none focus:border-primary-40" />
          </div>
          <div className="relative">
            <Icon name="lock" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-60" />
            <input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="Password"
              className="w-full bg-surface-container border border-neutral-80/50 rounded-xl pl-9 pr-4 py-2.5 text-sm text-neutral-20 placeholder-neutral-60 focus:outline-none focus:border-primary-40" />
          </div>

          <button onClick={handleSubmit} disabled={loading || !email || !password}
            className="w-full py-2.5 bg-primary-40 hover:bg-primary-30 disabled:opacity-50 text-white rounded-xl font-medium text-sm transition-all active:scale-[0.98]">
            {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </div>

        <div className="card bg-surface-container/50 text-center py-3">
          <div className="flex items-center justify-center gap-2 text-xs text-neutral-50">
            <Icon name="info" size={14} className="text-primary-40" />
            Demo: register any email/password. No verification required.
          </div>
        </div>
      </div>
    </div>
  );
}
