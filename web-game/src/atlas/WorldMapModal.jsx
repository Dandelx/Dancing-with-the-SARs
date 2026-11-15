import { useEffect, useRef, useState } from 'react'
import { RUTAS } from './misionesData.js'
import { Mundo } from './mundoEngine.js'
import audio from '../landing/audio/audioEngine.js'
import {
  CheckCircle2,
  Compass,
  ExternalLink,
  MapPin,
  Orbit,
  Satellite
} from 'lucide-react'

const METADATOS_REGIONES_NASA = {
  andes: {
    region: 'Andes Septentrionales',
    pais: 'Perú',
    lugarOficial: 'Laguna San Nicolás, Namora y Valle de Cajamarca',
    centroide: [-7.2347, -78.3422],
    coordenadasStr: '7.2347° S, 78.3422° W',
    bbox: '[-78.60°, -7.30°] a [-78.25°, -7.05°]',
    sensor: 'NISAR Banda L (23.8 cm) • Dual-Pol HH/HV',
    track: 'Track 092 (Descendente)',
    productos: ['NISAR GCOV (L2)', 'NISAR SME2 (L3)', 'SAOCOM-1 (Banda L)'],
    asfUrl:
      'https://search.asf.alaska.edu/#/?dataset=NISAR&polygon=-78.6,-7.3,-78.25,-7.3,-78.25,-7.05,-78.6,-7.05,-78.6,-7.3'
  },
  amazonia: {
    region: 'Amazonía Sur',
    pais: 'Perú',
    lugarOficial: 'Corredor La Pampa y Zona de Amortiguamiento Tambopata, Madre de Dios',
    centroide: [-12.9, -69.95],
    coordenadasStr: '12.9000° S, 69.9500° W',
    bbox: '[-70.15°, -13.15°] a [-69.60°, -12.70°]',
    sensor: 'NISAR Banda L (23.8 cm) • Dual-Pol HH/HV',
    track: 'Track 171 (Descendente)',
    productos: ['NISAR GCOV (L2)', 'SAOCOM-1 (Banda L)'],
    asfUrl:
      'https://search.asf.alaska.edu/#/?dataset=NISAR&polygon=-70.15,-13.15,-69.6,-13.15,-69.6,-12.7,-70.15,-12.7,-70.15,-13.15'
  },
  bafin: {
    region: 'Ártico Canadiense',
    pais: 'Canadá',
    lugarOficial: 'Casquete Glaciar Barnes (Barnes Ice Cap), Isla de Bafín, Nunavut',
    centroide: [69.95, -73.0],
    coordenadasStr: '69.9500° N, 73.0000° W',
    bbox: '[-74.50°, 69.30°] a [-71.50°, 70.70°]',
    sensor: 'NISAR Banda L (23.8 cm) • Dual-Pol HH/HV',
    track: 'Track 041 / Track 148',
    productos: ['NISAR GCOV (L2)', 'NISAR GUNW (L2)'],
    asfUrl:
      'https://search.asf.alaska.edu/#/?dataset=NISAR&polygon=-74.5,69.3,-71.5,69.3,-71.5,70.7,-74.5,70.7,-74.5,69.3'
  },
  yakarta: {
    region: 'Costa del Sudeste Asiático',
    pais: 'Indonesia',
    lugarOficial: 'Yakarta Norte y Bahía de Yakarta, Java Occidental',
    centroide: [-6.15, 106.82],
    coordenadasStr: '6.1500° S, 106.8200° E',
    bbox: '[106.65°, -6.30°] a [107.05°, -6.00°]',
    sensor: 'NISAR Banda L (23.8 cm) • Dual-Pol HH/HV',
    track: 'Track 092 (Descendente)',
    productos: ['NISAR GCOV (L2)', 'NISAR GUNW (L2)'],
    asfUrl:
      'https://search.asf.alaska.edu/#/?dataset=NISAR&polygon=106.65,-6.3,107.05,-6.3,107.05,-6.0,106.65,-6.0,106.65,-6.3'
  },
  volcan: {
    region: 'Rift Africano Oriental',
    pais: 'Etiopía',
    lugarOficial: 'Volcán Hayli Gubbi, Cordillera Erta Ale, Depresión de Afar',
    centroide: [13.51, 40.7164],
    coordenadasStr: '13.5100° N, 40.7164° E',
    bbox: '[40.50°, 13.35°] a [40.90°, 13.65°]',
    sensor: 'NISAR Banda L (23.8 cm) • Dual-Pol HH/HV',
    track: 'Tracks 082 y 009 (Interferometría InSAR)',
    productos: ['NISAR GUNW (L2)', 'NISAR GCOV (L2)'],
    asfUrl:
      'https://search.asf.alaska.edu/#/?dataset=NISAR&polygon=40.5,13.35,40.9,13.35,40.9,13.65,40.5,13.65,40.5,13.35'
  }
}

