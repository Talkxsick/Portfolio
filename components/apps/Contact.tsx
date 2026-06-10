'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'
import Window from '@/components/Window'

const ORANGE = '#ff6b00'
const YELLOW = '#ffd700'
const GREEN  = '#39ff14'

const LINKS = [
  {
    label: 'GITHUB',
    value: 'github.com/Talkxsick',
    href:  'https://github.com/Talkxsick',
    icon:  '</>',
    color: ORANGE,
  },
  {
    label: 'EMAIL',
    value: 'talksickmail@gmail.com',
    href:  'mailto:talksickmail@gmail.com',
    icon:  '@',
    color: YELLOW,
  },
  {
    label: 'LINKEDIN',
    value: 'linkedin.com/in/priyansh',
    href:  'https://linkedin.com/in/priyansh',
    icon:  'in',
    color: '#0a66c2',
  },
  {
    label: 'LEETCODE',
    value: 'leetcode.com/priyansh',
    href:  'https://leetcode.com/priyansh',
    icon:  '{}',
    color: '#ffa116',
  },
]

export default function Contact() {
  const [form, setForm]     = useState({ name: '', email: '', message: '' })
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')
  const [focused, setFocused] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.message) return
    setStatus('sending')
    // Simulate send — replace with your actual form endpoint if needed
    await new Promise(r => setTimeout(r, 1500))
    setStatus('sent')
    setForm({ name: '', email: '', message: '' })
    setTimeout(() => setStatus('idle'), 4000)
  }

  const inputStyle = (field: string): React.CSSProperties => ({
    width: '100%',
    background: focused === field ? 'rgba(255,107,0,0.05)' : 'rgba(0,0,0,0.3)',
    border: `1px solid ${focused === field ? 'rgba(255,107,0,0.4)' : 'rgba(255,255,255,0.08)'}`,
    color: '#ffffff',
    fontFamily: 'Share Tech Mono, monospace',
    fontSize: 12,
    letterSpacing: 1,
    padding: '8px 12px',
    outline: 'none',
    boxShadow: focused === field ? `0 0 8px rgba(255,107,0,0.15)` : 'none',
    transition: 'all 0.2s',
    resize: 'none' as const,
  })

  return (
    <Window id="contact" title="Contact" icon="@" num="05" width={620} height={500}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, height: '100%', overflow: 'auto' }}>

        {/* Header */}
        <div style={{ borderBottom: '1px solid rgba(255,107,0,0.1)', paddingBottom: 12 }}>
          <span className="mono" style={{ fontSize: 9, color: 'rgba(255,107,0,0.5)', letterSpacing: 4 }}>// CONTACT CHANNELS</span>
          <p className="mono" style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 6, lineHeight: 1.6 }}>
            Open to full-time roles, freelance work, and interesting conversations.
          </p>
        </div>

        {/* Contact links */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {LINKS.map((link, i) => (
            <motion.a
              key={i}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ x: 3, borderColor: link.color, background: `rgba(255,107,0,0.06)` }}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '10px 14px',
                border: '1px solid rgba(255,255,255,0.07)',
                textDecoration: 'none',
                transition: 'all 0.2s',
                position: 'relative',
              }}
            >
              {/* Left accent */}
              <motion.div
                whileHover={{ scaleY: 1 }}
                initial={{ scaleY: 0 }}
                style={{
                  position: 'absolute', left: 0, top: 0, bottom: 0,
                  width: 2, background: link.color,
                  transformOrigin: 'top',
                }}
              />
              {/* Icon */}
              <div style={{
                width: 32, height: 32, flexShrink: 0,
                border: `1px solid rgba(255,255,255,0.08)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(0,0,0,0.3)',
              }}>
                <span className="mono" style={{ fontSize: 10, color: link.color }}>{link.icon}</span>
              </div>
              {/* Info */}
              <div style={{ minWidth: 0 }}>
                <div className="mono" style={{ fontSize: 8, color: 'rgba(255,255,255,0.25)', letterSpacing: 3, marginBottom: 3 }}>{link.label}</div>
                <div className="mono" style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)', letterSpacing: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{link.value}</div>
              </div>
              {/* Arrow */}
              <span className="mono" style={{ fontSize: 10, color: 'rgba(255,255,255,0.15)', marginLeft: 'auto', flexShrink: 0 }}>→</span>
            </motion.a>
          ))}
        </div>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,107,0,0.08)' }} />
          <span className="mono" style={{ fontSize: 8, color: 'rgba(255,107,0,0.3)', letterSpacing: 3 }}>// SEND MESSAGE</span>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,107,0,0.08)' }} />
        </div>

        {/* Contact form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>

          {/* Name + Email row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div>
              <label className="mono" style={{ fontSize: 8, color: 'rgba(255,107,0,0.4)', letterSpacing: 3, display: 'block', marginBottom: 5 }}>NAME</label>
              <input
                type="text"
                placeholder="Your name"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                onFocus={() => setFocused('name')}
                onBlur={() => setFocused(null)}
                style={inputStyle('name')}
              />
            </div>
            <div>
              <label className="mono" style={{ fontSize: 8, color: 'rgba(255,107,0,0.4)', letterSpacing: 3, display: 'block', marginBottom: 5 }}>EMAIL</label>
              <input
                type="email"
                placeholder="your@email.com"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                onFocus={() => setFocused('email')}
                onBlur={() => setFocused(null)}
                style={inputStyle('email')}
              />
            </div>
          </div>

          {/* Message */}
          <div>
            <label className="mono" style={{ fontSize: 8, color: 'rgba(255,107,0,0.4)', letterSpacing: 3, display: 'block', marginBottom: 5 }}>MESSAGE</label>
            <textarea
              rows={4}
              placeholder="What's on your mind..."
              value={form.message}
              onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
              onFocus={() => setFocused('message')}
              onBlur={() => setFocused(null)}
              style={inputStyle('message')}
            />
          </div>

          {/* Submit */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            {/* Status message */}
            <div>
              {status === 'sent' && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mono"
                  style={{ fontSize: 10, color: GREEN, letterSpacing: 2 }}
                >
                  ✓ MESSAGE TRANSMITTED
                </motion.span>
              )}
              {status === 'sending' && (
                <span className="mono" style={{ fontSize: 10, color: YELLOW, letterSpacing: 2 }}>
                  TRANSMITTING...
                </span>
              )}
            </div>

            <motion.button
              type="submit"
              disabled={status === 'sending' || status === 'sent'}
              whileHover={{ borderColor: ORANGE, color: '#ffffff', boxShadow: `0 0 12px rgba(255,107,0,0.3)` }}
              whileTap={{ scale: 0.97 }}
              style={{
                background: 'transparent',
                border: `1px solid rgba(255,107,0,0.3)`,
                color: 'rgba(255,255,255,0.6)',
                fontFamily: 'Share Tech Mono, monospace',
                fontSize: 10, letterSpacing: 3,
                padding: '8px 20px',
                cursor: status === 'sending' ? 'wait' : 'pointer',
                transition: 'all 0.2s',
                opacity: status === 'sent' ? 0.4 : 1,
              }}
            >
              {status === 'sending' ? 'SENDING...' : 'TRANSMIT →'}
            </motion.button>
          </div>
        </form>

      </div>
    </Window>
  )
}