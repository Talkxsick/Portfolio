'use client'
import React, { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import NucleusBackground, { NucleusBackgroundHandle } from './NucleusBackground'
import Terminal    from './apps/Terminal'
import Projects    from './apps/Projects'
import AboutMe     from './apps/AboutMe'
import MusicPlayer from './apps/MusicPlayer'
import Contact     from './apps/Contact'
import { useWindowStore, AppName, WindowState } from '@/store/windowStore'
import { setMuted } from '@/components/SoundEngine'
import { useIsMobile } from '@/hooks/useIsMobile'

const APPS: { id: AppName; label: string; icon: string; num: string }[] = [
  { id: 'terminal', label: 'TERMINAL', icon: '>_', num: '01' },
  { id: 'projects', label: 'PROJECTS', icon: '[]', num: '02' },
  { id: 'about',    label: 'ABOUT',    icon: '//', num: '03' },
  { id: 'music',    label: 'MUSIC',    icon: '>>', num: '04' },
  { id: 'contact',  label: 'CONTACT',  icon: '@',  num: '05' },
]

function HUDPanel({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ position: 'relative', ...style }}>
      {[
        { top: 0,    left: 0,  borderWidth: '1px 0 0 1px' },
        { top: 0,    right: 0, borderWidth: '1px 1px 0 0' },
        { bottom: 0, left: 0,  borderWidth: '0 0 1px 1px' },
        { bottom: 0, right: 0, borderWidth: '0 1px 1px 0' },
      ].map((b, i) => (
        <div key={i} style={{
          position: 'absolute', width: 8, height: 8,
          borderStyle: 'solid', borderColor: 'rgba(255,255,255,0.2)',
          borderWidth: b.borderWidth,
          top: b.top, left: b.left, right: b.right, bottom: b.bottom,
        }} />
      ))}
      {children}
    </div>
  )
}

function MuteButton({ compact = false }: { compact?: boolean }) {
  const [muted, setMutedState] = useState(false)
  const toggle = () => {
    const next = !muted
    setMutedState(next)
    try { setMuted(next) } catch {}
  }
  return (
    <button
      onClick={toggle}
      style={{
        background: muted ? 'rgba(255,107,0,0.15)' : 'transparent',
        border: '1px solid',
        borderColor: muted ? 'rgba(255,107,0,0.4)' : 'rgba(255,255,255,0.1)',
        cursor: 'pointer',
        padding: compact ? '4px 6px' : '2px 8px',
        marginRight: 8,
        display: 'flex', alignItems: 'center', gap: 4,
      }}
    >
      <span className="mono" style={{ fontSize: 8, letterSpacing: compact ? 1 : 2, color: muted ? '#ff6b00' : 'rgba(255,255,255,0.35)' }}>
        {compact ? (muted ? 'OFF' : 'ON') : (muted ? 'SFX: OFF' : 'SFX: ON')}
      </span>
    </button>
  )
}

