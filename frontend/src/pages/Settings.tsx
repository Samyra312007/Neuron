import { useState, useEffect, useCallback } from 'react';
import { getDownloadUrl } from '../api/client';
import { useAlertConfigs, useCreateAlertConfig, useDeleteAlertConfig, useEvaluateAlerts } from '../hooks/useAlerts';
import { useToast } from '../components/Toast';
import AlertBanner from '../components/AlertBanner';
import LoadingSkeleton from '../components/LoadingSkeleton';

interface SettingsData {
  org_name: string;
  settings: Record<string, string>;
}

export default function Settings() {
  const { addToast } = useToast();
  const [data, setData] = useState<SettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [orgName, setOrgName] = useState('');
  const [notifyEmail, setNotifyEmail] = useState('');
  const [notifyInfections, setNotifyInfections] = useState(true);
  const [notifyAlerts, setNotifyAlerts] = useState(true);

  const [slackUrl, setSlackUrl] = useState('');
  const [discordUrl, setDiscordUrl] = useState('');
  const [smtpHost, setSmtpHost] = useState('');
  const [smtpPort, setSmtpPort] = useState(587);
  const [smtpUser, setSmtpUser] = useState('');
  const [smtpPass, setSmtpPass] = useState('');
  const [fromEmail, setFromEmail] = useState('');
  const [reportToEmail, setReportToEmail] = useState('');
  const [ghToken, setGhToken] = useState('');
  const [ghOwner, setGhOwner] = useState('');
  const [ghRepo, setGhRepo] = useState('');

  const { data: alertConfigs } = useAlertConfigs();
  const createAlert = useCreateAlertConfig();
  const deleteAlert = useDeleteAlertConfig();
  const evaluateAlerts = useEvaluateAlerts();
  const [newMetric, setNewMetric] = useState('health_score');
  const [newOp, setNewOp] = useState('lt');
  const [newThreshold, setNewThreshold] = useState('0.5');
  const [newLabel, setNewLabel] = useState('');

  const fetchSettings = useCallback(async () => {
    const url = await getDownloadUrl('/settings');
    const res = await fetch(url);
    const d: SettingsData = await res.json();
    setData(d);
    setOrgName(d.org_name);
    setNotifyEmail(d.settings.notify_email || '');
    setNotifyInfections(d.settings.notify_infections !== 'false');
    setNotifyAlerts(d.settings.notify_alerts !== 'false');
    setSlackUrl(d.settings.webhook_slack || '');
    setDiscordUrl(d.settings.webhook_discord || '');
    setLoading(false);
  }, []);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  const handleSave = async () => {
    const url = await getDownloadUrl('/settings');
    await fetch(url, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        org_name: orgName,
        settings: {
          notify_email: notifyEmail,
          notify_infections: String(notifyInfections),
          notify_alerts: String(notifyAlerts),
          webhook_slack: slackUrl,
          webhook_discord: discordUrl,
        },
      }),
    });
    addToast('Settings saved', 'success');
  };

  const testWebhook = async (type: string, url: string) => {
    addToast(`Testing ${type} webhook...`, 'info');
    try {
      const apiUrl = await getDownloadUrl('/notifications/test-webhook');
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, url }),
      });
      if (res.ok) addToast(`${type} webhook works!`, 'success');
      else addToast(`${type} webhook failed`, 'error');
    } catch { addToast(`${type} webhook test error`, 'error'); }
  };

  const testEmail = async () => {
    addToast('Testing email config...', 'info');
    try {
      const apiUrl = await getDownloadUrl('/email-reports/test');
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ smtp_host: smtpHost, smtp_port: smtpPort, smtp_user: smtpUser, smtp_pass: smtpPass, from_email: fromEmail, to_email: reportToEmail }),
      });
      if (res.ok) addToast('Email config works!', 'success');
      else addToast('Email test failed', 'error');
    } catch { addToast('Email test error', 'error'); }
  };

  const sendReport = async () => {
    addToast('Sending report...', 'info');
    try {
      const apiUrl = await getDownloadUrl('/email-reports/send');
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config: { smtp_host: smtpHost, smtp_port: smtpPort, smtp_user: smtpUser, smtp_pass: smtpPass, from_email: fromEmail, to_email: reportToEmail }, report_type: 'pdf' }),
      });
      if (res.ok) addToast('Report sent!', 'success');
      else addToast('Report send failed', 'error');
    } catch { addToast('Report send error', 'error'); }
  };

  const ingestGitHub = async () => {
    addToast('Ingesting GitHub data...', 'info');
    try {
      const apiUrl = await getDownloadUrl('/github/ingest');
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: ghToken, owner: ghOwner, repo: ghRepo }),
      });
      const d = await res.json();
      if (res.ok) addToast(`Ingested ${d.ingested} events from GitHub`, 'success');
      else addToast(`GitHub ingest failed: ${d.detail}`, 'error');
    } catch { addToast('GitHub ingest error', 'error'); }
  };

  const handleImportCsv = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    addToast('Importing CSV...', 'info');
    try {
      const baseUrl = await getDownloadUrl('/import/teams');
      const base = baseUrl.split('?')[0];
      const orgId = (await getDownloadUrl('')).split('org_id=')[1]?.split('&')[0] || '';
      const form = new FormData();
      form.append('file', file);
      const res = await fetch(`${base}?org_id=${orgId}`, { method: 'POST', body: form });
      const d = await res.json();
      if (res.ok) addToast(`Imported ${d.people_imported} people in ${d.teams_created} teams`, 'success');
      else addToast('Import failed', 'error');
    } catch { addToast('Import error', 'error'); }
  };

  const downloadBackup = async () => {
    const url = await getDownloadUrl('/export-all/json');
    window.open(url, '_blank');
  };

  if (loading) return <LoadingSkeleton lines={6} />;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-gray-400 mt-1">Organization configuration & preferences</p>
      </div>

      <div className="neuron-card">
        <h2 className="text-sm font-semibold text-gray-400 mb-4 uppercase tracking-wider">Organization</h2>
        <label className="block text-sm text-gray-300 mb-1">Organization Name</label>
        <input value={orgName} onChange={(e) => setOrgName(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-neuron-500" />
      </div>

      <div className="neuron-card">
        <h2 className="text-sm font-semibold text-gray-400 mb-4 uppercase tracking-wider">Notifications</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-300 mb-1">Notification Email</label>
            <input type="email" value={notifyEmail} onChange={(e) => setNotifyEmail(e.target.value)} placeholder="admin@example.com" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-neuron-500" />
          </div>
          <label className="flex items-center gap-3 text-sm text-gray-300">
            <input type="checkbox" checked={notifyInfections} onChange={(e) => setNotifyInfections(e.target.checked)} className="rounded bg-gray-800 border-gray-600" />
            Notify on new infections detected
          </label>
          <label className="flex items-center gap-3 text-sm text-gray-300">
            <input type="checkbox" checked={notifyAlerts} onChange={(e) => setNotifyAlerts(e.target.checked)} className="rounded bg-gray-800 border-gray-600" />
            Notify when metrics cross alert thresholds
          </label>
        </div>
      </div>

      <div className="neuron-card">
        <h2 className="text-sm font-semibold text-gray-400 mb-4 uppercase tracking-wider">Notification Channels</h2>
        <div className="space-y-3">
          <label className="block text-sm text-gray-300">Slack Webhook URL</label>
          <div className="flex gap-2">
            <input value={slackUrl} onChange={(e) => setSlackUrl(e.target.value)} placeholder="https://hooks.slack.com/services/..." className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-neuron-500" />
            <button onClick={() => testWebhook('slack', slackUrl)} disabled={!slackUrl} className="px-3 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-gray-200 rounded-lg text-xs">Test</button>
          </div>
          <label className="block text-sm text-gray-300">Discord Webhook URL</label>
          <div className="flex gap-2">
            <input value={discordUrl} onChange={(e) => setDiscordUrl(e.target.value)} placeholder="https://discord.com/api/webhooks/..." className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-neuron-500" />
            <button onClick={() => testWebhook('discord', discordUrl)} disabled={!discordUrl} className="px-3 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-gray-200 rounded-lg text-xs">Test</button>
          </div>
        </div>
      </div>

      <div className="neuron-card">
        <h2 className="text-sm font-semibold text-gray-400 mb-4 uppercase tracking-wider">Alert Rules</h2>
        <div className="space-y-3 mb-4">
          <div className="grid grid-cols-4 gap-2">
            <select value={newMetric} onChange={(e) => setNewMetric(e.target.value)} className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs text-gray-300">
              <option value="health_score">Health Score</option>
              <option value="composite_score">Metabolic Rate</option>
              <option value="cognitive_composite">Cognitive Load</option>
            </select>
            <select value={newOp} onChange={(e) => setNewOp(e.target.value)} className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs text-gray-300">
              <option value="lt">Below (&lt;)</option>
              <option value="gt">Above (&gt;)</option>
              <option value="lte">Below or = (&le;)</option>
              <option value="gte">Above or = (&ge;)</option>
            </select>
            <input value={newThreshold} onChange={(e) => setNewThreshold(e.target.value)} type="number" step="0.1" placeholder="Threshold" className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-xs" />
            <input value={newLabel} onChange={(e) => setNewLabel(e.target.value)} placeholder="Label (e.g. Low health)" className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-xs" />
          </div>
          <div className="flex gap-2">
            <button onClick={() => createAlert.mutate({ metric_name: newMetric, comparison_operator: newOp, threshold_value: parseFloat(newThreshold), label: newLabel || `${newMetric} ${newOp} ${newThreshold}` }, { onSuccess: () => addToast('Alert rule created', 'success'), onError: () => addToast('Failed to create rule', 'error') })} disabled={createAlert.isPending} className="py-2 px-4 bg-neuron-500 hover:bg-neuron-600 disabled:opacity-50 text-white rounded-lg text-xs">Add Rule</button>
            <button onClick={() => evaluateAlerts.mutate(undefined, { onSuccess: (d) => addToast(`${d.triggered.length} alert(s) triggered`, d.triggered.length > 0 ? 'error' : 'success'), onError: () => addToast('Evaluation failed', 'error') })} disabled={evaluateAlerts.isPending} className="py-2 px-4 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-gray-200 rounded-lg text-xs">Evaluate Now</button>
          </div>
        </div>
        {alertConfigs && alertConfigs.length > 0 ? (
          <div className="space-y-1">
            {alertConfigs.map((c) => (
              <div key={c.id} className="flex items-center justify-between py-1.5 px-3 rounded bg-gray-800/30">
                <div className="text-xs text-gray-300">{c.label} <span className="text-gray-600">({c.metric_name} {c.comparison_operator} {c.threshold_value})</span></div>
                <button onClick={() => deleteAlert.mutate(c.id, { onSuccess: () => addToast('Rule deleted', 'success') })} className="text-xs text-red-400 hover:text-red-300">Delete</button>
              </div>
            ))}
          </div>
        ) : <p className="text-xs text-gray-500">No alert rules configured.</p>}
      </div>

      <div className="neuron-card">
        <h2 className="text-sm font-semibold text-gray-400 mb-4 uppercase tracking-wider">Email Reports (SMTP)</h2>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="block text-xs text-gray-400 mb-1">SMTP Host</label><input value={smtpHost} onChange={(e) => setSmtpHost(e.target.value)} placeholder="smtp.gmail.com" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-neuron-500" /></div>
          <div><label className="block text-xs text-gray-400 mb-1">Port</label><input type="number" value={smtpPort} onChange={(e) => setSmtpPort(Number(e.target.value))} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-neuron-500" /></div>
          <div><label className="block text-xs text-gray-400 mb-1">Username</label><input value={smtpUser} onChange={(e) => setSmtpUser(e.target.value)} placeholder="user@gmail.com" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-neuron-500" /></div>
          <div><label className="block text-xs text-gray-400 mb-1">Password</label><input type="password" value={smtpPass} onChange={(e) => setSmtpPass(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-neuron-500" /></div>
          <div><label className="block text-xs text-gray-400 mb-1">From Email</label><input value={fromEmail} onChange={(e) => setFromEmail(e.target.value)} placeholder="neuron@org.com" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-neuron-500" /></div>
          <div><label className="block text-xs text-gray-400 mb-1">Send To</label><input value={reportToEmail} onChange={(e) => setReportToEmail(e.target.value)} placeholder="admin@org.com" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-neuron-500" /></div>
        </div>
        <div className="flex gap-2 mt-3">
          <button onClick={testEmail} disabled={!smtpHost || !smtpUser} className="py-2 px-4 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-gray-200 rounded-lg text-xs transition-colors">Test Email</button>
          <button onClick={sendReport} disabled={!smtpHost || !smtpUser} className="py-2 px-4 bg-neuron-500 hover:bg-neuron-600 disabled:opacity-50 text-white rounded-lg text-xs transition-colors">Send Report Now</button>
        </div>
      </div>

      <div className="neuron-card">
        <h2 className="text-sm font-semibold text-gray-400 mb-4 uppercase tracking-wider">GitHub Connector</h2>
        <div className="grid grid-cols-3 gap-3">
          <div><label className="block text-xs text-gray-400 mb-1">Token</label><input value={ghToken} onChange={(e) => setGhToken(e.target.value)} placeholder="ghp_..." className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-neuron-500" /></div>
          <div><label className="block text-xs text-gray-400 mb-1">Owner</label><input value={ghOwner} onChange={(e) => setGhOwner(e.target.value)} placeholder="org-name" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-neuron-500" /></div>
          <div><label className="block text-xs text-gray-400 mb-1">Repo</label><input value={ghRepo} onChange={(e) => setGhRepo(e.target.value)} placeholder="repo-name" className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-neuron-500" /></div>
        </div>
        <button onClick={ingestGitHub} disabled={!ghToken || !ghOwner || !ghRepo} className="mt-3 py-2 px-4 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 text-gray-200 rounded-lg text-xs transition-colors">Ingest GitHub Data</button>
      </div>

      <div className="neuron-card">
        <h2 className="text-sm font-semibold text-gray-400 mb-4 uppercase tracking-wider">Data Export / Import</h2>
        <div className="flex gap-3">
          <button onClick={downloadBackup} className="py-2 px-4 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg text-xs transition-colors">Download JSON Backup</button>
          <label className="py-2 px-4 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg text-xs transition-colors cursor-pointer">
            Import Teams CSV
            <input type="file" accept=".csv" onChange={handleImportCsv} className="hidden" />
          </label>
        </div>
      </div>

      <div className="neuron-card">
        <h2 className="text-sm font-semibold text-gray-400 mb-4 uppercase tracking-wider">Data Source</h2>
        <p className="text-sm text-gray-400">Data is currently generated synthetically via mock AI agents. Set <code className="text-neuron-400 bg-gray-800 px-1 rounded">MOCK_AI=false</code> and configure <code className="text-neuron-400 bg-gray-800 px-1 rounded">NVIDIA_NIM_API_KEY</code> to use real LLM analysis.</p>
      </div>

      <button onClick={handleSave} className="py-2 px-6 bg-neuron-500 hover:bg-neuron-600 text-white rounded-lg font-medium text-sm transition-colors">Save Settings</button>
      <AlertBanner type="info">Settings are persisted to the database and survive container restarts.</AlertBanner>
    </div>
  );
}
