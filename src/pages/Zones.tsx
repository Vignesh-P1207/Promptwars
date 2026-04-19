import { useEffect, useState } from 'react'
import { getZones, updateZone, createZone, deleteZone, getMetrics, openAllGates, emergencyLock, toggleGate, sendBroadcast } from '../api'

export default function Zones() {
  const [zones, setZones] = useState<any[]>([])
  const [metrics, setMetrics] = useState<any>({})
  const [showAdd, setShowAdd] = useState(false)
  const [showBroadcast, setShowBroadcast] = useState(false)
  const [broadcastMsg, setBroadcastMsg] = useState('')
  const [form, setForm] = useState({ zone_id: '', name: '', description: '', capacity: 0, max_capacity: 100 })
  const [actionMsg, setActionMsg] = useState('')

  const load = async () => { setZones(await getZones()); setMetrics(await getMetrics()) }
  useEffect(() => { load(); const iv = setInterval(load, 3000); return () => clearInterval(iv) }, [])

  const sysLoad = metrics.system_load?.value ?? 64.2
  const gateOn = zones.filter(z => z.gate_open).length
  const gateTotal = zones.length

  const flash = (msg: string) => { setActionMsg(msg); setTimeout(() => setActionMsg(''), 3000) }

  const handleCapacity = async (id: number, cap: number) => {
    const status = cap > 90 ? 'critical' : cap > 70 ? 'warning' : 'stable'
    const color = cap > 90 ? '#ffb4ab' : cap > 70 ? '#ffc068' : '#00c6a7'
    await updateZone(id, { capacity: cap, status, color }); load()
  }

  const handleAdd = async () => {
    if (!form.zone_id || !form.name) return
    const cap = form.capacity; const status = cap > 90 ? 'critical' : cap > 70 ? 'warning' : 'stable'
    const color = cap > 90 ? '#ffb4ab' : cap > 70 ? '#ffc068' : '#00c6a7'
    await createZone({ ...form, status, color }); setShowAdd(false); setForm({ zone_id: '', name: '', description: '', capacity: 0, max_capacity: 100 }); load()
  }

  const [showEmergencyConfirm, setShowEmergencyConfirm] = useState(false)

  const handleOpenAll = async () => { await openAllGates(); flash('✅ All gates opened'); load() }
  const handleEmergencyTrigger = () => { setShowEmergencyConfirm(!showEmergencyConfirm); setShowBroadcast(false); setShowAdd(false) }
  const confirmEmergency = async () => {
    await emergencyLock(); flash('🔒 EMERGENCY LOCKDOWN ENGAGED'); setShowEmergencyConfirm(false); load()
  }
  const handleBroadcast = async () => {
    if (!broadcastMsg.trim()) return
    await sendBroadcast(broadcastMsg); setBroadcastMsg(''); setShowBroadcast(false); flash('📢 Broadcast sent'); load()
  }
  const handleToggleGate = async (id: number) => { await toggleGate(id); load() }

  return (
    <div className="p-8 space-y-8 flex-1">
      {/* Action status */}
      {actionMsg && <div className="bg-[#43e2c2] text-[#00382d] px-6 py-3 font-[var(--font-mono)] text-sm font-bold uppercase tracking-widest animate-pulse">{actionMsg}</div>}

      {/* Stats */}
      <section className="grid grid-cols-12 gap-1 items-start">
        <div className="col-span-8 bg-[#101c2b] p-8">
          <div className="font-[var(--font-mono)] text-[10px] text-[#00c6a7] uppercase tracking-widest mb-2">System Load Overview</div>
          <div className="flex items-baseline gap-4">
            <div className="font-[var(--font-headline)] text-7xl font-bold tracking-tighter text-[#d7e3f8]">{sysLoad.toFixed(1)}%</div>
            <div className="font-[var(--font-mono)] text-sm text-[#00c6a7]">LIVE SIMULATION ACTIVE</div>
          </div>
          <div className="mt-6 w-full h-1 bg-[#2a3645] overflow-hidden"><div className="h-full bg-[#43e2c2] transition-all duration-1000" style={{width:`${sysLoad}%`}}></div></div>
        </div>
        <div className="col-span-4 bg-[#101c2b] p-8 h-full">
          <div className="font-[var(--font-mono)] text-[10px] text-[#00c6a7] uppercase tracking-widest mb-2">Gate Connectivity</div>
          <div className="font-[var(--font-headline)] text-5xl font-bold tracking-tighter text-[#d7e3f8]">{gateOn}<span className="text-[#2a3645]">/</span>{gateTotal}</div>
          <div className="mt-4 flex gap-1">{zones.map((z,i) => <div key={i} className={`h-2 flex-1 ${z.gate_open ? 'bg-[#43e2c2]' : 'bg-[#ffb4ab]'}`}></div>)}</div>
        </div>
      </section>

      {/* Directives — FULLY FUNCTIONAL */}
      <section className="grid grid-cols-4 gap-4 relative">
        <div onClick={handleOpenAll} className="col-span-2 bg-[#2a3645] p-6 flex flex-col justify-between group cursor-pointer hover:bg-[#43e2c2] transition-all duration-300">
          <div className="flex justify-between items-start"><span className="material-symbols-outlined text-4xl group-hover:text-[#00382d] text-[#d7e3f8]">gate</span><div className="font-[var(--font-mono)] text-[10px] uppercase tracking-widest opacity-50 group-hover:text-[#00382d]">Priority Alpha</div></div>
          <div className="mt-12 font-[var(--font-headline)] text-xl font-bold group-hover:text-[#00382d] uppercase tracking-tighter text-[#d7e3f8]">Open All Gates</div>
        </div>
        <div onClick={handleEmergencyTrigger} className={`p-6 flex flex-col justify-between group cursor-pointer transition-all duration-300 ${showEmergencyConfirm ? 'bg-[#ffb4ab]' : 'bg-[#2a3645] hover:bg-[#ffb4ab]'}`}>
          <span className={`material-symbols-outlined text-4xl ${showEmergencyConfirm ? 'text-white' : 'text-[#ffb4ab] group-hover:text-white'}`}>lock_open</span>
          <div className={`mt-8 font-[var(--font-headline)] text-sm font-bold uppercase tracking-tighter leading-none ${showEmergencyConfirm ? 'text-white' : 'text-[#d7e3f8] group-hover:text-white'}`}>{showEmergencyConfirm ? 'Cancel Lock' : 'Emergency Lock'}</div>
        </div>
        <div onClick={() => { setShowBroadcast(!showBroadcast); setShowEmergencyConfirm(false) }} className={`p-6 flex flex-col justify-between group cursor-pointer transition-all duration-300 ${showBroadcast ? 'bg-[#ffc068]' : 'bg-[#2a3645] hover:bg-[#ffc068]'}`}>
          <span className={`material-symbols-outlined text-4xl ${showBroadcast ? 'text-[#452b00]' : 'text-[#ffc068] group-hover:text-[#452b00]'}`}>campaign</span>
          <div className={`mt-8 font-[var(--font-headline)] text-sm font-bold uppercase tracking-tighter leading-none ${showBroadcast ? 'text-[#452b00]' : 'text-[#d7e3f8] group-hover:text-[#452b00]'}`}>Global Broadcast</div>
        </div>
      </section>

      {/* Emergency Lock Custom Modal/Dropdown */}
      {showEmergencyConfirm && (
        <div className="bg-[#1c0808] border-2 border-[#ffb4ab] p-8 flex flex-col items-center justify-center space-y-6 animate-pulse shadow-[0_0_50px_rgba(255,180,171,0.2)]">
          <div className="flex items-center gap-4 text-[#ffb4ab]">
            <span className="material-symbols-outlined text-5xl">warning</span>
            <div className="space-y-1">
              <h2 className="text-3xl font-[var(--font-headline)] font-black uppercase tracking-tighter leading-none">Confirm Global Lockdown</h2>
              <p className="font-[var(--font-mono)] text-xs font-bold tracking-widest uppercase">This action will immediately seal all venue gates.</p>
            </div>
          </div>
          <div className="flex gap-4 w-full justify-center">
            <button onClick={confirmEmergency} className="bg-[#ffb4ab] text-black px-12 py-4 font-[var(--font-headline)] font-black text-xl uppercase tracking-widest hover:brightness-125 transition-all shadow-[0_0_20px_rgba(255,180,171,0.5)]">Engage Lockdown</button>
            <button onClick={handleEmergencyTrigger} className="bg-transparent border border-[#ffb4ab] text-[#ffb4ab] px-8 py-4 font-[var(--font-headline)] font-bold text-sm uppercase tracking-widest hover:bg-[#ffb4ab]/10 transition-all">Cancel</button>
          </div>
        </div>
      )}

      {/* Broadcast Form */}
      {showBroadcast && (
        <div className="bg-[#1f2b3a] p-6 border-l-4 border-[#ffc068] flex gap-4 items-center">
          <span className="material-symbols-outlined text-[#ffc068]">campaign</span>
          <input value={broadcastMsg} onChange={e => setBroadcastMsg(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleBroadcast()} placeholder="TYPE BROADCAST MESSAGE..."
            className="flex-1 bg-[#101c2b] border border-[#3c4a45]/30 text-[#d7e3f8] px-4 py-3 text-sm font-[var(--font-mono)] focus:ring-1 focus:ring-[#ffc068] focus:outline-none placeholder:text-[#d7e3f8]/20 uppercase" />
          <button onClick={handleBroadcast} className="bg-[#ffc068] text-[#452b00] px-8 py-3 font-[var(--font-headline)] text-xs font-bold uppercase cursor-pointer hover:brightness-110">TRANSMIT</button>
        </div>
      )}

      {/* Add Zone Form */}
      {showAdd && (
        <div className="bg-[#1f2b3a] p-6 border-l-4 border-[#43e2c2] space-y-4">
          <h3 className="font-[var(--font-headline)] font-bold uppercase tracking-widest text-sm text-[#d7e3f8]">Create New Zone</h3>
          <div className="grid grid-cols-4 gap-4">
            <input value={form.zone_id} onChange={e => setForm({...form, zone_id: e.target.value})} placeholder="ZONE ID (e.g. ZN-020)" className="bg-[#101c2b] border border-[#3c4a45]/30 text-[#d7e3f8] px-4 py-2 text-sm font-[var(--font-mono)] focus:ring-1 focus:ring-[#43e2c2] focus:outline-none placeholder:text-[#d7e3f8]/20 uppercase"/>
            <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="ZONE NAME" className="bg-[#101c2b] border border-[#3c4a45]/30 text-[#d7e3f8] px-4 py-2 text-sm font-[var(--font-mono)] focus:ring-1 focus:ring-[#43e2c2] focus:outline-none placeholder:text-[#d7e3f8]/20 uppercase"/>
            <input value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="DESCRIPTION" className="bg-[#101c2b] border border-[#3c4a45]/30 text-[#d7e3f8] px-4 py-2 text-sm font-[var(--font-mono)] focus:ring-1 focus:ring-[#43e2c2] focus:outline-none placeholder:text-[#d7e3f8]/20"/>
            <div className="flex gap-2"><input type="number" min="0" max="100" value={form.capacity} onChange={e => setForm({...form, capacity:+e.target.value})} className="bg-[#101c2b] border border-[#3c4a45]/30 text-[#d7e3f8] px-4 py-2 text-sm font-[var(--font-mono)] focus:ring-1 focus:ring-[#43e2c2] focus:outline-none w-24"/>
            <button onClick={handleAdd} className="bg-[#43e2c2] text-[#00382d] px-6 py-2 font-[var(--font-headline)] text-xs font-bold uppercase cursor-pointer hover:brightness-110">CREATE</button></div>
          </div>
        </div>
      )}

      {/* Live Zone States */}
      <section className="space-y-4">
        <div className="flex justify-between items-end border-b border-[#3c4a45]/10 pb-4">
          <div className="font-[var(--font-headline)] text-2xl font-bold tracking-tighter uppercase text-[#d7e3f8]">Live Zone States</div>
          <div className="flex items-center gap-4">
            <div className="font-[var(--font-mono)] text-[10px] text-[#43e2c2] uppercase tracking-widest animate-pulse">● REAL-TIME 3s</div>
            <button onClick={() => setShowAdd(!showAdd)} className="bg-[#43e2c2] text-[#00382d] px-4 py-2 font-[var(--font-headline)] text-[10px] font-bold uppercase tracking-widest cursor-pointer hover:brightness-110 transition-all">+ Add Zone</button>
          </div>
        </div>
        {zones.map(zone => (
          <div key={zone.id} className="bg-[#101c2b] p-6 flex items-center gap-6" style={{borderLeft:`4px solid ${zone.color}`}}>
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-3">
                <span className="font-[var(--font-mono)] text-[10px] uppercase tracking-widest" style={{color:zone.color}}>ID: {zone.zone_id}</span>
                <span className={`text-[10px] font-bold font-[var(--font-mono)] px-2 py-0.5 uppercase tracking-widest ${zone.gate_open ? 'bg-[#43e2c2]/10 text-[#43e2c2]' : 'bg-[#ffb4ab]/10 text-[#ffb4ab]'}`}>
                  GATE: {zone.gate_open ? 'OPEN' : 'SEALED'}
                </span>
              </div>
              <h3 className="font-[var(--font-headline)] text-2xl font-bold tracking-tighter uppercase text-[#d7e3f8]">{zone.name}</h3>
              <p className="text-xs opacity-50 font-[var(--font-mono)]">{zone.description}</p>
            </div>
            <div className="w-48 space-y-2">
              <div className="flex justify-between font-[var(--font-mono)] text-[10px] uppercase tracking-widest text-[#d7e3f8]"><span>Capacity</span><span style={{color:zone.color}}>{zone.capacity}%</span></div>
              <input type="range" min="0" max="100" value={zone.capacity} onChange={e => handleCapacity(zone.id, +e.target.value)}
                className="w-full h-2 appearance-none cursor-pointer" style={{background:`linear-gradient(to right, ${zone.color} ${zone.capacity}%, #2a3645 ${zone.capacity}%)`}}/>
            </div>
            <div className="flex gap-2">
              <button onClick={() => handleToggleGate(zone.id)} className={`px-4 py-3 font-[var(--font-headline)] text-[10px] font-bold uppercase tracking-widest cursor-pointer transition-all ${zone.gate_open ? 'bg-[#ffb4ab]/20 text-[#ffb4ab] hover:bg-[#ffb4ab] hover:text-white' : 'bg-[#43e2c2]/20 text-[#43e2c2] hover:bg-[#43e2c2] hover:text-[#00382d]'}`}>
                {zone.gate_open ? 'Lock Gate' : 'Open Gate'}
              </button>
              <button onClick={() => deleteZone(zone.id).then(load)} className="bg-[#93000a]/20 hover:bg-[#93000a] text-[#ffb4ab] px-4 py-3 font-[var(--font-headline)] text-[10px] font-bold uppercase tracking-widest transition-all cursor-pointer">Delete</button>
            </div>
          </div>
        ))}
      </section>
    </div>
  )
}
