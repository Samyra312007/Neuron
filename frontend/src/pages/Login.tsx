import { useState } from 'react';
import { useToast } from '../components/Toast';
import AlertBanner from '../components/AlertBanner';

interface LoginProps {
  onLogin: (token: string) => void;
}

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
      const url = mode === 'login'
        ? `http://localhost:8000/api/v1/auth/login`
        : `http://localhost:8000/api/v1/auth/register`;
      const body = mode === 'login'
        ? { email, password }
        : { email, password, name, org_name: 'My Organization' };
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      localStorage.setItem('neuron-token', data.token);
      localStorage.setItem('neuron-user', JSON.stringify(data.user));
      onLogin(data.token);
      addToast(mode === 'login' ? 'Logged in' : 'Registered', 'success');
    } catch (e: any) {
      addToast(e.message || 'Auth failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-950">
      <div className="w-full max-w-sm p-8 space-y-6">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full neuron-gradient neuron-glow flex items-center justify-center text-white text-xl font-bold mx-auto mb-3">N</div>
          <h1 className="text-2xl font-bold text-white">NEURON</h1>
          <p className="text-gray-500 text-sm mt-1">Organizational Intelligence</p>
        </div>

        <div className="neuron-card space-y-4">
          <div className="flex border border-gray-700 rounded-lg overflow-hidden">
            <button onClick={() => setMode('login')} className={`flex-1 py-2 text-sm font-medium ${mode === 'login' ? 'bg-neuron-500 text-white' : 'bg-gray-800 text-gray-400'}`}>Login</button>
            <button onClick={() => setMode('register')} className={`flex-1 py-2 text-sm font-medium ${mode === 'register' ? 'bg-neuron-500 text-white' : 'bg-gray-800 text-gray-400'}`}>Register</button>
          </div>

          {mode === 'register' && (
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Full name" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-neuron-500" />
          )}
          <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="Email" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-neuron-500" />
          <input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="Password" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-neuron-500" />

          <button onClick={handleSubmit} disabled={loading || !email || !password} className="w-full py-2 bg-neuron-500 hover:bg-neuron-600 disabled:opacity-50 text-white rounded-lg font-medium text-sm transition-colors">
            {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </div>

        <AlertBanner type="info">
          Demo: register any email/password. No email verification required.
        </AlertBanner>
      </div>
    </div>
  );
}
