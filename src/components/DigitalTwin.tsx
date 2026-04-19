import { useEffect, useRef } from 'react'
import { getZones } from '../api'

export default function DigitalTwin({ evacMode }: { evacMode?: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const gatesRef = useRef<any>({ north: true, south: true, east: true, west: true })
  const evacRef = useRef(evacMode)

  useEffect(() => { evacRef.current = evacMode }, [evacMode])

  useEffect(() => {
    const loadGates = async () => {
      try {
        const z = await getZones()
        if (z[0]) gatesRef.current.north = !!z[0].gate_open
        if (z[1]) gatesRef.current.east = !!z[1].gate_open
        if (z[3]) gatesRef.current.west = !!z[3].gate_open
        if (z[4]) gatesRef.current.south = !!z[4].gate_open
      } catch (e) {}
    }
    loadGates()
    const iv = setInterval(loadGates, 3000)
    return () => clearInterval(iv)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d', { alpha: false })
    if (!ctx) return

    let aId: number

    const resize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect()
      if (rect) {
        canvas.width = rect.width
        canvas.height = rect.height
      }
    }
    resize()
    window.addEventListener('resize', resize)

    const SPACE = 1000
    const cx = SPACE/2
    const cy = SPACE/2

    const toS = (x: number, y: number, z: number = 0, angle: number = 0) => {
      const dx = x - cx
      const dy = y - cy
      const cosA = Math.cos(angle)
      const sinA = Math.sin(angle)
      const rx = cx + (dx * cosA - dy * sinA)
      const ry = cy + (dx * sinA + dy * cosA)

      const scale = Math.min(canvas.width, canvas.height) / 1400
      const offX = canvas.width / 2
      const offY = canvas.height / 2 - (150 * scale)

      const ix = (rx - ry) * Math.cos(Math.PI/6)
      const iy = (rx + ry) * Math.sin(Math.PI/6) - z

      return { x: offX + ix * scale, y: offY + iy * scale, s: scale, depth: rx + ry }
    }

    const drawIsoCube = (x: number, y: number, w: number, h: number, zH: number, color: string, alpha: number, angle: number) => {
      const p1 = toS(x, y, 0, angle)
      const p2 = toS(x+w, y, 0, angle)
      const p3 = toS(x+w, y+h, 0, angle)
      const p4 = toS(x, y+h, 0, angle)

      const t1 = toS(x, y, zH, angle)
      const t2 = toS(x+w, y, zH, angle)
      const t3 = toS(x+w, y+h, zH, angle)
      const t4 = toS(x, y+h, zH, angle)

      ctx.globalAlpha = alpha

      ctx.fillStyle = color
      ctx.filter = 'brightness(0.6)'
      ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p4.x, p4.y); ctx.lineTo(t4.x, t4.y); ctx.lineTo(t1.x, t1.y); ctx.fill()
      
      ctx.filter = 'brightness(0.8)'
      ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.lineTo(t2.x, t2.y); ctx.lineTo(t1.x, t1.y); ctx.fill()

      ctx.filter = 'brightness(1.2)'
      ctx.beginPath(); ctx.moveTo(t1.x, t1.y); ctx.lineTo(t2.x, t2.y); ctx.lineTo(t3.x, t3.y); ctx.lineTo(t4.x, t4.y); ctx.fill()

      ctx.filter = 'none'
      ctx.globalAlpha = alpha + 0.3
      ctx.strokeStyle = color
      ctx.lineWidth = 1
      ctx.beginPath(); ctx.moveTo(t1.x, t1.y); ctx.lineTo(t2.x, t2.y); ctx.lineTo(t3.x, t3.y); ctx.lineTo(t4.x, t4.y); ctx.closePath(); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(p4.x, p4.y); ctx.lineTo(t4.x, t4.y); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(p2.x, p2.y); ctx.lineTo(t2.x, t2.y); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(t1.x, t1.y); ctx.stroke();

      ctx.globalAlpha = 1.0
    }

    const walls = [
      { x: 100, y: 100, w: 300, h: 20 },
      { x: 600, y: 100, w: 300, h: 20 },
      { x: 100, y: 880, w: 300, h: 20 },
      { x: 600, y: 880, w: 300, h: 20 },
      { x: 100, y: 100, w: 20, h: 300 },
      { x: 100, y: 600, w: 20, h: 300 },
      { x: 880, y: 100, w: 20, h: 300 },
      { x: 880, y: 600, w: 20, h: 300 },
    ]

    const P_COUNT = 400
    const particles = Array.from({length: P_COUNT}).map(() => ({
      x: cx + (Math.random()-0.5)*800,
      y: cy + (Math.random()-0.5)*800,
      vx: (Math.random()-0.5), vy: (Math.random()-0.5),
      target: Math.floor(Math.random()*4),
      hubTime: Math.random()*200,
      state: 'HUB'
    }))

    const loop = () => {
      ctx.fillStyle = evacRef.current ? '#1c0808' : '#081422'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      const timeAngle = Date.now() * 0.0003

      ctx.strokeStyle = evacRef.current ? 'rgba(255, 180, 171, 0.3)' : 'rgba(67, 226, 194, 0.15)'
      ctx.lineWidth = 1
      ctx.beginPath()
      for(let i=0; i<=SPACE; i+=50) {
        let pA = toS(i, 0, 0, timeAngle), pB = toS(i, SPACE, 0, timeAngle)
        ctx.moveTo(pA.x, pA.y); ctx.lineTo(pB.x, pB.y)
        pA = toS(0, i, 0, timeAngle); pB = toS(SPACE, i, 0, timeAngle)
        ctx.moveTo(pA.x, pA.y); ctx.lineTo(pB.x, pB.y)
      }
      ctx.stroke()

      const gates = gatesRef.current
      const dynamicGates = [
        { open: evacRef.current || gates.north, x: 400, y: 100, w: 200, h: 20, dir:'N' },
        { open: evacRef.current || gates.south, x: 400, y: 880, w: 200, h: 20, dir:'S' },
        { open: evacRef.current || gates.west,  x: 100, y: 400, w: 20, h: 200, dir:'W' },
        { open: evacRef.current || gates.east,  x: 880, y: 400, w: 20, h: 200, dir:'E' },
      ]

      const allObstacles = [...walls]
      dynamicGates.forEach(g => { if (!g.open) allObstacles.push(g) })

      particles.forEach(p => {
        let tx = cx, ty = cy;
        
        if (evacRef.current) {
          p.state = 'EVACUATING'
          let px = p.x - cx; let py = p.y - cy;
          let pdist = Math.sqrt(px*px + py*py) || 1
          tx = p.x + (px/pdist)*2000
          ty = p.y + (py/pdist)*2000
          
          let dx = tx - p.x; let dy = ty - p.y; let dist = Math.sqrt(dx*dx + dy*dy)||1
          p.vx += (dx/dist) * 0.8
          p.vy += (dy/dist) * 0.8
        } else {
          if (p.state === 'HUB') {
            p.hubTime--
            if (p.hubTime <= 0) { p.state = 'EXIT'; p.target = Math.floor(Math.random()*4) }
            tx = cx + Math.sin(Date.now()*0.001 + p.x)*200
            ty = cy + Math.cos(Date.now()*0.001 + p.y)*200
          } else {
            if (p.target === 0) { tx = cx; ty = -200 }
            if (p.target === 1) { tx = SPACE+200; ty = cx }
            if (p.target === 2) { tx = cx; ty = SPACE+200 }
            if (p.target === 3) { tx = -200; ty = cx }
  
            if (p.x < -100 || p.x > SPACE+100 || p.y < -100 || p.y > SPACE+100) {
              p.state = 'HUB'; p.hubTime = 100 + Math.random()*200
              p.x = cx + (Math.random()-0.5)*200; p.y = cy + (Math.random()-0.5)*200
            }
          }
          let dx = tx - p.x; let dy = ty - p.y; let dist = Math.sqrt(dx*dx + dy*dy)||1
          p.vx += (dx/dist) * 0.1
          p.vy += (dy/dist) * 0.1
        }

        allObstacles.forEach(o => {
          let ox = o.x + o.w/2, oy = o.y + o.h/2
          let cdx = p.x - ox, cdy = p.y - oy
          if (Math.abs(cdx) < o.w/2+15 && Math.abs(cdy) < o.h/2+15) {
            p.vx += cdx * 0.01; p.vy += cdy * 0.01;
          }
        })

        p.vx *= 0.92; p.vy *= 0.92
        p.x += p.vx; p.y += p.vy
      })

      const renderStack: any[] = []

      walls.forEach(w => renderStack.push({ type: 'WALL', yDepth: toS(w.x+w.w/2, w.y+w.h/2, 0, timeAngle).depth, ...w }))
      
      dynamicGates.forEach(g => {
        if (!g.open) renderStack.push({ type: 'GATE_CLOSED', yDepth: toS(g.x+g.w/2, g.y+g.h/2, 0, timeAngle).depth, ...g })
        else renderStack.push({ type: 'GATE_OPEN', yDepth: toS(g.x+g.w/2, g.y+g.h/2, 0, timeAngle).depth, ...g })
      })

      particles.forEach(p => {
        let speed = Math.sqrt(p.vx*p.vx + p.vy*p.vy)
        renderStack.push({ type: 'PARTICLE', yDepth: toS(p.x, p.y, 0, timeAngle).depth, p, speed })
      })

      renderStack.sort((a,b) => a.yDepth - b.yDepth)

      renderStack.forEach(item => {
        if (item.type === 'WALL') {
          drawIsoCube(item.x, item.y, item.w, item.h, 60, evacRef.current ? '#ffb4ab' : '#00c6a7', 0.2, timeAngle)
        } else if (item.type === 'GATE_CLOSED') {
          drawIsoCube(item.x, item.y, item.w, item.h, 80, '#ffb4ab', 0.8, timeAngle)
        } else if (item.type === 'PARTICLE') {
          const p = item.p
          const spos = toS(p.x, p.y, 5, timeAngle)
          const shadow = toS(p.x, p.y, 0, timeAngle)
          const s = item.speed

          const isStuck = s < 0.2 && p.state === 'EXIT'
          const cMain = evacRef.current ? '#ffb4ab' : (isStuck ? '#ffb4ab' : (s < 0.5 ? '#ffc068' : '#43e2c2'))

          ctx.fillStyle = 'rgba(0,0,0,0.5)'
          ctx.beginPath(); ctx.ellipse(shadow.x, shadow.y, 3*spos.s, 1.5*spos.s, 0, 0, Math.PI*2); ctx.fill()

          ctx.fillStyle = cMain
          ctx.beginPath(); ctx.arc(spos.x, spos.y, 1.8 * spos.s, 0, Math.PI*2); ctx.fill()

          ctx.strokeStyle = cMain
          ctx.globalAlpha = 0.3
          ctx.lineWidth = 1 * spos.s
          ctx.beginPath(); ctx.moveTo(shadow.x, shadow.y); ctx.lineTo(spos.x, spos.y); ctx.stroke()
          ctx.globalAlpha = 1.0

        } else if (item.type === 'GATE_OPEN') {
          const p1 = toS(item.x, item.y, 0, timeAngle)
          const p2 = toS(item.x+item.w, item.y+item.h, 0, timeAngle)
          ctx.strokeStyle = evacRef.current ? '#ffb4ab' : '#43e2c2'
          ctx.lineWidth = 2
          ctx.setLineDash([5, 5])
          ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.stroke()
          ctx.setLineDash([])
        }
      })

      if (evacRef.current) {
        // Draw massive radial arrows on the floor!
        ctx.strokeStyle = 'rgba(255, 180, 171, 0.4)'
        ctx.lineWidth = 8
        const rLen = 150 + Math.sin(Date.now() * 0.01)*50 // animating pulse magnitude
        ;[0, 1, 2, 3].forEach(dir => {
           let ax = cx, ay = cy
           if(dir===0) ay -= rLen
           if(dir===1) ax += rLen
           if(dir===2) ay += rLen
           if(dir===3) ax -= rLen

           const cp = toS(cx, cy, 0, timeAngle)
           const ap = toS(ax, ay, 0, timeAngle)
           ctx.beginPath()
           ctx.moveTo(cp.x, cp.y)
           ctx.lineTo(ap.x, ap.y)
           ctx.stroke()
        })
      }

      ctx.fillStyle = evacRef.current ? '#ffb4ab' : '#43e2c2'
      ctx.font = 'bold 12px "JetBrains Mono", monospace'
      ctx.fillText(evacRef.current ? `EVACUATION PROTOCOL ACTIVE. RADIAL DISPERSAL.` : `ROTATING ISO ENGINE: ONLINE // TARGETS: ${P_COUNT}`, 20, 30)

      aId = requestAnimationFrame(loop)
    }

    loop()
    return () => { cancelAnimationFrame(aId); window.removeEventListener('resize', resize) }
  }, [])

  return (
    <div className={`absolute inset-0 z-0 border overflow-hidden ${evacMode ? 'border-[#ffb4ab]/30 bg-gradient-to-b from-[#1c0808] to-[#0a0303]' : 'border-[#3c4a45]/20 bg-gradient-to-b from-[#030f1d] to-[#081422]'}`}>
      <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: `radial-gradient(circle at center, transparent 30%, ${evacMode ? '#0a0303' : '#030f1d'} 90%)` }}></div>
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  )
}
