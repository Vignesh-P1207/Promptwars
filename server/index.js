import express from 'express';
import cors from 'cors';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();
import initSqlJs from 'sql.js';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const DB_PATH = join(__dirname, 'venueflow.db');

const app = express();
app.use(cors());
app.use(express.json());

let db;

function save() { writeFileSync(DB_PATH, Buffer.from(db.export())); }
function queryAll(sql, params = []) {
  const stmt = db.prepare(sql); if (params.length) stmt.bind(params);
  const rows = []; while (stmt.step()) rows.push(stmt.getAsObject()); stmt.free(); return rows;
}
function queryOne(sql, params = []) { const r = queryAll(sql, params); return r[0] || null; }
function execute(sql, params = []) {
  if (params.length) { const stmt = db.prepare(sql); stmt.bind(params); stmt.step(); stmt.free(); }
  else { db.run(sql); }
  save();
}
const ts = () => { const n = new Date(); return `${String(n.getHours()).padStart(2,'0')}:${String(n.getMinutes()).padStart(2,'0')}:${String(n.getSeconds()).padStart(2,'0')}`; };

async function initDB() {
  const SQL = await initSqlJs();
  if (existsSync(DB_PATH)) { db = new SQL.Database(readFileSync(DB_PATH)); }
  else { db = new SQL.Database(); }

  db.exec(`
    CREATE TABLE IF NOT EXISTS zones (id INTEGER PRIMARY KEY AUTOINCREMENT, zone_id TEXT UNIQUE NOT NULL, name TEXT NOT NULL, description TEXT, capacity INTEGER DEFAULT 0, max_capacity INTEGER DEFAULT 100, status TEXT DEFAULT 'stable', color TEXT DEFAULT '#00c6a7', gate_open INTEGER DEFAULT 1);
    CREATE TABLE IF NOT EXISTS telemetry (id INTEGER PRIMARY KEY AUTOINCREMENT, timestamp TEXT NOT NULL, type TEXT NOT NULL, message TEXT NOT NULL, severity TEXT DEFAULT 'info');
    CREATE TABLE IF NOT EXISTS metrics (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT UNIQUE NOT NULL, value REAL NOT NULL, unit TEXT, trend REAL DEFAULT 0);
    CREATE TABLE IF NOT EXISTS system_config (id INTEGER PRIMARY KEY AUTOINCREMENT, key TEXT UNIQUE NOT NULL, label TEXT NOT NULL, description TEXT, enabled INTEGER DEFAULT 1);
    CREATE TABLE IF NOT EXISTS alerts (id INTEGER PRIMARY KEY AUTOINCREMENT, zone_name TEXT, type TEXT NOT NULL, message TEXT NOT NULL, severity TEXT DEFAULT 'warning', resolved INTEGER DEFAULT 0);
    CREATE TABLE IF NOT EXISTS bottlenecks (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, wait_time TEXT, capacity INTEGER DEFAULT 0, status TEXT DEFAULT 'stable', icon TEXT DEFAULT 'check_circle', color TEXT DEFAULT '#00c6a7');
    CREATE TABLE IF NOT EXISTS staffing (id INTEGER PRIMARY KEY AUTOINCREMENT, active_personnel INTEGER DEFAULT 0, reserve_units INTEGER DEFAULT 0, utilization_rate REAL DEFAULT 0);
    CREATE TABLE IF NOT EXISTS broadcasts (id INTEGER PRIMARY KEY AUTOINCREMENT, message TEXT NOT NULL, sent_at TEXT NOT NULL, channel TEXT DEFAULT 'ALL');
    CREATE TABLE IF NOT EXISTS time_syncs (id INTEGER PRIMARY KEY AUTOINCREMENT, client_time TEXT, server_time TEXT, drift_ms REAL DEFAULT 0);
  `);

  const countResult = queryOne('SELECT COUNT(*) as c FROM zones');
  if (!countResult || countResult.c === 0) {
    console.log('🌱 Seeding...');
    for (const z of [
      ['ZN-001','North Gate','Main entry point - Optimized throughput',42,100,'stable','#00c6a7',1],
      ['ZN-008','Concourse A','High-density retail thoroughfare',81,100,'warning','#ffc068',1],
      ['ZN-012','Central Plaza','Main gathering hub - Overload risk',96,100,'critical','#ffb4ab',1],
      ['ZN-003','West Exit','Outbound flow - Clear',18,100,'stable','#00c6a7',1],
      ['ZN-005','South Corridor','Secondary pathway - Moderate traffic',55,100,'stable','#00c6a7',1],
      ['ZN-009','East Wing','VIP section - Controlled access',33,80,'stable','#00c6a7',1],
    ]) execute('INSERT INTO zones (zone_id,name,description,capacity,max_capacity,status,color,gate_open) VALUES (?,?,?,?,?,?,?,?)', z);
    for (const m of [
      ['live_efficiency',94.2,'%',1.2],['total_flow',42800,'persons',3.8],['system_uptime',99.9,'%',0],
      ['ai_path_processing',12.4,'ms',-0.8],['network_sync',240,'Gbps',2.1],['avg_velocity',2.4,'m/s',0.3],
      ['system_load',64.2,'%',2.4],['gate_online',12,'gates',0],['gate_total',14,'gates',0],
      ['efficiency_score',84,'%',2.4],['prediction_accuracy',96.8,'%',1.1],['bandwidth',4.8,'GB/s',0.2],
      ['packet_loss',0.0001,'%',0],['uplink_uptime',1248,'hours',24],['sensor_network',99.8,'%',0.1],['path_compute',12,'ms',-1],
    ]) execute('INSERT INTO metrics (name,value,unit,trend) VALUES (?,?,?,?)', m);
    for (const c of [
      ['auto_save_logs','Auto-Save Logs','Redundant storage backup active',1],
      ['ai_balancing','AI Balancing','Neural network flow optimization',1],
      ['deep_analytics','Deep Analytics','Historical data cross-referencing',0],
      ['thermal_throttling','Thermal Throttling','Passive cooling management',1],
    ]) execute('INSERT INTO system_config (key,label,description,enabled) VALUES (?,?,?,?)', c);
    for (const t of [
      ['14:22:01','SYSTEM','Node_7718 synchronized successfully.','info'],
      ['14:22:04','KERNEL','Re-calculating mesh distribution for Sector B...','info'],
      ['14:22:08','WARN','High density threshold reached at Gate 4.','warning'],
      ['14:22:10','SYSTEM','Redirecting flow vectors to relief corridor Alpha.','info'],
      ['14:22:12','AI','Path processing optimization complete (4ms reduction).','success'],
      ['14:22:15','AUTH','New operator handshake established: ALPHA_01.','success'],
    ]) execute('INSERT INTO telemetry (timestamp,type,message,severity) VALUES (?,?,?,?)', t);
    for (const b of [
      ['North Entrance','18:42 min',94,'CRITICAL','warning','#ffc068'],
      ['Main Concourse','09:15 min',82,'WARNING','error_outline','#eea01b'],
      ['Food Plaza B','02:45 min',45,'STABLE','check_circle','#00c6a7'],
    ]) execute('INSERT INTO bottlenecks (name,wait_time,capacity,status,icon,color) VALUES (?,?,?,?,?,?)', b);
    execute('INSERT INTO alerts (zone_name,type,message,severity,resolved) VALUES (?,?,?,?,?)',['Gate B-12 North','congestion','Congestion threshold exceeded by 14.5%. Deployment of Buffer Drone 04 recommended.','critical',0]);
    execute('INSERT INTO alerts (zone_name,type,message,severity,resolved) VALUES (?,?,?,?,?)',['South Plaza Hub','recovery','Flow normalized to 1.4m/s. All systems nominal.','success',1]);
    execute('INSERT INTO staffing (active_personnel,reserve_units,utilization_rate) VALUES (?,?,?)',[142,24,75]);
    console.log('✅ Seeded');
  }
}

