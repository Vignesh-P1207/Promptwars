import { useEffect, useRef } from 'react'

export default function AIVisionFeed() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number
    const rect = canvas.parentElement?.getBoundingClientRect()
    if (!rect) return
    canvas.width = rect.width
    canvas.height = rect.height
    const w = canvas.width
    const h = canvas.height

    const targets = Array.from({ length: 7 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 1.5,
      vy: (Math.random() - 0.5) * 1.5,
      conf: 75 + Math.random() * 24,
      boxW: 30 + Math.random() * 20,
      boxH: 60 + Math.random() * 30,
      c: Math.random() > 0.8 ? '#ffc068' : '#00c6a7'
    }))

    let frame = 0

    const loop = () => {
      // Clear with slight trailing for CCTV feel
      ctx.fillStyle = 'rgba(8, 20, 34, 0.4)' // #081422
      ctx.fillRect(0, 0, w, h)
      frame++

      // Draw faint dot grid pattern
      if (frame % 2 === 0) {
        ctx.fillStyle = 'rgba(67, 226, 194, 0.05)'
        for(let i=0; i<w; i+=15) {
          for(let j=0; j<h; j+=15) {
            ctx.fillRect(i, j, 1, 1)
          }
        }
      }

      // Draw scanning beam
      const scanY = (frame * 2) % h
      ctx.fillStyle = 'rgba(67, 226, 194, 0.1)'
      ctx.fillRect(0, scanY, w, 4)

      targets.forEach(t => {
        t.x += t.vx
        t.y += t.vy

        // Wrap around
        if (t.x < -100) t.x = w + 50
        if (t.x > w + 100) t.x = -50
        if (t.y < -100) t.y = h + 50
        if (t.y > h + 100) t.y = -50

        // AI Bounding Box
        ctx.strokeStyle = t.c
        ctx.lineWidth = 1.5
        ctx.strokeRect(t.x, t.y, t.boxW, t.boxH)

        // Crosshairs / Corners
        ctx.beginPath()
        ctx.moveTo(t.x, t.y + 10); ctx.lineTo(t.x, t.y); ctx.lineTo(t.x + 10, t.y) // Top left
        ctx.moveTo(t.x + t.boxW, t.y + 10); ctx.lineTo(t.x + t.boxW, t.y); ctx.lineTo(t.x + t.boxW - 10, t.y) // Top right
        ctx.moveTo(t.x, t.y + t.boxH - 10); ctx.lineTo(t.x, t.y + t.boxH); ctx.lineTo(t.x + 10, t.y + t.boxH) // Bot left
        ctx.moveTo(t.x + t.boxW, t.y + t.boxH - 10); ctx.lineTo(t.x + t.boxW, t.y + t.boxH); ctx.lineTo(t.x + t.boxW - 10, t.y + t.boxH) // Bot right
        ctx.stroke()

        // Label
        ctx.fillStyle = t.c
        ctx.fillRect(t.x, t.y - 14, 85, 14)
        ctx.fillStyle = '#081422'
        ctx.font = '9px "JetBrains Mono", monospace'
        ctx.fillText(`HUMAN ${t.conf.toFixed(1)}%`, t.x + 2, t.y - 4)

        // Trajectory line
        ctx.strokeStyle = `${t.c}40` // Add opacity
        ctx.beginPath()
        ctx.moveTo(t.x + t.boxW/2, t.y + t.boxH/2)
        ctx.lineTo(t.x + t.boxW/2 + t.vx * 20, t.y + t.boxH/2 + t.vy * 20)
        ctx.stroke()
      })

      // Static UI on the feed
      ctx.fillStyle = '#43e2c2'
      ctx.font = '10px "JetBrains Mono", monospace'
      ctx.fillText('CAM_04_FEED // MULTI-OBJECT TRACKING', 10, 20)
      ctx.fillText(`FOV: 120° | FPS: ${Math.floor(55 + Math.random() * 5)}`, 10, 35)

      // Timecode
      const d = new Date()
      const ms = d.getMilliseconds().toString().padStart(3, '0')
      ctx.fillText(`REC • ${d.toLocaleTimeString()}.${ms}`, w - 140, 20)
      // Red dot
      if (Math.floor(frame / 30) % 2 === 0) {
        ctx.fillStyle = '#ffb4ab'
        ctx.beginPath()
        ctx.arc(w - 150, 16, 3, 0, Math.PI*2)
        ctx.fill()
      }

      animationFrameId = requestAnimationFrame(loop)
    }

    loop()
    return () => cancelAnimationFrame(animationFrameId)
  }, [])

  return (
    <div className="absolute inset-0 z-0 border border-[#3c4a45]/20 bg-[#081422]">
      <canvas ref={canvasRef} className="w-full h-full block" />
    </div>
  )
}
