'use client'
import { playTypeTick } from '@/components/SoundEngine'
import { useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'
import Window from '@/components/Window'

const ORANGE = '#ff6b00'
const YELLOW = '#ffd700'
const GREEN  = '#39ff14'

const SKILLS = [
  { name: 'C++',        level: 70, tag: 'ADVANCED',     color: ORANGE },
  { name: 'PYTHON',     level: 70, tag: 'INTERMEDIATE', color: YELLOW },
  { name: 'JAVA',       level: 60, tag: 'INTERMEDIATE', color: YELLOW },
  { name: 'REACT/NEXT', level: 55, tag: 'DEVELOPING',   color: 'rgba(255,255,255,0.6)' },
  { name: 'DSA',        level: 60, tag: 'INTERMEDIATE', color: YELLOW },
  { name: 'LINUX/GIT',  level: 80, tag: 'PROFICIENT',   color: ORANGE },
]

const BIO = [
  'CSE graduate from Delhi, India. I write systems code that',
  'actually performs and build interfaces people enjoy using.',
  'Not because I have to pick one — but because good',
  'engineering lives somewhere between the two.',
  '',
  'I take ownership of what I build, say what I mean,',
  "and figure things out when the path isn't clear.",
  "That's just how I work.",
  '',
  "Outside the screen — I'm at the gym, nose in a book,",
  'or hunting for a good photograph. Evenings go better',
  'with a strong cup of coffee.',
]

function SkillBar({ name, level, tag, color, delay }: {
  name: string; level: number; tag: string; color: string; delay: number
}) {
  const [animated, setAnimated] = useState(false)
  const ref = useRef(false)

  useEffect(() => {
    if (ref.current) return
    ref.current = true
    const timer = setTimeout(() => setAnimated(true), delay)
    return () => clearTimeout(timer)
  }, [delay])

  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
        <span className="mono" style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', letterSpacing: 2 }}>{name}</span>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <span className="mono" style={{ fontSize: 9, color, letterSpacing: 2 }}>{tag}</span>
          <span className="mono" style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', letterSpacing: 1 }}>{level}%</span>
        </div>
      </div>
      <div style={{ height: 3, background: 'rgba(255,255,255,0.05)', width: '100%', position: 'relative' }}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: animated ? `${level}%` : 0 }}
          transition={{ duration: 1, ease: 'easeOut' }}
          style={{
            height: '100%',
            background: `linear-gradient(90deg, ${color}, rgba(255,255,255,0.3))`,
            boxShadow: `0 0 6px ${color}`,
          }}
        />
        {[25, 50, 75].map(mark => (
          <div key={mark} style={{
            position: 'absolute', top: 0, bottom: 0,
            left: `${mark}%`, width: 1,
            background: 'rgba(255,255,255,0.08)',
          }} />
        ))}
      </div>
    </div>
  )
}