// ═══════════════════════════════
// REAL-TIME SIMULATION ENGINE
// ═══════════════════════════════
const simMessages = [
  ['SYSTEM','Heartbeat pulse: All nodes reporting nominal status.','info'],
  ['KERNEL','Re-calculating mesh distribution for dynamic sectors...','info'],
  ['AI','Neural path optimizer recalibrated. Δ latency: -0.4ms.','success'],
  ['SENSOR','LiDAR sweep complete. 142/142 sensors active.','info'],
  ['SYSTEM','Crowd velocity vector updated for Zone Alpha.','info'],
  ['WARN','Micro-congestion detected near Food Court B. Auto-resolving...','warning'],
  ['AUTH','Operator session keepalive confirmed: ALPHA_01.','info'],
  ['SYSTEM','Thermal regulation nominal. Core temp: 42°C.','info'],
  ['AI','Predictive model updated. Confidence: 96.8%.','success'],
  ['KERNEL','Memory defragmentation cycle complete. 0ms downtime.','info'],
  ['SENSOR','Perimeter fence sensor handshake: 48/48 OK.','info'],
  ['SYSTEM','Flow redistribution algorithm v4.2 engaged.','info'],
  ['WARN','Gate D-4 response time elevated (220ms). Monitoring.','warning'],
  ['AI','Anomaly detection scan complete. No threats identified.','success'],
  ['SYSTEM','Bandwidth allocation optimized. Throughput +2.1%.','info'],
  ['LOG','Database checkpoint complete. WAL flushed.','info'],
];

