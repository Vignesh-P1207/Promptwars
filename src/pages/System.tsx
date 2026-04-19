import { useEffect, useState } from 'react'
import { getSystemConfig, toggleConfig, getMetrics, getTelemetry, rebootSystem, purgeSystem } from '../api'

export default function System() {
  const [configs, setConfigs] = useState<any[]>([])
  const [metrics, setMetrics] = useState<any>({})
  const [logs, setLogs] = useState<any[]>([])
  const [actionMsg, setActionMsg] = useState('')

  const load = async () => { setConfigs(await getSystemConfig()); setMetrics(await getMetrics()); setLogs(await getTelemetry(15)) }
  useEffect(() => { load(); const iv = setInterval(load, 3000); return () => clearInterval(iv) }, [])

  const flash = (msg: string) => { setActionMsg(msg); setTimeout(() => setActionMsg(''), 3000) }
  const handleToggle = async (key: string, current: boolean) => { await toggleConfig(key, !current); flash(`${key.replace(/_/g,' ').toUpperCase()} ${!current ? 'ENABLED' : 'DISABLED'}`); load() }
  const handleReboot = async () => { flash('⏳ Rebooting...'); await rebootSystem(); flash('✅ Command Core rebooted'); load() }
  const handlePurge = async () => { if (!confirm('⚠️ CONFIRM PURGE: Delete ALL telemetry data?')) return; await purgeSystem(); flash('🗑️ Telemetry purged'); load() }

  const bw = metrics.bandwidth?.value ?? 4.8
  const pktLoss = metrics.packet_loss?.value ?? 0.0001
  const uplinkHrs = metrics.uplink_uptime?.value ?? 1248
  const sensor = metrics.sensor_network?.value ?? 99.8
  const pathMs = metrics.path_compute?.value ?? 12
  const sevColor = (s: string) => s === 'warning' ? 'text-[#ffc068]' : s === 'success' ? 'text-[#43e2c2] font-bold' : s === 'critical' ? 'text-[#ffb4ab] font-bold' : ''

  return (
    <div className="flex-grow p-8 grid grid-cols-12 gap-6 relative overflow-y-auto">
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden select-none">
        <span className="text-[12vw] font-black font-[var(--font-headline)] text-[#14202f] opacity-[0.03] whitespace-nowrap leading-none tracking-tighter">SYSTEM DIAGNOSTICS</span>
      </div>
      <div className="col-span-12 flex items-baseline justify-between mb-4 relative z-10">
        <h2 className="text-6xl font-black font-[var(--font-headline)] tracking-tighter text-[#d7e3f8] uppercase">System Diagnostics</h2>
        <div className="text-right">
          <p className="font-[var(--font-mono)] text-sm text-[#43e2c2]">ENCRYPTED LINK 842-X</p>
          {actionMsg && <p className="font-[var(--font-mono)] text-xs text-[#43e2c2] mt-1 animate-pulse">{actionMsg}</p>}
        </div>
      </div>

      <div className="col-span-12 lg:col-span-4 flex flex-col gap-6 relative z-10">
        <div className="bg-[#101c2b] p-6 hover:bg-[#1f2b3a] transition-all">
          <div className="flex justify-between items-start"><p className="font-[var(--font-mono)] text-xs text-[#00c6a7] tracking-widest uppercase">Infrastructure / 01</p><span className="material-symbols-outlined text-[#43e2c2]">sensors</span></div>
          <div className="mt-8"><h3 className="text-4xl font-black font-[var(--font-headline)] tracking-tighter leading-none mb-1 text-[#d7e3f8]">{sensor}%</h3><p className="text-lg font-bold uppercase tracking-tight text-[#d7e3f8]">Sensor Network</p><p className="text-sm opacity-50 mt-2">Mesh connectivity across all sectors.</p></div>
          <div className="mt-6 flex gap-1 h-1">{[1,1,1,1,0].map((f,i)=><div key={i} className={`flex-grow ${f?'bg-[#43e2c2]':'bg-[#43e2c2]/20'}`}/>)}</div>
        </div>
        <div className="bg-[#101c2b] p-6 hover:bg-[#1f2b3a] transition-all">
          <div className="flex justify-between items-start"><p className="font-[var(--font-mono)] text-xs text-[#00c6a7] tracking-widest uppercase">Infrastructure / 02</p><span className="material-symbols-outlined text-[#43e2c2]">memory</span></div>
          <div className="mt-8"><h3 className="text-4xl font-black font-[var(--font-headline)] tracking-tighter leading-none mb-1 text-[#d7e3f8]">{pathMs}ms</h3><p className="text-lg font-bold uppercase tracking-tight text-[#d7e3f8]">Path Compute</p></div>
          <div className="mt-6 h-8 bg-[#2a3645] relative overflow-hidden"><div className="absolute inset-0 bg-gradient-to-r from-[#43e2c2]/10 to-transparent"></div><div className="absolute bottom-0 left-0 h-0.5 bg-[#43e2c2] w-2/3"></div></div>
        </div>
      </div>

      <div className="col-span-12 lg:col-span-4 bg-[#101c2b] p-8 flex flex-col gap-8 relative z-10">
        <div className="flex justify-between items-center"><h3 className="text-xl font-bold font-[var(--font-headline)] uppercase tracking-widest text-[#d7e3f8]">Uplink Status</h3><div className="flex items-center gap-2"><span className="w-2 h-2 bg-[#43e2c2] animate-pulse rounded-full"></span><span className="font-[var(--font-mono)] text-[10px] text-[#43e2c2]">LIVE</span></div></div>
        <div className="flex-grow flex flex-col justify-center">
          <div className="space-y-6">
            {[{l:'BANDWIDTH',v:`${bw} GB/S`},{l:'PACKET LOSS',v:`${pktLoss}%`},{l:'UPTIME',v:`${Math.round(uplinkHrs)}H`}].map(s=>(
              <div key={s.l} className="flex justify-between items-end border-b border-[#3c4a45]/20 pb-2"><span className="font-[var(--font-mono)] text-xs opacity-50">{s.l}</span><span className="font-[var(--font-headline)] font-bold text-2xl text-[#d7e3f8]">{s.v}</span></div>
            ))}
          </div>
        </div>
        <div className="relative h-32 bg-[#2a3645] overflow-hidden"><div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,#43e2c2,transparent)]"></div><div className="absolute inset-0 flex items-center justify-around px-4">{[8,12,20,16,24,10,14,20].map((h,i)=><div key={i} className="w-1 bg-[#43e2c2]" style={{height:`${h*4}px`}}/>)}</div></div>
      </div>

      <div className="col-span-12 lg:col-span-4 bg-[#1f2b3a] p-8 flex flex-col relative z-10">
        <h3 className="text-xl font-bold font-[var(--font-headline)] uppercase tracking-widest mb-8 text-[#d7e3f8]">System Configuration</h3>
        <div className="space-y-6 flex-grow">
          {configs.map(c => (
            <div key={c.key} className="flex items-center justify-between cursor-pointer" onClick={() => handleToggle(c.key, !!c.enabled)}>
              <div><p className="font-bold text-sm tracking-wide uppercase text-[#d7e3f8]">{c.label}</p><p className="text-xs opacity-40">{c.description}</p></div>
              <div className={`w-12 h-6 flex items-center px-1 transition-colors ${c.enabled?'bg-[#43e2c2] justify-end':'bg-[#2a3645] justify-start'}`}>
                <div className={`w-4 h-4 transition-all ${c.enabled?'bg-[#00382d]':'bg-[#85948e]'}`}></div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-8 pt-8 border-t border-[#3c4a45]/30 flex flex-col gap-4">
          <button onClick={handleReboot} className="w-full bg-transparent border border-[#43e2c2] text-[#43e2c2] py-3 font-bold text-xs uppercase hover:bg-[#43e2c2]/5 transition-all cursor-pointer">REBOOT COMMAND CORE</button>
          <button onClick={handlePurge} className="w-full bg-[#eea01b] text-[#5e3c00] py-3 font-bold text-xs uppercase hover:brightness-110 active:scale-95 transition-all cursor-pointer">INITIATE PURGE</button>
        </div>
      </div>

      <div className="col-span-12 bg-[#030f1d] border border-[#3c4a45]/10 p-6 font-[var(--font-mono)] text-sm relative z-10">
        <div className="flex justify-between items-center mb-4 border-b border-[#3c4a45]/20 pb-2">
          <div className="flex items-center gap-4"><span className="text-[#00c6a7]">TELEMETRY_TRACE.LOG</span><span className="text-[10px] opacity-30 uppercase tracking-[0.2em]">Live Stream • Auto-refresh 3s</span></div>
          <div className="flex gap-2"><div className="w-2 h-2 bg-[#ffb4ab]"></div><div className="w-2 h-2 bg-[#ffc068]"></div><div className="w-2 h-2 bg-[#43e2c2] animate-pulse"></div></div>
        </div>
        <div className="h-48 overflow-y-auto space-y-1 text-[#43e2c2]/70">
          {logs.map((l,i) => (<p key={i}><span className="opacity-30">[{l.timestamp}]</span>{' '}<span className={sevColor(l.severity)}>[{l.type}] {l.message}</span></p>))}
          {logs.length === 0 && <p className="opacity-30">Awaiting telemetry...</p>}
        </div>
      </div>
    </div>
  )
}
