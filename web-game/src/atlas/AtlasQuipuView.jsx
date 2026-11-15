import { useCallback, useEffect, useRef, useState } from 'react'
import './atlas.css'
import { MISIONES, MISIONES_MAP, RUTAS } from './misionesData.js'
import { CAMPO } from './campoData.js'
import { dibujarRadar, obtenerLeyenda } from './radarEngine.js'
import { Quipu } from './quipuCharacter.js'
import { Mundo } from './mundoEngine.js'
import LaboratorioView from './LaboratorioView.jsx'
import NasaEvidenceTab from './NasaEvidenceTab.jsx'
import WorldMapModal from './WorldMapModal.jsx'
import TopBar from '../landing/components/TopBar.jsx'
import LanguageSelect from '../landing/components/LanguageSelect.jsx'
import AudioControl from '../landing/components/AudioControl.jsx'
import { detectLanguage, getStrings } from '../landing/i18n.js'
import audio from '../landing/audio/audioEngine.js'
import { Orbit, Compass, Sparkles } from 'lucide-react'

const STORAGE_KEY = 'quipu.mundo.abierto.v2'

function cargarProgreso() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

export default function AtlasQuipuView({ onReturnToOrbit }) {
  // TopBar & audio state
  const [lang, setLang] = useState(detectLanguage)
  const t = getStrings(lang)
  const [volume, setVolume] = useState(() => {
    try {
      const v = Number(localStorage.getItem('orbitjump.volume'))
      return Number.isFinite(v) ? v : 0.55
    } catch {
      return 0.55
    }
  })
  const [muted, setMuted] = useState(false)

  // Game state
  const [currentRegionId, setCurrentRegionId] = useState('andes')
  const [estados, setEstados] = useState(() => {
    const saved = cargarProgreso()
    const inicial = {}
    for (const m of MISIONES) {
      const s = saved.estados?.[m.id]
      inicial[m.id] = {
        radar: !!s?.radar,
        muestras: s ? Number(s.muestras) & 3 : 0,
        resuelto: !!s?.resuelto
      }
    }
    return inicial
  })
  const [resueltas, setResueltas] = useState(() => {
    const saved = cargarProgreso()
    const res = new Set()
    for (const m of MISIONES) {
      if (saved.estados?.[m.id]?.resuelto) res.add(m.id)
    }
    return res
  })

  const [radarModo, setRadarModo] = useState('cambio') // 'antes' | 'despues' | 'cambio' | 'nasa'
  const [mensaje, setMensaje] = useState('Abriendo la expedición…')
  const [ubicacionTexto, setUbicacionTexto] = useState('')
  const [lugarTitulo, setLugarTitulo] = useState('Laguna San Nicolás')
  const [cartaOpen, setCartaOpen] = useState(false)
  const cartaOpenRef = useRef(cartaOpen)
  useEffect(() => {
    cartaOpenRef.current = cartaOpen
  }, [cartaOpen])
  const [destino, setDestino] = useState(null)
  const [cortinaActiva, setCortinaActiva] = useState(false)
  const [quipuPos, setQuipuPos] = useState(Mundo.inicio)

  // Refs for canvas and game loop
  const mainCanvasRef = useRef(null)
  const miniMapaRef = useRef(null)
  const syntheticRadarCanvasRef = useRef(null)

  // Mutable game loop references to avoid recreating animations
  const gameStateRef = useRef({
    quipu: null,
    interiores: {},
    adentro: false,
    retorno: null,
    salto: null,
    puertaLibre: true,
    teclas: new Map(),
    marcaInvestigada: null,
    tiempo: 0,
    anterior: null,
    tMini: -1,
    cortina: false,
    id: 'andes',
    destino: null,
    estados: {},
    resueltas: new Set()
  })

  // Sync state refs
  useEffect(() => {
    gameStateRef.current.estados = estados
    gameStateRef.current.resueltas = resueltas
    gameStateRef.current.id = currentRegionId
    gameStateRef.current.destino = destino
  }, [estados, resueltas, currentRegionId, destino])

  // Save progress helper
  const guardar = useCallback(() => {
    const gs = gameStateRef.current
    try {
      const pos = gs.adentro ? gs.retorno : gs.quipu ? [Math.round(gs.quipu.x), Math.round(gs.quipu.y)] : Mundo.inicio
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ estados: gs.estados, pos }))
    } catch {
      /* ignore */
    }
  }, [])

  // Refugiar player if trapped in changed landscape
  const refugiar = useCallback(() => {
    const gs = gameStateRef.current
    if (gs.adentro || !gs.quipu || Mundo.legal(gs.quipu.x, gs.quipu.y, gs.resueltas)) return
    for (let r = 1; r <= 64; r++) {
      for (const [dx, dy] of [[0, r], [-r, 0], [r, 0], [0, -r], [-r, r], [r, r]]) {
        if (Mundo.legal(gs.quipu.x + dx, gs.quipu.y + dy, gs.resueltas)) {
          gs.quipu.x += dx
          gs.quipu.y += dy
          return
        }
      }
    }
    gs.quipu.x = Mundo.inicio[0]
    gs.quipu.y = Mundo.inicio[1]
  }, [])

  // Terminar caso (resolve case)
  const terminarCaso = useCallback(() => {
    const gs = gameStateRef.current
    const cid = gs.id
    const s = gs.estados[cid]
    if (!s || s.muestras !== 3 || s.resuelto) return

    s.resuelto = true
    const nextResueltas = new Set(gs.resueltas)
    nextResueltas.add(cid)
    setResueltas(nextResueltas)
    gs.resueltas = nextResueltas

    setEstados({ ...gs.estados })
    refugiar()
    guardar()

    const m = MISIONES_MAP.get(cid)
    if (m) setMensaje(m.cierre)
    audio.sfx('ready')
  }, [guardar, refugiar])

  // Action executor
  const ejecutarAccion = useCallback((accion) => {
    const gs = gameStateRef.current
    if (gs.cortina || cartaOpen || !gs.quipu) return
    if (!gs.quipu.hacer(accion)) return

    if (accion === 'saludar') {
      audio.sfx('click')
      setMensaje('Quipu levanta la pata. ' + (gs.adentro ? 'El equipo le devuelve el saludo.' : 'El sendero continúa.'))
      return
    }
    if (accion === 'explorar') {
      audio.sfx('click')
      setMensaje(gs.adentro ? 'Consultando el cuaderno del refugio…' : 'Quipu saca la lupa de exploración SAR…')
      return
    }
    if (accion === 'saltar') {
      audio.sfx('play')
      if (!gs.adentro) {
        const fin = Mundo.salto(gs.quipu.x, gs.quipu.y, gs.quipu.direccion, gs.resueltas)
        if (fin) gs.salto = { inicio: [gs.quipu.x, gs.quipu.y], fin }
      }
    }
  }, [cartaOpen])

  // Interior transition
  const traspasar = useCallback(() => {
    const gs = gameStateRef.current
    if (gs.cortina) return
    gs.cortina = true
    setCortinaActiva(true)
    gs.teclas.clear()
    if (gs.quipu) gs.quipu.accion = null
    gs.salto = null

    audio.sfx('warp')

    setTimeout(() => {
      const cid = gs.id
      const m = MISIONES_MAP.get(cid)
      if (gs.adentro) {
        gs.adentro = false
        if (gs.quipu && gs.retorno) {
          gs.quipu.x = gs.retorno[0]
          gs.quipu.y = gs.retorno[1]
          gs.quipu.direccion = 'frente'
        }
        gs.puertaLibre = false
        setLugarTitulo(m ? m.lugar : 'Laguna San Nicolás')
        setMensaje(`Regresas al camino de ${m?.lugar || ''}.`)
      } else {
        if (gs.quipu) {
          gs.retorno = [gs.quipu.x, gs.quipu.y]
          gs.quipu.x = 192
          gs.quipu.y = 203
          gs.quipu.direccion = 'espalda'
        }
        gs.adentro = true
        const sitio = Mundo.sitios[cid]
        setLugarTitulo(sitio ? sitio.nombre : 'Refugio')
        setMensaje('Investiga con E en el interior. La salida está al sur.')
      }
      setCortinaActiva(false)
      setTimeout(() => {
        gs.cortina = false
      }, 230)
    }, 220)
  }, [])

  // Al explorar callback (lupa finished)
  const alExplorarQuipu = useCallback(() => {
    const gs = gameStateRef.current
    const cid = gs.id
    const m = MISIONES_MAP.get(cid)
    const s = gs.estados[cid]
    const sitio = Mundo.sitios[cid]
    if (!m || !s || !sitio || !gs.quipu) return

    if (gs.adentro) {
      setMensaje(`${sitio.nombre}. ${m.leccion}`)
      audio.sfx('click')
      return
    }
    if (s.resuelto) {
      setMensaje(m.cierre)
      audio.sfx('click')
      return
    }
    if (!s.radar) {
      s.radar = true
      setEstados({ ...gs.estados })
      guardar()
      setMensaje('Hay dos registros en la bitácora. Busca las marcas de campo con la ayuda de la carta.')
      audio.sfx('ready')
      return
    }

    const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1])
    const qPos = [gs.quipu.x, gs.quipu.y]
    const idx = sitio.muestras.findIndex(
      (p, i) => !(s.muestras & (1 << i)) && dist(qPos, p) <= 22
    )
    if (idx >= 0) {
      s.muestras |= 1 << idx
      gs.marcaInvestigada = { p: sitio.muestras[idx], hasta: gs.tiempo + 1.5 }
      setEstados({ ...gs.estados })
      guardar()
      audio.sfx('ready')
      setMensaje(
        CAMPO[cid].notas[idx] +
          (s.muestras === 3 ? ' Completa la tarea de la bitácora en el Laboratorio.' : '')
      )
      return
    }

    audio.sfx('click')
    setMensaje(
      s.muestras === 3
        ? CAMPO[cid].instruccion
        : 'La lupa señala los puntos aún pendientes. Consulta el minimapa.'
    )
  }, [guardar])

  // Initialize graphics & load character
  useEffect(() => {
    let animId = null
    let activo = true

    const foto = (nombre) =>
      new Promise((ok, fail) => {
        const i = new Image()
        i.onload = () => ok(i)
        i.onerror = () => fail(new Error('No se pudo cargar interior: ' + nombre))
        i.src = `/atlas/interiores/${nombre}.webp`
      })

    const inicializarJuego = async () => {
      try {
        await Promise.all([
          Mundo.cargar('/atlas/mundo/'),
          ...MISIONES.map(async (m) => {
            gameStateRef.current.interiores[m.id] = await foto(m.id)
          })
        ])

        const saved = cargarProgreso()
        const cargaPos =
          Array.isArray(saved.pos) &&
          saved.pos.every(Number.isFinite) &&
          Mundo.legal(saved.pos[0], saved.pos[1], gameStateRef.current.resueltas)
            ? saved.pos
            : Mundo.inicio

        const q = await Quipu.cargar({
          carpeta: '/atlas/quipu/',
          x: cargaPos[0],
          y: cargaPos[1],
          velocidad: 97,
          alExplorar: alExplorarQuipu
        })

        if (!activo) return
        gameStateRef.current.quipu = q
        const initialRegion = Mundo.region(q.x, q.y)
        gameStateRef.current.id = initialRegion
        setCurrentRegionId(initialRegion)
        setLugarTitulo(MISIONES_MAP.get(initialRegion)?.lugar || 'Laguna San Nicolás')
        setMensaje('Usa E para abrir el radar. Camina con WASD / flechas; pulsa M para la carta.')

        // Game animation loop
        const loop = (ms) => {
          if (!activo) return
          const gs = gameStateRef.current
          const dt = gs.anterior === null ? 0 : Math.min(0.05, (ms - gs.anterior) / 1000)
          gs.anterior = ms
          gs.tiempo += dt

          const canvas = mainCanvasRef.current
          const ctx = canvas ? canvas.getContext('2d') : null

          if (!gs.cortina && !cartaOpenRef.current && gs.quipu) {
            const direccion = Array.from(gs.teclas.values()).at(-1) || null
            const legalInterior = (x, y) =>
              (x >= 76 && x <= 289 && y >= 139 && y <= 211) ||
              (x >= 177 && x <= 203 && y >= 207 && y <= 246)

            gs.quipu.actualizar(
              dt,
              gs.salto ? null : direccion,
              gs.adentro ? legalInterior : (x, y) => Mundo.legal(x, y, gs.resueltas)
            )

            if (gs.salto) {
              const tVal = gs.quipu.accion === 'saltar' ? Math.min(1, gs.quipu.tiempoAccion / 0.64) : 1
              gs.quipu.x = gs.salto.inicio[0] + (gs.salto.fin[0] - gs.salto.inicio[0]) * tVal
              gs.quipu.y = gs.salto.inicio[1] + (gs.salto.fin[1] - gs.salto.inicio[1]) * tVal
              if (tVal === 1) gs.salto = null
            }

            // Region update
            if (!gs.adentro) {
              const nuevaRegion = Mundo.region(gs.quipu.x, gs.quipu.y)
              if (nuevaRegion !== gs.id) {
                gs.id = nuevaRegion
                setCurrentRegionId(nuevaRegion)
                if (gs.destino === nuevaRegion) {
                  gs.destino = null
                  setDestino(null)
                }
                const mData = MISIONES_MAP.get(nuevaRegion)
                setLugarTitulo(mData ? mData.lugar : '')
                setMensaje(`Llegaste a ${mData?.lugar || ''}. Usa E para investigar el caso SAR.`)
                guardar()
              }
            }

            // Door check
            if (!gs.quipu.accion && !gs.salto) {
              const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1])
              const qCoord = [gs.quipu.x, gs.quipu.y]
              if (gs.adentro) {
                if (dist(qCoord, [192, 235]) < 8) traspasar()
              } else {
                const sitio = Mundo.sitios[gs.id]
                if (sitio) {
                  const d = dist(qCoord, sitio.puerta)
                  if (d > 15) gs.puertaLibre = true
                  if (d <= 6 && gs.puertaLibre) traspasar()
                }
              }
            }
          }

          // Render canvas
          if (ctx && canvas && gs.quipu) {
            const w = canvas.width
            const h = canvas.height
            const cx = gs.adentro ? 0 : Math.round(Math.max(0, Math.min(Mundo.ancho - w, gs.quipu.x - w / 2)))
            const cy = gs.adentro ? 0 : Math.round(Math.max(0, Math.min(Mundo.alto - h, gs.quipu.y - h * 0.53)))

            ctx.imageSmoothingEnabled = false
            if (gs.adentro && gs.interiores[gs.id]) {
              ctx.drawImage(gs.interiores[gs.id], 0, 0, w, h)
            } else {
              Mundo.dibujar(ctx, cx, cy, gs.resueltas, gs.tiempo)
            }

            ctx.save()
            ctx.translate(-cx, -cy)

            const aro = (x, y, color, radio = 8) => {
              ctx.save()
              ctx.strokeStyle = '#05060d'
              ctx.lineWidth = 3
              ctx.beginPath()
              ctx.ellipse(x, y, radio, radio * 0.47, 0, 0, Math.PI * 2)
              ctx.stroke()
              ctx.strokeStyle = color
              ctx.lineWidth = 1.4
              ctx.stroke()
              ctx.restore()
            }

            const sState = gs.estados[gs.id]
            const sitioActual = Mundo.sitios[gs.id]
            if (!gs.adentro && sState?.radar && !sState?.resuelto && sitioActual) {
              sitioActual.muestras.forEach(([mx, my], i) => {
                if (!(sState.muestras & (1 << i))) {
                  aro(mx, my, '#ffe180', 9 + Math.sin(gs.tiempo * 3))
                  ctx.fillStyle = '#fff0b1'
                  ctx.fillRect(mx - 1, my - 2, 3, 3)
                }
              })
            }

            if (gs.marcaInvestigada && !gs.adentro && gs.tiempo < gs.marcaInvestigada.hasta) {
              aro(gs.marcaInvestigada.p[0], gs.marcaInvestigada.p[1], '#a9ebc0', 11)
            }

            if (sitioActual) {
              const puertaCoord = gs.adentro ? [192, 235] : sitioActual.puerta
              aro(puertaCoord[0], puertaCoord[1], '#bfe6ed', 5)
            }

            gs.quipu.dibujar(ctx)

            if (gs.quipu.accion === 'explorar' && !gs.adentro) {
              aro(gs.quipu.x, gs.quipu.y, '#e2dc90', 6 + gs.quipu.tiempoAccion * 18)
            }

            ctx.restore()
          }

          // Minimap update every 0.2s
          if (gs.tiempo - gs.tMini > 0.2 && miniMapaRef.current && gs.quipu) {
            const mCtx = miniMapaRef.current.getContext('2d')
            const pCoord = gs.adentro ? gs.retorno : [gs.quipu.x, gs.quipu.y]
            const metaCoord = gs.destino && Mundo.sitios[gs.destino] ? Mundo.sitios[gs.destino].puerta : null
            Mundo.mini(mCtx, pCoord[0], pCoord[1], metaCoord)
            gs.tMini = gs.tiempo
            setQuipuPos([Math.round(gs.quipu.x), Math.round(gs.quipu.y)])

            // Update route text
            if (gs.adentro) {
              setUbicacionTexto('Salida al sur · E para consultar el refugio')
            } else if (metaCoord) {
              const dx = metaCoord[0] - gs.quipu.x
              const dy = metaCoord[1] - gs.quipu.y
              const d = Math.hypot(dx, dy)
              const flechas = ['→', '↘', '↓', '↙', '←', '↖', '↑', '↗']
              const dirIdx = (Math.round((Math.atan2(dy, dx) * 4) / Math.PI) + 8) % 8
              const rNom = RUTAS[gs.destino] || 'Destino'
              setUbicacionTexto(
                d <= 19
                  ? `E · ${rNom}`
                  : `${flechas[dirIdx]} ${rNom} · ${Math.ceil(d / 16)} casillas`
              )
            } else {
              setUbicacionTexto(
                gs.estados[gs.id]?.resuelto
                  ? 'Caso resuelto · pulsa M para explorar otra región'
                  : ''
              )
            }
          }

          animId = requestAnimationFrame(loop)
        }

        animId = requestAnimationFrame(loop)
      } catch (err) {
        console.error('Error al inicializar Atlas Quipu:', err)
        setMensaje('Error al cargar el mundo de Quipu: ' + err.message)
      }
    }

    inicializarJuego()

    return () => {
      activo = false
      if (animId) cancelAnimationFrame(animId)
    }
  }, [alExplorarQuipu, guardar, traspasar])

  // Keyboard navigation & controls
  useEffect(() => {
    const dirsMap = {
      arrowup: 'espalda',
      w: 'espalda',
      arrowdown: 'frente',
      s: 'frente',
      arrowleft: 'izquierda',
      a: 'izquierda',
      arrowright: 'derecha',
      d: 'derecha'
    }

    const onKeyDown = (e) => {
      if (e.altKey || e.ctrlKey || e.metaKey) return
      const k = e.key.toLowerCase()

      if (k === 'm') {
        if (!e.repeat) {
          e.preventDefault()
          setCartaOpen((prev) => {
            const next = !prev
            if (next) audio.sfx('ready')
            else audio.sfx('click')
            return next
          })
        }
        return
      }

      if (k === 'escape') {
        if (cartaOpen) {
          e.preventDefault()
          audio.sfx('click')
          setCartaOpen(false)
        }
        return
      }

      if (cartaOpen || e.target?.tagName === 'INPUT') return

      if (Object.hasOwn(dirsMap, k)) {
        e.preventDefault()
        if (!e.repeat) gameStateRef.current.teclas.set(k, dirsMap[k])
      } else if (k === 'e' && !e.repeat) {
        e.preventDefault()
        ejecutarAccion('explorar')
      } else if (k === 'j' && !e.repeat) {
        e.preventDefault()
        ejecutarAccion('saltar')
      } else if (k === 'h' && !e.repeat) {
        e.preventDefault()
        ejecutarAccion('saludar')
      }
    }

    const onKeyUp = (e) => {
      gameStateRef.current.teclas.delete(e.key.toLowerCase())
    }

    const onBlur = () => {
      gameStateRef.current.teclas.clear()
      guardar()
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    window.addEventListener('blur', onBlur)
    window.addEventListener('pagehide', guardar)

    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
      window.removeEventListener('blur', onBlur)
      window.removeEventListener('pagehide', guardar)
    }
  }, [cartaOpen, ejecutarAccion, guardar])

  // Draw synthetic radar when active
  useEffect(() => {
    if (radarModo === 'nasa') return
    const canvas = syntheticRadarCanvasRef.current
    const m = MISIONES_MAP.get(currentRegionId)
    const s = estados[currentRegionId]
    if (canvas && m && s?.radar) {
      dibujarRadar(canvas, m, radarModo)
    }
  }, [currentRegionId, estados, radarModo])

  // Audio handlers
  const handleVolumeChange = (val) => {
    setVolume(val)
    audio.setVolume(val)
    if (muted && val > 0) {
      setMuted(false)
      audio.setMuted(false)
    }
    try {
      localStorage.setItem('orbitjump.volume', String(val))
    } catch {
      /* ignore */
    }
  }

  const handleToggleMute = () => {
    const next = !muted
    setMuted(next)
    audio.setMuted(next)
  }

  const handleReturnOrbit = () => {
    audio.sfx('back')
    guardar()
    if (onReturnToOrbit) onReturnToOrbit()
  }

  // Active mission & status info
  const misionActual = MISIONES_MAP.get(currentRegionId) || MISIONES[0]
  const estadoActual = estados[currentRegionId] || { radar: false, muestras: 0, resuelto: false }
  const campoActual = CAMPO[currentRegionId]

  return (
    <div className="atlas-container">
      {/* TopBar with Return to Orbit, Language, and Audio */}
      <TopBar>
        <button
          type="button"
          className="orbit-return-btn"
          onClick={handleReturnOrbit}
          title="Regresar a la visualización 3D en órbita"
        >
          <Orbit size={15} />
          <span>Órbita 3D</span>
        </button>
        <LanguageSelect lang={lang} onChange={setLang} t={t} />
        <AudioControl
          volume={volume}
          muted={muted}
          onVolumeChange={handleVolumeChange}
          onToggleMute={handleToggleMute}
          t={t}
        />
      </TopBar>

      {/* Sub-header with avatar & title */}
      <div className="atlas-subnav">
        <div className="atlas-brand">
          <div className="atlas-avatar" aria-hidden="true">
            <i />
          </div>
          <div className="atlas-title-group">
            <p>Mundo Abierto SAR &bull; Quipu</p>
            <h1>Atlas del Eco</h1>
          </div>
        </div>
        <div className="atlas-progress-badge">
          <strong>{resueltas.size} / 5</strong>
          <span>Casos Resueltos</span>
        </div>
      </div>

      {/* Main 2-column layout */}
      <div className="atlas-grid">
        {/* Left: 2D World Viewport */}
        <div className="atlas-visor-card">
          <div className="visor-header">
            <div className="visor-location">
              <span className="location-diamond" aria-hidden="true" />
              <span>{lugarTitulo}</span>
            </div>
            <button
              type="button"
              className="carta-trigger-btn"
              onClick={() => {
                audio.sfx('click')
                setCartaOpen(true)
              }}
              title="Abrir carta del mundo (M)"
            >
              <Compass size={14} className="inline mr-1" />
              Carta <kbd>M</kbd>
            </button>
          </div>

          <div className="visor-viewport">
            <canvas
              ref={mainCanvasRef}
              width={384}
              height={256}
              className="atlas-main-canvas"
              tabIndex={0}
              aria-label="Mundo abierto de Quipu. Camina con las flechas o WASD."
            />
            <div className={`viewport-curtain ${cortinaActiva ? 'is-active' : ''}`} />
            {ubicacionTexto && <div className="viewport-hud">{ubicacionTexto}</div>}
          </div>

          <div className="visor-status" role="status">
            <b>Quipu:</b>
            <span>{mensaje}</span>
          </div>

          {/* Controls Bar: D-Pad & Actions */}
          <div className="visor-controls-bar">
            <div className="dpad-container" aria-label="Mover a Quipu">
              <div />
              <button
                type="button"
                className="dpad-btn"
                onPointerDown={() => gameStateRef.current.teclas.set('pad_up', 'espalda')}
                onPointerUp={() => gameStateRef.current.teclas.delete('pad_up')}
                aria-label="Arriba"
              >
                ↑
              </button>
              <div />
              <button
                type="button"
                className="dpad-btn"
                onPointerDown={() => gameStateRef.current.teclas.set('pad_left', 'izquierda')}
                onPointerUp={() => gameStateRef.current.teclas.delete('pad_left')}
                aria-label="Izquierda"
              >
                ←
              </button>
              <button
                type="button"
                className="dpad-btn"
                onPointerDown={() => gameStateRef.current.teclas.set('pad_down', 'frente')}
                onPointerUp={() => gameStateRef.current.teclas.delete('pad_down')}
                aria-label="Abajo"
              >
                ↓
              </button>
              <button
                type="button"
                className="dpad-btn"
                onPointerDown={() => gameStateRef.current.teclas.set('pad_right', 'derecha')}
                onPointerUp={() => gameStateRef.current.teclas.delete('pad_right')}
                aria-label="Derecha"
              >
                →
              </button>
            </div>

            <div className="actions-container">
              <button
                type="button"
                className="action-btn primario"
                onClick={() => ejecutarAccion('explorar')}
              >
                Investigar <kbd>E</kbd>
              </button>
              <button
                type="button"
                className="action-btn"
                onClick={() => ejecutarAccion('saltar')}
              >
                Saltar <kbd>J</kbd>
              </button>
              <button
                type="button"
                className="action-btn"
                onClick={() => ejecutarAccion('saludar')}
              >
                Saludar <kbd>H</kbd>
              </button>
            </div>
          </div>

          <details className="visor-help">
            <summary>Guía de controles de la expedición</summary>
            <p>
              Muévete con las flechas o <strong>WASD</strong>. Acércate a una pista o al refugio e investiga con <strong>E</strong>.
              Mira hacia un obstáculo bajo y pulsa <strong>J</strong> para saltar. Cruza la marca azul de una puerta para entrar al refugio.
              En cada región recoge los indicios y resuelve la tarea en la bitácora. Pulsa <strong>M</strong> para la Carta del Mundo.
            </p>
          </details>
        </div>

        {/* Right: Notebook (Bitácora) */}
        <aside className="atlas-sidebar">
          {/* Orientation Card */}
          <div className="atlas-orient-card">
            <canvas
              ref={miniMapaRef}
              width={156}
              height={94}
              className="minimap-canvas"
              aria-label="Minimapa con la posición de Quipu"
            />
            <div className="orient-text">
              <h3>Orientación SAR</h3>
              <p>El punto blanco eres tú. El marco dorado señala tu destino.</p>
            </div>
          </div>

          {/* Cuaderno de Campo */}
          <article className="atlas-notebook-card">
            <div className="notebook-folio">
              <span>Bitácora SAR</span>
              <span>{RUTAS[currentRegionId]}</span>
            </div>

            <h2 className="notebook-title">{misionActual.titulo}</h2>
            <p className="notebook-story">{misionActual.historia}</p>

            <div className="notebook-phase-banner">
              <b>
                {estadoActual.resuelto
                  ? 'Caso Resuelto'
                  : !estadoActual.radar
                    ? 'Primera Observación'
                    : estadoActual.muestras !== 3
                      ? `Muestreo de Campo · ${(estadoActual.muestras & 1) + (estadoActual.muestras >> 1)}/2`
                      : 'Mesa de Interpretación'}
              </b>
              <p>
                {estadoActual.resuelto
                  ? resueltas.size === 5
                    ? '¡Atlas completo! Has resuelto todos los misterios SAR.'
                    : `${misionActual.efecto}. Elige otro destino en la carta.`
                  : !estadoActual.radar
                    ? 'Usa E para consultar las dos pasadas del radar SAR de esta región.'
                    : estadoActual.muestras !== 3
                      ? `Investiga con E: ${campoActual.puntos.filter((_, i) => !(estadoActual.muestras & (1 << i))).join(' y ')}.`
                      : `${campoActual.titulo}. Usa el laboratorio abajo para completar el trabajo.`}
              </p>
            </div>

            {/* Radar Evidence Section */}
            {estadoActual.radar && (
              <section className="notebook-section">
                <h3>Evidencias y Lecturas de Radar</h3>
                <div className="evidence-tabs-bar">
                  <button
                    type="button"
                    className={`ev-tab-btn ${radarModo === 'antes' ? 'is-active' : ''}`}
                    onClick={() => {
                      audio.sfx('click')
                      setRadarModo('antes')
                    }}
                  >
                    Antes
                  </button>
                  <button
                    type="button"
                    className={`ev-tab-btn ${radarModo === 'despues' ? 'is-active' : ''}`}
                    onClick={() => {
                      audio.sfx('click')
                      setRadarModo('despues')
                    }}
                  >
                    Después
                  </button>
                  <button
                    type="button"
                    className={`ev-tab-btn ${radarModo === 'cambio' ? 'is-active' : ''}`}
                    onClick={() => {
                      audio.sfx('click')
                      setRadarModo('cambio')
                    }}
                  >
                    Cambio
                  </button>
                  <button
                    type="button"
                    className={`ev-tab-btn is-nasa ${radarModo === 'nasa' ? 'is-active' : ''}`}
                    onClick={() => {
                      audio.sfx('click')
                      setRadarModo('nasa')
                    }}
                  >
                    <Sparkles size={12} className="inline mr-1" />
                    Datos Reales NASA / ASF
                  </button>
                </div>

                {radarModo === 'nasa' ? (
                  <NasaEvidenceTab key={currentRegionId} regionId={currentRegionId} />
                ) : (
                  <div>
                    <canvas
                      ref={syntheticRadarCanvasRef}
                      width={256}
                      height={104}
                      className="radar-canvas-view"
                      aria-label="Visualización SAR simulada"
                    />
                    <p className="radar-legend">{obtenerLeyenda(misionActual, radarModo)}</p>

                    <div className="radar-readings-grid">
                      <div className="reading-cell">
                        <small>{misionActual.fecha1}</small>
                        <b>
                          {misionActual.antes} {misionActual.unidad}
                        </b>
                      </div>
                      <div className="reading-cell">
                        <small>{misionActual.fecha2}</small>
                        <b>
                          {misionActual.despues} {misionActual.unidad}
                        </b>
                      </div>
                    </div>

                    <p className="radar-pista">{misionActual.pista}</p>
                  </div>
                )}
              </section>
            )}

            {/* Field Samples Notes */}
            {Boolean(estadoActual.muestras) && (
              <section className="notebook-section">
                <h3>Apunte de Campo</h3>
                <p className="field-notes-text">
                  {campoActual.notas.filter((_, i) => estadoActual.muestras & (1 << i)).join(' ')}
                </p>
              </section>
            )}

            {/* Interactive Laboratory Minigame */}
            {estadoActual.muestras === 3 && !estadoActual.resuelto && (
              <section className="notebook-section">
                <h3>{campoActual.titulo}</h3>
                <p className="text-xs text-[var(--nb-muted)] mb-2">{campoActual.instruccion}</p>
                <LaboratorioView
                  key={currentRegionId}
                  regionId={currentRegionId}
                  onCompletado={terminarCaso}
                />
              </section>
            )}

            {/* Resolved Case Conclusion */}
            {estadoActual.resuelto && (
              <section className="notebook-section">
                <div className="resolution-block">
                  <h3>Conclusión del Caso</h3>
                  <p>{misionActual.cierre}</p>
                  <div className="resolution-actions">
                    <button
                      type="button"
                      className="lab-btn"
                      onClick={() => {
                        audio.sfx('click')
                        const cid = currentRegionId
                        setEstados((prev) => ({
                          ...prev,
                          [cid]: { radar: false, muestras: 0, resuelto: false }
                        }))
                        setResueltas((prev) => {
                          const next = new Set(prev)
                          next.delete(cid)
                          return next
                        })
                        refugiar()
                        guardar()
                        setMensaje('Caso reabierto. Usa E para recuperar las observaciones.')
                      }}
                    >
                      Repetir este caso
                    </button>
                    <button
                      type="button"
                      className="lab-btn primario"
                      onClick={() => {
                        audio.sfx('ready')
                        setCartaOpen(true)
                      }}
                    >
                      Consultar la Carta &rarr;
                    </button>
                  </div>
                </div>
              </section>
            )}
          </article>
        </aside>
      </div>

      {/* World Map Modal */}
      <WorldMapModal
        isOpen={cartaOpen}
        onClose={() => setCartaOpen(false)}
        misiones={MISIONES}
        resueltas={resueltas}
        posicion={quipuPos}
        destino={destino}
        onSelectDestino={(id) => {
          setDestino(id)
          setCartaOpen(false)
        }}
      />
    </div>
  )
}