export default function Desktop() {
  const { openWindow, focusWindow, minimizeWindow, windows, highestZ } = useWindowStore()
  const isMobile = useIsMobile()
  const topBarHeight = isMobile ? 44 : 30
  const nucleusRef = useRef<NucleusBackgroundHandle>(null)

  const toggleApp = (id: AppName) => {
    const win = windows[id]
    if (!win.isOpen) openWindow(id)
    else if (win.isMinimized) focusWindow(id)
    else if (win.zIndex === highestZ) minimizeWindow(id)
    else focusWindow(id)
  }

  return (
    <div style={{
      position: 'relative', width: '100vw', height: '100dvh',
      overflow: 'hidden', background: '#060608',
      backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
      backgroundSize: '48px 48px',
    }}>
      <NucleusBackground ref={nucleusRef} />

      {/* Dedicated nucleus tap zone — sits BELOW every real button/panel/taskbar
          (z-index 2), so a tap on an actual UI control always hits that control
          first. Taps that land on empty background fall through to this layer
          and interact with the nucleus instead. This keeps the two fully separate:
          no more competing with the app icons for the same click. */}
      <div
        onClick={(e) => nucleusRef.current?.interact(e.clientX, e.clientY)}
        style={{ position: 'absolute', inset: 0, zIndex: 2, cursor: 'pointer' }}
      />

      {/* Click / tap hint */}
      <div style={{
        position: 'absolute', top: isMobile ? '62%' : '80%', left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 5, pointerEvents: 'none',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
      }}>
        <span className="mono" style={{ fontSize: 8, letterSpacing: 4, color: 'rgba(255,255,255,0.15)' }}>
          {isMobile ? '[ TAP TO INTERACT ]' : '[ CLICK TO INTERACT ]'}
        </span>
      </div>

      {/* Dark vignette */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1,
        background: 'radial-gradient(ellipse at center, transparent 30%, rgba(6,6,8,0.7) 100%)',
      }} />

      {/* TOP BAR */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: topBarHeight,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: isMobile ? '0 12px' : '0 20px',
          paddingTop: isMobile ? 'env(safe-area-inset-top, 0px)' : 0,
          background: 'rgba(6,6,8,0.8)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(255,255,255,0.04)',
          zIndex: 50,
        }}
      >
        <span className="orbitron" style={{
          fontSize: isMobile ? 11 : 12, fontWeight: 900, letterSpacing: isMobile ? 4 : 6,
          background: 'linear-gradient(90deg, #ff6b00, #ffd700)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>CHA.OS</span>

        {/* Ticker — desktop only, too cramped on small screens */}
        {!isMobile && (
          <div style={{ flex: 1, overflow: 'hidden', margin: '0 40px' }}>
            <div className="ticker-track" style={{ display: 'flex', gap: 32, whiteSpace: 'nowrap' }}>
              {['C++ SYSTEMS', '//', 'WEB DEV', '//', 'SE', '//', 'DELHI IN', '//', 'OPEN TO WORK', '//',
                'C++ SYSTEMS', '//', 'WEB DEV', '//', 'SE', '//', 'DELHI IN', '//', 'OPEN TO WORK', '//'].map((t, i) => (
                <span key={i} className="mono" style={{
                  fontSize: t === '//' ? 11 : 9, letterSpacing: 4,
                  color: t === '//' ? 'rgba(255,107,0,0.5)' : 'rgba(147,147,147,0.69)',
                }}>{t}</span>
              ))}
            </div>
          </div>
        )}
        {isMobile && <div style={{ flex: 1 }} />}

        <MuteButton compact={isMobile} />
        <Clock compact={isMobile} />
      </motion.div>

      {isMobile ? (
        <MobileAppGrid apps={APPS} windows={windows} onToggle={toggleApp} topOffset={topBarHeight} />
      ) : (
        <>
          {/* LEFT PANEL */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            style={{
              position: 'absolute', left: 20, top: topBarHeight, bottom: 60,
              display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 4,
              zIndex: 30,
            }}
          >
            <div className="mono" style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', letterSpacing: 3, marginBottom: 8 }}>// APPS</div>
            {APPS.map((app, i) => (
              <motion.div
                key={app.id}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + i * 0.07 }}
              >
                <HUDPanel>
                  <motion.button
                    onClick={() => toggleApp(app.id)}
                    whileHover={{ x: 3, background: 'rgba(255,107,0,0.12)' }}
                    whileTap={{ scale: 0.97 }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '7px 12px',
                      background: 'transparent',
                      border: 'none', cursor: 'pointer', width: 150,
                    }}
                  >
                    <div style={{
                      width: 2, height: 20, flexShrink: 0,
                      background: windows[app.id].isOpen ? 'linear-gradient(180deg, #ff6b00, #ffd700)' : 'rgba(255,255,255,0.1)',
                      transition: 'background 0.3s',
                      boxShadow: windows[app.id].isOpen ? '0 0 6px rgba(255,107,0,0.6)' : 'none',
                    }} />
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 1 }}>
                      <span className="mono" style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', letterSpacing: 2 }}>{app.num} //</span>
                      <span className="mono" style={{ fontSize: 11, letterSpacing: 2, color: windows[app.id].isOpen ? '#ffffff' : 'rgba(255,255,255,0.5)' }}>{app.label}</span>
                    </div>
                    {windows[app.id].isOpen && (
                      <div style={{ width: 4, height: 4, borderRadius: '50%', marginLeft: 'auto', background: '#ff6b00', boxShadow: '0 0 6px #ff6b00' }} />
                    )}
                  </motion.button>
                </HUDPanel>
              </motion.div>
            ))}
          </motion.div>

          {/* RIGHT PANEL */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            style={{
              position: 'absolute', right: 20, top: topBarHeight, bottom: 60,
              display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 6,
              zIndex: 10, width: 160,
            }}
          >
            <div className="mono" style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', letterSpacing: 3, marginBottom: 4 }}>// SYSTEM STATUS</div>
            {[
              { label: 'ENTITY',  value: 'Priyansh MISHRA' },
              { label: 'CLASS',   value: 'IT ENGINEER'     },
              { label: 'SPEC',    value: 'OVER 999'        },
              { label: 'STATUS',  value: 'AVAILABLE'       },
              { label: 'SIGNAL',  value: 'STRONG'          },
            ].map((item, i) => (
              <HUDPanel key={i} style={{ padding: '5px 10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="mono" style={{ fontSize: 8, color: 'rgba(255,255,255,0.25)', letterSpacing: 1 }}>{item.label}</span>
                  <span className="mono" style={{
                    fontSize: 9, letterSpacing: 1,
                    color: item.label === 'STATUS' ? '#39ff14' : item.label === 'SIGNAL' ? '#ffd700' : 'rgba(255,255,255,0.6)',
                  }}>{item.value}</span>
                </div>
              </HUDPanel>
            ))}

            <div style={{ marginTop: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span className="mono" style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', letterSpacing: 2 }}>SCAN</span>
                <span className="mono" style={{ fontSize: 8, color: 'rgba(57,255,20,0.6)', letterSpacing: 2 }}>100%</span>
              </div>
              <div style={{ height: 2, background: 'rgba(255,255,255,0.06)', width: '100%' }}>
                <motion.div
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ delay: 1, duration: 2, ease: 'easeOut' }}
                  style={{ height: '100%', background: 'linear-gradient(90deg, rgb(255,98,0), rgb(0,255,34))', boxShadow: '0 0 6px rgba(255,215,0,0.5)' }}
                />
              </div>
            </div>
          </motion.div>
        </>
      )}

      {/* TASKBAR — running-app dock */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        style={{
          position: 'absolute', bottom: isMobile ? 'calc(10px + env(safe-area-inset-bottom, 0px))' : 12,
          left: 0, right: 0,
          display: 'flex', justifyContent: 'center',
          zIndex: 50,
          pointerEvents: 'none',
        }}
      >
        <div style={{
          display: 'flex', alignItems: 'center', gap: 0,
          maxWidth: isMobile ? 'calc(100vw - 24px)' : undefined,
          overflowX: isMobile ? 'auto' : undefined,
          background: 'rgba(6,6,8,0.7)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255,255,255,0.06)',
          pointerEvents: 'auto',
        }}>
        <span className="mono" style={{ padding: '0 10px', color: 'rgba(255,255,255,0.15)', fontSize: 12 }}>[ </span>
        {APPS.map((app, i) => {
          const win    = windows[app.id]
          const isOpen = win.isOpen
          return (
            <React.Fragment key={app.id}>
              {i > 0 && <span className="mono" style={{ color: 'rgba(255,255,255,0.08)', fontSize: 10, padding: '0 2px' }}>//</span>}
              <motion.button
                onClick={() => toggleApp(app.id)}
                whileHover={{ background: 'rgba(255,107,0,0.12)' }}
                whileTap={{ scale: 0.96 }}
                style={{
                  padding: isMobile ? '6px 10px' : '6px 14px', border: 'none', cursor: 'pointer',
                  background: 'transparent',
                  borderLeft:  isOpen ? '1px solid rgba(255,107,0,0.3)' : '1px solid transparent',
                  borderRight: isOpen ? '1px solid rgba(255,107,0,0.3)' : '1px solid transparent',
                  position: 'relative', flexShrink: 0,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1,
                }}
              >
                <span className="mono" style={{ fontSize: 8, color: 'rgba(255,255,255,0.28)', letterSpacing: 1 }}>{app.num}</span>
                <span className="mono" style={{ fontSize: isMobile ? 9 : 10, letterSpacing: isMobile ? 1 : 2, color: isOpen ? '#ff6b00' : 'rgba(255,255,255,0.49)' }}>{app.label}</span>
                {isOpen && (
                  <div style={{
                    position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)',
                    width: 20, height: 1,
                    background: 'linear-gradient(90deg, transparent, rgb(255,106,0), transparent)',
                  }} />
                )}
              </motion.button>
            </React.Fragment>
          )
        })}
        <span className="mono" style={{ padding: '0 10px', color: 'rgba(255,255,255,0.15)', fontSize: 12 }}> ]</span>
        </div>
      </motion.div>

      {/* Windows layer — pointer-events:none so empty space passes clicks through to the
          nucleus tap layer beneath; individual Window instances re-enable pointer-events
          on themselves once open, same pattern as MobileAppGrid below. */}
      <div style={{ position: 'absolute', inset: 0, top: topBarHeight, zIndex: 20, pointerEvents: 'none' }}>
        <Terminal />
        <Projects />
        <AboutMe />
        <MusicPlayer />
        <Contact />
      </div>
    </div>
  )
}

