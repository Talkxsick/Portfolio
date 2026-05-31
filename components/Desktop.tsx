'use client'
import React, { useState } from 'react'
import { motion } from 'framer-motion'
import NucleusBackground from './NucleusBackground'
import Terminal    from './apps/Terminal'
import Projects    from './apps/Projects'
import AboutMe     from './apps/AboutMe'
import MusicPlayer from './apps/MusicPlayer'
import Contact     from './apps/Contact'
import { useWindowStore, AppName } from '@/store/windowStore'
import { setMuted } from '@/components/SoundEngine'

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

function MuteButton() {
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
        padding: '2px 8px',
        marginRight: 8,
        display: 'flex', alignItems: 'center', gap: 4,
      }}
    >
      <span className="mono" style={{ fontSize: 8, letterSpacing: 2, color: muted ? '#ff6b00' : 'rgba(255,255,255,0.35)' }}>
        {muted ? 'SFX: OFF' : 'SFX: ON'}
      </span>
    </button>
  )
}

export default function Desktop() {
  const { openWindow, focusWindow, minimizeWindow, windows, highestZ } = useWindowStore()

  return (
    <div style={{
      position: 'relative', width: '100vw', height: '100vh',
      overflow: 'hidden', background: '#060608',
      backgroundImage: 'linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)',
      backgroundSize: '48px 48px',
    }}>
      <NucleusBackground />

      {/* Click hint */}
      <div style={{
        position: 'absolute', top: '80%', left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 5, pointerEvents: 'none',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
      }}>
        <span className="mono" style={{ fontSize: 8, letterSpacing: 4, color: 'rgba(255,255,255,0.15)' }}>[ CLICK TO INTERACT ]</span>
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
          position: 'absolute', top: 0, left: 0, right: 0, height: 30,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0 20px',
          background: 'rgba(6,6,8,0.8)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(255,255,255,0.04)',
          zIndex: 50,
        }}
      >
        <span className="orbitron" style={{
          fontSize: 12, fontWeight: 900, letterSpacing: 6,
          background: 'linear-gradient(90deg, #ff6b00, #ffd700)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>CHA.OS</span>

        {/* Ticker */}
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

        <MuteButton />
        <Clock />
      </motion.div>

      {/* LEFT PANEL */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 }}
        style={{
          position: 'absolute', left: 20, top: '50%',
          transform: 'translateY(-50%)',
          display: 'flex', flexDirection: 'column', gap: 4,
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
                onClick={() => {
                  const win = windows[app.id]
                  if (!win.isOpen) openWindow(app.id)
                  else if (win.isMinimized) focusWindow(app.id)
                  else if (win.zIndex === highestZ) minimizeWindow(app.id)
                  else focusWindow(app.id)
                }}
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
          position: 'absolute', right: 20, top: '50%',
          transform: 'translateY(-50%)',
          display: 'flex', flexDirection: 'column', gap: 6,
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

      {/* TASKBAR */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        style={{
          position: 'absolute', bottom: 12, left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex', alignItems: 'center', gap: 0,
          background: 'rgba(6,6,8,0.7)',
          backdropFilter: 'blur(16px)',
          border: '1px solid rgba(255,255,255,0.06)',
          zIndex: 50,
        }}
      >
        <span className="mono" style={{ padding: '0 10px', color: 'rgba(255,255,255,0.15)', fontSize: 12 }}>[ </span>
        {APPS.map((app, i) => {
          const win    = windows[app.id]
          const isOpen = win.isOpen
          return (
            <React.Fragment key={app.id}>
              {i > 0 && <span className="mono" style={{ color: 'rgba(255,255,255,0.08)', fontSize: 10, padding: '0 2px' }}>//</span>}
              <motion.button
                onClick={() => {
                  const win = windows[app.id]
                  if (!win.isOpen) openWindow(app.id)
                  else if (win.isMinimized) focusWindow(app.id)
                  else if (win.zIndex === highestZ) minimizeWindow(app.id)
                  else focusWindow(app.id)
                }}
                whileHover={{ background: 'rgba(255,107,0,0.12)' }}
                whileTap={{ scale: 0.96 }}
                style={{
                  padding: '6px 14px', border: 'none', cursor: 'pointer',
                  background: 'transparent',
                  borderLeft:  isOpen ? '1px solid rgba(255,107,0,0.3)' : '1px solid transparent',
                  borderRight: isOpen ? '1px solid rgba(255,107,0,0.3)' : '1px solid transparent',
                  position: 'relative',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1,
                }}
              >
                <span className="mono" style={{ fontSize: 8, color: 'rgba(255,255,255,0.28)', letterSpacing: 1 }}>{app.num}</span>
                <span className="mono" style={{ fontSize: 10, letterSpacing: 2, color: isOpen ? '#ff6b00' : 'rgba(255,255,255,0.49)' }}>{app.label}</span>
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
      </motion.div>

      {/* Windows layer */}
      <div style={{ position: 'absolute', inset: 0, top: 30, zIndex: 20 }}>
        <Terminal />
        <Projects />
        <AboutMe />
        <MusicPlayer />
        <Contact />
      </div>
    </div>
  )
}

function Clock() {
  const [time, setTime] = React.useState('')
  const [date, setDate] = React.useState('')
  React.useEffect(() => {
    const update = () => {
      setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }))
      setDate(new Date().toLocaleDateString([], { weekday: 'short', day: '2-digit', month: 'short' }).toUpperCase())
    }
    update()
    const id = setInterval(update, 1000)
    return () => clearInterval(id)
  }, [])
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 1 }}>
      <span className="mono" style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)', letterSpacing: 2 }}>{time}</span>
      <span className="mono" style={{ fontSize: 8, color: 'rgba(255,255,255,0.25)', letterSpacing: 2 }}>{date}</span>
    </div>
  )
}