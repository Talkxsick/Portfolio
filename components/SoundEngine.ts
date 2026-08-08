// SoundEngine.ts — Web Audio API sound effects
// All sounds generated procedurally, no external files needed

let ctx: AudioContext | null = null
let muted = false

function getCtx(): AudioContext {
  if (!ctx) ctx = new AudioContext()
  if (ctx.state === 'suspended') ctx.resume()
  return ctx
}

export function setMuted(val: boolean) { muted = val }
export function getMuted() { return muted }


// ── Utility ────────────────────────────────────────────

function gain(ac: AudioContext, vol: number) {
  const g = ac.createGain()
  g.gain.value = vol
  g.connect(ac.destination)
  return g
}

function osc(ac: AudioContext, type: OscillatorType, freq: number, g: GainNode, duration: number) {
  const o = ac.createOscillator()
  o.type = type
  o.frequency.value = freq
  o.connect(g)
  o.start()
  o.stop(ac.currentTime + duration)
}

// ── Boot sounds ────────────────────────────────────────

// Short CRT tick for each [ OK ] line
export function playBootTick() {
  if (muted) return

  const ac = getCtx()

  const g = gain(ac, 0)

  g.gain.setValueAtTime(0.05, ac.currentTime)
  g.gain.exponentialRampToValueAtTime(
    0.0001,
    ac.currentTime + 0.035
  )

  const o = ac.createOscillator()

  o.type = 'square'
  o.frequency.setValueAtTime(
    2100,
    ac.currentTime
  )

  o.connect(g)
  o.start()
  o.stop(ac.currentTime + 0.035)
}

// CRT power-on hum at boot start
export function playBootPowerOn() {
  if (muted) return

  const ac = getCtx()

  // neural-link sweep
  const g = gain(ac, 0)

  g.gain.linearRampToValueAtTime(
    0.12,
    ac.currentTime + 0.05
  )

  g.gain.exponentialRampToValueAtTime(
    0.0001,
    ac.currentTime + 0.9
  )

  const sweep = ac.createOscillator()

  sweep.type = 'sawtooth'

  sweep.frequency.setValueAtTime(
    90,
    ac.currentTime
  )

  sweep.frequency.exponentialRampToValueAtTime(
    4200,
    ac.currentTime + 0.65
  )

  sweep.connect(g)

  sweep.start()
  sweep.stop(ac.currentTime + 0.9)

  // signal lock chirp
  const cg = gain(ac, 0)

  cg.gain.setValueAtTime(
    0.05,
    ac.currentTime + 0.3
  )

  cg.gain.exponentialRampToValueAtTime(
    0.0001,
    ac.currentTime + 0.55
  )

  const chirp = ac.createOscillator()

  chirp.type = 'square'

  chirp.frequency.setValueAtTime(
    2600,
    ac.currentTime + 0.3
  )

  chirp.frequency.exponentialRampToValueAtTime(
    3400,
    ac.currentTime + 0.5
  )

  chirp.connect(cg)

  chirp.start(ac.currentTime + 0.3)
  chirp.stop(ac.currentTime + 0.55)
}

// Boot complete — ascending confirmation chime
export function playBootComplete() {
  if (muted) return

  const ac = getCtx()

  // Alien-style static burst
  const bufSize = Math.floor(ac.sampleRate * 0.035)
  const buffer = ac.createBuffer(
    1,
    bufSize,
    ac.sampleRate
  )

  const data = buffer.getChannelData(0)

  for (let i = 0; i < bufSize; i++) {
    data[i] =
      (Math.random() * 2 - 1) *
      Math.pow(1 - i / bufSize, 2)
  }

  const noise = ac.createBufferSource()
  noise.buffer = buffer

  const ng = gain(ac, 0.04)

  ng.gain.exponentialRampToValueAtTime(
    0.0001,
    ac.currentTime + 0.035
  )

  noise.connect(ng)
  noise.start()

  const sequence = [
    { f: 1300, t: 0.00 },
    { f: 1850, t: 0.05 },
    { f: 2600, t: 0.10 },
    { f: 3600, t: 0.17 },
  ]

  sequence.forEach(({ f, t }) => {
    const g = gain(ac, 0)

    g.gain.setValueAtTime(
      0.08,
      ac.currentTime + t
    )

    g.gain.exponentialRampToValueAtTime(
      0.0001,
      ac.currentTime + t + 0.08
    )

    osc(ac, 'square', f, g, 0.09)
  })
}

// ── Nucleus sounds ──────────────────────────────────────

// Hover hum — call repeatedly while hovering
let fieldA: OscillatorNode | null = null
let fieldB: OscillatorNode | null = null
let fieldLFO: OscillatorNode | null = null
let fieldLFOGain: GainNode | null = null
let fieldGain: GainNode | null = null
let fieldFilter: BiquadFilterNode | null = null

