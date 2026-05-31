'use client'
import { useRef, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useWindowStore, AppName } from '@/store/windowStore'
import { playWindowOpen, playWindowClose } from '@/components/SoundEngine'

interface WindowProps {
  id: AppName
  title: string
  icon: string
  num: string
  width?: number
  height?: number
  children: React.ReactNode
}

const ORANGE = '#ff6b00'
const ORANGE_DIM = 'rgba(255,107,0,0.4)'
const ORANGE_GLOW = '0 0 8px rgba(255,107,0,0.6), 0 0 20px rgba(255,107,0,0.2)'

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
  const frameRef       = useRef<number | null>(null)
  const latestPos      = useRef({ x: 0, y: 0 })
  const mountedRef     = useRef(false)

  // Play open sound once when window opens
  useEffect(() => {
    if (!mountedRef.current && win.isOpen) {
      mountedRef.current = true
      try { playWindowOpen() } catch {}
    }
  }, [win.isOpen])

  const onTitleBarMouseDown = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).tagName === 'BUTTON') return
    e.preventDefault()
    const el = windowRef.current
    if (!el) return
    focusWindow(id)
    const rect = el.getBoundingClientRect()
    dragOffset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top }

    const onMouseMove = (e: MouseEvent) => {
      latestPos.current = {
        x: e.clientX - dragOffset.current.x,
        y: e.clientY - dragOffset.current.y,
      }
      if (frameRef.current) return
      frameRef.current = requestAnimationFrame(() => {
        el.style.left = `${latestPos.current.x}px`
        el.style.top  = `${latestPos.current.y}px`
        frameRef.current = null
      })
    }

    const onMouseUp = () => {
      if (frameRef.current) { cancelAnimationFrame(frameRef.current); frameRef.current = null }
      setPosition(id, { x: latestPos.current.x, y: latestPos.current.y })
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup',   onMouseUp)
    }

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup',   onMouseUp)
  }, [id, setPosition, focusWindow])

  if (!win.isOpen || win.isMinimized) return null

  return (
    <AnimatePresence>
      <motion.div
        ref={windowRef}
        key={id}
        initial={{ opacity: 0, scale: 0.92, y: 12 }}
        animate={{ opacity: 1, scale: 1,    y: 0  }}
        exit={{    opacity: 0, scale: 0.92, y: 12  }}
        transition={{ duration: 0.12 }}
        onMouseDown={() => focusWindow(id)}
        data-window="true"
        style={{
          position: 'absolute',
          left: win.position.x,
          top:  win.position.y,
          width,
          zIndex: win.zIndex,
        }}
      >
        {/* Outer neon orange glow frame */}
        <div style={{
          position: 'absolute', inset: -1,
          border: `1px solid ${ORANGE_DIM}`,
          boxShadow: ORANGE_GLOW,
          pointerEvents: 'none', zIndex: 0,
        }} />

        {/* Main window body */}
        <div style={{
          position: 'relative', height,
          display: 'flex', flexDirection: 'column',
          background: 'rgba(8, 5, 2, 0.82)',
          backdropFilter: 'blur(7px) saturate(170%)',
          WebkitBackdropFilter: 'blur(7px) saturate(160%)',
          border: `1px solid rgba(255,107,0,0.2)`,
          overflow: 'hidden', zIndex: 1,
        }}>

          {/* CRT scanline overlay */}
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 10,
            backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.12) 2px, rgba(0,0,0,0.12) 4px)',
            mixBlendMode: 'multiply',
          }} />

          {/* CRT phosphor tint */}
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 9,
            background: 'radial-gradient(ellipse at center, rgba(255,107,0,0.03) 0%, transparent 70%)',
          }} />

          {/* Top accent line */}
          <div style={{
            height: 2, flexShrink: 0,
            background: `linear-gradient(90deg, transparent, ${ORANGE}, ${ORANGE}, transparent)`,
            boxShadow: `0 0 10px ${ORANGE}, 0 0 20px rgba(255,107,0,0.4)`,
          }} />

          {/* Title bar */}
          <div
            onMouseDown={onTitleBarMouseDown}
            style={{
              height: 36, flexShrink: 0,
              display: 'flex', alignItems: 'center',
              padding: '0 14px', gap: 10,
              cursor: 'grab',
              background: 'rgba(255,107,0,0.04)',
              borderBottom: `1px solid rgba(255,107,0,0.12)`,
              userSelect: 'none',
              position: 'relative', zIndex: 11,
            }}
          >
            {/* Traffic lights */}
            <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
              <button
                onClick={(e) => { e.stopPropagation(); try { playWindowClose() } catch {}; closeWindow(id) }}
                style={{ width: 24, height: 17, background: 'transparent', border: `1px solid rgba(255,90,90,0.6)`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,90,90,0.4)'; e.currentTarget.style.boxShadow = '0 0 6px rgba(255,90,90,0.6)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.boxShadow = 'none' }}
              />
              <button
                onClick={(e) => { e.stopPropagation(); minimizeWindow(id) }}
                style={{ width: 24, height: 17, background: 'transparent', border: `1px solid rgba(255,200,0,0.6)`, cursor: 'pointer' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,200,0,0.4)'; e.currentTarget.style.boxShadow = '0 0 6px rgba(255,200,0,0.6)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.boxShadow = 'none' }}
              />
              <div style={{ width: 24, height: 17, border: '1px solid rgba(57,255,20,0.4)', background: 'transparent' }} />
            </div>

            <div style={{ width: 1, height: 18, background: 'rgba(255,107,0,0.2)' }} />
            <span className="mono" style={{ fontSize: 9, color: ORANGE_DIM, letterSpacing: 3 }}>{num}</span>
            <span className="mono" style={{ fontSize: 8, color: 'rgba(255,107,0,0.3)' }}>//</span>
            <span className="mono" style={{ fontSize: 11, letterSpacing: 3, color: 'rgba(255,255,255,0.8)', flex: 1 }}>{title.toUpperCase()}</span>

            <div style={{ display: 'flex', gap: 3, alignItems: 'center' }}>
              {[1, 0.5, 0.3].map((o, i) => (
                <div key={i} style={{ width: 4, height: 4, background: ORANGE, opacity: o, boxShadow: o === 1 ? `0 0 4px ${ORANGE}` : 'none' }} />
              ))}
            </div>
          </div>

          {/* Sub-header */}
          <div style={{
            height: 20, flexShrink: 0,
            display: 'flex', alignItems: 'center',
            padding: '0 14px', gap: 16,
            borderBottom: '1px solid rgba(255,107,0,0.06)',
            background: 'rgba(0,0,0,0.2)',
            position: 'relative', zIndex: 11,
          }}>
            <span className="mono" style={{ fontSize: 7, color: 'rgba(255,107,0,0.35)', letterSpacing: 3 }}>CHA.OS // SYS v1.0</span>
            <span className="mono" style={{ fontSize: 7, color: 'rgba(255,255,255,0.1)', letterSpacing: 2 }}>////////////////////</span>
            <span className="mono" style={{ fontSize: 7, color: 'rgba(255,107,0,0.25)', letterSpacing: 3, marginLeft: 'auto' }}>SIGNAL: STRONG</span>
          </div>

          {/* Content */}
          <div style={{ flex: 1, overflow: 'auto', padding: 18, position: 'relative', zIndex: 11 }}>
            {children}
          </div>

          {/* Bottom status bar */}
          <div style={{
            height: 22, flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0 14px',
            background: 'rgba(255,107,0,0.03)',
            borderTop: '1px solid rgba(255,107,0,0.08)',
            position: 'relative', zIndex: 11,
          }}>
            <span className="mono" style={{ fontSize: 7, color: 'rgba(255,107,0,0.3)', letterSpacing: 3 }}>STATUS: ACTIVE</span>
            <div style={{ display: 'flex', gap: 3 }}>
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} style={{ width: 3, height: 3, background: i < 6 ? ORANGE : 'rgba(255,107,0,0.15)', opacity: i < 6 ? (0.3 + i * 0.1) : 0.15 }} />
              ))}
            </div>
            <span className="mono" style={{ fontSize: 7, color: 'rgba(255,107,0,0.3)', letterSpacing: 3 }}>PRIYANSH.M</span>
          </div>

          {/* Corner markers */}
          {[
            { top: 0,      left: 0,  borderWidth: '1px 0 0 1px' },
            { top: 0,      right: 0, borderWidth: '1px 1px 0 0' },
            { bottom: 0,   left: 0,  borderWidth: '0 0 1px 1px' },
            { bottom: 0,   right: 0, borderWidth: '0 1px 1px 0' },
          ].map((pos, i) => (
            <div key={i} style={{
              position: 'absolute', ...pos,
              width: 6, height: 6,
              borderStyle: 'solid', borderColor: ORANGE,
              borderWidth: pos.borderWidth,
              boxShadow: ORANGE_GLOW,
              zIndex: 12, pointerEvents: 'none',
            }} />
          ))}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}