function startSimulation() {
  setInterval(() => {
    try {
      const msg = simMessages[Math.floor(Math.random() * simMessages.length)];
      execute('INSERT INTO telemetry (timestamp,type,message,severity) VALUES (?,?,?,?)', [ts(), ...msg]);

      // Fluctuate metrics slightly
      const eff = queryOne("SELECT value FROM metrics WHERE name='live_efficiency'");
      if (eff) {
        const newVal = Math.max(85, Math.min(99, eff.value + (Math.random() - 0.45) * 0.8));
        const trend = +(newVal - eff.value).toFixed(2);
        execute('UPDATE metrics SET value=?, trend=? WHERE name=?', [+newVal.toFixed(1), trend, 'live_efficiency']);
      }
      const flow = queryOne("SELECT value FROM metrics WHERE name='total_flow'");
      if (flow) {
        const newVal = flow.value + Math.floor(Math.random() * 200) + 50;
        execute('UPDATE metrics SET value=?, trend=? WHERE name=?', [newVal, +(Math.random() * 5).toFixed(1), 'total_flow']);
      }
      const vel = queryOne("SELECT value FROM metrics WHERE name='avg_velocity'");
      if (vel) {
        const newVal = Math.max(1.2, Math.min(3.8, vel.value + (Math.random() - 0.5) * 0.3));
        execute('UPDATE metrics SET value=? WHERE name=?', [+newVal.toFixed(1), 'avg_velocity']);
      }
      const load = queryOne("SELECT value FROM metrics WHERE name='system_load'");
      if (load) {
        const newVal = Math.max(40, Math.min(90, load.value + (Math.random() - 0.5) * 3));
        execute('UPDATE metrics SET value=?, trend=? WHERE name=?', [+newVal.toFixed(1), +(Math.random()*4-1).toFixed(1), 'system_load']);
      }
      // Fluctuate zone capacities slightly
      const zones = queryAll('SELECT id, capacity FROM zones');
      for (const z of zones) {
        const newCap = Math.max(5, Math.min(100, z.capacity + Math.floor(Math.random()*7) - 3));
        const status = newCap > 90 ? 'critical' : newCap > 70 ? 'warning' : 'stable';
        const color = newCap > 90 ? '#ffb4ab' : newCap > 70 ? '#ffc068' : '#00c6a7';
        execute('UPDATE zones SET capacity=?, status=?, color=? WHERE id=?', [newCap, status, color, z.id]);
      }
    } catch(e) { console.error('Sim error:', e.message); }
  }, 8000);
}