export function startField() {

  if (muted || fieldA) return

  const ac = getCtx()
  fieldGain = ac.createGain()
  fieldGain.gain.value = 0

  fieldA = ac.createOscillator()
  fieldA.type = 'sine'
  fieldA.frequency.value = 180

  fieldB = ac.createOscillator()
  fieldB.type = 'sine'
  fieldB.frequency.value = 221.5

  fieldFilter = ac.createBiquadFilter()

  fieldFilter.type = 'lowpass'
  fieldFilter.frequency.value = 900
  fieldFilter.Q.value = 0.7

  fieldA.connect(fieldFilter)
  fieldB.connect(fieldFilter)
  
  fieldFilter.connect(fieldGain)

  fieldGain.connect(ac.destination)

  fieldA.start()
  fieldB.start()

  fieldLFO = ac.createOscillator()
  fieldLFO.type = 'sine'
  fieldLFO.frequency.value = 0.18

  fieldLFOGain = ac.createGain()
  fieldLFOGain.gain.value = 6

  fieldLFO.connect(fieldLFOGain)

  fieldLFOGain.connect(fieldA.frequency)
  fieldLFOGain.connect(fieldB.frequency)

  fieldLFO.start()

}

export function updateField(speed: number, distance: number) {
  if (!fieldA || !fieldB || !fieldGain || !fieldFilter) return

  const ac = getCtx()
  const speedFactor = Math.min(speed / 20, 1)
  const distanceFactor = 1 - Math.min(distance / 180, 1)
  const intensity = speedFactor * distanceFactor

  fieldGain.gain.setTargetAtTime(
    intensity * 0.9,
    ac.currentTime,
    0.15
  )

  fieldA.frequency.setTargetAtTime(
    180 + intensity * 60,
    ac.currentTime,
    0.15
  )

  fieldB.frequency.setTargetAtTime(
    183 + intensity * 75,
    ac.currentTime,
    0.15
  )

  fieldFilter.frequency.setTargetAtTime(
    700 + intensity * 2500,
    ac.currentTime,
    0.2
  )

}



export function stopField() {
  if (!fieldGain) return

  const ac = getCtx()

  fieldGain.gain.setTargetAtTime(
    0,
    ac.currentTime,
    0.3
  )
}


// export function startHoverHum() {
//   if (muted || hoverOsc) return

//   console.log('hover start')
//   const ac = getCtx()

//   hoverGain = gain(ac, 0)

//   hoverGain.gain.linearRampToValueAtTime(
//     0.2,
//     ac.currentTime + 0.4
//   )

//   hoverOsc = ac.createOscillator()

//   hoverOsc.type = 'triangle'
//   hoverOsc.frequency.value = 140

//   hoverOsc.connect(hoverGain)
//   hoverOsc.start()
// }

// export function stopHoverHum() {
//   if (!hoverOsc || !hoverGain) return

//   const ac = getCtx()

//   hoverGain.gain.exponentialRampToValueAtTime(
//     0.0001,
//     ac.currentTime + 0.4
//   )

//   const o = hoverOsc

//   setTimeout(() => {
//     try {
//       o.stop()
//     } catch {}
//   }, 500)

//   hoverOsc = null
//   hoverGain = null
// }



// Click → form "PORTFOLIO" — energy gather whoosh
export function playFormText() {
  if (muted) return

  const ac = getCtx()

  const g = gain(ac, 0)

  g.gain.setValueAtTime(0, ac.currentTime)

  g.gain.linearRampToValueAtTime(
    0.08,
    ac.currentTime + 0.15
  )

  g.gain.exponentialRampToValueAtTime(
    0.0001,
    ac.currentTime + 0.8
  )

  const o = ac.createOscillator()

  o.type = 'triangle'

  o.frequency.setValueAtTime(
    120,
    ac.currentTime
  )

  o.frequency.exponentialRampToValueAtTime(
    520,
    ac.currentTime + 0.6
  )

  o.connect(g)

  o.start()
  o.stop(ac.currentTime + 0.8)

  const shimmerGain = gain(ac, 0)

  shimmerGain.gain.setValueAtTime(
    0.02,
    ac.currentTime + 0.25
  )

  shimmerGain.gain.exponentialRampToValueAtTime(
    0.0001,
    ac.currentTime + 0.9
  )

  const shimmer = ac.createOscillator()

  shimmer.type = 'sine'

  shimmer.frequency.setValueAtTime(
    900,
    ac.currentTime + 0.25
  )

  shimmer.frequency.exponentialRampToValueAtTime(
    1600,
    ac.currentTime + 0.7
  )

  shimmer.connect(shimmerGain)

  shimmer.start(ac.currentTime + 0.25)
  shimmer.stop(ac.currentTime + 0.9)
}

