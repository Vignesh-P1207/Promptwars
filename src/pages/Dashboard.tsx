import { useEffect, useState } from 'react'
import { getMetrics, getTelemetry, addTelemetry, createAlert } from '../api'

import AIVisionFeed from '../components/AIVisionFeed'

export default function Dashboard() {
  const [metrics, setMetrics] = useState<any>({})
  const [logs, setLogs] = useState<any[]>([])
  const [cmdInput, setCmdInput] = useState('')
  const [ghostMode, setGhostMode] = useState(false)
  const [matrixMode, setMatrixMode] = useState(false)

  const load = async () => { setMetrics(await getMetrics()); setLogs(await getTelemetry(20)); }
  useEffect(() => { load(); const iv = setInterval(load, 3000); return () => clearInterval(iv) }, [])

  const eff = metrics.live_efficiency?.value ?? 94.2
  const trend = metrics.live_efficiency?.trend ?? 1.2
  const flow = metrics.total_flow?.value ?? 42800
  const uptime = metrics.system_uptime?.value ?? 99.9
  const aiMs = metrics.ai_path_processing?.value ?? 12.4
  const netSync = metrics.network_sync?.value ?? 240

  const sevColor = (s: string) => s === 'warning' ? 'text-[#eea01b]' : s === 'success' ? 'text-[#43e2c2]' : s === 'critical' ? 'text-[#ffb4ab]' : 'text-[#d7e3f8]/70'

  const handleCommand = async () => {
    if (!cmdInput.trim()) return
    const cmd = cmdInput.toUpperCase().trim()
    const now = new Date()
    const t = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}:${String(now.getSeconds()).padStart(2,'0')}`
    
    await addTelemetry({ timestamp: t, type: 'CMD', message: `> ${cmd}`, severity: 'info' })

    if (cmd === 'HELP') {
       await addTelemetry({ timestamp: t, type: 'SYS', message: `AVAILABLE CMD: HELP, RUN_DIAGNOSTIC, RECALIBRATE, GHOST_PROTOCOL, SIMULATE_STAMPEDE, OVERLOAD, AI_FORECAST`, severity: 'success' })
    } else if (cmd === 'GHOST_PROTOCOL') {
       setGhostMode(true)
       await addTelemetry({ timestamp: t, type: 'CRIT', message: `GHOST PROTOCOL ENACTED. WIDE-AREA LOCKDOWN. SITE SECURE.`, severity: 'critical' })
       setTimeout(() => setGhostMode(false), 5000)
    } else if (cmd === 'OVERLOAD') {
       setMatrixMode(true)
       await addTelemetry({ timestamp: t, type: 'SYS', message: `OVERRIDING SYSTEM KERNEL... INITIALIZING MATRIX TRACE.`, severity: 'warning' })
       setTimeout(() => setMatrixMode(false), 8000)
    } else if (cmd === 'SIMULATE_STAMPEDE') {
       await createAlert({ zone_name: 'SECTOR_7_HUB', message: 'Predictive model detects 98% probability of crowd crush. Auto-deploying relief.', severity: 'critical'})
       await createAlert({ zone_name: 'EAST_EXIT_RAMP', message: 'Density threshold exceeded by 400%.', severity: 'critical'})
       await addTelemetry({ timestamp: t, type: 'CRIT', message: `SIMULATION INJECTED: CRITICAL ANOMALY DETECTED IN SECTOR 7.`, severity: 'critical' })
    } else if (cmd === 'AI_FORECAST') {
       await addTelemetry({ timestamp: t, type: 'AI', message: `Running Monte Carlo simulation (N=10,000)...`, severity: 'info' })
       setTimeout(() => addTelemetry({ timestamp: t, type: 'AI', message: `Result: Peak density at 22:45. Recommend opening Gate B and Gate C.`, severity: 'success' }).then(load), 2500)
    } else if (cmd === 'RUN_DIAGNOSTIC') {
       await addTelemetry({ timestamp: t, type: 'SYS', message: `Initiating full sector diagnostic...`, severity: 'warning' })
       setTimeout(() => addTelemetry({ timestamp: t, type: 'SYS', message: `Diagnostic Result: 0 Errors. Integrity 100%.`, severity: 'success' }).then(load), 1500)
    } else if (cmd === 'RECALIBRATE') {
       await addTelemetry({ timestamp: t, type: 'SYS', message: `Recalibrating neural mesh... Variance minimized.`, severity: 'success' })
    } else if (cmd === 'SUDO LOCKDOWN') {
       await addTelemetry({ timestamp: t, type: 'CRIT', message: `Unauthorized escalated privileges attempted. Logged.`, severity: 'critical' })
    } else {
       await addTelemetry({ timestamp: t, type: 'ERR', message: `Command not recognized. Type HELP.`, severity: 'critical' })
    }

    setCmdInput(''); load()
  }

  return (
    <div className={`p-8 space-y-8 flex-1 relative transition-all duration-1000 ${ghostMode ? 'opacity-90 saturate-0 invert' : ''} ${matrixMode ? 'hue-rotate-[120deg] saturate-200 contrast-150' : ''}`}>
      {ghostMode && (
        <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center bg-[#ffb4ab]/5 backdrop-blur-sm mix-blend-color-dodge">
          <div className="text-center absolute">
            <h1 className="text-[8rem] font-black font-[var(--font-headline)] tracking-tighter text-red-600 uppercase animate-pulse drop-shadow-[0_0_50px_rgba(255,0,0,0.8)] mix-blend-difference">GHOST PROTOCOL</h1>
            <p className="text-red-500 font-[var(--font-mono)] mt-4 tracking-[1em] text-xl animate-pulse">SITE SECURE</p>
          </div>
        </div>
      )}
      
      {matrixMode && (
        <div className="fixed inset-0 z-50 pointer-events-none opacity-20" style={{backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, #00ff00 2px, #00ff00 4px)', backgroundSize: '100% 4px'}}></div>
      )}

      {/* Hero */}
      <section className="grid grid-cols-12 gap-1 items-stretch relative">
        <div className="col-span-8 bg-[#101c2b] p-10 flex flex-col justify-between border-l-4 border-[#43e2c2]">
          <div className="space-y-1">
            <span className="font-[var(--font-mono)] text-xs text-[#00c6a7] tracking-[0.3em] uppercase">System Core Status</span>
            <h1 className="text-7xl font-[var(--font-headline)] font-bold text-[#d7e3f8] tracking-tighter uppercase leading-none">Live Efficiency</h1>
          </div>
          <div className="flex items-baseline gap-4 mt-8">
            <span className="text-8xl font-[var(--font-headline)] font-black text-[#43e2c2] tracking-tighter">{eff.toFixed(1)}<span className="text-4xl text-[#00c6a7]/50">%</span></span>
            <div className="flex flex-col">
              <span className={`font-[var(--font-mono)] text-xl ${trend >= 0 ? 'text-[#43e2c2]' : 'text-[#ffb4ab]'}`}>{trend >= 0 ? '+' : ''}{trend.toFixed(1)}%</span>
              <span className="text-[#d7e3f8]/40 text-xs font-[var(--font-mono)] uppercase">VS PREVIOUS CYCLE</span>
            </div>
            <a href="/flow" className="ml-auto bg-[#43e2c2] text-[#00382d] px-8 py-4 font-[var(--font-headline)] font-bold uppercase tracking-widest text-sm hover:brightness-110 flex items-center gap-2 cursor-pointer transition-all">
               <span className="material-symbols-outlined">visibility</span> VIEW DIGITAL TWIN
            </a>
          </div>
        </div>
        <div className="col-span-4 grid grid-rows-2 gap-1">
          <div className="bg-[#101c2b] p-8 flex flex-col justify-center">
            <span className="font-[var(--font-mono)] text-[10px] text-[#00c6a7] tracking-[0.2em] uppercase">Total Flow</span>
            <div className="text-5xl font-[var(--font-headline)] font-bold text-[#d7e3f8] mt-2 tracking-tighter">{(flow/1000).toFixed(1)}k</div>
            <div className="w-full h-1 bg-[#2a3645] mt-4 relative overflow-hidden"><div className="absolute inset-y-0 left-0 bg-[#43e2c2] transition-all duration-1000" style={{width:`${Math.min(flow/60000*100,100)}%`}}></div></div>
          </div>
          <div className="bg-[#101c2b] p-8 flex flex-col justify-center">
            <span className="font-[var(--font-mono)] text-[10px] text-[#00c6a7] tracking-[0.2em] uppercase">System Uptime</span>
            <div className="text-5xl font-[var(--font-headline)] font-bold text-[#d7e3f8] mt-2 tracking-tighter">{uptime}%</div>
            <div className="text-[10px] font-[var(--font-mono)] text-[#43e2c2] mt-2 uppercase tracking-widest animate-pulse">● NOMINAL OPERATION</div>
          </div>
        </div>
      </section>

      {/* Metrics & Telemetry */}
      <section className="grid grid-cols-12 gap-8">
        <div className="col-span-4 flex flex-col gap-4 h-full">
          <div className="bg-[#101c2b] p-6 shrink-0">
            <div className="flex justify-between items-center mb-4"><span className="font-[var(--font-mono)] text-[10px] text-[#00c6a7] tracking-widest uppercase">AI Path Processing</span><span className="material-symbols-outlined text-[#00c6a7] text-sm">psychology</span></div>
            <div className="text-3xl font-[var(--font-headline)] font-bold text-[#d7e3f8]">{aiMs} ms</div>
            <div className="flex gap-1 mt-4">{[1,1,1,0,0].map((f,i)=><div key={i} className={`h-1 flex-1 ${f?'bg-[#43e2c2]':'bg-[#43e2c2]/20'}`}/>)}</div>
          </div>
          <div className="bg-[#101c2b] p-6 shrink-0">
            <div className="flex justify-between items-center mb-4"><span className="font-[var(--font-mono)] text-[10px] text-[#00c6a7] tracking-widest uppercase">Network Sync</span><span className="material-symbols-outlined text-[#00c6a7] text-sm">sync_alt</span></div>
            <div className="text-3xl font-[var(--font-headline)] font-bold text-[#d7e3f8]">{netSync} Gbps</div>
            <div className="w-full h-1 bg-[#2a3645] mt-4 overflow-hidden relative"><div className="absolute inset-y-0 left-0 bg-[#43e2c2] w-4/5 animate-pulse"></div></div>
          </div>
          <div className="bg-[#101c2b] flex-1 relative min-h-[200px] border border-[#3c4a45]/20 overflow-hidden">
            <AIVisionFeed />
          </div>
        </div>
        <div className="col-span-8 bg-[#101c2b] flex flex-col border border-[#3c4a45]/20">
          <div className="p-4 border-b border-[#3c4a45]/30 flex justify-between items-center">
            <h3 className="font-[var(--font-headline)] font-bold text-[#d7e3f8] uppercase tracking-widest text-sm flex items-center gap-2"><span className="w-2 h-2 bg-[#43e2c2] animate-pulse rounded-full"></span>Telemetry Trace Log</h3>
            <span className="font-[var(--font-mono)] text-[10px] text-[#43e2c2]">LIVE • {logs.length} records</span>
          </div>
          <div className="p-4 font-[var(--font-mono)] text-[11px] space-y-1.5 max-h-56 overflow-y-auto no-scrollbar flex-1">
            {logs.map((l,i) => (
              <div key={i} className="flex gap-4">
                <span className="text-[#00c6a7]/50 shrink-0">{l.timestamp}</span>
                <span className={sevColor(l.severity)}>[{l.type}] {l.message}</span>
              </div>
            ))}
          </div>
          {/* Command Input */}
          <div className="p-4 border-t border-[#3c4a45]/30 flex gap-2">
            <span className="text-[#43e2c2] font-[var(--font-mono)] text-sm">$</span>
            <input value={cmdInput} onChange={e => setCmdInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleCommand()}
              placeholder="Enter command... (Type HELP for options)" className="flex-1 bg-transparent border-none text-[#d7e3f8] font-[var(--font-mono)] text-sm focus:outline-none placeholder:text-[#d7e3f8]/20" />
            <button onClick={handleCommand} className="text-[#43e2c2] font-[var(--font-mono)] text-xs hover:text-white transition-colors cursor-pointer uppercase tracking-widest">Send</button>
          </div>
        </div>
      </section>
    </div>
  )
}