// ═══════════════════════════════
// API ROUTES
// ═══════════════════════════════
app.get('/api/metrics', (_req, res) => { const rows = queryAll('SELECT * FROM metrics'); const map = {}; rows.forEach(r => { map[r.name] = r; }); res.json(map); });
app.put('/api/metrics/:name', (req, res) => { execute('UPDATE metrics SET value=?, trend=? WHERE name=?', [req.body.value, req.body.trend||0, req.params.name]); res.json({ok:true}); });

app.get('/api/zones', (_req, res) => res.json(queryAll('SELECT * FROM zones ORDER BY id')));
app.post('/api/zones', (req, res) => {
  try { const {zone_id,name,description,capacity,max_capacity,status,color} = req.body; execute('INSERT INTO zones (zone_id,name,description,capacity,max_capacity,status,color) VALUES (?,?,?,?,?,?,?)',[zone_id,name,description||'',capacity||0,max_capacity||100,status||'stable',color||'#00c6a7']); res.json({ok:true}); }
  catch(e){ res.status(400).json({error:e.message}); }
});
app.put('/api/zones/:id', (req, res) => { const f=req.body; execute(`UPDATE zones SET ${Object.keys(f).map(k=>`${k}=?`).join(',')} WHERE id=?`, [...Object.values(f),Number(req.params.id)]); res.json({ok:true}); });
app.delete('/api/zones/:id', (req, res) => { execute('DELETE FROM zones WHERE id=?',[Number(req.params.id)]); res.json({ok:true}); });

// ── GATE OPERATIONS ──
app.post('/api/gates/open-all', (_req, res) => {
  execute('UPDATE zones SET gate_open=1'); 
  execute('INSERT INTO telemetry (timestamp,type,message,severity) VALUES (?,?,?,?)',[ts(),'GATE','ALL GATES OPENED. Full ingress/egress flow enabled across all sectors.','success']);
  res.json({ok:true, message:'All gates opened'});
});
app.post('/api/gates/emergency-lock', (_req, res) => {
  execute('UPDATE zones SET gate_open=0');
  execute('INSERT INTO telemetry (timestamp,type,message,severity) VALUES (?,?,?,?)',[ts(),'EMERGENCY','🔒 EMERGENCY LOCKDOWN ENGAGED. All gates sealed. Awaiting operator clearance.','critical']);
  execute('INSERT INTO alerts (zone_name,type,message,severity,resolved) VALUES (?,?,?,?,?)',['ALL ZONES','emergency','Emergency lockdown activated by operator. All gates sealed.','critical',0]);
  res.json({ok:true, message:'Emergency lockdown engaged'});
});
app.post('/api/gates/toggle/:id', (req, res) => {
  const zone = queryOne('SELECT * FROM zones WHERE id=?',[Number(req.params.id)]);
  if(!zone) return res.status(404).json({error:'Zone not found'});
  const newState = zone.gate_open ? 0 : 1;
  execute('UPDATE zones SET gate_open=? WHERE id=?',[newState, Number(req.params.id)]);
  execute('INSERT INTO telemetry (timestamp,type,message,severity) VALUES (?,?,?,?)',[ts(),'GATE',`Gate ${zone.name} ${newState?'OPENED':'CLOSED'} by operator command.`,newState?'success':'warning']);
  res.json({ok:true, gate_open: newState});
});

// ── BROADCAST ──
app.post('/api/broadcast', (req, res) => {
  const {message, channel} = req.body;
  if(!message) return res.status(400).json({error:'Message required'});
  execute('INSERT INTO broadcasts (message,sent_at,channel) VALUES (?,?,?)',[message, ts(), channel||'ALL']);
  execute('INSERT INTO telemetry (timestamp,type,message,severity) VALUES (?,?,?,?)',[ts(),'BROADCAST',`📢 Global broadcast sent on channel ${channel||'ALL'}: "${message}"`, 'info']);
  res.json({ok:true, message:'Broadcast sent'});
});
app.get('/api/broadcasts', (_req, res) => res.json(queryAll('SELECT * FROM broadcasts ORDER BY id DESC LIMIT 20')));

