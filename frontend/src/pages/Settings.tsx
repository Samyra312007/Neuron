import { useState, useEffect, useCallback } from 'react';
import { getDownloadUrl } from '../api/client';
import { useAlertConfigs, useCreateAlertConfig, useDeleteAlertConfig, useEvaluateAlerts } from '../hooks/useAlerts';
import { useToast } from '../components/Toast';
import Icon from '../components/Icon';

interface SettingsData { org_name: string; settings: Record<string, string>; }

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
    try {
      const url = await getDownloadUrl('/settings');
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to load settings');
      const d: SettingsData = await res.json();
      setData(d); setOrgName(d.org_name);
      setNotifyEmail(d.settings.notify_email || '');
      setNotifyInfections(d.settings.notify_infections !== 'false');
      setNotifyAlerts(d.settings.notify_alerts !== 'false');
      setSlackUrl(d.settings.webhook_slack || '');
      setDiscordUrl(d.settings.webhook_discord || '');
    } catch (e) {
      addToast('Failed to load settings', 'error');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  useEffect(() => { fetchSettings(); }, [fetchSettings]);

  const handleSave = async () => {
    try {
      const url = await getDownloadUrl('/settings');
      const res = await fetch(url, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ org_name: orgName, settings: { notify_email: notifyEmail, notify_infections: String(notifyInfections), notify_alerts: String(notifyAlerts), webhook_slack: slackUrl, webhook_discord: discordUrl } }),
      });
      if (!res.ok) throw new Error('Save failed');
      addToast('Settings saved', 'success');
    } catch {
      addToast('Failed to save settings', 'error');
    }
  };

  const testWebhook = async (type: string, url: string) => {
    addToast(`Testing ${type}...`, 'info');
    try {
      const apiUrl = await getDownloadUrl('/notifications/test-webhook');
      const res = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type, url }) });
      addToast(res.ok ? `${type} webhook works!` : `${type} webhook failed`, res.ok ? 'success' : 'error');
    } catch { addToast(`${type} webhook test error`, 'error'); }
  };

  const testEmail = async () => {
    addToast('Testing email...', 'info');
    try {
      const apiUrl = await getDownloadUrl('/email-reports/test');
      const res = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ smtp_host: smtpHost, smtp_port: smtpPort, smtp_user: smtpUser, smtp_pass: smtpPass, from_email: fromEmail, to_email: reportToEmail }) });
      addToast(res.ok ? 'Email config works!' : 'Email test failed', res.ok ? 'success' : 'error');
    } catch { addToast('Email test error', 'error'); }
  };

  const sendReport = async () => {
    addToast('Sending report...', 'info');
    try {
      const apiUrl = await getDownloadUrl('/email-reports/send');
      const res = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ config: { smtp_host: smtpHost, smtp_port: smtpPort, smtp_user: smtpUser, smtp_pass: smtpPass, from_email: fromEmail, to_email: reportToEmail }, report_type: 'pdf' }) });
      addToast(res.ok ? 'Report sent!' : 'Report send failed', res.ok ? 'success' : 'error');
    } catch { addToast('Report send error', 'error'); }
  };

  const ingestGitHub = async () => {
    addToast('Ingesting GitHub...', 'info');
    try {
      const apiUrl = await getDownloadUrl('/github/ingest');
      const res = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token: ghToken, owner: ghOwner, repo: ghRepo }) });
      const d = await res.json();
      addToast(res.ok ? `Ingested ${d.ingested} events` : `GitHub ingest failed: ${d.detail}`, res.ok ? 'success' : 'error');
    } catch { addToast('GitHub ingest error', 'error'); }
  };

  const handleImportCsv = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    addToast('Importing CSV...', 'info');
    try {
      const baseUrl = await getDownloadUrl('/import/teams');
      const base = baseUrl.split('?')[0];
      const orgId = (await getDownloadUrl('')).split('org_id=')[1]?.split('&')[0] || '';
      const form = new FormData(); form.append('file', file);
      const res = await fetch(`${base}?org_id=${orgId}`, { method: 'POST', body: form });
      const d = await res.json();
      addToast(res.ok ? `Imported ${d.people_imported} people in ${d.teams_created} teams` : 'Import failed', res.ok ? 'success' : 'error');
    } catch { addToast('Import error', 'error'); }
  };

  const downloadBackup = async () => window.open(await getDownloadUrl('/export-all/json'), '_blank');

  if (loading) {
    return <div className="space-y-6">{Array.from({length:5}).map((_,i) => <div key={i} className="card h-32 animate-shimmer rounded-2xl" />)}</div>;
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Icon name="business" size={18} className="text-primary-40" />
          <h3 className="section-label">Organization</h3>
        </div>
        <label className="block text-sm text-neutral-50 mb-1">Organization Name</label>
        <input value={orgName} onChange={(e) => setOrgName(e.target.value)}
          className="w-full bg-surface-container border border-neutral-80/50 rounded-xl px-4 py-2.5 text-sm text-neutral-20 focus:outline-none focus:border-primary-40" />
      </div>

      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Icon name="notifications" size={18} className="text-primary-40" />
          <h3 className="section-label">Notifications</h3>
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-sm text-neutral-50 mb-1">Notification Email</label>
            <input type="email" value={notifyEmail} onChange={(e) => setNotifyEmail(e.target.value)} placeholder="admin@example.com"
              className="w-full bg-surface-container border border-neutral-80/50 rounded-xl px-4 py-2.5 text-sm text-neutral-20 placeholder-neutral-60 focus:outline-none focus:border-primary-40" />
          </div>
          <label className="flex items-center gap-3 text-sm text-neutral-40 cursor-pointer">
            <input type="checkbox" checked={notifyInfections} onChange={(e) => setNotifyInfections(e.target.checked)}
              className="rounded border-neutral-70 text-primary-40 focus:ring-primary-40" />
            Notify on new infections detected
          </label>
          <label className="flex items-center gap-3 text-sm text-neutral-40 cursor-pointer">
            <input type="checkbox" checked={notifyAlerts} onChange={(e) => setNotifyAlerts(e.target.checked)}
              className="rounded border-neutral-70 text-primary-40 focus:ring-primary-40" />
            Notify when metrics cross alert thresholds
          </label>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Icon name="webhook" size={18} className="text-primary-40" />
          <h3 className="section-label">Notification Channels</h3>
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-sm text-neutral-50 mb-1">Slack Webhook URL</label>
            <div className="flex gap-2">
              <input value={slackUrl} onChange={(e) => setSlackUrl(e.target.value)} placeholder="https://hooks.slack.com/services/..."
                className="flex-1 bg-surface-container border border-neutral-80/50 rounded-xl px-4 py-2.5 text-sm text-neutral-20 placeholder-neutral-60 focus:outline-none focus:border-primary-40" />
              <button onClick={() => testWebhook('slack', slackUrl)} disabled={!slackUrl} className="btn-secondary">Test</button>
            </div>
          </div>
          <div>
            <label className="block text-sm text-neutral-50 mb-1">Discord Webhook URL</label>
            <div className="flex gap-2">
              <input value={discordUrl} onChange={(e) => setDiscordUrl(e.target.value)} placeholder="https://discord.com/api/webhooks/..."
                className="flex-1 bg-surface-container border border-neutral-80/50 rounded-xl px-4 py-2.5 text-sm text-neutral-20 placeholder-neutral-60 focus:outline-none focus:border-primary-40" />
              <button onClick={() => testWebhook('discord', discordUrl)} disabled={!discordUrl} className="btn-secondary">Test</button>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Icon name="notifications_active" size={18} className="text-primary-40" />
          <h3 className="section-label">Alert Rules</h3>
        </div>
        <div className="space-y-3 mb-4">
          <div className="grid grid-cols-4 gap-2">
            <select value={newMetric} onChange={(e) => setNewMetric(e.target.value)}
              className="bg-surface-container border border-neutral-80/50 rounded-lg px-3 py-2 text-xs text-neutral-40 focus:outline-none focus:border-primary-40">
              <option value="health_score">Health Score</option>
              <option value="composite_score">Metabolic Rate</option>
              <option value="cognitive_composite">Cognitive Load</option>
            </select>
            <select value={newOp} onChange={(e) => setNewOp(e.target.value)}
              className="bg-surface-container border border-neutral-80/50 rounded-lg px-3 py-2 text-xs text-neutral-40 focus:outline-none focus:border-primary-40">
              <option value="lt">Below (&lt;)</option>
              <option value="gt">Above (&gt;)</option>
              <option value="lte">Below or = (&le;)</option>
              <option value="gte">Above or = (&ge;)</option>
            </select>
            <input value={newThreshold} onChange={(e) => setNewThreshold(e.target.value)} type="number" step="0.1" placeholder="Threshold"
              className="bg-surface-container border border-neutral-80/50 rounded-lg px-3 py-2 text-sm text-neutral-20 placeholder-neutral-60 focus:outline-none focus:border-primary-40" />
            <input value={newLabel} onChange={(e) => setNewLabel(e.target.value)} placeholder="Label"
              className="bg-surface-container border border-neutral-80/50 rounded-lg px-3 py-2 text-sm text-neutral-20 placeholder-neutral-60 focus:outline-none focus:border-primary-40" />
          </div>
          <div className="flex gap-2">
            <button onClick={() => createAlert.mutate({ metric_name: newMetric, comparison_operator: newOp, threshold_value: parseFloat(newThreshold), label: newLabel || `${newMetric} ${newOp} ${newThreshold}` }, { onSuccess: () => addToast('Alert rule created', 'success'), onError: () => addToast('Failed to create rule', 'error') })} disabled={createAlert.isPending} className="btn-primary">Add Rule</button>
            <button onClick={() => evaluateAlerts.mutate(undefined, { onSuccess: (d) => addToast(`${d.triggered.length} alert(s) triggered`, d.triggered.length > 0 ? 'error' : 'success'), onError: () => addToast('Evaluation failed', 'error') })} disabled={evaluateAlerts.isPending} className="btn-secondary">Evaluate Now</button>
          </div>
        </div>
        {alertConfigs && alertConfigs.length > 0 ? (
          <div className="space-y-1">
            {alertConfigs.map((c) => (
              <div key={c.id} className="flex items-center justify-between py-2 px-3 rounded-xl bg-surface-container">
                <div className="text-xs text-neutral-50">{c.label} <span className="text-neutral-70">({c.metric_name} {c.comparison_operator} {c.threshold_value})</span></div>
                <button onClick={() => deleteAlert.mutate(c.id, { onSuccess: () => addToast('Rule deleted', 'success') })} className="text-xs text-health-critical hover:text-health-critical/80">Delete</button>
              </div>
            ))}
          </div>
        ) : <p className="text-xs text-neutral-60">No alert rules configured.</p>}
      </div>

      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Icon name="mail" size={18} className="text-primary-40" />
          <h3 className="section-label">Email Reports (SMTP)</h3>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div><label className="block text-xs text-neutral-60 mb-1">SMTP Host</label><input value={smtpHost} onChange={(e) => setSmtpHost(e.target.value)} placeholder="smtp.gmail.com" className="w-full bg-surface-container border border-neutral-80/50 rounded-xl px-3 py-2 text-sm text-neutral-20 focus:outline-none focus:border-primary-40" /></div>
          <div><label className="block text-xs text-neutral-60 mb-1">Port</label><input type="number" value={smtpPort} onChange={(e) => setSmtpPort(Number(e.target.value))} className="w-full bg-surface-container border border-neutral-80/50 rounded-xl px-3 py-2 text-sm text-neutral-20 focus:outline-none focus:border-primary-40" /></div>
          <div><label className="block text-xs text-neutral-60 mb-1">Username</label><input value={smtpUser} onChange={(e) => setSmtpUser(e.target.value)} placeholder="user@gmail.com" className="w-full bg-surface-container border border-neutral-80/50 rounded-xl px-3 py-2 text-sm text-neutral-20 focus:outline-none focus:border-primary-40" /></div>
          <div><label className="block text-xs text-neutral-60 mb-1">Password</label><input type="password" value={smtpPass} onChange={(e) => setSmtpPass(e.target.value)} className="w-full bg-surface-container border border-neutral-80/50 rounded-xl px-3 py-2 text-sm text-neutral-20 focus:outline-none focus:border-primary-40" /></div>
          <div><label className="block text-xs text-neutral-60 mb-1">From Email</label><input value={fromEmail} onChange={(e) => setFromEmail(e.target.value)} placeholder="neuron@org.com" className="w-full bg-surface-container border border-neutral-80/50 rounded-xl px-3 py-2 text-sm text-neutral-20 focus:outline-none focus:border-primary-40" /></div>
          <div><label className="block text-xs text-neutral-60 mb-1">Send To</label><input value={reportToEmail} onChange={(e) => setReportToEmail(e.target.value)} placeholder="admin@org.com" className="w-full bg-surface-container border border-neutral-80/50 rounded-xl px-3 py-2 text-sm text-neutral-20 focus:outline-none focus:border-primary-40" /></div>
        </div>
        <div className="flex gap-2 mt-3">
          <button onClick={testEmail} disabled={!smtpHost || !smtpUser} className="btn-secondary">Test Email</button>
          <button onClick={sendReport} disabled={!smtpHost || !smtpUser} className="btn-primary gap-2"><Icon name="send" size={16} />Send Report Now</button>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Icon name="code" size={18} className="text-primary-40" />
          <h3 className="section-label">GitHub Connector</h3>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div><label className="block text-xs text-neutral-60 mb-1">Token</label><input value={ghToken} onChange={(e) => setGhToken(e.target.value)} placeholder="ghp_..." className="w-full bg-surface-container border border-neutral-80/50 rounded-xl px-3 py-2 text-sm text-neutral-20 focus:outline-none focus:border-primary-40" /></div>
          <div><label className="block text-xs text-neutral-60 mb-1">Owner</label><input value={ghOwner} onChange={(e) => setGhOwner(e.target.value)} placeholder="org-name" className="w-full bg-surface-container border border-neutral-80/50 rounded-xl px-3 py-2 text-sm text-neutral-20 focus:outline-none focus:border-primary-40" /></div>
          <div><label className="block text-xs text-neutral-60 mb-1">Repo</label><input value={ghRepo} onChange={(e) => setGhRepo(e.target.value)} placeholder="repo-name" className="w-full bg-surface-container border border-neutral-80/50 rounded-xl px-3 py-2 text-sm text-neutral-20 focus:outline-none focus:border-primary-40" /></div>
        </div>
        <button onClick={ingestGitHub} disabled={!ghToken || !ghOwner || !ghRepo} className="btn-secondary mt-3 gap-2"><Icon name="download" size={16} />Ingest GitHub Data</button>
      </div>

      <div className="card">
        <div className="flex items-center gap-2 mb-4">
          <Icon name="folder" size={18} className="text-primary-40" />
          <h3 className="section-label">Data Export / Import</h3>
        </div>
        <div className="flex gap-3">
          <button onClick={downloadBackup} className="btn-secondary gap-2"><Icon name="download" size={16} />Download JSON Backup</button>
          <label className="btn-secondary cursor-pointer gap-2"><Icon name="upload" size={16} />Import Teams CSV<input type="file" accept=".csv" onChange={handleImportCsv} className="hidden" /></label>
        </div>
      </div>

      <div className="card bg-primary-95/50">
        <div className="flex items-center gap-2 mb-2">
          <Icon name="info" size={18} className="text-primary-40" />
          <h3 className="section-label">Data Source</h3>
        </div>
        <p className="text-sm text-neutral-50">Data is currently generated synthetically via mock AI agents. Set <code className="text-primary-40 bg-primary-95 px-1 rounded font-mono text-xs">MOCK_AI=false</code> and configure <code className="text-primary-40 bg-primary-95 px-1 rounded font-mono text-xs">NVIDIA_NIM_API_KEY</code> to use real LLM analysis.</p>
      </div>

      <div className="flex items-center gap-4">
        <button onClick={handleSave} className="btn-primary gap-2"><Icon name="save" size={16} />Save Settings</button>
        <span className="text-xs text-neutral-50">Settings are persisted to the database.</span>
      </div>
    </div>
  );
}
