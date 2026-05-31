'use client'
import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import Window from '@/components/Window'

const ORANGE = '#ff6b00'
const YELLOW = '#ffd700'


// Glitch title — RGB split on hover
function GlitchTitle({ text, active }: { text: string; active: boolean }) {
  const [glitching, setGlitching] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => {
    if (active) {
      setGlitching(true)
      timerRef.current = setTimeout(() => setGlitching(false), 180)
    }
    return () => clearTimeout(timerRef.current)
  }, [active])

  return (
    <span style={{ position: 'relative', display: 'inline-block' }}>
      {/* Red channel — shifts left */}
      {glitching && (
        <span className="mono" style={{
          position: 'absolute', inset: 0,
          fontSize: 13, letterSpacing: 3, fontWeight: 700,
          color: 'rgba(255,50,50,0.7)',
          transform: 'translateX(-2px)',
          pointerEvents: 'none',
        }}>{text}</span>
      )}
      {/* Cyan channel — shifts right */}
      {glitching && (
        <span className="mono" style={{
          position: 'absolute', inset: 0,
          fontSize: 13, letterSpacing: 3, fontWeight: 700,
          color: 'rgba(0,255,255,0.5)',
          transform: 'translateX(2px)',
          pointerEvents: 'none',
        }}>{text}</span>
      )}
      {/* Main text */}
      <span className="mono" style={{
        fontSize: 13, color: '#ffffff',
        letterSpacing: 3, fontWeight: 700,
        filter: glitching ? 'brightness(1.3)' : 'none',
        transition: 'filter 0.1s',
      }}>{text}</span>
    </span>
  )
}

const PROJECTS = [
  {
    num:    '01',
    title:  'C++ JOB SCHEDULER',
    tags:   ['C++17', 'CUDA', 'HPC', 'MULTITHREADING'],
    stat:   '6.1x SPEEDUP @ 6 THREADS',
    desc:   'Priority-based multi-threaded job scheduler with thread pool, rate-limited dispatcher, exponential backoff retry, ncurses terminal UI, and persistent logger. Benchmarked across 1000-job workloads.',
    link:   'https://github.com/Talkxsick/cpp-job-scheduler',
    label:  'VIEW ON GITHUB',
    status: 'COMPLETE',
    bar:    100,
  },
  {
    num:    '02',
    title:  'PORTFOLIO OS',
    tags:   ['NEXT.JS', 'REACT', 'FRAMER MOTION', 'CANVAS'],
    stat:   'YOU ARE HERE',
    desc:   'Portfolio built as a fake operating system. Features a reactive grain nucleus, draggable glass windows, CRT boot screen, interactive terminal, and music player with audio visualizer.',
    link:   '#',
    label:  'CURRENTLY RUNNING',
    status: 'ACTIVE',
    bar:    85,
  },
  {
    num:    '03',
    title:  'AI RECEIPT SCANNER',
    tags:   ['PYTHON', 'GEN AI', 'GPT-4 VISION', 'FLASK'],
    stat:   'INCOMING TRANSMISSION',
    desc:   'AI-powered expense tracker — photographs receipts, extracts line items with 90%+ accuracy using GPT-4 Vision, categorizes spending, and generates monthly insight reports.',
    link:   '#',
    label:  'IN DEVELOPMENT',
    status: 'PENDING',
    bar:    15,
  },
]

const STATUS_COLOR: Record<string, string> = {
  COMPLETE: '#39ff14',
  ACTIVE:   '#ffd700',
  PENDING:  'rgba(255,107,0,0.5)',
}

