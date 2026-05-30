'use client'
import Window from '@/components/Window'
export default function MusicPlayer() {
  return (
    <Window id="music" title="Music Player" icon=">>" num="04" width={380} height={500}>
      <div style={{ color: 'rgba(255,255,255,0.6)', fontFamily: 'Share Tech Mono, monospace', fontSize: 12 }}>
        <p style={{ color: '#06b6d4' }}>// MUSIC PLAYER — LOADING...</p>
        <p style={{ marginTop: 8, color: 'rgba(255,255,255,0.3)' }}>CONTENT INCOMING — DAYS 8-9</p>
      </div>
    </Window>
  )
}