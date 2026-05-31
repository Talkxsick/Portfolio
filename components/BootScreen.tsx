'use client'
import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useWindowStore } from '@/store/windowStore'
import { playBootTick, playBootPowerOn, playBootComplete, playDesktopTransition} from '@/components/SoundEngine'

const BOOT_SEQUENCE = [
  { delay: 0,    text: '> INITIALIZING CHA.OS KERNEL..................... [ OK ]' },
  { delay: 180,  text: '> LOADING SYSTEM MODULES......................... [ OK ]' },
  { delay: 340,  text: '> MOUNTING FILE SYSTEMS.......................... [ OK ]' },
  { delay: 500,  text: '> STARTING PROCESS SCHEDULER..................... [ OK ]' },
  { delay: 660,  text: '> INITIALIZING GPU DRIVERS....................... [ OK ]' },
  { delay: 820,  text: '> LOADING CUDA RUNTIME........................... [ OK ]' },
  { delay: 980,  text: '> CALIBRATING DISPLAY MATRICES................... [ OK ]' },
  { delay: 1140, text: '> STARTING WINDOW COMPOSITOR..................... [ OK ]' },

  { delay: 1320, text: '─────────────────────────────────────────────────────' },

  { delay: 1480, text: '> SYSTEM SCAN COMPLETE' },
  { delay: 1640, text: '> ENTITY   : PRIYANSH MISHRA' },
  { delay: 1800, text: '> CLASS    : C++ SYSTEMS ENGINEER // HPC // CUDA' },
  { delay: 1960, text: '> STATUS   : ONLINE' },
  { delay: 2120, text: '> LOCATION : DELHI, INDIA' },

  { delay: 2280, text: '─────────────────────────────────────────────────────' },

  { delay: 2500, text: '> LAUNCHING CHA.OS................................ [ OK ]' },
]

export default function BootScreen() {
  const [visibleLines, setVisibleLines] = useState<string[]>([])
  const [progress, setProgress]         = useState(0)
  const [done, setDone]                 = useState(false)
  const setBootComplete                 = useWindowStore(s => s.setBootComplete)

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = []

    // Power on sound at start
    timers.push(setTimeout(() => { try { playBootPowerOn() } catch {} }, 100))

    BOOT_SEQUENCE.forEach((item, i) => {
      timers.push(setTimeout(() => {
        setVisibleLines(prev => [...prev, item.text])
        setProgress(Math.round(((i + 1) / BOOT_SEQUENCE.length) * 100))
        try { playBootTick() } catch {}
      }, item.delay))
    })

    // Complete after last line
    timers.push(setTimeout(() => {
      try { playBootComplete() 
          setTimeout(() => { playDesktopTransition() }, 150)
      } catch {}
      setDone(true)
      setTimeout(setBootComplete, 800)
    }, 2600))

    return () => timers.forEach(clearTimeout)
  }, [setBootComplete])

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          key="boot"
          className="scanlines"
          exit={{ opacity: 0, transition: { duration: 0.4 } }}
          style={{
            position: 'fixed', inset: 0, zIndex: 9000,
            background: '#000000',
            display: 'flex', flexDirection: 'column',
            alignItems: 'flex-start', justifyContent: 'center',
            padding: '10vh 12vw',
            overflow: 'hidden',
          }}
        >
          {/* Subtle green vignette */}
          <div style={{
            position: 'absolute', inset: 0, pointerEvents: 'none',
            background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,20,0,0.8) 100%)',
          }} />

          {/* Top border line */}
          <div style={{
            position: 'absolute', top: '8vh', left: '10vw', right: '10vw',
            borderTop: '1px solid rgba(57,255,20,0.3)',
            display: 'flex', justifyContent: 'space-between',
            paddingTop: 8,
          }}>
            <span style={{ color: 'rgba(57,255,20,0.5)', fontSize: 10, fontFamily: 'Share Tech Mono, monospace', letterSpacing: 3 }}>
              CHA.OS v1.0.0
            </span>
            <span style={{ color: 'rgba(57,255,20,0.5)', fontSize: 10, fontFamily: 'Share Tech Mono, monospace', letterSpacing: 3 }}>
              BOOT SEQUENCE
            </span>
          </div>

          {/* Boot lines */}
          <div style={{ width: '100%', maxWidth: 680, position: 'relative', zIndex: 1 }}>
            {visibleLines.map((line, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.15 }}
                style={{
                  fontFamily: 'Share Tech Mono, monospace',
                  fontSize: 13,
                  lineHeight: 2,
                  color: line.startsWith('─') ? 'rgba(57,255,20,0.25)' :
                         line.includes('[ OK ]') ? 'rgba(57,255,20,0.9)' :
                         line.startsWith('> ENTITY') || line.startsWith('> CLASS') ||
                         line.startsWith('> STATUS') || line.startsWith('> LOCATION') ?
                         '#ffffff' : 'rgba(57,255,20,0.75)',
                  textShadow: '0 0 8px rgba(57,255,20,0.4)',
                  letterSpacing: 1,
                }}
              >
                {line}
              </motion.div>
            ))}

            {/* Blinking cursor */}
            {!done && (
              <span className="cursor-blink" style={{
                color: '#39ff14',
                textShadow: '0 0 8px #39ff14',
                fontFamily: 'Share Tech Mono, monospace',
                fontSize: 13,
              }}>▊</span>
            )}
          </div>

          {/* Progress bar */}
          <div style={{
            position: 'absolute', bottom: '10vh', left: '10vw', right: '10vw',
            zIndex: 1,
          }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between', marginBottom: 6,
              fontFamily: 'Share Tech Mono, monospace', fontSize: 10,
              color: 'rgba(57,255,20,0.5)', letterSpacing: 3,
            }}>
              <span>LOADING SYSTEM</span>
              <span>{progress}%</span>
            </div>
            <div style={{
              width: '100%', height: 2,
              background: 'rgba(57,255,20,0.1)',
              border: '1px solid rgba(57,255,20,0.2)',
            }}>
              <motion.div
                style={{
                  height: '100%',
                  background: '#39ff14',
                  boxShadow: '0 0 8px #39ff14, 0 0 16px rgba(57,255,20,0.5)',
                }}
                initial={{ width: '0%' }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            {/* Bottom border */}
            <div style={{
              marginTop: 16, borderTop: '1px solid rgba(57,255,20,0.15)',
              paddingTop: 8, display: 'flex', justifyContent: 'space-between',
            }}>
              <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: 9, color: 'rgba(57,255,20,0.3)', letterSpacing: 3 }}>
                ▲▼ : NAVIGATE
              </span>
              <span style={{ fontFamily: 'Share Tech Mono, monospace', fontSize: 9, color: 'rgba(57,255,20,0.3)', letterSpacing: 3 }}>
                OK : SELECT
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}