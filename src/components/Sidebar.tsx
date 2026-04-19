import { NavLink } from 'react-router-dom'
import { deployAsset } from '../api'
import { useState } from 'react'

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { to: '/flow', label: 'Flow', icon: 'waves' },
  { to: '/zones', label: 'Zones', icon: 'grid_view' },
  { to: '/alerts', label: 'Alerts', icon: 'warning' },
  { to: '/analytics', label: 'Analytics', icon: 'analytics' },
  { to: '/system', label: 'System', icon: 'settings_input_component' },
  { to: '/assistant', label: 'Command AI', icon: 'neurology' },
]

export default function Sidebar() {
  const [deploying, setDeploying] = useState(false)
  const [deployMsg, setDeployMsg] = useState('')

  const handleDeploy = async () => {
    setDeploying(true)
    setDeployMsg('')
    try {
      const res = await deployAsset()
      setDeployMsg(res.message || 'Deployed!')
      setTimeout(() => setDeployMsg(''), 3000)
    } catch { setDeployMsg('Deploy failed') }
    setDeploying(false)
  }

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-[#101c2b] flex flex-col z-40">
      <div className="px-6 py-8">
        <div className="text-xl font-black text-[#00c6a7] font-[var(--font-headline)] tracking-tighter uppercase mb-2">VENUEFLOW</div>
        <div className="space-y-1">
          <div className="text-[10px] font-[var(--font-mono)] uppercase tracking-[0.2em] text-[#00c6a7]/60">Command Center</div>
          <div className="text-[10px] font-[var(--font-mono)] uppercase tracking-widest text-[#d7e3f8]/40">Active Session: 04:22:15</div>
        </div>
      </div>
      <nav className="flex-1 px-4 space-y-2 mt-4">
        {navItems.map(item => (
          <NavLink key={item.to} to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              `flex items-center gap-4 px-4 py-3 font-bold font-[var(--font-headline)] uppercase tracking-widest transition-all text-sm ${isActive ? 'bg-[#00c6a7] text-[#00382d]' : 'text-[#d7e3f8] hover:bg-[#2a3645]'}`
            }>
            <span className="material-symbols-outlined">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="px-4 py-3">
        <button onClick={handleDeploy} disabled={deploying}
          className="w-full py-4 bg-[#43e2c2] text-[#00382d] font-bold font-[var(--font-headline)] uppercase tracking-[0.15em] active:scale-[0.98] transition-transform cursor-pointer text-sm disabled:opacity-50">
          {deploying ? 'DEPLOYING...' : 'DEPLOY ASSET'}
        </button>
        {deployMsg && <div className="text-[10px] text-[#43e2c2] font-[var(--font-mono)] mt-2 text-center uppercase">{deployMsg}</div>}
      </div>
      <div className="border-t border-[#3c4a45]/30 px-4 py-4 space-y-1">
        <a href="#" className="flex items-center gap-4 px-4 py-2 text-[#d7e3f8]/70 hover:text-[#43e2c2] text-sm font-[var(--font-headline)] uppercase tracking-widest transition-all">
          <span className="material-symbols-outlined text-sm">help_outline</span><span>Support</span>
        </a>
        <a href="#" className="flex items-center gap-4 px-4 py-2 text-[#d7e3f8]/70 hover:text-[#43e2c2] text-sm font-[var(--font-headline)] uppercase tracking-widest transition-all">
          <span className="material-symbols-outlined text-sm">terminal</span><span>Logs</span>
        </a>
      </div>
    </aside>
  )
}
