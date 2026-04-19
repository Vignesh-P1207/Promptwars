import { useEffect, useState } from 'react'
import { getMetrics, getAlerts, getTelemetry, resolveAlert, addTelemetry } from '../api'
import DigitalTwin from '../components/DigitalTwin'

export default function Flow() {
  const [metrics, setMetrics] = useState<any>({})
  const [alerts, setAlerts] = useState<any[]>([])
  const [logs, setLogs] = useState<any[]>([])

  const load = async () => { setMetrics(await getMetrics()); setAlerts(await getAlerts()); setLogs(await getTelemetry(10)) }
  useEffect(() => { load(); const iv = setInterval(load, 3000); return () => clearInterval(iv) }, [])

  const eff = metrics.live_efficiency?.value ?? 94.2
  const vel = metrics.avg_velocity?.value ?? 2.4
  const unresolvedAlerts = alerts.filter(a => !a.resolved)
  const resolvedAlerts = alerts.filter(a => a.resolved)

  const handleResolve = async (id: number) => {
    await resolveAlert(id)
    const now = new Date()
    const t = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`
    await addTelemetry({ timestamp: t, type: 'RECOVERY', message: `Alert #${id} resolved. Recovery protocol executed successfully.`, severity: 'success' })
    load()
  }

  const sevColor = (s: string) => s === 'warning' ? 'text-[#ffc068]' : s === 'success' ? 'text-[#43e2c2]' : s === 'critical' ? 'text-[#ffb4ab]' : 'text-[#bacac4]'

  const [evacMode, setEvacMode] = useState(false)
  const [evacTimer, setEvacTimer] = useState(0)

  useEffect(() => {
    let iv: any;
    if (evacMode) {
      setEvacTimer(180) // 3 minutes est
      iv = setInterval(() => setEvacTimer(p => (p <= 1 ? 0 : p - 1)), 50)
    }
    return () => clearInterval(iv)
  }, [evacMode])

  const formatTime = (s: number) => `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`

  const triggerEvac = async () => {
    const next = !evacMode
    setEvacMode(next)
    const t = new Date().toTimeString().split(' ')[0]
    await addTelemetry({ timestamp: t, type: 'SYS', message: next ? `PROJECT MOSES: ALL OUTBOUND PRESSURE RELIEF VALVES COMPROMISED. MASS EVACUATION ROUTING.` : `ABORTING EVAC. AI RETURNED TO NORMAL OPTIMIZATION.`, severity: next ? 'critical' : 'info' })
  }

  return (
    <section className={`flex-1 px-8 pb-8 grid grid-cols-12 gap-1 items-start transition-colors duration-1000 ${evacMode ? 'bg-red-900/10' : ''}`}>
      <div className="col-span-8 space-y-1">
        <div className="bg-[#101c2b] p-8 flex justify-between items-end">
          <div>
            <h1 className="text-[5rem] font-[var(--font-headline)] font-black leading-none tracking-[-0.05em] uppercase text-[#d7e3f8]">FLOW STATE</h1>
            <div className="flex items-center gap-3 mt-2">
              <span className="bg-[#43e2c2]/10 text-[#43e2c2] px-3 py-1 text-xs font-[var(--font-mono)] font-bold tracking-widest border border-[#43e2c2]/20 animate-pulse">LIVE_OPTIMIZED</span>
              <span className="text-[#bacac4] font-[var(--font-mono)] text-xs tracking-widest">NETWORK_LATENCY: {metrics.ai_path_processing?.value ?? 12}ms</span>
            </div>
          </div>
          <div className="text-right flex flex-col items-end gap-3">
            {evacMode && (
               <div className="bg-[#ffb4ab]/10 border border-[#ffb4ab] px-4 py-2 animate-pulse">
                  <span className="text-red-500 font-bold font-[var(--font-mono)] text-xs uppercase block">ESTIMATED CLEARANCE</span>
                  <span className="text-3xl font-[var(--font-headline)] text-[#ffb4ab] leading-none font-black">{formatTime(evacTimer)}</span>
               </div>
            )}
            <button onClick={triggerEvac} className={`px-6 py-3 font-bold font-[var(--font-headline)] uppercase tracking-widest text-sm transition-all border-2 ${evacMode ? 'border-[#ffb4ab] text-[#ffb4ab] bg-transparent hover:bg-[#ffb4ab] hover:text-black font-black' : 'border-[#43e2c2] text-[#43e2c2] bg-transparent hover:bg-[#43e2c2] hover:text-black'}`}>
               <span className="material-symbols-outlined align-middle mr-2">{evacMode ? 'close' : 'bolt'}</span> {evacMode ? 'ABORT EVACUATION PROTOCOL' : 'PROJECT MOSES: AI EVACUATION'}
            </button>
          </div>
        </div>
        <div className={`relative bg-[#101c2b] h-[540px] overflow-hidden border-2 ${evacMode ? 'border-[#ffb4ab] shadow-[0_0_50px_rgba(255,0,0,0.2)]' : 'border-transparent'}`}>
          <DigitalTwin evacMode={evacMode} />
        </div>
      </div>
      <div className="col-span-4 space-y-1 h-full">
        <div className="bg-[#101c2b] p-8 flex flex-col justify-between" style={{minHeight:240}}>
          <div className="flex justify-between items-start"><span className="text-[10px] font-[var(--font-mono)] text-[#bacac4] tracking-[0.3em] uppercase">Optimization RT</span><span className="material-symbols-outlined text-[#43e2c2] text-lg">auto_awesome</span></div>
          <div className="flex items-baseline gap-4"><span className="text-7xl font-[var(--font-headline)] font-black text-[#d7e3f8]">{eff.toFixed(1)}</span><span className="text-2xl font-[var(--font-mono)] text-[#43e2c2]">%</span></div>
          <div className="w-full bg-[#2a3645] h-1"><div className="bg-[#43e2c2] h-full transition-all duration-1000" style={{width:`${eff}%`,boxShadow:'0 0 10px rgba(67,226,194,0.5)'}}></div></div>
        </div>
        <div className="bg-[#101c2b] p-6 space-y-4">
          <span className="text-[10px] font-[var(--font-mono)] text-[#bacac4] tracking-[0.3em] uppercase">Velocity Variance</span>
          <div className="flex items-end gap-1 h-24">{[40,65,50,85,30,95,60,70,45,100].map((h,i)=><div key={i} className="flex-1 hover:bg-[#43e2c2] transition-colors cursor-pointer" style={{height:`${h}%`,backgroundColor:`rgba(67,226,194,${0.2+(h/100)*0.7})`}}/>)}</div>
          <div className="flex justify-between text-[8px] font-[var(--font-mono)] text-[#85948e] uppercase tracking-widest"><span>T-30M</span><span>T-15M</span><span>Current</span></div>
        </div>
        <div className="space-y-1">
          {unresolvedAlerts.map(a => (
            <div key={a.id} className="bg-[#eea01b] p-6 flex flex-col gap-4">
              <div className="flex justify-between items-center"><div className="flex items-center gap-2"><span className="material-symbols-outlined text-[#5e3c00]">warning</span><span className="text-[10px] font-bold font-[var(--font-mono)] text-[#5e3c00] uppercase tracking-widest">{a.severity === 'critical' ? 'CRITICAL' : 'WARNING'}</span></div></div>
              <div><h4 className="text-xl font-[var(--font-headline)] font-black text-[#5e3c00] leading-none uppercase">{a.zone_name}</h4><p className="text-xs font-medium text-[#5e3c00]/80 mt-2">{a.message}</p></div>
              <button onClick={() => handleResolve(a.id)} className="bg-[#5e3c00] text-[#eea01b] py-3 text-[10px] font-bold uppercase tracking-widest cursor-pointer hover:brightness-110 transition-all">Execute Recovery</button>
            </div>
          ))}
          {resolvedAlerts.slice(0,2).map(a => (
            <div key={a.id} className="bg-[#101c2b] p-6">
              <div className="flex items-center gap-3 mb-3"><span className="material-symbols-outlined text-[#43e2c2] text-sm">check_circle</span><span className="text-[10px] font-[var(--font-mono)] text-[#43e2c2] uppercase tracking-widest">Resolved</span></div>
              <h4 className="text-lg font-[var(--font-headline)] font-bold text-[#d7e3f8] uppercase leading-none">{a.zone_name}</h4>
              <p className="text-xs text-[#bacac4] mt-2">{a.message}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="col-span-12 mt-1">
        <div className="bg-[#101c2b] p-6 border-t border-[#3c4a45]/10">
          <div className="flex justify-between items-center mb-4"><h3 className="text-xs font-bold tracking-[0.3em] text-[#bacac4] uppercase">System Command Log</h3><div className="flex gap-4"><span className="text-[10px] font-[var(--font-mono)] text-[#43e2c2] animate-pulse">● STREAMING</span><span className="text-[10px] font-[var(--font-mono)] text-[#85948e]">RECORDS: {logs.length}</span></div></div>
          <div className="font-[var(--font-mono)] text-[10px] space-y-1 max-h-32 overflow-y-auto pr-4">
            {logs.map((l,i) => (<div key={i} className="flex gap-6 py-1 border-b border-[#3c4a45]/5"><span className="text-[#85948e] shrink-0">{l.timestamp}</span><span className={`font-bold ${sevColor(l.severity)}`}>[{l.type}]</span><span className="text-[#bacac4]">{l.message}</span></div>))}
          </div>
        </div>
      </div>
    </section>
  )
}
