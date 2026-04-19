import { useEffect, useState } from 'react'
import { getMetrics, getBottlenecks, getStaffing, updateStaffing, getExportReport, timeSync } from '../api'

export default function Analytics() {
  const [metrics, setMetrics] = useState<any>({})
  const [bottlenecks, setBottlenecks] = useState<any[]>([])
  const [staffing, setStaffing] = useState<any>({})
  const [syncResult, setSyncResult] = useState<any>(null)
  const [chartMode, setChartMode] = useState<'DAILY'|'WEEKLY'>('DAILY')

  const load = async () => { setMetrics(await getMetrics()); setBottlenecks(await getBottlenecks()); setStaffing(await getStaffing() || {}); }
  useEffect(() => { load(); const iv = setInterval(load, 5000); return () => clearInterval(iv) }, [])

  const effScore = metrics.efficiency_score?.value ?? 84
  const predAcc = metrics.prediction_accuracy?.value ?? 96.8
  const active = staffing.active_personnel ?? 142
  const reserve = staffing.reserve_units ?? 24
  const util = staffing.utilization_rate ?? 75

  const handleOptimize = async () => {
    await updateStaffing({ active_personnel: Math.min(active+5,200), reserve_units: Math.max(reserve-5,0), utilization_rate: Math.min(util+3,100) }); load()
  }

  const handleExportPDF = async () => {
    const report = await getExportReport()
    const html = `<!DOCTYPE html><html><head><title>VenueFlow Analytics Report</title>
    <style>body{font-family:'Segoe UI',sans-serif;background:#081422;color:#d7e3f8;padding:40px;}
    h1{color:#43e2c2;border-bottom:2px solid #43e2c2;padding-bottom:10px;}h2{color:#00c6a7;margin-top:30px;}
    table{border-collapse:collapse;width:100%;margin:10px 0;}th,td{border:1px solid #2a3645;padding:8px 12px;text-align:left;}
    th{background:#101c2b;color:#43e2c2;}tr:nth-child(even){background:#101c2b;}
    .stat{display:inline-block;background:#101c2b;padding:20px;margin:10px;min-width:200px;}
    .stat h3{color:#00c6a7;font-size:12px;text-transform:uppercase;letter-spacing:2px;}
    .stat .val{font-size:48px;font-weight:bold;color:#d7e3f8;}
    @media print{body{background:white;color:black;}th{background:#eee;color:black;}tr:nth-child(even){background:#f9f9f9;}.stat{border:1px solid #ccc;}}</style></head>
    <body><h1>VENUEFLOW — ANALYTICS REPORT</h1>
    <p>Generated: ${new Date().toLocaleString()} | Report ID: VF-RPT-${Date.now().toString(36).toUpperCase()}</p>
    <h2>Key Metrics</h2><div>
    ${report.metrics.map((m:any) => `<div class="stat"><h3>${m.name.replace(/_/g,' ')}</h3><div class="val">${m.value}${m.unit||''}</div></div>`).join('')}
    </div>
    <h2>Zone Status</h2><table><tr><th>ID</th><th>Name</th><th>Capacity</th><th>Status</th><th>Gate</th></tr>
    ${report.zones.map((z:any) => `<tr><td>${z.zone_id}</td><td>${z.name}</td><td>${z.capacity}%</td><td>${z.status.toUpperCase()}</td><td>${z.gate_open?'OPEN':'SEALED'}</td></tr>`).join('')}</table>
    <h2>Active Alerts</h2><table><tr><th>Zone</th><th>Type</th><th>Message</th><th>Severity</th><th>Resolved</th></tr>
    ${report.alerts.map((a:any) => `<tr><td>${a.zone_name}</td><td>${a.type}</td><td>${a.message}</td><td>${a.severity}</td><td>${a.resolved?'YES':'NO'}</td></tr>`).join('')}</table>
    <h2>Bottlenecks</h2><table><tr><th>Location</th><th>Wait Time</th><th>Capacity</th><th>Status</th></tr>
    ${report.bottlenecks.map((b:any) => `<tr><td>${b.name}</td><td>${b.wait_time}</td><td>${b.capacity}%</td><td>${b.status}</td></tr>`).join('')}</table>
    <h2>Recent Telemetry (last 50)</h2><table><tr><th>Time</th><th>Type</th><th>Message</th></tr>
    ${report.telemetry.map((t:any) => `<tr><td>${t.timestamp}</td><td>${t.type}</td><td>${t.message}</td></tr>`).join('')}</table>
    <h2>System Configuration</h2><table><tr><th>Setting</th><th>Status</th></tr>
    ${report.system_config.map((c:any) => `<tr><td>${c.label}</td><td>${c.enabled?'ENABLED':'DISABLED'}</td></tr>`).join('')}</table>
    <p style="margin-top:40px;opacity:0.5;font-size:12px;">© VenueFlow Industrial Command Center • Confidential</p>
    </body></html>`;
    const w = window.open('', '_blank'); if(w){ w.document.write(html); w.document.close(); w.print(); }
  }

  const handleTimeSync = async () => {
    const result = await timeSync(); setSyncResult(result); setTimeout(() => setSyncResult(null), 5000)
  }

  const dailyBars = [45,65,100,80,55,90,70,40,85,60]
  const weeklyBars = [70,85,60,95,75,50,80]
  const bars = chartMode === 'DAILY' ? dailyBars : weeklyBars
  const dailyTimes = ['08:00','10:00','12:00','14:00','16:00','18:00','20:00','22:00']
  const weeklyTimes = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun']
  const times = chartMode === 'DAILY' ? dailyTimes : weeklyTimes

  return (
    <div className="flex-1 px-8 pb-10 overflow-y-auto no-scrollbar">
      <div className="flex justify-between items-end mb-10 border-b border-[#d7e3f8]/5 pb-8">
        <div>
          <h2 className="text-7xl font-[var(--font-headline)] font-bold tracking-tighter text-[#00c6a7] uppercase leading-none">ANALYTICS</h2>
          <p className="font-[var(--font-mono)] text-xs tracking-[0.4em] text-[#d7e3f8] opacity-50 mt-4">HISTORICAL_DATA_V4.02 // ARCHIVE_QUERY_SUCCESSFUL</p>
        </div>
        <div className="flex gap-2 items-center">
          {syncResult && <span className="font-[var(--font-mono)] text-[10px] text-[#43e2c2] animate-pulse">SYNCED • DRIFT: {syncResult.drift_ms}ms</span>}
          <button onClick={handleExportPDF} className="bg-[#2a3645] text-[#d7e3f8] px-6 py-2 text-[10px] font-[var(--font-mono)] font-bold tracking-widest hover:bg-[#00c6a7] hover:text-[#00382d] transition-all cursor-pointer">EXPORT_PDF</button>
          <button onClick={handleTimeSync} className="bg-[#2a3645] text-[#d7e3f8] px-6 py-2 text-[10px] font-[var(--font-mono)] font-bold tracking-widest hover:bg-[#00c6a7] hover:text-[#00382d] transition-all cursor-pointer">TIME_SYNC</button>
        </div>
      </div>
      <div className="grid grid-cols-12 gap-1">
        <div className="col-span-3 bg-[#101c2b] p-8 flex flex-col justify-between min-h-[240px]">
          <div><span className="font-[var(--font-mono)] text-[10px] text-[#00c6a7] tracking-[0.2em] uppercase">Efficiency Score</span><h3 className="text-6xl font-[var(--font-headline)] font-bold text-[#d7e3f8] mt-2">{effScore}%</h3></div>
          <div className="relative w-full h-1 bg-[#2a3645]"><div className="absolute h-full bg-[#00c6a7] transition-all duration-1000" style={{width:`${effScore}%`}}></div></div>
          <div className="flex justify-between font-[var(--font-mono)] text-[9px] text-[#d7e3f8]/40"><span>SYS_OPTIMAL</span><span>Δ +{metrics.efficiency_score?.trend ?? 2.4}%</span></div>
        </div>
        <div className="col-span-3 bg-[#101c2b] p-8 flex flex-col justify-between min-h-[240px] border-l border-[#081422]">
          <div><span className="font-[var(--font-mono)] text-[10px] text-[#ffc068] tracking-[0.2em] uppercase">Prediction Accuracy</span><h3 className="text-6xl font-[var(--font-headline)] font-bold text-[#d7e3f8] mt-2">{predAcc}</h3></div>
          <div className="w-full h-16 bg-gradient-to-t from-[#eea01b]/10 to-transparent flex items-end"><div className="flex items-end gap-1 w-full px-1 pb-1">{[60,75,90,85,100].map((h,i)=><div key={i} className="flex-1" style={{height:`${h}%`,backgroundColor:`rgba(255,192,104,${0.3+i*0.15})`}}></div>)}</div></div>
          <div className="font-[var(--font-mono)] text-[9px] text-[#ffc068] tracking-widest uppercase">High Confidence State</div>
        </div>
        <div className="col-span-6 bg-[#101c2b] p-8 flex flex-col">
          <div className="flex justify-between items-start mb-6">
            <div><span className="font-[var(--font-mono)] text-[10px] text-[#00c6a7] tracking-[0.2em] uppercase">Historical Throughput</span></div>
            <div className="flex bg-[#081422]">
              <button onClick={()=>setChartMode('DAILY')} className={`px-4 py-1 text-[9px] font-[var(--font-mono)] font-bold cursor-pointer ${chartMode==='DAILY'?'bg-[#00c6a7] text-[#00382d]':'text-[#d7e3f8] opacity-50 hover:bg-[#2a3645]'} transition-all`}>DAILY</button>
              <button onClick={()=>setChartMode('WEEKLY')} className={`px-4 py-1 text-[9px] font-[var(--font-mono)] font-bold cursor-pointer ${chartMode==='WEEKLY'?'bg-[#00c6a7] text-[#00382d]':'text-[#d7e3f8] opacity-50 hover:bg-[#2a3645]'} transition-all`}>WEEKLY</button>
            </div>
          </div>
          <div className="flex-1 flex items-end justify-between gap-2 mt-4 min-h-[120px]">{bars.map((h,i)=><div key={i} className="flex-1 bg-[#00c6a7]/60 hover:bg-[#00c6a7] transition-all cursor-pointer" style={{height:`${h}%`}}/>)}</div>
          <div className="flex justify-between mt-4 font-[var(--font-mono)] text-[8px] text-[#d7e3f8]/30">{times.map(t=><span key={t}>{t}</span>)}</div>
        </div>

        {/* Bottlenecks */}
        <div className="col-span-8 flex flex-col gap-1 mt-1">
          <div className="bg-[#101c2b] p-6"><h4 className="font-[var(--font-mono)] text-[10px] text-[#ffc068] tracking-[0.2em] uppercase">Top Bottlenecks // Immediate Attention Required</h4></div>
          <div className="grid grid-cols-3 gap-1">
            {bottlenecks.map(bn => (
              <div key={bn.id} className="bg-[#101c2b] p-6 hover:bg-[#2a3645] transition-colors cursor-pointer">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-2" style={{backgroundColor:`${bn.color}10`,color:bn.color}}><span className="material-symbols-outlined">{bn.icon}</span></div>
                  <span className="font-[var(--font-mono)] text-[10px]" style={{color:bn.color}}>{bn.status}</span>
                </div>
                <h5 className="text-xl font-[var(--font-headline)] font-bold text-[#d7e3f8] uppercase mb-1">{bn.name}</h5>
                <div className="space-y-4 mt-6">
                  <div className="flex justify-between items-end"><span className="text-[9px] font-[var(--font-mono)] text-[#d7e3f8]/40 uppercase">Wait Time</span><span className="text-lg font-[var(--font-mono)]" style={{color:bn.color}}>{bn.wait_time}</span></div>
                  <div className="w-full h-1 bg-[#081422]"><div className="h-full" style={{width:`${bn.capacity}%`,backgroundColor:bn.color}}></div></div>
                  <div className="flex justify-between items-end"><span className="text-[9px] font-[var(--font-mono)] text-[#d7e3f8]/40 uppercase">Capacity</span><span className="text-lg font-[var(--font-mono)] text-[#d7e3f8]">{bn.capacity}%</span></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Staffing */}
        <div className="col-span-4 bg-[#101c2b] p-8 flex flex-col justify-between mt-1">
          <div>
            <span className="font-[var(--font-mono)] text-[10px] text-[#00c6a7] tracking-[0.2em] uppercase">Staffing Efficiency</span>
            <div className="flex items-center gap-6 mt-8">
              <div className="relative w-24 h-24 flex items-center justify-center">
                <svg className="w-full h-full -rotate-90"><circle cx="48" cy="48" fill="transparent" r="44" stroke="#2a3645" strokeWidth="4"/><circle cx="48" cy="48" fill="transparent" r="44" stroke="#00c6a7" strokeDasharray="276" strokeDashoffset={276-(276*util/100)} strokeWidth="4"/></svg>
                <span className="absolute text-xl font-bold font-[var(--font-headline)] text-[#d7e3f8]">{Math.round(util)}%</span>
              </div>
              <div className="space-y-1"><div className="text-[10px] font-[var(--font-mono)] text-[#d7e3f8]/40 uppercase">Utilization</div><div className="text-xs font-[var(--font-mono)] text-[#00c6a7]">UPWARD_TREND</div></div>
            </div>
          </div>
          <div className="space-y-4 border-t border-[#d7e3f8]/10 pt-6">
            <div className="flex justify-between items-center"><span className="text-[10px] font-[var(--font-mono)] text-[#d7e3f8]/40 uppercase">Active Personnel</span><span className="text-2xl font-bold font-[var(--font-headline)] text-[#d7e3f8]">{active}</span></div>
            <div className="flex justify-between items-center"><span className="text-[10px] font-[var(--font-mono)] text-[#d7e3f8]/40 uppercase">Reserve Units</span><span className="text-2xl font-bold font-[var(--font-headline)] text-[#d7e3f8]/30">{reserve}</span></div>
          </div>
          <button onClick={handleOptimize} className="w-full mt-6 bg-transparent border border-[#00c6a7]/30 text-[#00c6a7] py-3 font-[var(--font-mono)] text-[9px] font-bold tracking-widest hover:bg-[#00c6a7]/10 transition-all cursor-pointer">OPTIMIZE_ALLOCATION</button>
        </div>
      </div>
    </div>
  )
}