// Click → scatter — burst/explosion
export function playScatter() {
  if (muted) return

  const ac = getCtx()

  const g = gain(ac, 0)

  g.gain.setValueAtTime(
    0.08,
    ac.currentTime
  )

  g.gain.exponentialRampToValueAtTime(
    0.0001,
    ac.currentTime + 0.9
  )

  const o = ac.createOscillator()

  o.type = 'triangle'

  o.frequency.setValueAtTime(
    320,
    ac.currentTime
  )

  o.frequency.exponentialRampToValueAtTime(
    90,
    ac.currentTime + 0.8
  )

  o.connect(g)

  o.start()
  o.stop(ac.currentTime + 0.9)

  const noiseBuffer = ac.createBuffer(
    1,
    Math.floor(ac.sampleRate * 0.15),
    ac.sampleRate
  )

  const data = noiseBuffer.getChannelData(0)

  for (let i = 0; i < data.length; i++) {
    data[i] =
      (Math.random() * 2 - 1) *
      Math.pow(1 - i / data.length, 2)
  }

  const noise = ac.createBufferSource()

  noise.buffer = noiseBuffer

  const ng = gain(ac, 0.015)

  ng.gain.exponentialRampToValueAtTime(
    0.0001,
    ac.currentTime + 0.15
  )

  noise.connect(ng)

  noise.start()
}

// Click → reform — magnetic pull reverse whoosh
export function playReform() {
  if (muted) return

  const ac = getCtx()

  const lowGain = gain(ac, 0)

  lowGain.gain.setValueAtTime(
    0.08,
    ac.currentTime
  )

  lowGain.gain.exponentialRampToValueAtTime(
    0.0001,
    ac.currentTime + 1.0
  )

  const low = ac.createOscillator()

  low.type = 'triangle'

  low.frequency.setValueAtTime(
    180,
    ac.currentTime
  )

  low.frequency.exponentialRampToValueAtTime(
    260,
    ac.currentTime + 0.8
  )

  low.connect(lowGain)

  low.start()
  low.stop(ac.currentTime + 1)

  const highGain = gain(ac, 0)

  highGain.gain.setValueAtTime(
    0.03,
    ac.currentTime + 0.15
  )

  highGain.gain.exponentialRampToValueAtTime(
    0.0001,
    ac.currentTime + 1
  )

  const high = ac.createOscillator()

  high.type = 'sine'

  high.frequency.setValueAtTime(
    500,
    ac.currentTime + 0.15
  )

  high.frequency.exponentialRampToValueAtTime(
    800,
    ac.currentTime + 0.8
  )

  high.connect(highGain)

  high.start(ac.currentTime + 0.15)
  high.stop(ac.currentTime + 1)
}

// Window open click
export function playWindowOpen() {
  if (muted) return
  const ac = getCtx()
  const g = gain(ac, 0)
  g.gain.setTargetAtTime(0.1, ac.currentTime, 0.01)
  g.gain.setTargetAtTime(0, ac.currentTime + 0.12, 0.03)
  osc(ac, 'square', 440, g, 0.15)
}

// Window close
export function playWindowClose() {
  if (muted) return
  const ac = getCtx()
  const g = gain(ac, 0)
  g.gain.setTargetAtTime(0.08, ac.currentTime, 0.01)
  g.gain.setTargetAtTime(0, ac.currentTime + 0.1, 0.03)
  const o = ac.createOscillator()
  o.type = 'square'
  o.frequency.setValueAtTime(440, ac.currentTime)
  o.frequency.exponentialRampToValueAtTime(220, ac.currentTime + 0.1)
  o.connect(g)
  o.start()
  o.stop(ac.currentTime + 0.12)
}

// Boot to desktop transition
export function playDesktopTransition() {
  if (muted) return

  const ac = getCtx()

  // Main sweep
  const g = gain(ac, 0)

  g.gain.setValueAtTime(0.08, ac.currentTime)

  g.gain.exponentialRampToValueAtTime(
    0.0001,
    ac.currentTime + 0.35
  )

  const osc = ac.createOscillator()

  osc.type = 'triangle'

  osc.frequency.setValueAtTime(
    1200,
    ac.currentTime
  )

  osc.frequency.exponentialRampToValueAtTime(
    280,
    ac.currentTime + 0.35
  )

  osc.connect(g)

  osc.start()
  osc.stop(ac.currentTime + 0.35)

  // Soft shimmer
  const sg = gain(ac, 0)

  sg.gain.setValueAtTime(
    0.015,
    ac.currentTime
  )

  sg.gain.exponentialRampToValueAtTime(
    0.0001,
    ac.currentTime + 0.25
  )

  const shimmer = ac.createOscillator()

  shimmer.type = 'sine'

  shimmer.frequency.setValueAtTime(
    1800,
    ac.currentTime
  )

  shimmer.frequency.exponentialRampToValueAtTime(
    900,
    ac.currentTime + 0.2
  )

  shimmer.connect(sg)

  shimmer.start()
  shimmer.stop(ac.currentTime + 0.25)
}


// About me intro type sound
export function playTypeTick() {
  if (muted) return

  const ac = getCtx()

  const g = gain(ac, 0.02)

  g.gain.exponentialRampToValueAtTime(
    0.0001,
    ac.currentTime + 0.03
  )

  const o = ac.createOscillator()

  o.type = 'square'
  o.frequency.value = 1800

  o.connect(g)

  o.start()
  o.stop(ac.currentTime + 0.03)
}