'use client'
import { useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useWindowStore, AppName } from '@/store/windowStore'


interface WindowProps {
  id: AppName
  title: string
  icon: string
  num: string
  width?: number
  height?: number
  children: React.ReactNode
}

export default function Window({
  id, title, num,
  width = 620, height = 440,
  children
}: WindowProps) {
  const closeWindow    = useWindowStore(s => s.closeWindow)
  const minimizeWindow = useWindowStore(s => s.minimizeWindow)
  const focusWindow    = useWindowStore(s => s.focusWindow)
  const setPosition    = useWindowStore(s => s.setPosition)
  const win            = useWindowStore(s => s.windows[id])
  const windowRef      = useRef<HTMLDivElement>(null)
  const dragOffset     = useRef({ x: 0, y: 0 })

  const onTitleBarMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).tagName === 'BUTTON') return
    e.preventDefault()
    const el = windowRef.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    dragOffset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top }
    const onMouseMove = (e: MouseEvent) => {
      el.style.left = `${e.clientX - dragOffset.current.x}px`
      el.style.top  = `${e.clientY - dragOffset.current.y}px`
    }
    const onMouseUp = () => {
      const rect = el.getBoundingClientRect()
      setPosition(id, { x: rect.left, y: rect.top })
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup',   onMouseUp)
    }
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup',   onMouseUp)
  }, [id, setPosition])

  if (!win.isOpen || win.isMinimized) return null

  return (
    <AnimatePresence>
      <motion.div
        ref={windowRef}
        key={id}
        initial={{ opacity: 0, scale: 0.96, y: 12 }}
        animate={{ opacity: 1, scale: 1,    y: 0  }}
        exit={{    opacity: 0, scale: 0.96, y: 12  }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        onMouseDown={() => focusWindow(id)}
        style={{
          position: 'absolute',
          left: win.position.x,
          top:  win.position.y,
          width,
          zIndex: win.zIndex,
        }}
      >
        {/* Outer container — sharp corners, no border radius */}
        <div style={{
          height,
          display: 'flex',
          flexDirection: 'column',
          background: 'rgba(6, 6, 10, 0.82)',
          backdropFilter: 'blur(28px) saturate(160%)',
          WebkitBackdropFilter: 'blur(28px) saturate(160%)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 0,
          overflow: 'hidden',
          position: 'relative',
          // Subtle CRT inner glow
          boxShadow: 'inset 0 0 80px rgba(124,58,237,0.04), 0 30px 80px rgba(0,0,0,0.7)',
        }}>

          {/* TOP accent line — purple, full width */}
          <div style={{
            height: 2, flexShrink: 0,
            background: 'linear-gradient(90deg, #7c3aed, rgba(124,58,237,0.2), transparent)',
          }} />

          {/* Corner markers — ✕ style at all 4 corners */}
          {[
            { top: 6,    left: 6,    },
            { top: 6,    right: 6,   },
            { bottom: 6, left: 6,    },
            { bottom: 6, right: 6,   },
          ].map((pos, i) => (
            <div key={i} style={{
              position: 'absolute', ...pos,
              width: 10, height: 10,
              pointerEvents: 'none', zIndex: 2,
            }}>
              {/* Two lines forming + */}
              <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 1, background: '#7c3aed', opacity: 0.6 }} />
              <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 1, background: '#7c3aed', opacity: 0.6 }} />
            </div>
          ))}

          {/* Dot grid texture overlay */}
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0, opacity: 0.3,
            backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px)',
            backgroundSize: '24px 24px',
          }} />

          {/* CRT scanline overlay */}
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1,
            background: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.06) 3px, rgba(0,0,0,0.06) 4px)',
          }} />

          {/* Title bar */}
          <div
            onMouseDown={onTitleBarMouseDown}
            style={{
              height: 38, flexShrink: 0,
              display: 'flex', alignItems: 'center',
              padding: '0 14px', gap: 12,
              cursor: 'grab',
              background: 'rgba(0,0,0,0.25)',
              borderBottom: '1px solid rgba(255,255,255,0.05)',
              userSelect: 'none',
              position: 'relative', zIndex: 3,
            }}
          >
            {/* Traffic lights */}
            <div style={{ display: 'flex', gap: 5, flexShrink: 0 }}>
              <button
                onClick={(e) => { e.stopPropagation(); closeWindow(id) }}
                style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f57', border: 'none', cursor: 'pointer' }}
              />
              <button
                onClick={(e) => { e.stopPropagation(); minimizeWindow(id) }}
                style={{ width: 10, height: 10, borderRadius: '50%', background: '#febc2e', border: 'none', cursor: 'pointer' }}
              />
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#28c840' }} />
            </div>

            {/* Vertical divider */}
            <div style={{ width: 1, height: 18, background: 'rgba(255,255,255,0.08)', flexShrink: 0 }} />

            {/* Number badge */}
            <span className="mono" style={{
              fontSize: 9, color: '#7c3aed', letterSpacing: 3,
              border: '1px solid rgba(124,58,237,0.4)',
              padding: '1px 5px',
              flexShrink: 0,
            }}>{num}</span>

            {/* Title — large editorial style */}
            <span className="mono" style={{
              fontSize: 12, color: 'rgba(255,255,255,0.75)',
              letterSpacing: 4, fontWeight: 600,
              flex: 1,
            }}>{title.toUpperCase()}</span>

            {/* Right side — status indicators */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
              <div style={{ display: 'flex', gap: 3 }}>
                {[1,2,3].map(i => (
                  <div key={i} style={{
                    width: 3, height: 3,
                    background: i === 1 ? '#7c3aed' : 'rgba(255,255,255,0.15)',
                    boxShadow: i === 1 ? '0 0 4px #7c3aed' : 'none',
                  }} />
                ))}
              </div>
            </div>
          </div>

          {/* Content area */}
          <div style={{
            flex: 1, overflow: 'auto', padding: '16px 20px',
            position: 'relative', zIndex: 3,
          }}>
            {children}
          </div>

          {/* Bottom status strip — editorial data row */}
          <div style={{
            height: 22, flexShrink: 0,
            display: 'flex', alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 14px',
            background: 'rgba(0,0,0,0.3)',
            borderTop: '1px solid rgba(255,255,255,0.04)',
            position: 'relative', zIndex: 3,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span className="mono" style={{ fontSize: 7, color: 'rgba(255,255,255,0.2)', letterSpacing: 3 }}>PM/OS</span>
              <span style={{ color: 'rgba(255,255,255,0.1)', fontSize: 8 }}>//</span>
              <span className="mono" style={{ fontSize: 7, color: 'rgba(124,58,237,0.5)', letterSpacing: 2 }}>ACTIVE</span>
              <span style={{ color: 'rgba(255,255,255,0.1)', fontSize: 8 }}>//</span>
              <span className="mono" style={{ fontSize: 7, color: 'rgba(255,255,255,0.2)', letterSpacing: 2 }}>{title.toUpperCase()}</span>
            </div>
            {/* Bottom right — pulsing dot */}
            <div style={{
              width: 4, height: 4,
              background: '#7c3aed',
              boxShadow: '0 0 6px #7c3aed',
            }} />
          </div>

        </div>
      </motion.div>
    </AnimatePresence>
  )
}