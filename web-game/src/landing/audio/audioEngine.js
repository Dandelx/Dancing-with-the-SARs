/**
 * Orbit Jump audio engine.
 *
 * Every sound in this file is synthesised at runtime with the Web Audio API,
 * so there is no third-party sample, loop or melody to license. The ambient
 * bed is an original generative piece loosely modelled on contemporary
 * Andean music: a pentatonic quena-like flute, charango-style plucks and a
 * bombo pulse over a soft drone.
 */

const MIDI_A4 = 69
const midiToFreq = (m) => 440 * Math.pow(2, (m - MIDI_A4) / 12)

/* A minor pentatonic — the interval set most associated with Andean music. */
const MELODY = [
  69, null, 72, 74, null, 72, 69, null,
  67, null, 64, null, 67, 69, null, null,
  64, null, 67, 69, null, 72, 74, null,
  76, 74, 72, null, 69, null, 67, null,
]

/* Am – F – C – G, one chord per bar (8 eighth notes). */
const CHORDS = [
  [45, 57, 60, 64],
  [41, 53, 57, 60],
  [48, 60, 64, 67],
  [43, 55, 59, 62],
]

class OrbitAudio {
  constructor() {
    this.ctx = null
    this.master = null
    this.musicBus = null
    this.sfxBus = null
    this.reverbSend = null
    this.noiseBuffer = null

    this.volume = 0.55
    this.muted = false
    this.started = false
    this.unlocked = false

    this.step = 0
    this.nextNoteTime = 0
    this.stepDur = 60 / 76 / 2
    this.timer = null

    this._onVisibility = this._onVisibility.bind(this)
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', this._onVisibility)
    }
  }

  get isUnlocked() {
    return this.unlocked
  }

  /** Must be called from a user gesture (click / key press). */
  async unlock() {
    if (!this.ctx) this._build()
    if (this.ctx.state === 'suspended') {
      try {
        await this.ctx.resume()
      } catch {
        return
      }
    }
    this.unlocked = this.ctx.state === 'running'
    if (this.unlocked && !this.started) this._startMusic()
    return this.unlocked
  }

  _build() {
    const Ctx = window.AudioContext || window.webkitAudioContext
    const ctx = new Ctx()
    this.ctx = ctx

    this.master = ctx.createGain()
    this.master.gain.value = this.muted ? 0 : this.volume
    this.master.connect(ctx.destination)

    this.musicBus = ctx.createGain()
    this.musicBus.gain.value = 0.0001
    this.musicBus.connect(this.master)

    this.sfxBus = ctx.createGain()
    this.sfxBus.gain.value = 0.85
    this.sfxBus.connect(this.master)

    /* Procedural plate-ish reverb: exponentially decaying noise. */
    const seconds = 2.6
    const rate = ctx.sampleRate
    const impulse = ctx.createBuffer(2, Math.floor(rate * seconds), rate)
    for (let ch = 0; ch < 2; ch += 1) {
      const data = impulse.getChannelData(ch)
      for (let i = 0; i < data.length; i += 1) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, 3.2)
      }
    }
    const convolver = ctx.createConvolver()
    convolver.buffer = impulse
    const wet = ctx.createGain()
    wet.gain.value = 0.35
    convolver.connect(wet).connect(this.master)
    this.reverbSend = convolver

    this.noiseBuffer = this._makeNoise(ctx, 1)
  }

  _makeNoise(ctx, seconds) {
    const buffer = ctx.createBuffer(1, Math.floor(ctx.sampleRate * seconds), ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < data.length; i += 1) data[i] = Math.random() * 2 - 1
    return buffer
  }

  /* ------------------------------------------------------------------ */
  /* Mixer                                                               */
  /* ------------------------------------------------------------------ */

  setVolume(value) {
    this.volume = Math.min(1, Math.max(0, value))
    if (this.master) {
      const target = this.muted ? 0.0001 : Math.max(0.0001, this.volume)
      this.master.gain.setTargetAtTime(target, this.ctx.currentTime, 0.08)
    }
  }

  setMuted(muted) {
    this.muted = muted
    if (this.master) {
      const target = muted ? 0.0001 : Math.max(0.0001, this.volume)
      this.master.gain.setTargetAtTime(target, this.ctx.currentTime, 0.06)
    }
  }

  /* ------------------------------------------------------------------ */
  /* Generative ambient music                                            */
  /* ------------------------------------------------------------------ */

  _startMusic() {
    this.started = true
    this.step = 0
    this.nextNoteTime = this.ctx.currentTime + 0.15
    this.musicBus.gain.setValueAtTime(0.0001, this.ctx.currentTime)
    this.musicBus.gain.exponentialRampToValueAtTime(0.85, this.ctx.currentTime + 5)
    this.timer = window.setInterval(() => this._schedule(), 140)
  }

  _schedule() {
    if (!this.ctx || this.ctx.state !== 'running') return
    const horizon = this.ctx.currentTime + 0.9
    while (this.nextNoteTime < horizon) {
      this._playStep(this.step, this.nextNoteTime)
      this.nextNoteTime += this.stepDur
      this.step += 1
    }
  }

  _playStep(step, time) {
    const bar = Math.floor(step / 8) % 4
    const inBar = step % 8
    const chord = CHORDS[bar]

    /* Drone: two long voices at the start of every bar. */
    if (inBar === 0) {
      this._voice({
        freq: midiToFreq(chord[0]),
        time,
        dur: this.stepDur * 7.4,
        type: 'sine',
        gain: 0.05,
        attack: 1.1,
        release: 2.2,
        pan: -0.1,
      })
      this._voice({
        freq: midiToFreq(chord[0] + 7),
        time,
        dur: this.stepDur * 7.4,
        type: 'triangle',
        gain: 0.022,
        attack: 1.6,
        release: 2.4,
        pan: 0.14,
      })
    }

    /* Charango-style arpeggio. */
    if (inBar === 2 || inBar === 6) {
      const note = chord[1 + ((step >> 1) % 3)]
      this._pluck(midiToFreq(note), time, 0.045, inBar === 2 ? -0.25 : 0.25)
    }

    /* Quena-ish lead line. */
    const note = MELODY[step % MELODY.length]
    if (note) {
      this._flute(midiToFreq(note), time, this.stepDur * 1.15)
    }

    /* Bombo on the downbeat, shaker on the offbeat. */
    if (inBar === 0 || inBar === 4) this._bombo(time)
    if (inBar % 2 === 1) this._shaker(time)
  }

  _voice({
    freq,
    time,
    dur,
    type = 'triangle',
    gain = 0.05,
    attack = 0.03,
    release = 0.5,
    filter = null,
    vibrato = null,
    pan = 0,
    destination = null,
  }) {
    const ctx = this.ctx
    const osc = ctx.createOscillator()
    osc.type = type
    osc.frequency.setValueAtTime(freq, time)

    if (vibrato) {
      const lfo = ctx.createOscillator()
      const lfoGain = ctx.createGain()
      lfo.frequency.value = vibrato.rate
      lfoGain.gain.value = vibrato.depth
      lfo.connect(lfoGain).connect(osc.frequency)
      lfo.start(time)
      lfo.stop(time + dur + release)
    }

    const env = ctx.createGain()
    env.gain.setValueAtTime(0.0001, time)
    env.gain.exponentialRampToValueAtTime(gain, time + attack)
    env.gain.exponentialRampToValueAtTime(0.0001, time + dur + release)

    let head = osc
    if (filter) {
      const bq = ctx.createBiquadFilter()
      bq.type = 'lowpass'
      bq.frequency.setValueAtTime(filter, time)
      bq.Q.value = 0.6
      osc.connect(bq)
      head = bq
    }

    const panner = ctx.createStereoPanner()
    panner.pan.value = pan

    head.connect(env).connect(panner)
    panner.connect(destination || this.musicBus)
    if (this.reverbSend && !destination) panner.connect(this.reverbSend)

    osc.start(time)
    osc.stop(time + dur + release + 0.05)
  }

  _flute(freq, time, dur) {
    this._voice({
      freq,
      time,
      dur,
      type: 'triangle',
      gain: 0.055,
      attack: 0.09,
      release: 0.45,
      filter: 2400,
      vibrato: { rate: 5.1, depth: freq * 0.006 },
      pan: 0.08,
    })
    /* Airy breath layer. */
    this._voice({
      freq: freq * 2.002,
      time,
      dur,
      type: 'sine',
      gain: 0.016,
      attack: 0.14,
      release: 0.4,
      pan: -0.06,
    })
  }

  _pluck(freq, time, gain, pan) {
    this._voice({
      freq,
      time,
      dur: 0.16,
      type: 'sawtooth',
      gain,
      attack: 0.004,
      release: 0.28,
      filter: 1500,
      pan,
    })
  }

  _bombo(time) {
    const ctx = this.ctx
    const osc = ctx.createOscillator()
    const env = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(105, time)
    osc.frequency.exponentialRampToValueAtTime(44, time + 0.26)
    env.gain.setValueAtTime(0.0001, time)
    env.gain.exponentialRampToValueAtTime(0.16, time + 0.012)
    env.gain.exponentialRampToValueAtTime(0.0001, time + 0.4)
    osc.connect(env).connect(this.musicBus)
    if (this.reverbSend) env.connect(this.reverbSend)
    osc.start(time)
    osc.stop(time + 0.45)
  }

  _shaker(time) {
    const ctx = this.ctx
    const src = ctx.createBufferSource()
    src.buffer = this.noiseBuffer
    const hp = ctx.createBiquadFilter()
    hp.type = 'highpass'
    hp.frequency.value = 6500
    const env = ctx.createGain()
    env.gain.setValueAtTime(0.0001, time)
    env.gain.exponentialRampToValueAtTime(0.022, time + 0.008)
    env.gain.exponentialRampToValueAtTime(0.0001, time + 0.08)
    src.connect(hp).connect(env).connect(this.musicBus)
    src.start(time)
    src.stop(time + 0.1)
  }

  /* ------------------------------------------------------------------ */
  /* SFX                                                                 */
  /* ------------------------------------------------------------------ */

  sfx(name = 'click') {
    if (!this.ctx || this.ctx.state !== 'running') {
      /* Still try to unlock so the very first click is not silent. */
      this.unlock().then(() => {
        if (this.unlocked) this.sfx(name)
      })
      return
    }
    const t = this.ctx.currentTime + 0.01
    switch (name) {
      case 'play':
        this._blip(740, t, 0.07, 0.09)
        this._blip(1180, t + 0.09, 0.1, 0.08)
        break
      case 'hover':
        this._blip(520, t, 0.04, 0.025)
        break
      case 'back':
        this._blip(420, t, 0.08, 0.05)
        break
      case 'warp':
        this._warp(t)
        break
      case 'ready':
        this._blip(659.25, t, 0.12, 0.06)
        this._blip(830.6, t + 0.1, 0.12, 0.055)
        this._blip(987.77, t + 0.2, 0.24, 0.05)
        break
      case 'click':
      default:
        /* "bip-bop" */
        this._blip(880, t, 0.055, 0.055)
        this._blip(1318.5, t + 0.07, 0.075, 0.04)
        break
    }
  }

  _blip(freq, time, dur, gain) {
    const ctx = this.ctx
    const osc = ctx.createOscillator()
    const env = ctx.createGain()
    osc.type = 'square'
    osc.frequency.setValueAtTime(freq, time)
    env.gain.setValueAtTime(0.0001, time)
    env.gain.exponentialRampToValueAtTime(gain, time + 0.008)
    env.gain.exponentialRampToValueAtTime(0.0001, time + dur)
    const lp = ctx.createBiquadFilter()
    lp.type = 'lowpass'
    lp.frequency.value = 3600
    osc.connect(lp).connect(env).connect(this.sfxBus)
    if (this.reverbSend) env.connect(this.reverbSend)
    osc.start(time)
    osc.stop(time + dur + 0.02)
  }

  _warp(time) {
    const ctx = this.ctx
    const osc = ctx.createOscillator()
    const env = ctx.createGain()
    const lp = ctx.createBiquadFilter()
    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(90, time)
    osc.frequency.exponentialRampToValueAtTime(760, time + 1.1)
    lp.type = 'lowpass'
    lp.frequency.setValueAtTime(300, time)
    lp.frequency.exponentialRampToValueAtTime(4200, time + 1.1)
    env.gain.setValueAtTime(0.0001, time)
    env.gain.exponentialRampToValueAtTime(0.07, time + 0.3)
    env.gain.exponentialRampToValueAtTime(0.0001, time + 1.35)
    osc.connect(lp).connect(env).connect(this.sfxBus)
    if (this.reverbSend) env.connect(this.reverbSend)
    osc.start(time)
    osc.stop(time + 1.4)

    /* Noise whoosh layered on top. */
    const src = ctx.createBufferSource()
    src.buffer = this.noiseBuffer
    const bp = ctx.createBiquadFilter()
    bp.type = 'bandpass'
    bp.Q.value = 0.8
    bp.frequency.setValueAtTime(240, time)
    bp.frequency.exponentialRampToValueAtTime(3200, time + 1.0)
    const nEnv = ctx.createGain()
    nEnv.gain.setValueAtTime(0.0001, time)
    nEnv.gain.exponentialRampToValueAtTime(0.05, time + 0.35)
    nEnv.gain.exponentialRampToValueAtTime(0.0001, time + 1.4)
    src.connect(bp).connect(nEnv).connect(this.sfxBus)
    src.start(time)
    src.stop(time + 1.45)
  }

  _onVisibility() {
    if (!this.ctx) return
    if (document.hidden) {
      this.ctx.suspend().catch(() => {})
    } else if (this.started && !this.muted) {
      this.ctx.resume().catch(() => {})
    }
  }
}

export const audio = new OrbitAudio()
export default audio
