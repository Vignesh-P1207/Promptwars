import { useState, useEffect, useRef } from 'react'
import { getAlerts, resolveAlert } from '../api'

export default function TopBar() {
  const [alerts, setAlerts] = useState<any[]>([])
  const [showNotifs, setShowNotifs] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  
  const searchRef = useRef<HTMLDivElement>(null)
  const notifRef = useRef<HTMLDivElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)

  const load = async () => { setAlerts(await getAlerts()) }
  useEffect(() => { load(); const iv = setInterval(load, 5000); return () => clearInterval(iv) }, [])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setIsSearching(false)
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifs(false)
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setShowProfile(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const unreadAlerts = alerts.filter(a => !a.resolved)

  const handleResolveAlert = async (id: number) => {
    await resolveAlert(id); load()
  }

  return (
    <header className="bg-[#081422] flex justify-between items-center w-full px-8 py-4 sticky top-0 z-30">
      <div className="flex items-center gap-8 flex-1">
        <div className="relative w-full max-w-md" ref={searchRef}>
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-[#00c6a7]">
            <span className="material-symbols-outlined">search</span>
          </span>
          <input 
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setIsSearching(e.target.value.length > 0) }}
            onFocus={() => { if (searchQuery.length > 0) setIsSearching(true) }}
            className="w-full bg-[#101c2b] border border-transparent text-[#d7e3f8] pl-10 pr-4 py-2 text-sm font-[var(--font-mono)] focus:ring-1 focus:ring-[#00c6a7] focus:border-[#00c6a7] focus:outline-none placeholder:text-[#d7e3f8]/20 uppercase transition-all" 
            placeholder="QUERY ASSETS..." 
            type="text" 
          />
          
          {/* Search Dropdown */}
          {isSearching && (
            <div className="absolute top-full mt-2 w-full bg-[#101c2b] border border-[#3c4a45]/30 shadow-2xl p-2 z-50">
              <div className="text-[10px] font-[var(--font-mono)] text-[#00c6a7] uppercase tracking-widest p-2">Global System Match</div>
              {['Zone Configuration', 'Telemetry Archive', 'Personnel Registry', 'Emergency Protocols'].filter(i => i.toLowerCase().includes(searchQuery.toLowerCase())).map((item, i) => (
                <div key={i} onClick={() => { setSearchQuery(''); setIsSearching(false) }} className="p-3 hover:bg-[#2a3645] cursor-pointer group flex items-center justify-between">
                  <span className="font-[var(--font-mono)] text-sm text-[#d7e3f8] group-hover:text-[#43e2c2] uppercase">{item}</span>
                  <span className="material-symbols-outlined text-[#85948e] group-hover:text-[#43e2c2] text-sm">arrow_forward</span>
                </div>
              ))}
              {['Zone Configuration', 'Telemetry Archive', 'Personnel Registry', 'Emergency Protocols'].filter(i => i.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                <div className="p-4 text-center font-[var(--font-mono)] text-xs text-[#85948e] uppercase">NO MATCHES FOUND IN SECTOR</div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-6">
        {/* Notifications */}
        <div className="relative" ref={notifRef}>
          <button onClick={() => setShowNotifs(!showNotifs)} className={`text-[#d7e3f8] transition-opacity relative cursor-pointer ${showNotifs ? 'opacity-100 text-[#ffc068]' : 'opacity-70 hover:opacity-100'}`}>
            <span className="material-symbols-outlined">notifications_active</span>
            {unreadAlerts.length > 0 && <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#ffc068] animate-pulse rounded-full border-2 border-[#081422]"></span>}
          </button>
          
          {showNotifs && (
            <div className="absolute right-0 top-full mt-4 w-80 bg-[#101c2b] border border-[#3c4a45]/30 shadow-2xl z-50">
              <div className="p-4 flex justify-between items-center border-b border-[#3c4a45]/30">
                <span className="font-[var(--font-headline)] text-sm font-bold text-[#d7e3f8] uppercase tracking-widest">Active Alerts</span>
                <span className="bg-[#ffc068]/10 text-[#ffc068] px-2 py-0.5 text-[10px] font-[var(--font-mono)]">{unreadAlerts.length} UNRESOLVED</span>
              </div>
              <div className="max-h-80 overflow-y-auto no-scrollbar">
                {unreadAlerts.length === 0 ? (
                  <div className="p-8 text-center text-[#85948e] font-[var(--font-mono)] text-xs uppercase">ALL ALERTS RESOLVED. SYSTEM NOMINAL.</div>
                ) : (
                  unreadAlerts.map(a => (
                    <div key={a.id} className="p-4 border-b border-[#3c4a45]/10 hover:bg-[#2a3645] transition-colors group">
                      <div className="flex justify-between items-start mb-2">
                        <span className={`text-[10px] font-[var(--font-mono)] uppercase ${a.severity === 'critical' ? 'text-[#ffb4ab]' : 'text-[#ffc068]'}`}>{a.zone_name}</span>
                        <span className="text-[10px] font-[var(--font-mono)] text-[#85948e]">{a.created_at ? a.created_at.split(' ').pop() : ''}</span>
                      </div>
                      <p className="text-xs text-[#d7e3f8] font-[var(--font-mono)] line-clamp-2">{a.message}</p>
                      <button onClick={() => handleResolveAlert(a.id)} className="mt-3 text-[#43e2c2] text-[10px] font-[var(--font-mono)] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Acknowledge</button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Settings -> Links to System Page */}
        <a href="/system" className="text-[#d7e3f8] opacity-70 hover:opacity-100 transition-opacity cursor-pointer">
          <span className="material-symbols-outlined">settings</span>
        </a>

        {/* Profile */}
        <div className="relative" ref={profileRef}>
          <div className="flex items-center gap-3 pl-6 border-l border-[#3c4a45]/30 cursor-pointer group" onClick={() => setShowProfile(!showProfile)}>
            <div className="text-right">
              <div className="text-xs font-bold text-[#d7e3f8] uppercase font-[var(--font-headline)] tracking-tighter group-hover:text-[#43e2c2] transition-colors">OP_ALPHA_01</div>
              <div className="text-[10px] text-[#00c6a7] font-[var(--font-mono)]">ROOT_LEVEL</div>
            </div>
            <div className={`w-10 h-10 border flex items-center justify-center transition-colors ${showProfile ? 'bg-[#43e2c2] border-[#43e2c2] text-[#00382d]' : 'bg-[#2a3645] border-[#00c6a7]/20 text-[#00c6a7] group-hover:border-[#43e2c2]'}`}>
              <span className="material-symbols-outlined text-lg">person</span>
            </div>
          </div>
          
          {showProfile && (
            <div className="absolute right-0 top-full mt-4 w-48 bg-[#101c2b] border border-[#3c4a45]/30 shadow-2xl z-50">
              <div className="p-4 border-b border-[#3c4a45]/30">
                <span className="block font-[var(--font-headline)] text-sm font-bold text-[#d7e3f8] uppercase tracking-widest">OP_ALPHA_01</span>
                <span className="block text-[10px] font-[var(--font-mono)] text-[#85948e] uppercase mt-1">Operator Profile</span>
              </div>
              <div className="p-2 space-y-1">
                <a href="/system" className="block w-full text-left p-2 cursor-pointer font-[var(--font-mono)] text-xs text-[#d7e3f8] hover:bg-[#2a3645] hover:text-[#43e2c2] uppercase">Access Logs</a>
                <button className="block w-full text-left p-2 cursor-pointer font-[var(--font-mono)] text-xs text-[#ffb4ab] hover:bg-[#ffb4ab]/10 uppercase" onClick={() => { alert('Handshake severed. Logging out...'); setShowProfile(false) }}>Terminate Link</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
