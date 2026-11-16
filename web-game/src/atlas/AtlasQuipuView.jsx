import { useCallback, useEffect, useRef, useState } from 'react'
import './atlas.css'
import { MISIONES, MISIONES_MAP, RUTAS } from './misionesData.js'
import { CAMPO } from './campoData.js'
import { MISSIONS_EN, FIELD_EN } from './englishData.js'
import { Quipu } from './quipuCharacter.js'
import { Mundo } from './mundoEngine.js'
import LaboratorioView from './LaboratorioView.jsx'
import NasaEvidenceTab from './NasaEvidenceTab.jsx'
import TriviaQuipu from './TriviaQuipu.jsx'
import QuipuWelcome from './QuipuWelcome.jsx'
import WorldMapModal from './WorldMapModal.jsx'
import TopBar from '../landing/components/TopBar.jsx'
import LanguageSelect from '../landing/components/LanguageSelect.jsx'
import AudioControl from '../landing/components/AudioControl.jsx'
import { getStrings } from '../landing/i18n.js'
import audio from '../landing/audio/audioEngine.js'
import { Orbit, Compass, Check } from 'lucide-react'

// Keep progress only while this page is open, including trips back to orbit.
// A reload or a new visit starts a fresh expedition.
let progresoSesion = {}

function cargarProgreso() {
  return progresoSesion
}

function englishStatus(text) {
  let result = text
  for (const mission of MISIONES) {
    const en = MISSIONS_EN[mission.id]
    for (const key of ['lugar', 'leccion', 'cierre']) {
      if (mission[key]) result = result.replace(mission[key], en[key])
    }
    CAMPO[mission.id].notas.forEach((note, i) => { result = result.replace(note, FIELD_EN[mission.id].notas[i]) })
    result = result.replace(CAMPO[mission.id].instruccion, FIELD_EN[mission.id].instruccion)
  }
  const phrases = {
    'Abriendo la expedición…': 'Opening the expedition…',
    'Bitácora completada. QIPU tiene unas preguntas para ti.': 'Field journal complete. QIPU has some questions for you.',
    'Quipu levanta la pata. ': 'Quipu waves. ', 'El equipo le devuelve el saludo.': 'The team waves back.', 'El sendero continúa.': 'The path continues.',
    'Consultando el cuaderno del refugio…': 'Checking the shelter journal…', 'Quipu saca la lupa de exploración SAR…': 'Quipu takes out the SAR magnifying glass…',
    'Investiga con E en el interior. La salida está al sur.': 'Press E to investigate inside. The exit is to the south.',
    'Hay dos registros en la bitácora. Busca las marcas de campo con la ayuda de la carta.': 'There are two field records. Use the map to find the field markers.',
    ' Completa la tarea de la bitácora en el Laboratorio.': ' Open field notes to complete the activity.',
    'La lupa señala los puntos aún pendientes. Consulta el minimapa.': 'The magnifying glass points to remaining clues. Check the minimap.',
    'Usa E para abrir el radar. Camina con WASD / flechas; pulsa M para la carta.': 'Press E to inspect radar. Move with WASD or arrows; press M for the map.',
    'Caso reabierto. Usa E para recuperar las observaciones.': 'Case reopened. Press E to collect observations.',
    'Archivo de Namora': 'Namora archive', 'Cabaña del dosel': 'Canopy cabin', 'Refugio de Bafín': 'Baffin shelter', 'Archivo del puerto': 'Harbor archive', 'Observatorio del domo': 'Dome observatory',
    'Error al cargar el mundo de Quipu:': 'Could not load Quipu’s world:',
    'Salida al sur · E para consultar el refugio': 'Exit south · press E to inspect the shelter',
    'Caso resuelto · pulsa M para explorar otra región': 'Case solved · press M to explore another region',
    ' casillas': ' tiles', 'Amazonía': 'Amazon', 'Bafín': 'Baffin', 'Yakarta': 'Jakarta', 'Destino': 'Destination'
  }
  for (const [es, en] of Object.entries(phrases)) result = result.replace(es, en)
  result = result.replace(/^Regresas al camino de (.*)\.$/, 'Returning to the path at $1.')
  result = result.replace(/^Llegaste a (.*)\. Usa E para investigar el caso SAR\.$/, 'Arrived at $1. Press E to investigate the SAR case.')
  return result
}

