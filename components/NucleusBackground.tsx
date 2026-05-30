'use client'
import { useEffect, useRef } from 'react'

const PALETTE = [
  [180, 0,   0  ],
  [255, 200, 0  ],
  [57,  255, 20 ],
  [124, 58,  237],
  [240, 240, 240],
]

function lerpColor(a: number[], b: number[], t: number) {
  return a.map((v, i) => Math.round(v + (b[i] - v) * t))
}

function getColor(t: number): number[] {
  const scaled = (t % PALETTE.length)
  const idx    = Math.floor(scaled)
  const frac   = scaled - idx
  return lerpColor(PALETTE[idx % PALETTE.length], PALETTE[(idx + 1) % PALETTE.length], frac)
}

const RING_CONFIGS = [
  { tiltX: 0.3,  tiltY: 0.0,  speed:  0.008, radiusX: 280, radiusY: 85,  count: 380, axisAngle: 0                },
  { tiltX: -0.3, tiltY: 0.4,  speed: -0.006, radiusX: 265, radiusY: 100, count: 360, axisAngle: Math.PI / 3      },
  { tiltX: 0.1,  tiltY: -0.5, speed:  0.007, radiusX: 295, radiusY: 80,  count: 400, axisAngle: Math.PI * 2 / 3  },
]

interface Grain {
  ring:      number
  angle:     number
  speed:     number
  size:      number
  alpha:     number
  noiseSeed: number
  disint:    number   // 0 = normal, 1 = fully scattered
  disintVx:  number
  disintVy:  number
}