export default function WorldMapModal({
  isOpen,
  onClose,
  misiones,
  resueltas,
  posicion,
  destino,
  onSelectDestino
}) {
  const canvasRef = useRef(null)
  const [selectedRegionId, setSelectedRegionId] = useState(null)

  // Deriva la región activa sin efectos ni re-renderizados en cascada
  const defaultRegionId = destino || misiones?.[0]?.id || 'andes'
  const inspectedId = selectedRegionId || defaultRegionId

  // Dibuja el minimapa del mundo con el objetivo actual
  useEffect(() => {
    if (!isOpen) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const objetivo = destino && Mundo.sitios[destino] ? Mundo.sitios[destino].puerta : null

    Mundo.mini(ctx, posicion[0], posicion[1], objetivo)

    // Etiquetas sobre el canvas
    ctx.save()
    ctx.font = 'bold 11px "IBM Plex Mono", monospace'
    ctx.textBaseline = 'middle'
    for (const m of misiones) {
      const [wx, wy] = Mundo.sitios[m.id].puerta
      const x = Math.round((wx / Mundo.ancho) * canvas.width)
      const y = Math.round((wy / Mundo.alto) * canvas.height) - 12
      const texto = RUTAS[m.id] + (resueltas.has(m.id) ? ' ✓' : '')
      const textWidth = Math.ceil(ctx.measureText(texto).width)

      ctx.fillStyle = '#05060d'
      ctx.fillRect(x - 3, y - 8, textWidth + 6, 16)
      ctx.strokeStyle = resueltas.has(m.id) ? '#a9ebc0' : '#f0c46a'
      ctx.lineWidth = 1
      ctx.strokeRect(x - 3, y - 8, textWidth + 6, 16)

      ctx.fillStyle = '#fff5d9'
      ctx.fillText(texto, x, y)
    }
    ctx.restore()
  }, [isOpen, posicion, destino, misiones, resueltas])

  if (!isOpen) return null

  const infoNasa = METADATOS_REGIONES_NASA[inspectedId] || METADATOS_REGIONES_NASA.andes
  const misionActual = misiones.find((m) => m.id === inspectedId)
  const isResuelta = resueltas.has(inspectedId)
  const isDestinoActivo = destino === inspectedId

  const handleSelectRegion = (id) => {
    audio.sfx('click')
    setSelectedRegionId(id)
  }

  const handleMarcarRumbo = (id) => {
    audio.sfx('click')
    onSelectDestino(id)
  }

  return (
    <div
      className="carta-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="tituloCarta"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          audio.sfx('click')
          onClose()
        }
      }}
    >
      <section className="carta-hoja">
        <header className="carta-header">
          <div className="flex items-center gap-2">
            <Compass size={20} className="text-[var(--oj-gold-2)]" />
            <h2 id="tituloCarta" className="carta-title">
              Carta del Mundo &bull; Red de Monitoreo NISAR
            </h2>
          </div>
          <button
            type="button"
            className="carta-close-btn"
            onClick={() => {
              audio.sfx('click')
              onClose()
            }}
            aria-label="Cerrar carta del mundo"
          >
            Cerrar <kbd>M</kbd>
          </button>
        </header>

        {/* Canvas de Navegación 2D */}
        <div className="carta-canvas-wrap">
          <canvas
            ref={canvasRef}
            width={540}
            height={320}
            className="carta-canvas"
            aria-label="Carta de las cinco regiones y posición actual de Quipu"
          />
        </div>

        {/* Botones de Selección de Región */}
        <div className="destinos-container">
          <span className="destinos-label">
            Selecciona una región para consultar sus datos satelitales o marcar rumbo:
          </span>
          <div className="destinos-buttons">
            {misiones.map((m) => (
              <button
                key={m.id}
                type="button"
                className={`destino-btn ${inspectedId === m.id ? 'is-selected' : ''}`}
                onClick={() => handleSelectRegion(m.id)}
              >
                {RUTAS[m.id]} {resueltas.has(m.id) ? '✓' : ''}
              </button>
            ))}
          </div>
        </div>

        {/* Ficha Satelital Geodésica de la Región Seleccionada */}
        <div className="carta-geodetic-card">
          <div className="geodetic-card-header">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[var(--oj-cyan)]">
                  {infoNasa.region} &bull; {infoNasa.pais}
                </span>
                {isResuelta ? (
                  <span className="geodetic-badge is-resolved">
                    <CheckCircle2 size={11} className="inline mr-1" />
                    Caso Resuelto
                  </span>
                ) : (
                  <span className="geodetic-badge is-pending">
                    Misión Pendiente
                  </span>
                )}
              </div>
              <h3 className="geodetic-title">
                {misionActual?.lugar || RUTAS[inspectedId]}: {infoNasa.lugarOficial}
              </h3>
            </div>
          </div>

          {/* Grilla con Coordenadas y Sensor */}
          <div className="geodetic-grid">
            <div className="geodetic-item">
              <span className="geodetic-label">
                <MapPin size={12} className="inline mr-1 text-[var(--oj-gold-2)]" />
                Coordenadas Geodésicas:
              </span>
              <span className="geodetic-value font-mono text-[var(--oj-gold-light)]">
                {infoNasa.coordenadasStr}
              </span>
              <span className="text-[10px] font-mono text-[var(--oj-muted)] block">
                BBox: {infoNasa.bbox}
              </span>
            </div>

            <div className="geodetic-item">
              <span className="geodetic-label">
                <Satellite size={12} className="inline mr-1 text-[var(--oj-cyan)]" />
                Sensor & Órbita:
              </span>
              <span className="geodetic-value font-mono">
                {infoNasa.sensor}
              </span>
              <span className="text-[10px] font-mono text-[var(--oj-cyan)] block">
                {infoNasa.track}
              </span>
            </div>
          </div>

          {/* Productos NASA y Enlaces Oficiales ASF */}
          <div className="geodetic-products-row">
            <div>
              <span className="geodetic-label block mb-1">
                <Orbit size={12} className="inline mr-1 text-[var(--oj-gold-2)]" />
                Productos NASA Asociados:
              </span>
              <div className="flex flex-wrap gap-1">
                {infoNasa.productos.map((prod) => (
                  <span key={prod} className="nasa-chip">
                    {prod}
                  </span>
                ))}
              </div>
            </div>

            <div className="geodetic-actions">
              <a
                href={infoNasa.asfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="asf-catalog-btn"
                title="Consultar catálogo abierto en Alaska Satellite Facility"
              >
                <span>Catálogo ASF</span>
                <ExternalLink size={12} />
              </a>

              <button
                type="button"
                className={`marcar-rumbo-btn ${isDestinoActivo ? 'is-active-target' : ''}`}
                onClick={() => handleMarcarRumbo(inspectedId)}
              >
                <Compass size={13} />
                <span>
                  {isDestinoActivo ? 'Rumbo Activo' : 'Marcar Rumbo'}
                </span>
              </button>
            </div>
          </div>
        </div>

        <p className="carta-hint">
          {destino && misiones.find((m) => m.id === destino)
            ? `Rumbo marcado hacia ${misiones.find((m) => m.id === destino).lugar}. La brújula te guiará en el mapa.`
            : 'Selecciona una región y pulsa "Marcar Rumbo" para que la brújula te guíe en el mundo abierto.'}
        </p>
      </section>
    </div>
  )
}
