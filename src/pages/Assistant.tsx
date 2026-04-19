import { useState } from 'react'

interface Directive {
  directive: string;
  actions: string[];
  severity: string;
}

export default function Assistant() {
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [directive, setDirective] = useState<Directive | null>(null)
  const [error, setError] = useState('')

  const handleCommand = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!prompt.trim()) return
    
    setLoading(true)
    setError('')
    try {
      const res = await fetch('http://localhost:3001/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      })
      const data = await res.json()
      if (res.ok) setDirective(data)
      else setError(data.error || 'Failed to generate directive.')
    } catch (err) {
      setError('Network error contacting Command AI.')
    }
    setLoading(false)
  }

  return (
    <div className="p-8 space-y-8 flex-1 flex flex-col bg-[#080d14]">
      <section className="flex flex-col flex-1 bg-[#101c2b] border border-[#43e2c2]/20 p-8 shadow-[0_0_40px_rgba(67,226,194,0.05)]">
        <div className="flex justify-between items-end mb-8 border-b border-[#3c4a45]/30 pb-4">
          <div>
            <h1 className="text-3xl font-[var(--font-headline)] font-bold text-[#d7e3f8] uppercase tracking-tighter">Aura Command AI</h1>
            <p className="font-[var(--font-mono)] text-[#00c6a7] text-xs tracking-widest uppercase mt-2">Neural Optimization Core</p>
          </div>
          <span className="material-symbols-outlined text-[#43e2c2] text-4xl opacity-50">neurology</span>
        </div>

        <div className="flex-1 flex flex-col gap-8">
          <div className="flex-1 bg-[#0a121d] p-6 border border-[#2a3645] relative overflow-y-auto min-h-[300px]">
            {!loading && !directive && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-[#d7e3f8]/30 font-[var(--font-mono)] text-xs uppercase tracking-widest text-center px-4">
                <span className="material-symbols-outlined text-4xl mb-4 opacity-20">terminal</span>
                Awaiting operator input.<br/>Example: "Mitigate zone C congestion flow"
              </div>
            )}
            
            {loading && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-[#43e2c2] font-[var(--font-mono)] text-xs uppercase tracking-widest">
                <span className="material-symbols-outlined animate-spin text-4xl mb-4">settings</span>
                Computing operational vectors...
              </div>
            )}

            {error && (
              <div className="text-[#eea01b] font-[var(--font-mono)] border border-[#eea01b]/50 bg-[#eea01b]/10 p-4">
                [ERR] {error}
              </div>
            )}

            {directive && !loading && (
              <div className="space-y-6 animate-fade-in">
                <div>
                  <h3 className="font-[var(--font-mono)] text-[#00c6a7] text-[10px] tracking-widest uppercase mb-2 block">Primary Directive</h3>
                  <div className="text-xl font-[var(--font-headline)] text-[#d7e3f8]">{directive.directive}</div>
                </div>
                
                <div>
                  <h3 className="font-[var(--font-mono)] text-[#00c6a7] text-[10px] tracking-widest uppercase mb-2 block">Execution Steps</h3>
                  <ul className="space-y-2">
                    {directive.actions.map((act, i) => (
                      <li key={i} className="flex gap-4 items-start font-[var(--font-mono)] text-xs text-[#d7e3f8]/80">
                        <span className="text-[#43e2c2] mt-0.5">[{String(i + 1).padStart(2, '0')}]</span>
                        <span className="leading-relaxed">{act}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="inline-flex gap-2 items-center bg-[#2a3645]/50 px-3 py-1.5 border border-[#3c4a45]">
                   <span className="font-[var(--font-mono)] text-[#00c6a7] text-[10px] tracking-widest uppercase">Severity Assessment:</span>
                   <span className={`font-[var(--font-headline)] text-xs font-bold uppercase ${directive.severity.toLowerCase() === 'critical' ? 'text-[#ffb4ab]' : 'text-[#ffc068]'}`}>{directive.severity}</span>
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleCommand} className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-[#43e2c2]/50 text-sm">chevron_right</span>
            </div>
            <input 
              type="text" 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="ENTER COMMAND VECTOR..." 
              className="w-full bg-[#0a121d] border border-[#43e2c2]/30 text-[#d7e3f8] font-[var(--font-mono)] text-sm px-10 py-4 focus:outline-none focus:border-[#43e2c2] transition-colors placeholder:text-[#d7e3f8]/20 tracking-widest uppercase"
              disabled={loading}
            />
            <div className="absolute inset-y-0 right-0 pr-2 flex items-center">
              <button 
                type="submit" 
                disabled={loading || !prompt.trim()}
                className="bg-[#43e2c2] text-[#0a121d] px-6 py-2 font-[var(--font-headline)] font-bold text-xs tracking-widest uppercase hover:bg-[#00c6a7] transition-colors disabled:opacity-50"
              >
                Execute
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  )
}
