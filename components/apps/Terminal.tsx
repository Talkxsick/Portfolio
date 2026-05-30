'use client'
import { useState, useEffect, useRef, KeyboardEvent } from 'react'
import Window from '@/components/Window'

interface Line {
  type: 'input' | 'output' | 'error' | 'system'
  text: string
}

const PROMPT = 'priyansh@pm-os:~$'

const COMMANDS: Record<string, string[]> = {
  whoami: [
    '// ENTITY SCAN COMPLETE',
    '   NAME     : PRIYANSH MISHRA',
    '   CLASS    : C++ SYSTEMS ENGINEER',
    '   SPEC     : HPC // CUDA // MULTITHREADING',
    '   LOCATION : DELHI, INDIA',
    '   STATUS   : SEEKING OPPORTUNITIES',
  ],
  skills: [
    '// TECHNICAL LOADOUT',
    '   LANGUAGES  : C++ (ADV) // CUDA // PYTHON // JAVA // SQL',
    '   FRAMEWORKS : PYTORCH // TENSORFLOW // REACT // NEXT.JS',
    '   TOOLS      : LINUX // GIT // DOCKER // JIRA // GERRIT',
    '   CONCEPTS   : MULTITHREADING // SYSTEM DESIGN // GPU ARCH',
  ],
  projects: [
    '// PROJECT INDEX',
    '   [01] C++ JOB SCHEDULER',
    '        6.1x SPEEDUP @ 6 THREADS // NEAR-LINEAR SCALING',
    '        github.com/Talkxsick/cpp-job-scheduler',
    '',
    '   [02] PORTFOLIO OS',
    '        NEXT.JS // FRAMER MOTION // GLASSMORPHISM',
    '        YOU ARE HERE',
    '',
    '   [03] AI RECEIPT SCANNER — INCOMING',
    '        PYTHON // GEN AI // REAL WORLD UTILITY',
  ],
  experience: [
    '// DEPLOYMENT HISTORY',
    '   ROLE     : ASSOCIATE SOFTWARE INTERN',
    '   COMPANY  : AIHIFUSION',
    '   PERIOD   : OCT 2024 — SEP 2025',
    '   MISSION  :',
    '   > DEVELOPED GPU OPERATOR LIBRARIES IN C++ AND CUDA',
    '   > IMPLEMENTED NMS, POOLING, VECTOR COMPUTATION KERNELS',
    '   > OPTIMIZED MEMORY ACCESS AND PARALLEL EXECUTION',
    '   > RESOLVED PRODUCTION ISSUES VIA JIRA',
  ],
  contact: [
    '// COMMUNICATION CHANNELS',
    '   EMAIL  : talksickmail@gmail.com',
    '   GITHUB : github.com/Talkxsick',
  ],
  help: [
    '// AVAILABLE COMMANDS',
    '   whoami      — identity scan',
    '   skills      — technical loadout',
    '   projects    — mission log',
    '   experience  — deployment history',
    '   contact     — communication channels',
    '   clear       — wipe terminal',
    '   hello       — initiate greeting protocol',
  ],
  hello: ['> GREETING PROTOCOL INITIATED. HELLO, OPERATOR.'],
  hi:    ['> HELLO, OPERATOR. TYPE "help" FOR COMMAND LIST.'],
  clear: [],
}

const BOOT_LINES: Line[] = [
  { type: 'system', text: '// PM/OS TERMINAL v1.0.0' },
  { type: 'system', text: '// TYPE "help" FOR AVAILABLE COMMANDS' },
  { type: 'system', text: '────────────────────────────────────────' },
]

export default function Terminal() {
  const [lines, setLines]     = useState<Line[]>([])
  const [input, setInput]     = useState('')
  const [history, setHistory] = useState<string[]>([])
  const [histIdx, setHistIdx] = useState(-1)
  const bottomRef             = useRef<HTMLDivElement>(null)
  const inputRef              = useRef<HTMLInputElement>(null)

  useEffect(() => {
    let i = 0
    const interval = setInterval(() => {
      if (i < BOOT_LINES.length) { setLines(prev => [...prev, BOOT_LINES[i]]); i++ }
      else clearInterval(interval)
    }, 120)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [lines])

  const runCommand = (cmd: string) => {
    const trimmed = cmd.trim().toLowerCase()
    const inputLine: Line = { type: 'input', text: `${PROMPT} ${cmd}` }
    if (trimmed === 'clear') { setLines([]); return }
    if (trimmed === '') { setLines(prev => [...prev, inputLine]); return }
    const output = COMMANDS[trimmed]
    if (output) {
      setLines(prev => [...prev, inputLine, ...output.map(t => ({ type: 'output' as const, text: t })), { type: 'output', text: '' }])
    } else {
      setLines(prev => [...prev, inputLine, { type: 'error', text: `> UNKNOWN COMMAND: "${trimmed}" — TYPE "help"` }, { type: 'output', text: '' }])
    }
  }

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const cmd = input.trim()
      if (cmd) setHistory(prev => [cmd, ...prev])
      setHistIdx(-1); runCommand(input); setInput('')
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      const next = Math.min(histIdx + 1, history.length - 1)
      setHistIdx(next); setInput(history[next] ?? '')
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      const next = Math.max(histIdx - 1, -1)
      setHistIdx(next); setInput(next === -1 ? '' : history[next])
    }
  }

  const lineColor = (type?: Line['type']) => {
    if (!type)             return 'rgba(255,255,255,0.7)'
    if (type === 'input')  return '#ffffff'
    if (type === 'error')  return '#f87171'
    if (type === 'system') return 'rgba(6,182,212,0.8)'
    return 'rgba(255,255,255,0.65)'
  }

  return (
    <Window id="terminal" title="Terminal" icon=">_" num="01" width={660} height={420}>
      <div style={{ height: '100%', cursor: 'text', display: 'flex', flexDirection: 'column' }}
        onClick={() => inputRef.current?.focus()}>
        <div style={{ flex: 1, overflow: 'auto', lineHeight: 1.8 }}>
          {lines.map((line, i) => (
            <div key={i} style={{ color: lineColor(line?.type), fontFamily: 'Share Tech Mono, monospace', fontSize: 12, whiteSpace: 'pre' }}>
              {line?.text}
            </div>
          ))}
          <div style={{ display: 'flex', alignItems: 'center', fontFamily: 'Share Tech Mono, monospace', fontSize: 12 }}>
            <span style={{ color: '#06b6d4', marginRight: 8 }}>{PROMPT}</span>
            <input
              ref={inputRef} value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={onKeyDown} autoFocus
              style={{ background: 'transparent', border: 'none', outline: 'none', color: '#ffffff', fontFamily: 'Share Tech Mono, monospace', fontSize: 12, flex: 1, caretColor: '#7c3aed' }}
            />
          </div>
          <div ref={bottomRef} />
        </div>
      </div>
    </Window>
  )
}