function DialogoJuego({ titulo, onCerrar, children, clase = '', atajoCerrar }) {
  const panelRef = useRef(null)
  useEffect(() => {
    const anterior = document.activeElement
    panelRef.current?.focus()
    return () => anterior?.focus?.()
  }, [])

  const manejarTeclado = (event) => {
    if ((event.key === 'Escape' || (atajoCerrar && event.key.toLowerCase() === atajoCerrar && !event.target.closest('input, textarea, select'))) && onCerrar) {
      event.preventDefault()
      event.stopPropagation()
      onCerrar()
    }
    if (event.key !== 'Tab') return
    const botones = [...panelRef.current.querySelectorAll('button:not(:disabled), a[href], input:not(:disabled), select:not(:disabled)')]
    if (!botones.length) { event.preventDefault(); return }
    if (event.shiftKey && (document.activeElement === botones[0] || document.activeElement === panelRef.current)) {
      event.preventDefault()
      botones.at(-1).focus()
    } else if (!event.shiftKey && document.activeElement === botones.at(-1)) {
      event.preventDefault()
      botones[0].focus()
    }
  }
  return (
    <div className="juego-dialogo-fondo">
      <section className={`juego-dialogo ${clase}`} role="dialog" aria-modal="true" aria-label={titulo} tabIndex={-1} ref={panelRef} onKeyDown={manejarTeclado}>
        {children}
      </section>
    </div>
  )
}