function MobileAppGrid({
  apps, windows, onToggle, topOffset,
}: {
  apps: { id: AppName; label: string; icon: string; num: string }[]
  windows: Record<AppName, WindowState>
  onToggle: (id: AppName) => void
  topOffset: number
}) {
  return (
    <div style={{
      position: 'absolute', left: 0, right: 0,
      top: topOffset, bottom: 74,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 15, pointerEvents: 'none',
    }}>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 18, padding: '0 24px',
          pointerEvents: 'auto',
        }}
      >
        {apps.map((app, i) => {
          const isOpen = windows[app.id].isOpen
          return (
            <motion.button
              key={app.id}
              onClick={() => onToggle(app.id)}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.45 + i * 0.06 }}
              whileTap={{ scale: 0.92 }}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                background: 'transparent', border: 'none', cursor: 'pointer',
                width: 84, padding: '6px 0',
              }}
            >
              <div style={{
                position: 'relative',
                width: 56, height: 56,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: `1px solid ${isOpen ? 'rgba(255,107,0,0.6)' : 'rgba(255,255,255,0.12)'}`,
                background: isOpen ? 'rgba(255,107,0,0.12)' : 'rgba(255,255,255,0.03)',
                boxShadow: isOpen ? '0 0 14px rgba(255,107,0,0.35)' : 'none',
                borderRadius: 4,
              }}>
                <span className="mono" style={{ fontSize: 18, color: isOpen ? '#ff6b00' : 'rgba(255,255,255,0.7)' }}>{app.icon}</span>
                {isOpen && (
                  <div style={{
                    position: 'absolute', top: 4, right: 4,
                    width: 5, height: 5, borderRadius: '50%',
                    background: '#ff6b00', boxShadow: '0 0 6px #ff6b00',
                  }} />
                )}
              </div>
              <span className="mono" style={{
                fontSize: 9, letterSpacing: 1.5,
                color: isOpen ? '#ffffff' : 'rgba(255,255,255,0.55)',
                textAlign: 'center',
              }}>{app.label}</span>
            </motion.button>
          )
        })}
      </motion.div>
    </div>
  )
}

function Clock({ compact = false }: { compact?: boolean }) {
  const [time, setTime] = React.useState('')
  const [date, setDate] = React.useState('')
  React.useEffect(() => {
    const update = () => {
      setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: compact ? undefined : '2-digit' }))
      setDate(new Date().toLocaleDateString([], { weekday: 'short', day: '2-digit', month: 'short' }).toUpperCase())
    }
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [compact])
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
      <span className="mono" style={{ fontSize: compact ? 10 : 11, color: 'rgba(255,255,255,0.6)', letterSpacing: 2 }}>{time}</span>
      {!compact && <span className="mono" style={{ fontSize: 8, color: 'rgba(255,255,255,0.25)', letterSpacing: 2 }}>{date}</span>}
    </div>
  )
}