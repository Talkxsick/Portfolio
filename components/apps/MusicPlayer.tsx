'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import Window from '@/components/Window'

const ORANGE = '#ff6b00'
const YELLOW = '#ffd700'

const TRACKS = [
  { id: 1,  title: 'No Way Out',          artist: 'feat. Noy Markel',         src: '/music/01 No Way Out (feat. Noy Markel)(0).mp3' },
  { id: 2,  title: 'No Stylist',          artist: 'feat. Drake',              src: '/music/03 - No Stylist (feat_ Drake) - MusicMingo.Com.mp3' },
  { id: 3,  title: 'Havana',              artist: 'Camila Cabello',           src: '/music/04. Havana.mp3' },
  { id: 4,  title: 'Pretty Little Fears', artist: '6LACK ft. J Cole',         src: '/music/6LACK_~_Pretty_Little_Fears_ft._J_Cole_(Kid_Travis_Cover_ft._Just_Shad).mp3' },
  { id: 5,  title: '7 Rings',             artist: 'Ariana Grande',            src: '/music/7 rings.mp3' },
  { id: 6,  title: "Beggin'",             artist: 'Alex Lupa',                src: "/music/Alex Lupa - Beggin'.mp3" },
  { id: 7,  title: 'All We Have Is Love', artist: 'Sabrina Carpenter',        src: '/music/All We Have Is Love Sabrina Carpenter.mp3' },
  { id: 8,  title: 'Attention',           artist: 'Charlie Puth',             src: '/music/Charlie Puth - Attention  (DawnFoxes.com).mp3' },
  { id: 9,  title: 'I Warned Myself',     artist: 'Charlie Puth',             src: '/music/Charlie Puth - I Warned Myself.mp3' },
  { id: 10, title: 'Hymn For The Weekend',artist: 'Coldplay',                 src: '/music/Hymn For The Weekend Coldplay.mp3' },
  { id: 11, title: 'The Prophec',         artist: 'Kamle',                    src: '/music/Kamle - The Prophec (DjPunjab.Com).mp3' },
  { id: 12, title: "I'm So Tired",        artist: 'Lauv, Troye Sivan',        src: "/music/Lauv, Troye Sivan - i'm so tired....mp3" },
  { id: 13, title: 'Thoughts',            artist: 'LanternNation',            src: '/music/LOUD -Thoghts [LanternNation].mp3' },
  { id: 14, title: 'On Purpose',          artist: 'Sabrina Carpenter',        src: '/music/On Purpose Sabrina Carpenter.mp3' },
  { id: 15, title: 'Lullaby',             artist: 'R3HAB x Mike Williams',    src: '/music/R3HAB x Mike Williams - Lullaby.mp3' },
  { id: 16, title: 'Hislerim',            artist: 'Serhat Durmus ft. Zerrin', src: '/music/Serhat Durmus - Hislerim (feat. Zerrin).mp3' },
]

// ── Module-level singletons — persist across component mounts ──
let _audio:     HTMLAudioElement | null       = null
let _audioCtx:  AudioContext | null           = null
let _analyserL: AnalyserNode | null           = null
let _analyserR: AnalyserNode | null           = null
let _source:    MediaElementAudioSourceNode | null = null

function getAudio(): HTMLAudioElement {
  if (!_audio) _audio = new Audio()
  return _audio
}

function setupAudioGraph() {
  if (_source) return // already set up — never do it twice
  const audio = getAudio()
  const ac    = new AudioContext()
  const src   = ac.createMediaElementSource(audio)
  const split = ac.createChannelSplitter(2)
  const aL    = ac.createAnalyser()
  const aR    = ac.createAnalyser()
  aL.fftSize  = 512
  aR.fftSize  = 512
  src.connect(split)
  split.connect(aL, 0)
  split.connect(aR, 1)
  src.connect(ac.destination)
  _audioCtx  = ac
  _analyserL = aL
  _analyserR = aR
  _source    = src
}

