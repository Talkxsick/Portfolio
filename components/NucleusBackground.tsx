'use client'
import { useEffect, useRef } from 'react'
import { playFormText, playScatter, playReform, startField, updateField, stopField } from '@/components/SoundEngine'

const PALETTE = [
  [180, 0,   0  ],
  [255, 200, 0  ],
  [57,  255, 20 ],
  [255, 107, 0  ],
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
  { tiltX: 0.3,  speed:  0.008, radiusX: 280, radiusY: 85,  count: 400, axisAngle: 0                },
  { tiltX: -0.3, speed: -0.006, radiusX: 265, radiusY: 100, count: 450, axisAngle: Math.PI / 3      },
  { tiltX: 0.1,  speed:  0.007, radiusX: 295, radiusY: 80,  count: 500, axisAngle: Math.PI * 2 / 3  },
]

// States: 0 = rings, 1 = text, 2 = scatter, returning to 0
type NucleusState = 0 | 1 | 2

interface Grain {
  ring:      number
  angle:     number
  speed:     number
  size:      number
  alpha:     number
  noiseSeed: number
  // Current actual position
  x: number
  y: number
  // Target position for each state
  ringX: number
  ringY: number
  textX: number
  textY: number
  // Scatter velocity
  scatterVx: number
  scatterVy: number
  scatterX:  number
  scatterY:  number
  // Transition progress 0→1
  t: number
}

// Sample pixel positions from text rendered on offscreen canvas
function getTextPositions(text: string, count: number, cx: number, cy: number): {x:number,y:number}[] {
  const offscreen = document.createElement('canvas')
  offscreen.width  = 800
  offscreen.height = 160
  const ctx = offscreen.getContext('2d')!
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 110px "Share Tech Mono", monospace'
  ctx.textAlign    = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillText(text, 400, 80)

  const data    = ctx.getImageData(0, 0, 800, 160).data
  const points: {x:number,y:number}[] = []

  // Sample every Nth pixel that is filled
  for (let py = 0; py < 160; py += 3) {
    for (let px = 0; px < 800; px += 3) {
      const idx = (py * 800 + px) * 4
      if (data[idx + 3] > 128) {
        points.push({
          x: cx + (px - 400) * 0.95,
          y: cy + (py - 80),
        })
      }
    }
  }

  // Shuffle and return exactly `count` points (repeat if needed)
  const shuffled = points.sort(() => Math.random() - 0.5)
  const result: {x:number,y:number}[] = []
  for (let i = 0; i < count; i++) {
    result.push(shuffled[i % shuffled.length])
  }
  return result
}