export default function NucleusBackground() {
  const canvasRef    = useRef<HTMLCanvasElement>(null)
  const disintRef    = useRef(false)
  const cursorRef    = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const rawCtx = canvas.getContext('2d')
    if (!rawCtx) return
    const ctx: CanvasRenderingContext2D = rawCtx

    let animId: number
    let t      = 0
    let mouseX = -999
    let mouseY = -999

    const resize = () => {
      canvas.width  = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()

    // Create grains
    const grains: Grain[] = []
    RING_CONFIGS.forEach((cfg, ri) => {
      for (let i = 0; i < cfg.count; i++) {
        grains.push({
          ring:      ri,
          angle:     (i / cfg.count) * Math.PI * 2 + (Math.random() - 0.5) * 0.15,
          speed:     cfg.speed * (0.85 + Math.random() * 0.3),
          size:      Math.random() * 1.8 + 0.3,
          alpha:     Math.random() * 0.55 + 0.15,
          noiseSeed: Math.random() * 1000,
          disint:    0,
          // Each grain has its own scatter direction so it looks organic
          disintVx:  (Math.random() - 0.5) * 5,
          disintVy:  (Math.random() - 0.5) * 5,
        })
      }
    })

    // Click handler — toggle disintegration
    const onClick = (e: MouseEvent) => {
      const cx = canvas.width  / 2
      const cy = canvas.height / 2
      const dx = e.clientX - cx
      const dy = e.clientY - cy
      // Only trigger when clicking directly on the star (within 35px)
      if (Math.sqrt(dx * dx + dy * dy) < 35) {
        disintRef.current = !disintRef.current
      }
    }

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX
      mouseY = e.clientY

      const cx   = canvas.width  / 2
      const cy   = canvas.height / 2
      const dx   = e.clientX - cx
      const dy   = e.clientY - cy
      const dist = Math.sqrt(dx * dx + dy * dy)

      // Show crosshair cursor when hovering over star or rings (within 320px)
      if (cursorRef.current) {
        if (dist < 320) {
          cursorRef.current.style.opacity  = '1'
          cursorRef.current.style.left     = `${e.clientX}px`
          cursorRef.current.style.top      = `${e.clientY}px`
          // Turn red when hovering directly over star
          cursorRef.current.style.borderColor = dist < 35 ? '#ff4444' : 'rgba(255,255,255,0.5)'
        } else {
          cursorRef.current.style.opacity = '0'
        }
      }
    }
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('click', onClick)

    function drawStar(x: number, y: number, r: number) {
      ctx.save()
      ctx.translate(x, y)

      // Glow
      const glow = ctx.createRadialGradient(0, 0, 0, 0, 0, r * 3.5)
      glow.addColorStop(0,   'rgba(240,240,240,0.35)')
      glow.addColorStop(0.4, 'rgba(240,240,240,0.08)')
      glow.addColorStop(1,   'transparent')
      ctx.beginPath()
      ctx.arc(0, 0, r * 3.5, 0, Math.PI * 2)
      ctx.fillStyle = glow
      ctx.fill()

      // 4-pointed star
      ctx.beginPath()
      for (let i = 0; i < 8; i++) {
        const angle = (i * Math.PI) / 4 - Math.PI / 2
        const rad   = i % 2 === 0 ? r : r * 0.22
        if (i === 0) ctx.moveTo(Math.cos(angle) * rad, Math.sin(angle) * rad)
        else         ctx.lineTo(Math.cos(angle) * rad, Math.sin(angle) * rad)
      }
      ctx.closePath()
      ctx.fillStyle   = 'rgba(240,240,240,0.95)'
      ctx.shadowColor = 'rgba(255,255,255,0.9)'
      ctx.shadowBlur  = 18
      ctx.fill()
      ctx.shadowBlur  = 0
      ctx.restore()
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const cx  = canvas.width  / 2
      const cy  = canvas.height / 2
      const col = getColor(t * 0.0004)
      const isDisint = disintRef.current

      grains.forEach(g => {
        g.angle += g.speed

        const cfg = RING_CONFIGS[g.ring]

        const cosA  = Math.cos(cfg.axisAngle + t * 0.0005)
        const sinA  = Math.sin(cfg.axisAngle + t * 0.0005)
        const localX = Math.cos(g.angle) * cfg.radiusX
        const localY = Math.sin(g.angle) * cfg.radiusY

        let x = cx + localX * cosA - localY * sinA * cfg.tiltX
        let y = cy + localX * sinA * 0.3 + localY * Math.cos(cfg.tiltX)

        const n = Math.sin(g.noiseSeed + t * 0.008) * 3
        x += n
        y += n * 0.5

        // Snappy disintegration — fast lerp rate
        // 0.06 = scatter fast, 0.04 = return slightly slower (feels natural)
        if (isDisint) {
          g.disint = Math.min(1, g.disint + 0.06)
        } else {
          g.disint = Math.max(0, g.disint - 0.04)
        }

        // Apply scatter displacement — scales with disint value
        // Using easeOut curve (sqrt) so it starts fast and slows as it reaches max
        const ease = Math.sqrt(g.disint)
        x += g.disintVx * ease * 120
        y += g.disintVy * ease * 80

        // Mouse repulsion
        const dx   = x - mouseX
        const dy   = y - mouseY
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 90 && dist > 0) {
          const f = (90 - dist) / 90 * 18
          x += (dx / dist) * f
          y += (dy / dist) * f
        }

        // Depth alpha
        const depth      = 0.35 + 0.65 * ((Math.sin(g.angle) + 1) / 2)
        // Fade out more at full scatter
        const scatterFade = 1 - g.disint * 0.5
        const alpha      = g.alpha * depth * scatterFade

        ctx.beginPath()
        ctx.arc(x, y, g.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${col[0]},${col[1]},${col[2]},${alpha})`
        ctx.fill()

        if (g.alpha > 0.55 && depth > 0.7) {
          const gr = ctx.createRadialGradient(x, y, 0, x, y, g.size * 3)
          gr.addColorStop(0,   `rgba(${col[0]},${col[1]},${col[2]},${alpha * 0.25})`)
          gr.addColorStop(1,   'transparent')
          ctx.beginPath()
          ctx.arc(x, y, g.size * 3, 0, Math.PI * 2)
          ctx.fillStyle = gr
          ctx.fill()
        }
      })

      // North star — shrinks slightly when scattered
      const starSize  = (28 + Math.sin(t * 0.04) * 3) * (isDisint ? 0.7 : 1)
      drawStar(cx, cy, starSize)

      // Ambient glow
      const ambient = ctx.createRadialGradient(cx, cy, 200, cx, cy, 420)
      ambient.addColorStop(0,   `rgba(${col[0]},${col[1]},${col[2]},0.04)`)
      ambient.addColorStop(1,   'transparent')
      ctx.beginPath()
      ctx.arc(cx, cy, 420, 0, Math.PI * 2)
      ctx.fillStyle = ambient
      ctx.fill()

      t++
      animId = requestAnimationFrame(draw)
    }

    draw()

    window.addEventListener('resize', resize)
    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize',    resize)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('click',     onClick)
    }
  }, [])

  return (
    <>
      <canvas
        ref={canvasRef}
        style={{
          position: 'fixed', inset: 0,
          width: '100%', height: '100%',
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />
      {/* Custom crosshair cursor — only visible near nucleus */}
      <div
        ref={cursorRef}
        style={{
          position: 'fixed',
          width: 20, height: 20,
          border: '1px solid rgba(255,255,255,0.5)',
          borderRadius: 0,
          pointerEvents: 'none',
          zIndex: 9998,
          opacity: 0,
          transform: 'translate(-50%, -50%)',
          transition: 'border-color 0.15s, opacity 0.1s',
        }}
      >
        {/* Crosshair lines */}
        <div style={{ position: 'absolute', top: '50%', left: -6, right: -6, height: 1, background: 'currentColor', opacity: 0.5 }} />
        <div style={{ position: 'absolute', left: '50%', top: -6, bottom: -6, width: 1, background: 'currentColor', opacity: 0.5 }} />
        {/* Center dot */}
        <div style={{ position: 'absolute', top: '50%', left: '50%', width: 3, height: 3, background: 'currentColor', transform: 'translate(-50%,-50%)', borderRadius: '50%' }} />
      </div>
    </>
  )
}