// ── Lissajous Visualizer ───────────────────────────────
function LissajousVisualizer({ isPlaying }: { isPlaying: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef   = useRef<number>(0)
  const phaseRef  = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const SIZE = 256
    const bufL = new Float32Array(SIZE)
    const bufR = new Float32Array(SIZE)

    const draw = () => {
      animRef.current = requestAnimationFrame(draw)
      const W  = canvas.width
      const H  = canvas.height
      const cx = W / 2
      const cy = H / 2

      ctx.fillStyle = 'rgba(6,4,2,0.18)'
      ctx.fillRect(0, 0, W, H)

      if (_analyserL && _analyserR && isPlaying) {
        _analyserL.getFloatTimeDomainData(bufL)
        _analyserR.getFloatTimeDomainData(bufR)
      } else {
        phaseRef.current += 0.003
        const p = phaseRef.current
        for (let i = 0; i < SIZE; i++) {
          const t = (i / SIZE) * Math.PI * 2
          bufL[i] = Math.sin(3 * t + p) * 0.4
          bufR[i] = Math.sin(2 * t + p * 0.7) * 0.4
        }
      }

      for (let i = 0; i < SIZE; i++) {
        const x = cx + bufL[i] * cx * 0.85
        const y = cy + bufR[i] * cy * 0.85
        const hue = i / SIZE
        const r   = 255
        const g   = Math.round(107 + hue * 108)
        const b   = Math.round(hue * 10)
        const alpha = 0.6 + Math.abs(bufL[i]) * 0.4

        ctx.beginPath()
        ctx.arc(x, y, 0.8, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`
        ctx.fill()

        if (Math.abs(bufL[i]) > 0.3 || Math.abs(bufR[i]) > 0.3) {
          const glow = ctx.createRadialGradient(x, y, 0, x, y, 4)
          glow.addColorStop(0, `rgba(${r},${g},${b},0.6)`)
          glow.addColorStop(1, 'transparent')
          ctx.beginPath()
          ctx.arc(x, y, 4, 0, Math.PI * 2)
          ctx.fillStyle = glow
          ctx.fill()
        }
      }

      ctx.beginPath()
      for (let i = 0; i < SIZE; i++) {
        const x = cx + bufL[i] * cx * 0.85
        const y = cy + bufR[i] * cy * 0.85
        if (i === 0) ctx.moveTo(x, y)
        else         ctx.lineTo(x, y)
      }
      ctx.strokeStyle = 'rgba(255,160,0,0.12)'
      ctx.lineWidth   = 0.5
      ctx.stroke()

      ctx.beginPath()
      ctx.arc(cx, cy, 2, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(255,215,0,0.4)'
      ctx.fill()
    }

    draw()
    return () => cancelAnimationFrame(animRef.current)
  }, [isPlaying])

  return (
    <canvas
      ref={canvasRef}
      width={280} height={280}
      style={{ width: '100%', height: '100%', display: 'block' }}
    />
  )
}

// ── Main Music Player ──────────────────────────────────
export default function MusicPlayer() {
  const [currentIdx, setCurrentIdx] = useState(0)
  const [isPlaying,  setIsPlaying]  = useState(false)
  const [volume,     setVolume]     = useState(0.7)
  const [progress,   setProgress]   = useState(0)
  const [duration,   setDuration]   = useState(0)
  const progTimerRef = useRef<number>(0)

  const track = TRACKS[currentIdx]

  // Wire up audio element events on mount
  useEffect(() => {
    const audio = getAudio()
    audio.volume = volume

    const onEnded = () => {
      setCurrentIdx(i => (i + 1) % TRACKS.length)
    }
    audio.addEventListener('ended', onEnded)

    const tick = () => {
      setProgress(audio.currentTime)
      setDuration(audio.duration || 0)
      progTimerRef.current = requestAnimationFrame(tick)
    }
    progTimerRef.current = requestAnimationFrame(tick)

    return () => {
      audio.removeEventListener('ended', onEnded)
      cancelAnimationFrame(progTimerRef.current)
    }
  }, [])

  // Update src when track changes
  useEffect(() => {
    const audio = getAudio()
    const wasPlaying = !audio.paused
    audio.src = track.src
    audio.load()
    if (wasPlaying) audio.play().catch(() => {})
  }, [track.src])

  // Volume
  useEffect(() => { getAudio().volume = volume }, [volume])

  const play = useCallback(async () => {
    const audio = getAudio()
    setupAudioGraph()
    if (_audioCtx?.state === 'suspended') await _audioCtx.resume()
    await audio.play()
    setIsPlaying(true)
  }, [])

  const pause = useCallback(() => {
    getAudio().pause()
    setIsPlaying(false)
  }, [])

  const togglePlay = useCallback(() => {
    isPlaying ? pause() : play()
  }, [isPlaying, play, pause])

  const playTrack = useCallback((idx: number) => {
    const audio  = getAudio()
    audio.src    = TRACKS[idx].src
    audio.load()
    setCurrentIdx(idx)
    setProgress(0)
    setupAudioGraph()
    if (_audioCtx?.state === 'suspended') _audioCtx.resume()
    audio.play().then(() => setIsPlaying(true)).catch(() => {})
  }, [])

  const nextTrack = useCallback(() => playTrack((currentIdx + 1) % TRACKS.length), [currentIdx, playTrack])
  const prevTrack = useCallback(() => playTrack((currentIdx - 1 + TRACKS.length) % TRACKS.length), [currentIdx, playTrack])

  const formatTime = (s: number) => {
    if (!s || isNaN(s)) return '0:00'
    return `${Math.floor(s/60)}:${Math.floor(s%60).toString().padStart(2,'0')}`
  }

  const seekTo = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = getAudio()
    if (!duration) return
    const rect  = e.currentTarget.getBoundingClientRect()
    audio.currentTime = ((e.clientX - rect.left) / rect.width) * duration
  }

  return (
    <Window id="music" title="Music Player" icon=">>" num="04" width={720} height={480}>
      <div style={{ display: 'flex', gap: 20, height: '100%' }}>

        {/* LEFT — Visualizer */}
        <div style={{ flex: '0 0 260px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{
            flex: 1, border: `1px solid rgba(255,107,0,0.15)`,
            background: 'rgba(6,4,2,0.6)', position: 'relative', overflow: 'hidden',
          }}>
            {[
              { top: 0,      left: 0,  borderWidth: '1px 0 0 1px' },
              { top: 0,      right: 0, borderWidth: '1px 1px 0 0' },
              { bottom: 0,   left: 0,  borderWidth: '0 0 1px 1px' },
              { bottom: 0,   right: 0, borderWidth: '0 1px 1px 0' },
            ].map((c, i) => (
              <div key={i} style={{
                position: 'absolute', width: 8, height: 8,
                borderStyle: 'solid', borderColor: ORANGE, borderWidth: c.borderWidth,
                top: c.top, left: c.left, right: c.right, bottom: c.bottom, zIndex: 2,
              }} />
            ))}
            <LissajousVisualizer isPlaying={isPlaying} />
            <div style={{ position: 'absolute', bottom: 8, left: 0, right: 0, textAlign: 'center', pointerEvents: 'none' }}>
              <span className="mono" style={{ fontSize: 7, color: 'rgba(255,107,0,0.3)', letterSpacing: 3 }}>LISSAJOUS // L+R</span>
            </div>
          </div>

          <div style={{ border: `1px solid rgba(255,107,0,0.1)`, padding: '8px 12px' }}>
            <span className="mono" style={{ fontSize: 7, color: 'rgba(255,107,0,0.4)', letterSpacing: 3, display: 'block', marginBottom: 4 }}>NOW PLAYING</span>
            <div className="mono" style={{ fontSize: 12, color: '#ffffff', letterSpacing: 1, marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{track.title}</div>
            <div className="mono" style={{ fontSize: 10, color: 'rgba(255,215,0,0.6)', letterSpacing: 1 }}>{track.artist}</div>
          </div>
        </div>

        {/* RIGHT — Controls + Playlist */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14, minWidth: 0 }}>

          {/* Progress */}
          <div>
            <div onClick={seekTo} style={{ height: 3, background: 'rgba(255,255,255,0.06)', cursor: 'pointer', position: 'relative', marginBottom: 6 }}>
              <div style={{
                height: '100%',
                width: `${duration ? (progress/duration)*100 : 0}%`,
                background: `linear-gradient(90deg, ${ORANGE}, ${YELLOW})`,
                boxShadow: `0 0 6px ${ORANGE}`,
                transition: 'width 0.1s linear',
              }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span className="mono" style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)' }}>{formatTime(progress)}</span>
              <span className="mono" style={{ fontSize: 9, color: 'rgba(255,255,255,0.3)' }}>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Controls */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
            {[
              { label: '⏮', action: prevTrack, large: false },
              { label: isPlaying ? '⏸' : '▶', action: togglePlay, large: true },
              { label: '⏭', action: nextTrack, large: false },
            ].map((btn, i) => (
              <button key={i} onClick={btn.action} style={{
                background: btn.large && isPlaying ? 'rgba(255,107,0,0.15)' : 'transparent',
                border: `1px solid ${btn.large && isPlaying ? ORANGE : 'rgba(255,107,0,0.3)'}`,
                color: btn.large && isPlaying ? ORANGE : 'rgba(255,255,255,0.7)',
                cursor: 'pointer',
                width: btn.large ? 48 : 36,
                height: btn.large ? 48 : 36,
                fontSize: btn.large ? 18 : 14,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: btn.large && isPlaying ? `0 0 12px rgba(255,107,0,0.3)` : 'none',
                transition: 'all 0.2s',
              }}>{btn.label}</button>
            ))}
          </div>

          {/* Volume */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className="mono" style={{ fontSize: 8, color: 'rgba(255,107,0,0.4)', letterSpacing: 2, flexShrink: 0 }}>VOL</span>
            <input type="range" min={0} max={1} step={0.01} value={volume}
              onChange={e => setVolume(Number(e.target.value))}
              style={{ flex: 1, accentColor: ORANGE, height: 2, cursor: 'pointer' }}
            />
            <span className="mono" style={{ fontSize: 8, color: 'rgba(255,255,255,0.3)', flexShrink: 0 }}>{Math.round(volume*100)}%</span>
          </div>

          {/* Playlist */}
          <div style={{ flex: 1, overflow: 'auto', borderTop: '1px solid rgba(255,107,0,0.08)', paddingTop: 8 }}>
            <span className="mono" style={{ fontSize: 7, color: 'rgba(255,107,0,0.4)', letterSpacing: 3, display: 'block', marginBottom: 8 }}>
              // PLAYLIST — {TRACKS.length} TRACKS
            </span>
            {TRACKS.map((t, i) => (
              <div key={t.id} onClick={() => playTrack(i)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '6px 8px', cursor: 'pointer',
                  background: i === currentIdx ? 'rgba(255,107,0,0.08)' : 'transparent',
                  borderLeft: i === currentIdx ? `2px solid ${ORANGE}` : '2px solid transparent',
                  marginBottom: 2, transition: 'all 0.15s',
                }}
                onMouseEnter={e => { if (i !== currentIdx) e.currentTarget.style.background = 'rgba(255,107,0,0.04)' }}
                onMouseLeave={e => { if (i !== currentIdx) e.currentTarget.style.background = 'transparent' }}
              >
                <span className="mono" style={{ fontSize: 8, color: 'rgba(255,255,255,0.2)', width: 20, textAlign: 'right', flexShrink: 0 }}>
                  {i === currentIdx && isPlaying ? '▶' : String(t.id).padStart(2,'0')}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="mono" style={{ fontSize: 11, color: i === currentIdx ? '#ffffff' : 'rgba(255,255,255,0.55)', letterSpacing: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.title}</div>
                  <div className="mono" style={{ fontSize: 9, color: i === currentIdx ? 'rgba(255,215,0,0.6)' : 'rgba(255,255,255,0.2)', letterSpacing: 1 }}>{t.artist}</div>
                </div>
                {i === currentIdx && isPlaying && (
                  <div style={{ display: 'flex', gap: 2, alignItems: 'flex-end', height: 14, flexShrink: 0 }}>
                    {[1,0.6,0.8,0.4].map((h,bi) => (
                      <div key={bi} style={{ width: 2, height: `${h*100}%`, background: ORANGE, animation: `eq-bar ${0.4+bi*0.1}s ease-in-out infinite alternate` }} />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      <style>{`@keyframes eq-bar { from{transform:scaleY(0.3)} to{transform:scaleY(1)} }`}</style>
    </Window>
  )
}