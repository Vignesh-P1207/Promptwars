import { useEffect, useState } from 'react'
import { getAlerts, resolveAlert, emergencyLock, openAllGates, addTelemetry } from '../api'

export default function Alerts() {
  const [alerts, setAlerts] = useState<any[]>([])
  const [lockingMode, setLockingMode] = useState(false)

  const load = async () => setAlerts(await getAlerts())
  useEffect(() => { load(); const iv = setInterval(load, 3000); return () => clearInterval(iv) }, [])

  const unresolved = alerts.filter(a => !a.resolved)
  const resolved = alerts.filter(a => a.resolved).slice(0, 5) // recent 5

  const handleResolve = async (id: number) => {
    await resolveAlert(id)
    load()
  }

  const handleGlobalLockdown = async () => {
    setLockingMode(true)
    await emergencyLock()
    const t = new Date().toTimeString().split(' ')[0]
    await addTelemetry({ timestamp: t, type: 'CRIT', message: 'SUDO COMMAND: GLOBAL LOCKDOWN ENACTED VIA EMERGENCY PANEL.', severity: 'critical'})
    setTimeout(() => { setLockingMode(false); load() }, 2000)
  }

  const handleOpenAllGates = async () => {
    await openAllGates()
    const t = new Date().toTimeString().split(' ')[0]
    await addTelemetry({ timestamp: t, type: 'SYS', message: 'SUDO COMMAND: ALL GATES OPENED.', severity: 'success'})
  }

  return (
    <div className={`p-8 flex-1 space-y-8 transition-colors duration-1000 ${lockingMode ? 'bg-[#ffb4ab]/10' : ''}`}>
      <div className="flex justify-between items-center bg-[#101c2b] p-8 mt-2 border-t-4 border-[#ffb4ab]">
        <div>
          <span className="font-[var(--font-mono)] text-xs text-[#ffb4ab] tracking-[0.3em] uppercase">Emergency Protocols</span>
          <h1 className="text-5xl font-[var(--font-headline)] font-bold text-[#d7e3f8] tracking-tighter uppercase leading-none mt-2">Critical Alerts Hub</h1>
        </div>
        <div className="flex gap-4">
          <button onClick={handleOpenAllGates} className="bg-[#43e2c2]/10 text-[#43e2c2] border border-[#43e2c2]/50 px-6 py-4 font-[var(--font-headline)] font-bold uppercase tracking-widest text-sm hover:bg-[#43e2c2] hover:text-[#00382d] transition-all flex items-center gap-2">
            <span className="material-symbols-outlined">lock_open</span> OPEN ALL SECURE GATES
          </button>
          <button onClick={handleGlobalLockdown} className="bg-[#ffb4ab] text-red-900 border-2 border-red-500 px-8 py-4 font-[var(--font-headline)] font-black uppercase tracking-widest text-lg hover:brightness-110 shadow-[0_0_20px_rgba(255,180,171,0.4)] transition-all flex items-center gap-3 animate-pulse">
            <span className="material-symbols-outlined">warning</span> EMERGENCY LOCKDOWN
          </button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        <div className="col-span-8 space-y-4">
          <h2 className="text-[#d7e3f8] font-[var(--font-headline)] font-bold tracking-widest uppercase mb-6 flex items-center gap-3">
             <span className="w-3 h-3 bg-[#ffb4ab] rounded-full animate-ping"></span> Unresolved Threats ({unresolved.length})
          </h2>
          {unresolved.length === 0 ? (
            <div className="bg-[#101c2b] p-16 text-center border border-[#43e2c2]/20">
               <span className="material-symbols-outlined text-[#43e2c2] text-6xl mb-4">gpp_good</span>
               <h3 className="text-[#d7e3f8] font-[var(--font-headline)] text-2xl uppercase tracking-widest font-bold">ALL CLEAR</h3>
               <p className="text-[#85948e] font-[var(--font-mono)] mt-2">Zero critical anomalies detected across the venue.</p>
            </div>
          ) : (
            unresolved.map(a => (
              <div key={a.id} className={`p-8 border-l-4 flex justify-between items-center ${a.severity === 'critical' ? 'bg-[#ffb4ab]/10 border-[#ffb4ab]' : 'bg-[#ffc068]/10 border-[#ffc068]'}`}>
                 <div>
                   <div className="flex items-center gap-3 mb-2">
                     <span className={`px-2 py-0.5 text-[10px] font-[var(--font-mono)] font-bold uppercase tracking-widest ${a.severity === 'critical' ? 'bg-[#ffb4ab] text-red-900' : 'bg-[#ffc068] text-orange-950'}`}>
                       {a.severity}
                     </span>
                     <span className="text-[#85948e] text-xs font-[var(--font-mono)]">{new Date(a.created_at).toLocaleString()}</span>
                   </div>
                   <h3 className="text-2xl font-[var(--font-headline)] font-bold text-[#d7e3f8] uppercase">{a.zone_name}</h3>
                   <p className="text-[#bacac4] font-[var(--font-mono)] mt-2">{a.message}</p>
                 </div>
                 <button onClick={() => handleResolve(a.id)} className="bg-[#2a3645] hover:bg-[#43e2c2] text-[#43e2c2] hover:text-[#00382d] border border-[#43e2c2]/30 px-6 py-3 font-[var(--font-headline)] font-bold uppercase tracking-widest text-sm transition-all duration-300">
                   Execute Recovery
                 </button>
              </div>
            ))
          )}
        </div>

        <div className="col-span-4 space-y-4">
           <h2 className="text-[#85948e] font-[var(--font-headline)] font-bold tracking-widest uppercase mb-6 flex items-center gap-3 border-b border-[#3c4a45]/30 pb-4">
             Resolved Logs
          </h2>
          {resolved.length === 0 ? <p className="text-[#85948e] text-sm font-[var(--font-mono)]">No recent resolved alerts.</p> : (
            resolved.map(a => (
              <div key={a.id} className="bg-[#101c2b] p-6 border-l-2 border-[#43e2c2]">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-sm font-[var(--font-headline)] font-bold text-[#d7e3f8] uppercase">{a.zone_name}</h4>
                  <span className="material-symbols-outlined text-[#43e2c2] text-sm">check_circle</span>
                </div>
                <p className="text-[10px] text-[#85948e] font-[var(--font-mono)] line-clamp-2 leading-relaxed">{a.message}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
