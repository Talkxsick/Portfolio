'use client'
import { motion } from 'framer-motion'
import { AppName } from '@/store/windowStore'

interface DesktopIconProps {
  id: AppName
  label: string
  icon: string
  num: string
  onClick: () => void
}

export default function DesktopIcon({ label, icon, num, onClick }: DesktopIconProps) {
  return (
    <motion.div
      onClick={onClick}
      whileHover={{ x: 4 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '6px 10px',
        cursor: 'pointer',
        position: 'relative',
        width: 140,
      }}
    >
      {/* Left accent line */}
      <motion.div
        initial={{ scaleY: 0 }}
        whileHover={{ scaleY: 1 }}
        style={{
          position: 'absolute', left: 0, top: 0, bottom: 0,
          width: 2, background: 'linear-gradient(180deg, #7c3aed, #06b6d4)',
          transformOrigin: 'top',
          transition: 'transform 0.2s',
        }}
      />

      {/* Icon box */}
      <motion.div
        whileHover={{
          background: 'rgba(124,58,237,0.15)',
          borderColor: 'rgba(124,58,237,0.4)',
          boxShadow: '0 0 12px rgba(124,58,237,0.3)',
        }}
        style={{
          width: 32, height: 32,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: '1px solid rgba(255,255,255,0.1)',
          background: 'rgba(255,255,255,0.03)',
          flexShrink: 0,
          transition: 'all 0.2s',
        }}
      >
        <span className="mono" style={{ fontSize: 11, color: 'rgba(255,255,255,0.6)' }}>{icon}</span>
      </motion.div>

      {/* Label */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <span className="mono" style={{ fontSize: 8, color: 'rgba(255,255,255,0.25)', letterSpacing: 2 }}>{num} //</span>
        <span className="mono" style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)', letterSpacing: 2 }}>{label}</span>
      </div>
    </motion.div>
  )
}