export default function NucleusBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const stateRef  = useRef<NucleusState>(0)
  const cursorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animId: number
    let t      = 0
    let mouseX = -999
    let mouseY = -999
    let lastMouseX = 0
    let lastMouseY = 0
    let lastTime = performance.now()
    let smoothedVelocity = 0

    const resize = () => {
      canvas.width  = window.innerWidth
      canvas.height = window.innerHeight
    }
    resize()

    const cx = () => canvas.width  / 2
    const cy = () => canvas.height / 2

    // Build grains
    const totalGrains = RING_CONFIGS.reduce((s, c) => s + c.count, 0)
    const grains: Grain[] = []

    RING_CONFIGS.forEach((cfg, ri) => {
      for (let i = 0; i < cfg.count; i++) {
        const angle = (i / cfg.count) * Math.PI * 2 + (Math.random() - 0.5) * 0.15
        grains.push({
          ring:      ri,
          angle,
          speed:     cfg.speed * (0.85 + Math.random() * 0.3),
          size:      Math.random() * 1.8 + 0.3,
          alpha:     Math.random() * 0.55 + 0.15,
          noiseSeed: Math.random() * 1000,
          x: cx(), y: cy(),
          ringX: 0, ringY: 0,
          textX: 0, textY: 0,
          scatterVx: (Math.random() - 0.5) * 6,
          scatterVy: (Math.random() - 0.5) * 6,
          scatterX:  0, scatterY: 0,
          t: 0,
        })
      }
    })

    // Precompute scatter positions
    grains.forEach(g => {
      const angle  = Math.random() * Math.PI * 2
      const radius = 300 + Math.random() * 250
      g.scatterX = cx() + Math.cos(angle) * radius
      g.scatterY = cy() + Math.sin(angle) * radius
    })

    // Compute text positions (deferred so canvas is sized)
    let textPositions: {x:number,y:number}[] = []
    const buildTextPositions = () => {
      textPositions = getTextPositions('PORTFOLIO', totalGrains, cx(), cy())
      grains.forEach((g, i) => {
        g.textX = textPositions[i].x
        g.textY = textPositions[i].y
      })
    }
    buildTextPositions()

    // Click — cycle state
    const onClick = (e: MouseEvent) => {
      const dx   = e.clientX - cx()
      const dy   = e.clientY - cy()
      const dist = Math.sqrt(dx * dx + dy * dy)
      // Only trigger on nucleus area
      if (dist > 200) return
      const topEl = document.elementFromPoint(e.clientX, e.clientY)
      if (topEl?.closest('[data-window="true"]')) return

      const prev = stateRef.current
      const next = ((prev + 1) % 3) as NucleusState
      stateRef.current = next
      if (next !== 0) {
        stopField()
      }
      // Play sound for each state transition
      try {
        if (next === 1) playFormText()
        else if (next === 2) playScatter()
        else playReform()
      } catch {}

      // Reset transition progress for all grains
      grains.forEach(g => { g.t = 0 })

      // On scatter state entry — give each grain an outward velocity burst
      if (stateRef.current === 2) {
        grains.forEach(g => {
          // Direction away from center
          const dx    = g.x - cx()
          const dy    = g.y - cy()
          const dist  = Math.sqrt(dx*dx + dy*dy) || 1
          const speed = 3 + Math.random() * 4
          g.scatterVx = (dx/dist) * speed + (Math.random()-0.5)*2
          g.scatterVy = (dy/dist) * speed + (Math.random()-0.5)*2
        })
      }
    }

    window.addEventListener('click', onClick)

    const onMouseMove = (e: MouseEvent) => {

      const now = performance.now()

      const dt = now - lastTime

      const velocity =
        Math.sqrt(
          Math.pow(e.clientX - lastMouseX, 2) +
          Math.pow(e.clientY - lastMouseY, 2)
        ) / Math.max(dt, 1)

      const boostedVelocity = velocity * 25

      smoothedVelocity = smoothedVelocity * 0.85 + boostedVelocity * 0.15
      

      lastMouseX = e.clientX
      lastMouseY = e.clientY
      lastTime = now


      mouseX = e.clientX
      mouseY = e.clientY

      const dx   = e.clientX - cx()
      const dy   = e.clientY - cy()
      const dist = Math.sqrt(dx * dx + dy * dy)

      const topEl      = document.elementFromPoint(e.clientX, e.clientY)
      const overWindow = topEl?.closest('[data-window="true"]') != null

      if (cursorRef.current) {
        if (stateRef.current === 0 && dist < 180 && !overWindow) {
          startField()
          if (smoothedVelocity > 2) {
            updateField(
              smoothedVelocity,
              dist
            )
          } else {
            stopField()
          }
        }
        else {
          stopField()
        }
      }
    }
    window.addEventListener('mousemove', onMouseMove)

    // Easing functions
    const easeOutCubic  = (x: number) => 1 - Math.pow(1 - x, 3)
    const easeInOutQuad = (x: number) => x < 0.5 ? 2*x*x : 1 - Math.pow(-2*x+2,2)/2

    function drawStar(c: CanvasRenderingContext2D, x: number, y: number, r: number) {
      c.save()
      c.translate(x, y)
      const glow = c.createRadialGradient(0,0,0,0,0,r*3.5)
      glow.addColorStop(0,   'rgba(240,240,240,0.35)')
      glow.addColorStop(0.4, 'rgba(240,240,240,0.08)')
      glow.addColorStop(1,   'transparent')
      c.beginPath(); c.arc(0,0,r*3.5,0,Math.PI*2)
      c.fillStyle = glow; c.fill()
      c.beginPath()
      for (let i = 0; i < 8; i++) {
        const a = (i * Math.PI)/4 - Math.PI/2
        const rad = i%2===0 ? r : r*0.22
        if (i===0) c.moveTo(Math.cos(a)*rad, Math.sin(a)*rad)
        else       c.lineTo(Math.cos(a)*rad, Math.sin(a)*rad)
      }
      c.closePath()
      c.fillStyle   = 'rgba(240,240,240,0.95)'
      c.shadowColor = 'rgba(255,255,255,0.9)'
      c.shadowBlur  = 18
      c.fill()
      c.shadowBlur = 0
      c.restore()
    }

    const TRANSITION_SPEED = 0.035 // snappy but smooth

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const col   = getColor(t * 0.0004)
      const state = stateRef.current

      grains.forEach(g => {
        // Always update ring position (keeps orbiting in background)
        g.angle += g.speed
        const cfg  = RING_CONFIGS[g.ring]
        const cosA = Math.cos(cfg.axisAngle + t * 0.0005)
        const sinA = Math.sin(cfg.axisAngle + t * 0.0005)
        const lx   = Math.cos(g.angle) * cfg.radiusX
        const ly   = Math.sin(g.angle) * cfg.radiusY
        const n    = Math.sin(g.noiseSeed + t * 0.008) * 3
        g.ringX    = cx() + lx*cosA - ly*sinA*cfg.tiltX + n
        g.ringY    = cy() + lx*sinA*0.3 + ly*Math.cos(cfg.tiltX) + n*0.5

        // Advance transition
        g.t = Math.min(1, g.t + TRANSITION_SPEED)
        const ease = easeOutCubic(g.t)

        // Determine target based on state
        let targetX: number, targetY: number
        if (state === 0) {
          targetX = g.ringX; targetY = g.ringY
        } else if (state === 1) {
          targetX = g.textX; targetY = g.textY
        } else {
          targetX = g.scatterX; targetY = g.scatterY
        }

        if (state === 2) {
          // Scatter state — particles drift freely with velocity, wrap around edges
          g.x += g.scatterVx
          g.y += g.scatterVy

          // Slow down gradually
          g.scatterVx *= 0.992
          g.scatterVy *= 0.992

          // Add small random drift to keep them alive
          g.scatterVx += (Math.random() - 0.5) * 0.08
          g.scatterVy += (Math.random() - 0.5) * 0.08

          // Wrap around screen edges
          if (g.x < 0) g.x = canvas.width
          if (g.x > canvas.width)  g.x = 0
          if (g.y < 0) g.y = canvas.height
          if (g.y > canvas.height) g.y = 0

          // Mouse repulsion
          const dx   = g.x - mouseX
          const dy   = g.y - mouseY
          const dist = Math.sqrt(dx*dx + dy*dy)
          if (dist < 90 && dist > 0) {
            const f = (90-dist)/90*18
            g.x += (dx/dist)*f
            g.y += (dy/dist)*f
          }
        } else {
          // Ring or text state — lerp toward target
          g.x += (targetX - g.x) * (TRANSITION_SPEED * 2.5)
          g.y += (targetY - g.y) * (TRANSITION_SPEED * 2.5)

          // Mouse repulsion in ring state
          if (state === 0) {
            const dx   = g.x - mouseX
            const dy   = g.y - mouseY
            const dist = Math.sqrt(dx*dx + dy*dy)
            if (dist < 90 && dist > 0) {
              const f = (90-dist)/90*18
              g.x += (dx/dist)*f
              g.y += (dy/dist)*f
            }
          }
        }

        // Alpha — text state makes particles brighter
        const depth = state === 1
          ? 0.85
          : 0.35 + 0.65*((Math.sin(g.angle)+1)/2)
        const alpha = g.alpha * depth

        // Color — text state uses warm white/yellow
        let r = col[0], gr = col[1], b = col[2]
        if (state === 1) {
          // Blend toward warm white for text readability
          r = Math.round(r + (255-r)*0.6)
          gr = Math.round(gr + (220-gr)*0.4)
          b = Math.round(b + (180-b)*0.3)
        }

        ctx.beginPath()
        ctx.arc(g.x, g.y, state === 1 ? g.size * 1.2 : g.size, 0, Math.PI*2)
        ctx.fillStyle = `rgba(${r},${gr},${b},${alpha})`
        ctx.fill()

        // Glow on bright particles
        if (g.alpha > 0.55 && depth > 0.6) {
          const glowR = ctx.createRadialGradient(g.x,g.y,0,g.x,g.y,g.size*3)
          glowR.addColorStop(0,   `rgba(${r},${gr},${b},${alpha*0.25})`)
          glowR.addColorStop(1,   'transparent')
          ctx.beginPath(); ctx.arc(g.x,g.y,g.size*3,0,Math.PI*2)
          ctx.fillStyle = glowR; ctx.fill()
        }
      })

      // Star — always visible, moves up behind "F" in text state
      {
        const starSize = (28 + Math.sin(t*0.04)*3) * (state === 2 ? 0.6 : 1)
        // In text state: move star up and slightly left (behind the "F" in PORTFOLIO)
        // "F" is roughly at -120px horizontally, -55px vertically from center
        const starTargetX = state === 1 ? cx() - 118 : cx()
        const starTargetY = state === 1 ? cy() - 52  : cy()
        // Smooth lerp star position
        if (!('_starX' in canvas)) {
          (canvas as any)._starX = cx();
          (canvas as any)._starY = cy();
        }
        ;(canvas as any)._starX += (starTargetX - (canvas as any)._starX) * 0.04
        ;(canvas as any)._starY += (starTargetY - (canvas as any)._starY) * 0.04
        drawStar(ctx, (canvas as any)._starX, (canvas as any)._starY, starSize)
      }

      // Ambient glow
      const ambient = ctx.createRadialGradient(cx(),cy(),200,cx(),cy(),420)
      ambient.addColorStop(0,   `rgba(${col[0]},${col[1]},${col[2]},0.04)`)
      ambient.addColorStop(1,   'transparent')
      ctx.beginPath(); ctx.arc(cx(),cy(),420,0,Math.PI*2)
      ctx.fillStyle = ambient; ctx.fill()

      // State hint text at bottom of nucleus
      if (state === 1) {
        ctx.save()
        ctx.font      = '9px "Share Tech Mono", monospace'
        ctx.fillStyle = 'rgba(255,200,0,0.4)'
        ctx.textAlign = 'center'
        ctx.fillText('[ CLICK TO SCATTER ]', cx(), cy() + 140)
        ctx.restore()
      } else if (state === 2) {
        ctx.save()
        ctx.font      = '9px "Share Tech Mono", monospace'
        ctx.fillStyle = 'rgba(255,107,0,0.4)'
        ctx.textAlign = 'center'
        ctx.fillText('[ CLICK TO REFORM ]', cx(), cy() + 20)
        ctx.restore()
      }

      t++
      animId = requestAnimationFrame(draw)
    }

    draw()

    window.addEventListener('resize', () => { resize(); buildTextPositions() })
    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('click',     onClick)
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('resize',    resize)
    }
  }, [])

  return (
    <>
      <canvas
        ref={canvasRef}
        style={{
          position: 'fixed', inset: 0,
          width: '100%', height: '100%',
          zIndex: 0, pointerEvents: 'none',
        }}
      />
      {/* Custom crosshair */}
      <div
        ref={cursorRef}
        style={{
          position: 'fixed',
          width: 20, height: 20,
          border: '1px solid rgba(255,255,255,0.5)',
          pointerEvents: 'none',
          zIndex: 9998, opacity: 0,
          transform: 'translate(-50%, -50%)',
          transition: 'border-color 0.15s, opacity 0.1s',
        }}
      >
        <div style={{ position:'absolute', top:'50%', left:-6, right:-6, height:1, background:'currentColor', opacity:0.5 }} />
        <div style={{ position:'absolute', left:'50%', top:-6, bottom:-6, width:1, background:'currentColor', opacity:0.5 }} />
        <div style={{ position:'absolute', top:'50%', left:'50%', width:3, height:3, background:'currentColor', transform:'translate(-50%,-50%)', borderRadius:'50%' }} />
      </div>
    </>
  )
}