// ── TIME SYNC ──
app.post('/api/time-sync', (req, res) => {
  const clientTime = req.body.client_time || new Date().toISOString();
  const serverTime = new Date().toISOString();
  const drift = Math.abs(new Date(serverTime).getTime() - new Date(clientTime).getTime());
  execute('INSERT INTO time_syncs (client_time,server_time,drift_ms) VALUES (?,?,?)',[clientTime, serverTime, drift]);
  execute('INSERT INTO telemetry (timestamp,type,message,severity) VALUES (?,?,?,?)',[ts(),'SYNC',`Time synchronization complete. Drift: ${drift}ms. Server clock authoritative.`,'success']);
  res.json({ok:true, server_time: serverTime, drift_ms: drift, synced: true});
});

// ── EXPORT (returns JSON report for client-side PDF) ──
app.get('/api/export/report', (_req, res) => {
  const metrics = queryAll('SELECT * FROM metrics');
  const zones = queryAll('SELECT * FROM zones');
  const alerts = queryAll('SELECT * FROM alerts');
  const bottlenecks = queryAll('SELECT * FROM bottlenecks');
  const staffing = queryOne('SELECT * FROM staffing LIMIT 1');
  const telemetry = queryAll('SELECT * FROM telemetry ORDER BY id DESC LIMIT 50');
  const configs = queryAll('SELECT * FROM system_config');
  res.json({ generated_at: new Date().toISOString(), metrics, zones, alerts, bottlenecks, staffing, telemetry, system_config: configs });
});

app.get('/api/telemetry', (req, res) => res.json(queryAll('SELECT * FROM telemetry ORDER BY id DESC LIMIT ?',[Number(req.query.limit)||50])));
app.post('/api/telemetry', (req, res) => { const{timestamp,type,message,severity}=req.body; execute('INSERT INTO telemetry (timestamp,type,message,severity) VALUES (?,?,?,?)',[timestamp,type,message,severity||'info']); res.json({ok:true}); });

app.get('/api/system-config', (_req, res) => res.json(queryAll('SELECT * FROM system_config ORDER BY id')));
app.put('/api/system-config/:key', (req, res) => {
  execute('UPDATE system_config SET enabled=? WHERE key=?',[req.body.enabled?1:0,req.params.key]);
  const label = queryOne('SELECT label FROM system_config WHERE key=?',[req.params.key]);
  execute('INSERT INTO telemetry (timestamp,type,message,severity) VALUES (?,?,?,?)',[ts(),'CONFIG',`${label?.label||req.params.key} ${req.body.enabled?'ENABLED':'DISABLED'} by operator.`,req.body.enabled?'success':'warning']);
  res.json({ok:true});
});

app.get('/api/alerts', (_req, res) => res.json(queryAll('SELECT * FROM alerts ORDER BY id DESC')));
app.post('/api/alerts', (req, res) => { const{zone_name,type,message,severity}=req.body; execute('INSERT INTO alerts (zone_name,type,message,severity) VALUES (?,?,?,?)',[zone_name,type,message,severity||'warning']); res.json({ok:true}); });
app.put('/api/alerts/:id/resolve', (req, res) => { execute('UPDATE alerts SET resolved=1 WHERE id=?',[Number(req.params.id)]); res.json({ok:true}); });

app.get('/api/bottlenecks', (_req, res) => res.json(queryAll('SELECT * FROM bottlenecks ORDER BY id')));
app.get('/api/staffing', (_req, res) => res.json(queryOne('SELECT * FROM staffing LIMIT 1')||{}));
app.put('/api/staffing', (req, res) => { const{active_personnel,reserve_units,utilization_rate}=req.body; execute('UPDATE staffing SET active_personnel=?, reserve_units=?, utilization_rate=?',[active_personnel,reserve_units,utilization_rate]); res.json({ok:true}); });