export default function AtlasQuipuView({ lang, onLanguageChange, mostrarBienvenida, onTutorialFinish, onReturnToOrbit }) {
  // TopBar & audio state
  const t = getStrings(lang)
  const en = lang === 'en'
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
        resuelto: !!s?.resuelto,
        triviaPendiente: !!s?.triviaPendiente
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

  const [triviaRegion, setTriviaRegion] = useState(null)
  const [bienvenidaOpen, setBienvenidaOpen] = useState(() => mostrarBienvenida)
  const [apuntesOpen, setApuntesOpen] = useState(false)
  const [nasaExtrasHost, setNasaExtrasHost] = useState(null)
  const [panelInfo, setPanelInfo] = useState(null)
  const [notificacion, setNotificacion] = useState(null)
  const evidenciaRef = useRef(null)
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
  const triviaActiva = triviaRegion === currentRegionId || (!estados[currentRegionId]?.resuelto && !!estados[currentRegionId]?.triviaPendiente)
  const dialogoAbiertoRef = useRef(bienvenidaOpen)

  // Refs for canvas and game loop
  const mainCanvasRef = useRef(null)
  const miniMapaRef = useRef(null)

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

  useEffect(() => {
    dialogoAbiertoRef.current = bienvenidaOpen || apuntesOpen || triviaActiva
    if (dialogoAbiertoRef.current) gameStateRef.current.teclas.clear()
  }, [bienvenidaOpen, apuntesOpen, triviaActiva])

  const cerrarBienvenida = useCallback(() => {
    setBienvenidaOpen(false)
    onTutorialFinish?.()
  }, [onTutorialFinish])

  useEffect(() => {
    if (!notificacion) return
    const timer = window.setTimeout(() => setNotificacion(null), 6000)
    return () => window.clearTimeout(timer)
  }, [notificacion])

  const abrirEvidencia = useCallback(() => {
    if (!gameStateRef.current.estados[gameStateRef.current.id]?.radar) return
    setPanelInfo(prev => prev === 'evidencia' ? null : 'evidencia')
  }, [])

  // Save progress helper
  const guardar = useCallback(() => {
    const gs = gameStateRef.current
    const pos = gs.adentro ? gs.retorno : gs.quipu ? [Math.round(gs.quipu.x), Math.round(gs.quipu.y)] : Mundo.inicio
    progresoSesion = { estados: Object.fromEntries(Object.entries(gs.estados).map(([id, estado]) => [id, { ...estado }])), pos }
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

  const iniciarTrivia = useCallback(() => {
    const gs = gameStateRef.current
    const s = gs.estados[gs.id]
    if (!s) return
    if (!s.resuelto) {
      s.triviaPendiente = true
      setEstados({ ...gs.estados })
      guardar()
      setNotificacion({ titulo: '¡Bitácora completada!', texto: 'Resuelve la trivia de QIPU para cerrar el caso.' })
    }
    setApuntesOpen(false)
    setTriviaRegion(gs.id)
    setMensaje('Bitácora completada. QIPU tiene unas preguntas para ti.')
  }, [guardar])

  const finalizarTrivia = useCallback(() => {
    const gs = gameStateRef.current
    const s = gs.estados[gs.id]
    const casoNuevo = s && !s.resuelto
    if (s) s.triviaPendiente = false
    terminarCaso()
    if (s?.resuelto) {
      setEstados({ ...gs.estados })
      guardar()
    }
    setTriviaRegion(null)
    setPanelInfo('evidencia')
    if (casoNuevo) setNotificacion({ titulo: '¡Caso resuelto!', texto: 'Ya puedes explorar las observaciones NASA / ASF.' })
    window.setTimeout(() => evidenciaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100)
  }, [guardar, terminarCaso])

  // Action executor
  const ejecutarAccion = useCallback((accion) => {
    const gs = gameStateRef.current
    if (gs.cortina || cartaOpen || dialogoAbiertoRef.current || !gs.quipu) return
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

          if (!gs.cortina && !cartaOpenRef.current && !dialogoAbiertoRef.current && gs.quipu) {
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
      if (e.altKey || e.ctrlKey || e.metaKey || e.target?.closest('input, select, textarea, [contenteditable="true"]')) return
      if (dialogoAbiertoRef.current) return
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

      if (!e.repeat && k === 'p') {
        e.preventDefault()
        setApuntesOpen(true)
        return
      }
      if (!e.repeat && k === 'n') {
        e.preventDefault()
        abrirEvidencia()
        return
      }
      if (!e.repeat && k === 'c' && gameStateRef.current.estados[gameStateRef.current.id]?.resuelto) {
        e.preventDefault()
        setPanelInfo(prev => prev === 'conclusion' ? null : 'conclusion')
        return
      }
      if (e.target?.closest('button, a')) return

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
  }, [abrirEvidencia, cartaOpen, ejecutarAccion, guardar])

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
  const misionBase = MISIONES_MAP.get(currentRegionId) || MISIONES[0]
  const misionActual = en ? { ...misionBase, ...MISSIONS_EN[currentRegionId] } : misionBase
  const estadoActual = estados[currentRegionId] || { radar: false, muestras: 0, resuelto: false }
  const campoActual = en ? FIELD_EN[currentRegionId] : CAMPO[currentRegionId]

  return (
    <div className="atlas-container">
      {/* TopBar with Return to Orbit, Language, and Audio */}
      <TopBar>
        <button
          type="button"
          className="orbit-return-btn"
          onClick={handleReturnOrbit}
          title={en ? 'Return to the 3D orbit' : 'Regresar a la visualización 3D en órbita'}
        >
          <Orbit size={15} />
          <span>{en ? '3D Orbit' : 'Órbita 3D'}</span>
        </button>
        <LanguageSelect lang={lang} onChange={onLanguageChange} t={t} />
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
          <div className="atlas-title-group">
            <h1>Orbit Jump</h1>
          </div>
        </div>
        <div className="atlas-progress-badge">
          <strong>{resueltas.size} / 5</strong>
          <span>{en ? 'Cases solved' : 'Casos resueltos'}</span>
        </div>
      </div>

      {/* Main 2-column layout */}
      <div className="atlas-grid">
        {/* Left: 2D World Viewport */}
        <div className="atlas-visor-card">
          <div className="visor-header">
            <div className="visor-location">
              <span className="location-diamond" aria-hidden="true" />
              <span>{en ? misionActual.lugar : lugarTitulo}</span>
            </div>
            <div className="visor-header-actions">
            <button type="button" className="apuntes-trigger" onClick={() => setApuntesOpen(true)}>
              {en ? 'Field notes' : 'Apuntes de campo'} <kbd>P</kbd>{estadoActual.muestras === 3 && !estadoActual.resuelto ? ' •' : ''}
            </button>
            <button
              type="button"
              className="carta-trigger-btn"
              onClick={() => {
                audio.sfx('click')
                setCartaOpen(true)
              }}
              title={en ? 'Open world map (M)' : 'Abrir carta del mundo (M)'}
            >
              <Compass size={14} className="inline mr-1" />
              {en ? 'Map' : 'Carta'} <kbd>M</kbd>
            </button>
            </div>
          </div>

          <div className="visor-viewport">
            <canvas
              ref={mainCanvasRef}
              width={384}
              height={256}
              className="atlas-main-canvas"
              tabIndex={0}
              aria-label={en ? 'Quipu’s open world. Move with the arrow keys or WASD.' : 'Mundo abierto de Quipu. Camina con las flechas o WASD.'}
            />
            <div className={`viewport-curtain ${cortinaActiva ? 'is-active' : ''}`} />
            {ubicacionTexto && <div className="viewport-hud">{en ? englishStatus(ubicacionTexto) : ubicacionTexto}</div>}
          </div>

          <div className="visor-status" role="status">
            <b>Quipu:</b>
            <span>{en ? englishStatus(mensaje) : mensaje}</span>
          </div>

          {/* Controls Bar: D-Pad & Actions */}
          <div className="visor-controls-bar">
            <div className="dpad-container" aria-label={en ? 'Move Quipu' : 'Mover a Quipu'}>
              <div />
              <button
                type="button"
                className="dpad-btn"
                onPointerDown={() => gameStateRef.current.teclas.set('pad_up', 'espalda')}
                onPointerUp={() => gameStateRef.current.teclas.delete('pad_up')}
                aria-label={en ? 'Up' : 'Arriba'}
              >
                ↑
              </button>
              <div />
              <button
                type="button"
                className="dpad-btn"
                onPointerDown={() => gameStateRef.current.teclas.set('pad_left', 'izquierda')}
                onPointerUp={() => gameStateRef.current.teclas.delete('pad_left')}
                aria-label={en ? 'Left' : 'Izquierda'}
              >
                ←
              </button>
              <button
                type="button"
                className="dpad-btn"
                onPointerDown={() => gameStateRef.current.teclas.set('pad_down', 'frente')}
                onPointerUp={() => gameStateRef.current.teclas.delete('pad_down')}
                aria-label={en ? 'Down' : 'Abajo'}
              >
                ↓
              </button>
              <button
                type="button"
                className="dpad-btn"
                onPointerDown={() => gameStateRef.current.teclas.set('pad_right', 'derecha')}
                onPointerUp={() => gameStateRef.current.teclas.delete('pad_right')}
                aria-label={en ? 'Right' : 'Derecha'}
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
                {en ? 'Investigate' : 'Investigar'} <kbd>E</kbd>
              </button>
              <button
                type="button"
                className="action-btn"
                onClick={() => ejecutarAccion('saltar')}
              >
                {en ? 'Jump' : 'Saltar'} <kbd>J</kbd>
              </button>
              <button
                type="button"
                className="action-btn"
                onClick={() => ejecutarAccion('saludar')}
              >
                {en ? 'Wave' : 'Saludar'} <kbd>H</kbd>
              </button>
            </div>
          </div>

          <details className="visor-help">
            <summary>{en ? 'Expedition controls' : 'Guía de controles de la expedición'}</summary>
            <p>
              {en ? 'Move with the arrow keys or WASD. Approach a clue or shelter and press E to investigate. Press J to jump, P for field notes, N for NASA data and M for the map.' : 'Muévete con las flechas o WASD. Acércate a una pista o al refugio e investiga con E. Pulsa J para saltar, P para los apuntes, N para los datos NASA y M para la carta.'}
            </p>
            <button type="button" className="welcome-replay" onClick={() => setBienvenidaOpen(true)}>{en ? 'Show welcome' : 'Ver bienvenida'}</button>
          </details>
          <div className="nasa-game-extras" ref={setNasaExtrasHost} />
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
              aria-label={en ? 'Minimap showing Quipu’s position' : 'Minimapa con la posición de Quipu'}
            />
            <div className="orient-text">
              <h3>{en ? 'SAR navigation' : 'Orientación SAR'}</h3>
              <p>{en ? 'The white dot is you. The gold outline marks your destination.' : 'El punto blanco eres tú. El marco dorado señala tu destino.'}</p>
            </div>
          </div>

          {/* Cuaderno de Campo */}
          <article className="atlas-notebook-card">
            <div className="notebook-folio">
              <span>{en ? 'SAR field journal' : 'Bitácora SAR'}</span>
              <span>{en ? ({ andes: 'Andes', amazonia: 'Amazon', bafin: 'Baffin', yakarta: 'Jakarta', volcan: 'Hayli Gubbi' })[currentRegionId] : RUTAS[currentRegionId]}</span>
            </div>

            <h2 className="notebook-title">{misionActual.titulo}</h2>
            <p className="notebook-story">{misionActual.historia}</p>

            <div className="notebook-phase-banner">
              <b>
                {estadoActual.resuelto
                  ? (en ? 'Case solved' : 'Caso Resuelto')
                  : !estadoActual.radar
                    ? (en ? 'First observation' : 'Primera Observación')
                    : estadoActual.muestras !== 3
                      ? `${en ? 'Field samples' : 'Muestreo de Campo'} · ${(estadoActual.muestras & 1) + (estadoActual.muestras >> 1)}/2`
                      : (en ? 'Interpretation desk' : 'Mesa de Interpretación')}
              </b>
              <p>
                {estadoActual.resuelto
                  ? resueltas.size === 5
                    ? (en ? 'Expedition complete! You solved every SAR case.' : '¡Atlas completo! Has resuelto todos los misterios SAR.')
                    : `${misionActual.efecto}. ${en ? 'Choose another destination on the map.' : 'Elige otro destino en la carta.'}`
                  : !estadoActual.radar
                    ? (en ? 'Press E to begin investigating this region.' : 'Usa E para comenzar a investigar esta región.')
                    : estadoActual.muestras !== 3
                      ? `${en ? 'Investigate with E' : 'Investiga con E'}: ${campoActual.puntos.filter((_, i) => !(estadoActual.muestras & (1 << i))).join(en ? ' and ' : ' y ')}.`
                      : `${campoActual.titulo}. ${en ? 'Press P to open your field notes.' : 'Abre los apuntes de campo con P para completar el trabajo.'}`}
              </p>
            </div>

            <div className="notebook-navigation" aria-label={en ? 'Field journal information' : 'Información de la bitácora'}>
              <button type="button" disabled={!estadoActual.radar} aria-expanded={panelInfo === 'evidencia'} onClick={abrirEvidencia}>
                <span>{en ? 'NASA / ASF data' : 'Datos NASA / ASF'}</span><kbd>N</kbd>
              </button>
              {estadoActual.resuelto && <button type="button" aria-expanded={panelInfo === 'conclusion'} onClick={() => setPanelInfo(prev => prev === 'conclusion' ? null : 'conclusion')}>
                <span>{en ? 'Conclusion' : 'Conclusión'}</span><kbd>C</kbd>
              </button>}
            </div>
            {!estadoActual.radar && <p className="notebook-field-hint">{en ? 'Investigate the first observation to unlock NASA / ASF data.' : 'Investiga la primera observación para desbloquear los datos NASA / ASF.'}</p>}
            {estadoActual.resuelto && triviaRegion !== currentRegionId && (
              <button type="button" className="notebook-replay-trivia" onClick={iniciarTrivia}>{en ? 'Play the trivia again' : 'Volver a responder la trivia'}</button>
            )}

            {/* NASA / ASF observation for the current region */}
            {estadoActual.radar && panelInfo === 'evidencia' && (
              <section className="notebook-section" ref={evidenciaRef}>
                <h3>{en ? 'NASA / ASF observations' : 'Observaciones NASA / ASF'}</h3>
                <NasaEvidenceTab key={currentRegionId} regionId={currentRegionId} lang={lang} extrasHost={nasaExtrasHost} />
              </section>
            )}

            {/* Resolved Case Conclusion */}
            {estadoActual.resuelto && panelInfo === 'conclusion' && (
              <section className="notebook-section">
                <div className="resolution-block">
                  <h3>{en ? 'Case conclusion' : 'Conclusión del Caso'}</h3>
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
                      {en ? 'Replay this case' : 'Repetir este caso'}
                    </button>
                    <button
                      type="button"
                      className="lab-btn primario"
                      onClick={() => {
                        audio.sfx('ready')
                        setCartaOpen(true)
                      }}
                    >
                      {en ? 'Open map' : 'Consultar la Carta'} &rarr;
                    </button>
                  </div>
                </div>
              </section>
            )}
          </article>
        </aside>
      </div>

      {bienvenidaOpen && (
        <DialogoJuego titulo={en ? 'Welcome to the expedition' : 'Bienvenida a la expedición'} onCerrar={cerrarBienvenida} clase="welcome-dialogo">
          <QuipuWelcome lang={lang} onFinish={cerrarBienvenida} />
        </DialogoJuego>
      )}
      {apuntesOpen && !triviaActiva && !bienvenidaOpen && (
        <DialogoJuego titulo={en ? 'Field notes' : 'Apuntes de campo'} onCerrar={() => setApuntesOpen(false)} atajoCerrar="p" clase="campo-dialogo">
          <header className="campo-dialogo-header">
            <div><span>{en ? ({ andes: 'Andes', amazonia: 'Amazon', bafin: 'Baffin', yakarta: 'Jakarta', volcan: 'Hayli Gubbi' })[currentRegionId] : RUTAS[currentRegionId]}</span><h2>{en ? 'Field notes' : 'Apuntes de campo'}</h2></div>
            <button type="button" className="campo-cerrar" onClick={() => setApuntesOpen(false)} aria-label={en ? 'Close field notes' : 'Cerrar apuntes de campo'}>×</button>
          </header>
          {estadoActual.muestras ? (
            <div className="campo-pistas">
              <h3>{en ? 'Observations collected' : 'Observaciones recogidas'}</h3>
              {campoActual.notas.filter((_, i) => estadoActual.muestras & (1 << i)).map((nota) => <p key={nota}>{nota}</p>)}
            </div>
          ) : <p className="campo-vacio">{en ? 'No notes yet. Investigate the field markers to collect clues.' : 'Todavía no hay apuntes. Investiga las marcas de campo para recoger pistas.'}</p>}
          {estadoActual.muestras !== 3 && !estadoActual.resuelto && <p className="campo-progreso">{en ? 'Clues found' : 'Pistas encontradas'}: {(estadoActual.muestras & 1) + (estadoActual.muestras >> 1)} {en ? 'of 2. Investigate both markers to unlock the activity.' : 'de 2. Investiga ambas marcas para desbloquear la actividad.'}</p>}
          {estadoActual.muestras === 3 && !estadoActual.resuelto && (
            <div className="campo-actividad">
              <h3>{campoActual.titulo}</h3>
              <p>{campoActual.instruccion}</p>
              <LaboratorioView key={`${currentRegionId}-${lang}`} regionId={currentRegionId} lang={lang} onCompletado={iniciarTrivia} />
            </div>
          )}
          {estadoActual.resuelto && <div className="campo-actividad"><p>{en ? 'This case is already solved.' : 'Este caso ya está resuelto.'}</p><button type="button" className="lab-btn primario" onClick={iniciarTrivia}>{en ? 'Play QIPU’s trivia' : 'Responder la trivia de QIPU'}</button></div>}
        </DialogoJuego>
      )}
      {triviaActiva && !bienvenidaOpen && (
        <DialogoJuego titulo={en ? 'QIPU’s trivia' : 'Trivia de QIPU'} clase="trivia-dialogo-juego">
          <TriviaQuipu key={currentRegionId} regionId={currentRegionId} lang={lang} onFinalizar={finalizarTrivia} />
        </DialogoJuego>
      )}

      {notificacion && (
        <div className="bitacora-notificacion" role="status" aria-live="polite">
          <span className="bitacora-notificacion-icon" aria-hidden="true"><Check size={19} /></span>
          <div><strong>{en ? (notificacion.titulo === '¡Caso resuelto!' ? 'Case solved!' : 'Field journal complete!') : notificacion.titulo}</strong><p>{en ? (notificacion.titulo === '¡Caso resuelto!' ? 'Explore the NASA / ASF observations.' : 'Answer QIPU’s trivia to complete the case.') : notificacion.texto}</p></div>
        </div>
      )}

      {/* World Map Modal */}
      <WorldMapModal
        lang={lang}
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