export default function Projects() {
  const [hovered, setHovered] = useState<number | null>(null)

  return (
    <Window id="projects" title="Projects" icon="[]" num="02" width={680} height={500}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, height: '100%', overflow: 'auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <span className="mono" style={{ fontSize: 8, color: 'rgba(255,107,0,0.5)', letterSpacing: 4 }}>
            // PROJECT INDEX — {PROJECTS.length} ENTRIES
          </span>
          <span className="mono" style={{ fontSize: 8, color: 'rgba(255,255,255,0.15)', letterSpacing: 3 }}>
            PRIYANSH.M // 2025
          </span>
        </div>

        {PROJECTS.map((p, i) => (
          <motion.div
            key={i}
            onHoverStart={() => setHovered(i)}
            onHoverEnd={() => setHovered(null)}
            animate={{
              borderColor: hovered === i ? 'rgba(255,107,0,0.4)' : 'rgba(255,255,255,0.06)',
              background:  hovered === i ? 'rgba(255,107,0,0.04)' : 'rgba(0,0,0,0.2)',
            }}
            style={{
              border: '1px solid rgba(255,255,255,0.06)',
              padding: '14px 16px',
              position: 'relative',
              cursor: 'default',
            }}
          >
            {/* CRT scanline intensifier on hover */}
            <motion.div
              animate={{ opacity: hovered === i ? 1 : 0 }}
              transition={{ duration: 0.15 }}
              style={{
                position: 'absolute', inset: 0, pointerEvents: 'none',
                backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px)',
                zIndex: 1,
              }}
            />

            {/* Neon left bar on hover */}
            <motion.div
              animate={{ scaleY: hovered === i ? 1 : 0, opacity: hovered === i ? 1 : 0 }}
              style={{
                position: 'absolute', left: 0, top: 0, bottom: 0,
                width: 2,
                background: `linear-gradient(180deg, ${ORANGE}, ${YELLOW})`,
                boxShadow: `0 0 8px ${ORANGE}`,
                transformOrigin: 'top',
              }}
            />

            {/* Top row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span className="mono" style={{ fontSize: 9, color: 'rgba(255,107,0,0.5)', letterSpacing: 3 }}>{p.num} //</span>
                <GlitchTitle text={p.title} active={hovered === i} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 5, height: 5, background: STATUS_COLOR[p.status], boxShadow: `0 0 6px ${STATUS_COLOR[p.status]}` }} />
                <span className="mono" style={{ fontSize: 8, color: STATUS_COLOR[p.status], letterSpacing: 2 }}>{p.status}</span>
              </div>
            </div>

            {/* Tags */}
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
              {p.tags.map((tag, ti) => (
                <span key={ti} className="mono" style={{
                  fontSize: 8, letterSpacing: 2,
                  color: 'rgba(255,215,0,0.7)',
                  border: '1px solid rgba(255,215,0,0.2)',
                  padding: '2px 6px',
                  background: 'rgba(255,215,0,0.04)',
                }}>{tag}</span>
              ))}
            </div>

            {/* Description */}
            <p className="mono" style={{
              fontSize: 10, lineHeight: 1.7,
              color: 'rgba(255,255,255,0.45)',
              marginBottom: 12,
            }}>{p.desc}</p>

            {/* Progress bar */}
            <div style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span className="mono" style={{ fontSize: 7, color: 'rgba(255,107,0,0.4)', letterSpacing: 3 }}>COMPLETION</span>
                <span className="mono" style={{ fontSize: 7, color: 'rgba(255,107,0,0.6)', letterSpacing: 2 }}>{p.bar}%</span>
              </div>
              <div style={{ height: 2, background: 'rgba(255,255,255,0.05)', width: '100%' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${p.bar}%` }}
                  transition={{ duration: 1.2, delay: i * 0.2, ease: 'easeOut' }}
                  style={{
                    height: '100%',
                    background: p.bar === 100
                      ? `linear-gradient(90deg, ${ORANGE}, ${YELLOW})`
                      : p.bar > 50
                      ? `linear-gradient(90deg, ${ORANGE}, rgba(255,107,0,0.4))`
                      : 'rgba(255,107,0,0.3)',
                    boxShadow: p.bar === 100 ? `0 0 6px ${ORANGE}` : 'none',
                  }}
                />
              </div>
            </div>

            {/* Bottom row — stat + link */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span className="mono" style={{ fontSize: 9, color: 'rgba(255,215,0,0.6)', letterSpacing: 2 }}>
                › {p.stat}
              </span>
              {p.link !== '#' ? (
                <motion.a
                  href={p.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ color: '#ffffff', borderColor: ORANGE, boxShadow: `0 0 8px ${ORANGE}` }}
                  style={{
                    fontFamily: 'Share Tech Mono, monospace',
                    fontSize: 8, letterSpacing: 3,
                    color: 'rgba(255,107,0,0.7)',
                    border: '1px solid rgba(255,107,0,0.3)',
                    padding: '3px 10px',
                    textDecoration: 'none',
                    transition: 'all 0.2s',
                    cursor: 'pointer',
                  }}
                >{p.label} →</motion.a>
              ) : (
                <span className="mono" style={{
                  fontSize: 8, letterSpacing: 3,
                  color: 'rgba(255,255,255,0.15)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  padding: '3px 10px',
                }}>{p.label}</span>
              )}
            </div>

            {/* Corner markers */}
            {[
              { top: 0, left: 0, borderWidth: '1px 0 0 1px' },
              { top: 0, right: 0, borderWidth: '1px 1px 0 0' },
            ].map((c, ci) => (
              <motion.div
                key={ci}
                animate={{ borderColor: hovered === i ? ORANGE : 'rgba(255,255,255,0.1)' }}
                style={{
                  position: 'absolute', ...c,
                  width: 6, height: 6,
                  borderStyle: 'solid',
                  borderColor: 'rgba(255,255,255,0.1)',
                  pointerEvents: 'none',
                }}
              />
            ))}
          </motion.div>
        ))}
      </div>
    </Window>
  )
}