export default function AboutMe() {
  const [typedText, setTypedText] = useState('')
  const hasStarted = useRef(false) // prevents StrictMode double-fire

  useEffect(() => {
    if (hasStarted.current) return
    hasStarted.current = true
  
    const fullText = BIO.join('\n')
  
    let i = 0
  
    const interval = setInterval(() => {
      i++
  
      setTypedText(
        fullText.slice(0, i)
      )
  
      if (i >= fullText.length) {
        clearInterval(interval)
      }
    }, 22)
  
    return () => clearInterval(interval)
  }, [])

  return (
    <Window id="about" title="About Me" icon="//" num="03" width={660} height={540}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 22, height: '100%', overflow: 'auto' }}>

        {/* Identity header */}
        <div style={{ borderBottom: '1px solid rgba(255,107,0,0.1)', paddingBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                <div style={{ width: 3, height: 26, background: `linear-gradient(180deg, ${ORANGE}, ${YELLOW})`, boxShadow: `0 0 8px ${ORANGE}` }} />
                <h2 className="orbitron" style={{
                  fontSize: 20, fontWeight: 900, letterSpacing: 4,
                  background: `linear-gradient(90deg, ${ORANGE}, ${YELLOW})`,
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                }}>PRIYANSH MISHRA</h2>
              </div>
              <span className="mono" style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', letterSpacing: 3 }}>
                C++ SYSTEMS ENGINEER // HPC // CUDA // DELHI, IN
              </span>
            </div>
            <div style={{
              border: `1px solid rgba(57,255,20,0.3)`,
              padding: '5px 12px',
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <div style={{ width: 6, height: 6, background: GREEN, boxShadow: `0 0 6px ${GREEN}`, borderRadius: '50%' }} />
              <span className="mono" style={{ fontSize: 9, color: GREEN, letterSpacing: 2 }}>AVAILABLE</span>
            </div>
          </div>
        </div>

        {/* Bio — typewriter */}
        <div>
          <span className="mono" style={{ fontSize: 9, color: 'rgba(255,107,0,0.5)', letterSpacing: 4 }}>// BIO</span>
          <div style={{
            marginTop: 12,
            fontFamily: 'Share Tech Mono, monospace',
            fontSize: 13,
            lineHeight: 2,
            color: 'rgba(255,255,255,0.7)',
          }}>
            <pre
              style={{
                margin: 0,
                whiteSpace: 'pre-wrap',
                fontFamily: 'inherit',
                lineHeight: 2,
              }}
            >
                {typedText}
            </pre>
            {typedText.length < BIO.join('\n').length && (
              <span className="cursor-blink" style={{ color: ORANGE, fontSize: 14 }}>▊</span>
            )}
          </div>

          {typedText.length >= BIO.join('\n').length && (
            <motion.div
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              style={{
                marginTop: 14,
                borderLeft: `2px solid rgba(255,107,0,0.3)`,
                paddingLeft: 14,
              }}
            >
              <span className="mono" style={{
                fontSize: 12, color: 'rgba(255,215,0,0.6)',
                fontStyle: 'italic', letterSpacing: 1,
              }}>
                "He who has a why to live can bear almost any how." — Nietzsche
              </span>
            </motion.div>
          )}
        </div>

        {/* Skills */}
        <div>
          <span className="mono" style={{ fontSize: 9, color: 'rgba(255,107,0,0.5)', letterSpacing: 4 }}>// SKILLS</span>
          <div style={{ marginTop: 14 }}>
            {SKILLS.map((skill, i) => (
              <SkillBar key={skill.name} {...skill} delay={1000 + i * 150} />
            ))}
          </div>
        </div>

        {/* Education */}
        <div>
          <span className="mono" style={{ fontSize: 9, color: 'rgba(255,107,0,0.5)', letterSpacing: 4 }}>// EDUCATION</span>
          <div style={{
            marginTop: 10,
            border: '1px solid rgba(255,107,0,0.1)',
            padding: '12px 16px',
            position: 'relative',
          }}>
            <div style={{ position: 'absolute', top: 0, left: 0, width: 6, height: 6, borderTop: `1px solid ${ORANGE}`, borderLeft: `1px solid ${ORANGE}` }} />
            <div style={{ position: 'absolute', bottom: 0, right: 0, width: 6, height: 6, borderBottom: `1px solid ${ORANGE}`, borderRight: `1px solid ${ORANGE}` }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span className="mono" style={{ fontSize: 13, color: 'rgba(255,255,255,0.85)', letterSpacing: 2 }}>B.TECH — COMPUTER SCIENCE</span>
                <div style={{ marginTop: 5 }}>
                  <span className="mono" style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', letterSpacing: 2 }}>KRISHNA ENGINEERING COLLEGE</span>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span className="mono" style={{ fontSize: 11, color: ORANGE, letterSpacing: 2 }}>2021 — 2025</span>
                <div style={{ marginTop: 5 }}>
                  <span className="mono" style={{ fontSize: 11, color: 'rgba(255,215,0,0.7)', letterSpacing: 2 }}>CGPA: 7.75</span>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </Window>
  )
}