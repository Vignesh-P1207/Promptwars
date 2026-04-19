export default function Footer() {
  return (
    <footer className="mt-auto bg-[#081422] flex justify-between px-8 py-3 w-full border-t border-[#d7e3f8]/10 items-center">
      <div className="flex items-center gap-8">
        <span className="font-[var(--font-mono)] text-[10px] text-[#d7e3f8]/40 tracking-widest uppercase">© 2024 VENUEFLOW INDUSTRIAL COMMAND</span>
        <div className="flex gap-4">
          <a className="font-[var(--font-mono)] text-[10px] text-[#d7e3f8]/50 uppercase tracking-widest hover:text-[#00c6a7] transition-colors" href="#">API Status</a>
          <a className="font-[var(--font-mono)] text-[10px] text-[#d7e3f8]/50 uppercase tracking-widest hover:text-[#00c6a7] transition-colors" href="#">Documentation</a>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="w-1.5 h-1.5 bg-[#43e2c2] rounded-full"></span>
        <span className="font-[var(--font-mono)] text-[10px] text-[#00c6a7] uppercase tracking-widest">Core Engine: 4.2.0-STABLE</span>
      </div>
    </footer>
  )
}