app.post('/api/deploy', (_req, res) => { execute('INSERT INTO telemetry (timestamp,type,message,severity) VALUES (?,?,?,?)',[ts(),'DEPLOY',`Asset deployment initiated at ${ts()}. Payload dispatched to active zone.`,'success']); res.json({ok:true,message:'Asset deployed'}); });
app.post('/api/system/reboot', (_req, res) => { execute('INSERT INTO telemetry (timestamp,type,message,severity) VALUES (?,?,?,?)',[ts(),'SYSTEM','Command Core reboot initiated. Hot reload — 0ms downtime.','warning']); res.json({ok:true,message:'Rebooted'}); });
app.post('/api/system/purge', (_req, res) => { db.exec('DELETE FROM telemetry'); save(); execute('INSERT INTO telemetry (timestamp,type,message,severity) VALUES (?,?,?,?)',[ts(),'SYSTEM','Telemetry purge complete. All logs cleared.','warning']); res.json({ok:true,message:'Purged'}); });

// ── AI ASSISTANT ──
app.post('/api/assistant', async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: 'Prompt required' });
    
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const schema = {
      type: 'OBJECT',
      properties: {
        directive: { type: 'STRING' },
        actions: { type: 'ARRAY', items: { type: 'STRING' } },
        severity: { type: 'STRING' },
        system_action: { type: 'STRING', description: 'Must be ONE of: "NONE", "EMERGENCY_LOCK", "OPEN_ALL_GATES", "SYSTEM_REBOOT", "SYSTEM_PURGE", "DEPLOY_ASSET"' }
      },
      required: ['directive', 'actions', 'severity', 'system_action']
    };

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{ role: 'user', parts: [{ text: `You are VenueFlow Command AI. Given the operator's command, generate an operational directive. Identify if a system action must be taken: "${prompt}"` }] }],
      config: { responseMimeType: 'application/json', responseSchema: schema, temperature: 0.1 }
    });
    
    if (response.text) {
      const data = JSON.parse(response.text);
      
      // Execute the system action if AI deemed it necessary
      const action = data.system_action;
      if (action === 'EMERGENCY_LOCK') {
        execute('UPDATE zones SET gate_open=0');
        execute('INSERT INTO telemetry (timestamp,type,message,severity) VALUES (?,?,?,?)',[ts(),'EMERGENCY','🔒 AI INITIATED EMERGENCY LOCKDOWN. All gates sealed.','critical']);
        execute('INSERT INTO alerts (zone_name,type,message,severity,resolved) VALUES (?,?,?,?,?)',['ALL ZONES','emergency','Emergency lockdown activated by AI Command.','critical',0]);
      } else if (action === 'OPEN_ALL_GATES') {
        execute('UPDATE zones SET gate_open=1'); 
        execute('INSERT INTO telemetry (timestamp,type,message,severity) VALUES (?,?,?,?)',[ts(),'GATE','AI OPENED ALL GATES. Full ingress/egress flow enabled.','success']);
      } else if (action === 'SYSTEM_REBOOT') {
        execute('INSERT INTO telemetry (timestamp,type,message,severity) VALUES (?,?,?,?)',[ts(),'SYSTEM','AI triggered Core reboot. Hot reload — 0ms downtime.','warning']);
      } else if (action === 'SYSTEM_PURGE') {
        db.exec('DELETE FROM telemetry'); save();
        execute('INSERT INTO telemetry (timestamp,type,message,severity) VALUES (?,?,?,?)',[ts(),'SYSTEM','AI triggered Telemetry purge. All logs cleared.','warning']);
      } else if (action === 'DEPLOY_ASSET') {
        execute('INSERT INTO telemetry (timestamp,type,message,severity) VALUES (?,?,?,?)',[ts(),'DEPLOY',`AI Asset deployment initiated. Payload dispatched to active zone.`,'success']);
      }

      res.json(data);
    } else {
      res.status(500).json({ error: 'Empty AI response' });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3001;

// Serve Vite frontend in production
app.use(express.static(join(__dirname, '../dist')));
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(join(__dirname, '../dist/index.html'));
  }
});

initDB().then(() => {
  startSimulation();
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`⚡ VenueFlow API running → http://0.0.0.0:${PORT}`);
    console.log(`📊 Full API with real-time simulation active`);
  });
}).catch(err => { console.error('❌ DB Error:', err); process.exit(1); });
