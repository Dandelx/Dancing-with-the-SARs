import { useCallback, useEffect, useRef, useState } from 'react'
import './landing.css'
import { detectLanguage, getStrings } from './i18n.js'
import audio from './audio/audioEngine.js'
import { createOrbitScene } from './three/OrbitScene.js'
import TopBar from './components/TopBar.jsx'
import LanguageSelect from './components/LanguageSelect.jsx'
import AudioControl from './components/AudioControl.jsx'
import PlayButton from './components/PlayButton.jsx'
import LoadingScreen from './components/LoadingScreen.jsx'

const readStoredVolume = () => {
  try {
    const stored = window.localStorage.getItem('orbitjump.volume')
    if (stored === null) return 0.55
    const value = Number(stored)
    return Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : 0.55
  } catch {
    return 0.55
  }
}

export default function OrbitJumpLanding() {
  const [lang, setLang] = useState(detectLanguage)
  const t = getStrings(lang)

  const [phase, setPhase] = useState('idle') // idle | launching | loading | ready
  const [sceneReady, setSceneReady] = useState(false)
  const [glError, setGlError] = useState(false)
  const [volume, setVolume] = useState(readStoredVolume)
  const [muted, setMuted] = useState(false)
  const [audioOn, setAudioOn] = useState(false)
  const [warp, setWarp] = useState(false)
  const [flash, setFlash] = useState(false)

  const stageRef = useRef(null)
  const labelRef = useRef(null)
  const sceneRef = useRef(null)

  /* --- 3D scene lifecycle --- */
  useEffect(() => {
    const stage = stageRef.current
    if (!stage) return undefined

    let scene = null
    try {
      scene = createOrbitScene(stage, {
        labelEl: labelRef.current,
        onReady: () => setSceneReady(true),
      })
      sceneRef.current = scene
    } catch (error) {
      console.error('[Orbit Jump] WebGL unavailable, using CSS planet.', error)
      setGlError(true)
      setSceneReady(true)
    }

    return () => {
      scene?.dispose()
      sceneRef.current = null
    }
  }, [])

  /* --- Language --- */
  useEffect(() => {
    document.documentElement.lang = lang
    try {
      window.localStorage.setItem('orbitjump.lang', lang)
    } catch {
      /* ignore */
    }
  }, [lang])

  /* --- Audio bootstrapping (autoplay policies need a gesture) --- */
  useEffect(() => {
    audio.setVolume(volume)
    audio.setMuted(muted)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const unlock = () => {
      audio.unlock().then((ok) => {
        if (ok) setAudioOn(true)
      })
    }
    const onKey = (event) => {
      if (event.key === 'Tab' || event.key === 'Shift') return
      unlock()
    }

    window.addEventListener('pointerdown', unlock, { once: true })
    window.addEventListener('keydown', onKey, { once: true })

    return () => {
      window.removeEventListener('pointerdown', unlock)
      window.removeEventListener('keydown', onKey)
    }
  }, [])

  useEffect(() => {
    if (phase === 'loading' || phase === 'ready') {
      sceneRef.current?.setPaused(true)
    }
  }, [phase])

  /* --- Handlers --- */
  const changeLanguage = (next) => {
    setLang(next)
  }

  const changeVolume = (value) => {
    setVolume(value)
    audio.setVolume(value)
    if (muted && value > 0) {
      setMuted(false)
      audio.setMuted(false)
    }
    try {
      window.localStorage.setItem('orbitjump.volume', String(value))
    } catch {
      /* ignore */
    }
  }

  const toggleMute = () => {
    const next = !muted
    setMuted(next)
    audio.setMuted(next)
    if (!next) {
      audio.unlock().then((ok) => {
        if (ok) setAudioOn(true)
      })
    }
  }

  const handlePlay = useCallback(() => {
    if (phase !== 'idle' || !sceneReady) return

    audio.unlock().then((ok) => {
      if (ok) setAudioOn(true)
    })
    audio.sfx('play')
    setPhase('launching')

    if (!sceneRef.current) {
      /* No WebGL: go straight to the loading screen. */
      window.setTimeout(() => setPhase('loading'), 600)
      return
    }

    sceneRef.current.playIntro({
      onWarp: () => {
        setWarp(true)
        audio.sfx('warp')
      },
      onFlash: () => setFlash(true),
      onComplete: () => {
        window.setTimeout(() => setPhase('loading'), 380)
      },
    })
  }, [phase, sceneReady])

  /* --- Keyboard start --- */
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Enter' && phase === 'idle' && !event.repeat) {
        event.preventDefault()
        handlePlay()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [handlePlay, phase])

  const handleLoaded = useCallback(() => {
    setPhase('ready')
    audio.sfx('ready')
  }, [])

  useEffect(() => {
    if (phase === 'ready') {
      window.dispatchEvent(new CustomEvent('orbitjump:ready'))
    }
  }, [phase])

  const isBusy = phase !== 'idle'

  return (
    <div className={`oj-shell${isBusy ? ' is-busy' : ''}`}>
      <div className="oj-bg" aria-hidden="true">
        <span className="oj-nebula oj-nebula--a" />
        <span className="oj-nebula oj-nebula--b" />
        <span className="oj-nebula oj-nebula--c" />
        <span className="oj-grain" />
      </div>

      <TopBar>
        <LanguageSelect lang={lang} onChange={changeLanguage} t={t} />
        <AudioControl
          volume={volume}
          muted={muted}
          onVolumeChange={changeVolume}
          onToggleMute={toggleMute}
          t={t}
        />
      </TopBar>

      <main className="oj-main">
        <header className="oj-hero">
          <p className="oj-eyebrow">{t.eyebrow}</p>
          <h1 className="oj-title">Orbit Jump</h1>
          <div className="oj-chakana" aria-hidden="true">
            <svg viewBox="0 0 260 22" fill="none">
              <path d="M0 11h84" stroke="currentColor" strokeWidth="1" opacity="0.32" />
              <path d="M176 11h84" stroke="currentColor" strokeWidth="1" opacity="0.32" />
              <path d="M96 11l9-9 9 9-9 9z" fill="currentColor" opacity="0.28" />
              <path d="M146 11l9-9 9 9-9 9z" fill="currentColor" opacity="0.28" />
              <path d="M119 2h9v5h6v12h-6v5h-9v-5h-6V7h6z" fill="currentColor" opacity="0.92" />
            </svg>
          </div>
          <p className="oj-tagline">{t.tagline}</p>
        </header>

        <section
          className="oj-stage"
          ref={stageRef}
          role="img"
          aria-label="Earth rotating in space with the NISAR satellite and a space station in orbit, Peru glowing over the Andes"
        >
          {glError && <div className="oj-earth-fallback" aria-hidden="true" />}
          <div className="oj-peru-label" ref={labelRef}>
            <span className="oj-peru-dot" aria-hidden="true" />
            <span>{t.peruLabel}</span>
          </div>
        </section>

        <PlayButton
          onClick={handlePlay}
          disabled={!sceneReady || isBusy}
          label={t.play}
          hint={sceneReady ? t.hint : t.preparing}
          ready={sceneReady}
        />
      </main>

      <footer className="oj-footer">
        <span className={`oj-audio-status${audioOn ? ' is-on' : ''}`}>
          <span className="oj-audio-wave" aria-hidden="true" />
          {audioOn ? t.audioOn : t.audioHint}
        </span>
        <span className="oj-credit">{t.footer}</span>
      </footer>

      {warp && <div className="oj-warp" aria-hidden="true" />}
      {flash && <div className="oj-flash" aria-hidden="true" />}

      {(phase === 'loading' || phase === 'ready') && (
        <LoadingScreen t={t} onComplete={handleLoaded} />
      )}
    </div>
  )
}
