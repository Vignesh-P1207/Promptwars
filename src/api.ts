const API = '';
async function request(url: string, options?: RequestInit) {
  const res = await fetch(`${API}${url}`, { headers: { 'Content-Type': 'application/json' }, ...options });
  return res.json();
}

export const getMetrics = () => request('/api/metrics');
export const updateMetric = (name: string, value: number, trend?: number) => request(`/api/metrics/${name}`, { method: 'PUT', body: JSON.stringify({ value, trend }) });
export const getZones = () => request('/api/zones');
export const createZone = (data: any) => request('/api/zones', { method: 'POST', body: JSON.stringify(data) });
export const updateZone = (id: number, data: any) => request(`/api/zones/${id}`, { method: 'PUT', body: JSON.stringify(data) });
export const deleteZone = (id: number) => request(`/api/zones/${id}`, { method: 'DELETE' });
export const getTelemetry = (limit = 50) => request(`/api/telemetry?limit=${limit}`);
export const addTelemetry = (data: { timestamp: string; type: string; message: string; severity?: string }) => request('/api/telemetry', { method: 'POST', body: JSON.stringify(data) });
export const getSystemConfig = () => request('/api/system-config');
export const toggleConfig = (key: string, enabled: boolean) => request(`/api/system-config/${key}`, { method: 'PUT', body: JSON.stringify({ enabled }) });
export const getAlerts = () => request('/api/alerts');
export const createAlert = (data: any) => request('/api/alerts', { method: 'POST', body: JSON.stringify(data) });
export const resolveAlert = (id: number) => request(`/api/alerts/${id}/resolve`, { method: 'PUT' });
export const getBottlenecks = () => request('/api/bottlenecks');
export const getStaffing = () => request('/api/staffing');
export const updateStaffing = (data: any) => request('/api/staffing', { method: 'PUT', body: JSON.stringify(data) });
export const deployAsset = () => request('/api/deploy', { method: 'POST' });
export const rebootSystem = () => request('/api/system/reboot', { method: 'POST' });
export const purgeSystem = () => request('/api/system/purge', { method: 'POST' });

// NEW: Gate operations
export const openAllGates = () => request('/api/gates/open-all', { method: 'POST' });
export const emergencyLock = () => request('/api/gates/emergency-lock', { method: 'POST' });
export const toggleGate = (id: number) => request(`/api/gates/toggle/${id}`, { method: 'POST' });

// NEW: Broadcast
export const sendBroadcast = (message: string, channel = 'ALL') => request('/api/broadcast', { method: 'POST', body: JSON.stringify({ message, channel }) });
export const getBroadcasts = () => request('/api/broadcasts');

// NEW: Time sync
export const timeSync = () => request('/api/time-sync', { method: 'POST', body: JSON.stringify({ client_time: new Date().toISOString() }) });

// NEW: Export report
export const getExportReport = () => request('/api/export/report');
