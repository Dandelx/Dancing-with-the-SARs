import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import L from 'leaflet'
import { MISSIONS_EN, NASA_EN } from './englishData.js'
import 'leaflet/dist/leaflet.css'
import {
  ArrowLeftRight,
  Download,
  ExternalLink,
  Globe,
  Info,
  Layers,
  Map,
  Orbit,
  Satellite,
  Sliders
} from 'lucide-react'

// URLs oficiales de mapas base 100% gratuitos y sin API key
const ESRI_SATELLITE_URL =
  'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
const ESRI_ATTRIBUTION =
  'Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics'

const OSM_TILES_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
const OSM_ATTRIBUTION = '&copy; OpenStreetMap contributors'

// Guías pedagógicas de dispersión física por región
const GUIAS_FISICAS = {
  andes: {
    resumen:
      'El agua libre y calma en la Laguna San Nicolás refleja especularmente la señal de Banda L (píxeles oscuros en HH). Al retirarse el agua de la poza, el lecho rugoso húmedo y los totorales generan dispersión superficial y doble rebote (píxeles brillantes en HH).',
    canalHH: 'HH: Sensible a rugosidad del fango húmedo y doble rebote en tallos de totora.',
    canalHV: 'HV: Responde a la estructura foliar de bofedales y pastos circundantes.'
  },
  amazonia: {
    resumen:
      'En la selva de Madre de Dios, las ramas y copas densas despolarizan la microonda creando una fuerte dispersión volumétrica en HV. En los claros por tala o pozas mineras de La Pampa, la dispersión volumétrica colapsa drásticamente.',
    canalHH: 'HH: Muestra la retrodispersión directa y cambios en el suelo expuesto.',
    canalHV: 'HV: Clave para biomasa forestal; el dosel brilla intensamente y la tala se vuelve oscura.'
  },
  bafin: {
    resumen:
      'En el casquete Barnes, las grietas superficiales y el hielo rugoso producen ecos dispersos en HH y HV. Los afloramientos rocosos estables mantienen una firma fija que sirve de referencia geodésica para medir el desplazamiento del flujo glacial.',
    canalHH: 'HH: Resalta fracturas, grietas de tensión y morfología del hielo.',
    canalHV: 'HV: Muestra la atenuación volumétrica en hielo denso y nieve recristalizada.'
  },
  yakarta: {
    resumen:
      'En la bahía y el puerto de Yakarta, los muros verticales, muelles y edificios forman reflectores diedros de doble rebote muy intenso en HH. El agua marina y zonas hundidas se mantienen oscuras, facilitando el mapeo de subsidencia.',
    canalHH: 'HH: Fuerte doble rebote diedro en muros de hormigón y arquitectura costera.',
    canalHV: 'HV: Baja respuesta en agua e infraestructuras lisas; moderada en arbolado urbano.'
  },
  volcan: {
    resumen:
      'En el volcán Hayli Gubbi (Afar), las coladas de lava basáltica rugosa generan alta retrodispersión superficial en HH. Los mantos de ceniza fina piroclástica atenúan la señal, permitiendo mapear la extensión de la erupción.',
    canalHH: 'HH: Máxima sensibilidad a la rugosidad de escorias y lavas basálticas.',
    canalHV: 'HV: Muestra la dispersión difusa en depósitos de ceniza y piroclastos.'
  }
}

export default function NasaEvidenceTab({ regionId, lang, extrasHost }) {
  const en = lang === 'en'
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Capa base seleccionada: 'satellite' (Esri World Imagery) o 'osm' (OpenStreetMap)
  const [basemapLayer, setBasemapLayer] = useState('satellite')
  const [showSarOverlay, setShowSarOverlay] = useState(true)

  // Modos de visualización del visor: 'comparer' (slider split) o 'single' (vista canal único)
  const [viewMode, setViewMode] = useState('comparer')
  const [singleChannel, setSingleChannel] = useState('hh')
  const [sliderPos, setSliderPos] = useState(50)
  const [leftChannel, setLeftChannel] = useState('hh')
  const [rightChannel, setRightChannel] = useState('hv')

  const mapContainerRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const tileLayerRef = useRef(null)
  const sarOverlayRef = useRef(null)
  const geoLayerRef = useRef(null)

  useEffect(() => {
    let cancelled = false
    fetch('/data/nasa_real_cases.json')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then((json) => {
        if (!cancelled) {
          setData(json)
          setLoading(false)
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message)
          setLoading(false)
        }
      })
    return () => {
      cancelled = true
    }
  }, [])

  const regionData = data?.[regionId]
  const escenas = regionData?.escenas || []
  const previewSource = regionData?.vistas?.find((vista) => vista.id === 'hh')?.archivo_origen
    || regionData?.vistas?.find((vista) => vista.id === 'latlon')?.archivo_origen
  const currentScene = escenas.find((escena) => escena.granuleName && previewSource?.includes(escena.granuleName))
  const sameScene = currentScene && regionData?.vistas?.every((vista) => vista.archivo_origen?.includes(currentScene.granuleName))
  const guia = GUIAS_FISICAS[regionId] || GUIAS_FISICAS.andes

  // Inicialización y ciclo de vida del mapa Leaflet
  useEffect(() => {
    if (!regionData || !mapContainerRef.current) return

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove()
      mapInstanceRef.current = null
      tileLayerRef.current = null
      sarOverlayRef.current = null
      geoLayerRef.current = null
    }

    const centroide = regionData.coordenadas?.centroide_lat_lon || [0, 0]
    const map = L.map(mapContainerRef.current, {
      center: centroide,
      zoom: 8,
      zoomControl: true,
      attributionControl: true
    })

    // Capa base inicial (Esri World Imagery o OSM)
    const isSat = basemapLayer === 'satellite'
    const tileLayer = L.tileLayer(isSat ? ESRI_SATELLITE_URL : OSM_TILES_URL, {
      maxZoom: isSat ? 18 : 19,
      attribution: isSat ? ESRI_ATTRIBUTION : OSM_ATTRIBUTION,
      className: isSat ? 'esri-sat-tiles' : 'osm-dark-tiles'
    }).addTo(map)
    tileLayerRef.current = tileLayer

    // Superposición de imagen radar SAR georreferenciada sobre el AOI
    const bbox = regionData.coordenadas?.bounding_box_wsen
    const sarSrc = regionData.browse_hh || regionData.browse_latlon
    if (showSarOverlay && bbox && sarSrc) {
      const [w, s, e, n] = bbox
      const sarOverlay = L.imageOverlay(sarSrc, [[s, w], [n, e]], {
        opacity: 0.7,
        interactive: false
      }).addTo(map)
      sarOverlayRef.current = sarOverlay
    }

    // Pin de objetivo radar con alto contraste sobre fondo satelital
    const targetIcon = L.divIcon({
      className: 'nasa-target-icon',
      html: `
        <div style="
          width: 24px; height: 24px;
          border-radius: 50%;
          border: 2px solid #f0c46a;
          background: rgba(5, 6, 13, 0.88);
          box-shadow: 0 0 12px rgba(240, 196, 106, 0.9), 0 0 4px #7fd4ff;
          display: flex; align-items: center; justify-content: center;
        ">
          <div style="width: 8px; height: 8px; background: #7fd4ff; border-radius: 50%;"></div>
        </div>
      `,
      iconSize: [24, 24],
      iconAnchor: [12, 12]
    })

    L.marker(centroide, { icon: targetIcon })
      .addTo(map)
      .bindPopup(
        `<b style="color:#05060d;">${en ? NASA_EN[regionId].region : regionData.region_oficial}</b><br><small style="color:#333;">Lat: ${centroide[0].toFixed(4)}, Lon: ${centroide[1].toFixed(4)}</small>`
      )

    // Polígono GeoJSON AOI con borde dorado luminoso y relleno cian semitransparente
    if (regionData.geojson_feature) {
      const geoLayer = L.geoJSON(regionData.geojson_feature, {
        style: {
          color: '#f0c46a',
          weight: 3,
          opacity: 1,
          fillColor: '#7fd4ff',
          fillOpacity: 0.22,
          dashArray: '5, 5'
        }
      }).addTo(map)
      geoLayerRef.current = geoLayer

      try {
        const bounds = geoLayer.getBounds()
        if (bounds.isValid()) {
          map.fitBounds(bounds, { padding: [30, 30] })
        }
      } catch {
        /* ignore */
      }
    }

    mapInstanceRef.current = map

    const timer = setTimeout(() => {
      map.invalidateSize()
    }, 120)

    return () => {
      clearTimeout(timer)
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [regionData, en, regionId, extrasHost]) // eslint-disable-line react-hooks/exhaustive-deps

  // Cambio dinámico de capa base (Esri vs OSM) sin reiniciar el mapa
  useEffect(() => {
    if (!mapInstanceRef.current) return
    if (tileLayerRef.current) {
      mapInstanceRef.current.removeLayer(tileLayerRef.current)
      tileLayerRef.current = null
    }

    const isSat = basemapLayer === 'satellite'
    const newTileLayer = L.tileLayer(isSat ? ESRI_SATELLITE_URL : OSM_TILES_URL, {
      maxZoom: isSat ? 18 : 19,
      attribution: isSat ? ESRI_ATTRIBUTION : OSM_ATTRIBUTION,
      className: isSat ? 'esri-sat-tiles' : 'osm-dark-tiles'
    }).addTo(mapInstanceRef.current)

    tileLayerRef.current = newTileLayer

    // Asegura que las geometrías queden al frente
    if (sarOverlayRef.current) sarOverlayRef.current.bringToFront()
    if (geoLayerRef.current) geoLayerRef.current.bringToFront()
  }, [basemapLayer])

  // Alternar superposición radar SAR sobre el mapa
  useEffect(() => {
    if (!mapInstanceRef.current) return
    if (sarOverlayRef.current) {
      mapInstanceRef.current.removeLayer(sarOverlayRef.current)
      sarOverlayRef.current = null
    }

    const bbox = regionData?.coordenadas?.bounding_box_wsen
    const sarSrc = regionData?.browse_hh || regionData?.browse_latlon

    if (showSarOverlay && bbox && sarSrc) {
      const [w, s, e, n] = bbox
      const overlay = L.imageOverlay(sarSrc, [[s, w], [n, e]], {
        opacity: 0.7,
        interactive: false
      }).addTo(mapInstanceRef.current)
      sarOverlayRef.current = overlay

      if (geoLayerRef.current) {
        geoLayerRef.current.bringToFront()
      }
    }
  }, [showSarOverlay, regionData])

  if (loading) {
    return (
      <div className="nasa-tab-loading">
        <Satellite className="animate-spin text-[var(--oj-gold-2)]" size={24} />
        <p className="mt-2 text-xs font-mono text-[var(--oj-ink)]">
          {en ? 'Loading NASA / ASF satellite catalog…' : 'Cargando catálogo satelital NASA ASF...'}
        </p>
      </div>
    )
  }

  if (error || !regionData) {
    return (
      <div className="nasa-tab-error">
        <p className="text-xs text-rose-400">
          {en ? 'Could not load observation data: ' : 'No se pudieron cargar los datos reales: '}{error || (en ? 'Region not found' : 'Región no encontrada')}
        </p>
      </div>
    )
  }

  // Rutas de imágenes disponibles
  const resolveChannelUrl = (ch) => {
    if (ch === 'hh') return regionData.browse_hh || currentScene?.browse_hh
    if (ch === 'hv') return regionData.browse_hv || currentScene?.browse_hv
    if (ch === 'latlon') return regionData.browse_latlon || currentScene?.browse_latlon
    return currentScene?.imagen_principal || regionData.browse_latlon
  }

  const leftImgSrc = resolveChannelUrl(leftChannel)
  const rightImgSrc = resolveChannelUrl(rightChannel)
  const singleImgSrc = resolveChannelUrl(singleChannel)

  const swapChannels = () => {
    setLeftChannel(rightChannel)
    setRightChannel(leftChannel)
    setSliderPos(100 - sliderPos)
  }

  const formatChannelLabel = (ch) => {
    if (ch === 'hh') return en ? 'HH channel (co-polarized)' : 'Canal HH (Co-Polarizado)'
    if (ch === 'hv') return en ? 'HV channel (cross-polarized)' : 'Canal HV (Cruzado)'
    if (ch === 'latlon') return en ? 'LatLon preview' : 'Vista Previa LatLon'
    return ch.toUpperCase()
  }

  return (
    <>
    <div className="nasa-evidence-view">
      {/* Encabezado Oficial de la Región */}
      <div className="nasa-header-card">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Satellite size={16} className="text-[var(--oj-gold-2)]" />
            <span className="text-[10px] uppercase font-mono tracking-wider text-[var(--oj-gold-2)]">
              {en ? 'NISAR mission · NASA / ASF observations' : 'Misión NISAR · Observaciones Reales NASA / ASF'}
            </span>
          </div>
          <span className="nasa-live-badge">{en ? 'L-band' : 'Banda L'} &bull; 23.8 cm</span>
        </div>
        <h4 className="text-sm font-semibold text-[var(--oj-ink)] mt-1">
          {en ? MISSIONS_EN[regionId].titulo : regionData.titulo}
        </h4>
        <p className="text-xs text-[var(--oj-muted)]">
          {en ? NASA_EN[regionId].region : regionData.region_oficial}
        </p>
      </div>

      {/* Visor Interactivo de Comparación con Slider / Canales */}
      <div className="nasa-comparator-card">
        <div className="comparator-topbar">
          <div className="flex items-center gap-2">
            <Sliders size={14} className="text-[var(--oj-cyan)]" />
            <span className="text-xs font-mono font-bold uppercase text-[var(--oj-ink)]">
              {en ? 'SAR polarization viewer' : 'Visor Polarimétrico SAR'}
            </span>
          </div>

          {/* Selector de Modo: Comparador Dividido vs Canal Único */}
          <div className="comparator-mode-pills">
            <button
              type="button"
              className={`mode-pill ${viewMode === 'comparer' ? 'is-active' : ''}`}
              onClick={() => setViewMode('comparer')}
            >
              <ArrowLeftRight size={12} className="inline mr-1" />
              {en ? 'Split comparison (HH / HV)' : 'Comparador Dividido (HH / HV)'}
            </button>
            <button
              type="button"
              className={`mode-pill ${viewMode === 'single' ? 'is-active' : ''}`}
              onClick={() => setViewMode('single')}
            >
              {en ? 'Single channel' : 'Canal Único'}
            </button>
          </div>
        </div>

        {/* Modo Comparador Dividido */}
        {viewMode === 'comparer' ? (
          <div className="comparator-body">
            {/* Controles del comparador */}
            <div className="comparator-controls-bar">
              <div className="channel-select-group">
                <span className="control-label">{en ? 'Left:' : 'Izquierda:'}</span>
                <select
                  value={leftChannel}
                  onChange={(e) => setLeftChannel(e.target.value)}
                  className="channel-select"
                >
                  <option value="hh">{en ? 'HH channel (co-pol)' : 'Canal HH (Co-Pol)'}</option>
                  <option value="hv">{en ? 'HV channel (cross-pol)' : 'Canal HV (Cruzado)'}</option>
                  <option value="latlon">{en ? 'LatLon overview' : 'Vista general LatLon'}</option>
                </select>
              </div>

              <button
                type="button"
                onClick={swapChannels}
                className="swap-channels-btn"
                title={en ? 'Swap left and right channels' : 'Invertir canales izquierdo y derecho'}
              >
                <ArrowLeftRight size={13} />
                <span>{en ? 'Swap' : 'Invertir'}</span>
              </button>

              <div className="channel-select-group">
                <span className="control-label">{en ? 'Right:' : 'Derecha:'}</span>
                <select
                  value={rightChannel}
                  onChange={(e) => setRightChannel(e.target.value)}
                  className="channel-select"
                >
                  <option value="hv">{en ? 'HV channel (cross-pol)' : 'Canal HV (Cruzado)'}</option>
                  <option value="hh">{en ? 'HH channel (co-pol)' : 'Canal HH (Co-Pol)'}</option>
                  <option value="latlon">{en ? 'LatLon overview' : 'Vista general LatLon'}</option>
                </select>
              </div>

              {/* Presets rápidos */}
              <div className="comparator-presets">
                <button
                  type="button"
                  className={`preset-btn ${sliderPos === 100 ? 'is-active' : ''}`}
                  onClick={() => setSliderPos(100)}
                >
                  100% {leftChannel.toUpperCase()}
                </button>
                <button
                  type="button"
                  className={`preset-btn ${sliderPos === 50 ? 'is-active' : ''}`}
                  onClick={() => setSliderPos(50)}
                >
                  50 / 50
                </button>
                <button
                  type="button"
                  className={`preset-btn ${sliderPos === 0 ? 'is-active' : ''}`}
                  onClick={() => setSliderPos(0)}
                >
                  100% {rightChannel.toUpperCase()}
                </button>
              </div>
            </div>

            {/* Viewport del Slider Dividido */}
            <div className="slider-viewport-container">
              {/* Imagen base (fondo, derecha) */}
              <img
                src={rightImgSrc}
                alt={formatChannelLabel(rightChannel)}
                className="slider-base-image"
                loading="lazy"
              />

              {/* Imagen recortada (frente, izquierda) */}
              <div
                className="slider-clip-layer"
                style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
              >
                <img
                  src={leftImgSrc}
                  alt={formatChannelLabel(leftChannel)}
                  className="slider-clip-image"
                  loading="lazy"
                />
              </div>

              {/* Línea divisoria interactiva */}
              <div
                className="slider-divider-line"
                style={{ left: `${sliderPos}%` }}
              >
                <div className="slider-handle">
                  <ArrowLeftRight size={12} />
                  <span>{sliderPos}%</span>
                </div>
              </div>

              {/* Badges indicativos en pantalla */}
              <div className="slider-channel-badge badge-left">
                <span>◀ {formatChannelLabel(leftChannel)}</span>
              </div>
              <div className="slider-channel-badge badge-right">
                <span>{formatChannelLabel(rightChannel)} ▶</span>
              </div>
            </div>

            {/* Barra deslizante tipo Range */}
            <div className="slider-input-wrapper">
              <input
                type="range"
                min="0"
                max="100"
                value={sliderPos}
                onChange={(e) => setSliderPos(Number(e.target.value))}
                className="nasa-split-slider"
                aria-label={en ? 'Drag to compare SAR polarization channels' : 'Arrastra para comparar canales polarimétricos SAR'}
              />
              <div className="slider-legend">
                <span className="legend-left font-mono text-[11px] text-[var(--oj-gold-1)]">
                  {leftChannel.toUpperCase()}: {sliderPos}%
                </span>
                <span className="legend-center font-mono text-[10px] text-[var(--oj-muted)]">
                  {en ? 'Drag to compare backscatter' : 'Arrastra el deslizador para comparar dispersión'}
                </span>
                <span className="legend-right font-mono text-[11px] text-[var(--oj-cyan)]">
                  {rightChannel.toUpperCase()}: {100 - sliderPos}%
                </span>
              </div>
            </div>

            {/* Guía física didáctica */}
            <div className="comparator-guide-card">
              <div className="flex items-start gap-2">
                <Info size={15} className="text-[var(--oj-gold-2)] shrink-0 mt-0.5" />
                <div className="text-xs">
                  <p className="nasa-analysis-title font-semibold mb-1">
                    {en ? 'Scattering guide:' : 'Análisis de Dispersión Física en esta Escena:'}
                  </p>
                  <p className="text-[var(--oj-muted)] mb-1.5">{en ? NASA_EN[regionId].resumen : guia.resumen}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2 pt-2 border-t border-[rgba(255,255,255,0.08)]">
                    <span className="text-[11px] text-[#e0e6f5]">
                      <strong className="text-[var(--oj-gold-1)]">HH:</strong> {en ? NASA_EN[regionId].hh : guia.canalHH}
                    </span>
                    <span className="text-[11px] text-[#e0e6f5]">
                      <strong className="text-[var(--oj-cyan)]">HV:</strong> {en ? NASA_EN[regionId].hv : guia.canalHV}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Modo Canal Único */
          <div className="single-channel-body">
            <div className="nasa-channel-selector">
              {regionData.browse_latlon && (
                <button
                  type="button"
                  className={`channel-btn ${singleChannel === 'latlon' ? 'is-active' : ''}`}
                  onClick={() => setSingleChannel('latlon')}
                >
                  {en ? 'LatLon view' : 'Vista LatLon'}
                </button>
              )}
              {regionData.browse_hh && (
                <button
                  type="button"
                  className={`channel-btn ${singleChannel === 'hh' ? 'is-active' : ''}`}
                  onClick={() => setSingleChannel('hh')}
                >
                  {en ? 'HH channel (co-pol)' : 'Canal HH (Co-Pol)'}
                </button>
              )}
              {regionData.browse_hv && (
                <button
                  type="button"
                  className={`channel-btn ${singleChannel === 'hv' ? 'is-active' : ''}`}
                  onClick={() => setSingleChannel('hv')}
                >
                  {en ? 'HV channel (cross-pol)' : 'Canal HV (Cruzado)'}
                </button>
              )}
            </div>

            <div className="nasa-image-viewport">
              {singleImgSrc ? (
                <img
                  src={singleImgSrc}
                  alt={en ? `${singleChannel} observation` : `Vista ${singleChannel} real`}
                  className="nasa-radar-image"
                  loading="lazy"
                />
              ) : (
                <div className="p-4 text-center text-xs text-[var(--oj-muted)]">
                  {en ? 'View unavailable' : 'Vista no disponible'}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Ficha Técnica Completa de la Escena NISAR L2 GCOV */}
      {currentScene && (
        <div className="nasa-preview-card">
          <div className="nasa-preview-header">
            <div>
              <span className="text-[10px] font-mono uppercase text-[var(--oj-cyan)] block">
                {en ? 'Satellite details' : 'Ficha Técnica Satelital'} &bull; {currentScene.producto}
              </span>
              <span className="text-xs font-mono font-bold text-[var(--oj-ink)] break-all">
                {currentScene.granuleName}
              </span>
            </div>
            {currentScene.url_descarga_asf && (
              <a
                href={currentScene.url_descarga_asf}
                target="_blank"
                rel="noopener noreferrer"
                className="nasa-download-btn"
                title={en ? 'Download the official HDF5 product from Alaska Satellite Facility' : 'Descargar producto oficial HDF5 en Alaska Satellite Facility'}
              >
                <Download size={12} />
                <span>{en ? 'Download HDF5' : 'Descargar HDF5'}</span>
                <ExternalLink size={11} />
              </a>
            )}
          </div>

          {/* Grilla de Metadatos de la Escena */}
          <div className="scene-metadata-grid">
            <div className="meta-item">
              <span className="meta-label">{en ? 'Processing level:' : 'Nivel de Proceso:'}</span>
              <span className="meta-value font-mono">
                {currentScene.processingLevel} (Geocoded Covariance Matrix)
              </span>
            </div>
            <div className="meta-item">
              <span className="meta-label">{en ? 'Date and time UTC:' : 'Fecha y Hora UTC:'}</span>
              <span className="meta-value font-mono">
                {currentScene.startTime
                  ? currentScene.startTime.replace('T', ' ').replace('Z', ' UTC')
                  : 'Oct-Nov 2026'}
              </span>
            </div>
            <div className="meta-item">
              <span className="meta-label">{en ? 'Polarization:' : 'Polarización:'}</span>
              <span className="meta-value font-mono text-[var(--oj-cyan)]">
                {currentScene.polarizaciones || 'Dual-Pol (HH + HV)'}
              </span>
            </div>
            <div className="meta-item">
              <span className="meta-label">{en ? 'Orbit direction:' : 'Paso Orbital:'}</span>
              <span className="meta-value font-mono">
                {en ? (currentScene.orbita === 'Ascendente' ? 'Ascending' : currentScene.orbita === 'Descendente' ? 'Descending' : currentScene.orbita) : (currentScene.orbita || 'Descendente')}
              </span>
            </div>
          </div>
        </div>
      )}

      <p className="nasa-preview-note">
        {sameScene
          ? (en ? 'The images above show the scene identified in the satellite details.' : 'Las imágenes corresponden a la escena identificada en la ficha satelital.')
          : (en ? 'Some preview images could not be matched to the scene in the satellite details.' : 'Algunas vistas previas no se pudieron asociar con la escena de la ficha satelital.')}
      </p>

    </div>

    {extrasHost && createPortal(
    <div className="nasa-extras-layout">

      {/* Mapa Interactivo Leaflet con AOI y Coordenadas */}
      <div className="nasa-map-wrapper">
        <div className="nasa-map-label">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <span className="text-[11px] font-mono font-bold text-[var(--oj-gold-1)]">
                {en ? 'Area of interest (AOI) · satellite polygon' : 'Área de Interés (AOI) · Polígono Satelital'}
              </span>
              {regionData.coordenadas?.centroide_lat_lon && (
                <span className="text-[10px] font-mono text-[var(--oj-muted)] ml-2">
                  Lat: {regionData.coordenadas.centroide_lat_lon[0].toFixed(4)}°, Lon:{' '}
                  {regionData.coordenadas.centroide_lat_lon[1].toFixed(4)}°
                </span>
              )}
            </div>

            {/* Selector de Capa Base y Superposición Radar SAR */}
            <div className="map-layer-controls">
              <div className="map-layer-selector">
                <button
                  type="button"
                  className={`map-layer-btn ${basemapLayer === 'satellite' ? 'is-active' : ''}`}
                  onClick={() => setBasemapLayer('satellite')}
                  title={en ? 'Esri World Imagery satellite view' : 'Vista Satelital Óptica Esri World Imagery'}
                >
                  <Globe size={11} className="inline mr-1" />
                  {en ? 'Satellite (Esri)' : 'Satélite (Esri)'}
                </button>
                <button
                  type="button"
                  className={`map-layer-btn ${basemapLayer === 'osm' ? 'is-active' : ''}`}
                  onClick={() => setBasemapLayer('osm')}
                  title={en ? 'OpenStreetMap base map' : 'Mapa Base Callejero OpenStreetMap (Modo Oscuro)'}
                >
                  <Map size={11} className="inline mr-1" />
                  {en ? 'Base map (OSM)' : 'Mapa Base (OSM)'}
                </button>
              </div>

              <button
                type="button"
                className={`map-sar-toggle-btn ${showSarOverlay ? 'is-active' : ''}`}
                onClick={() => setShowSarOverlay(!showSarOverlay)}
                title={en ? 'Show the SAR preview over the map' : 'Superponer imagen radar SAR sobre el mapa'}
              >
                <Layers size={11} className="inline mr-1" />
                <span>Radar SAR {showSarOverlay ? 'ON' : 'OFF'}</span>
              </button>
            </div>
          </div>
        </div>

        <div ref={mapContainerRef} className="nasa-leaflet-container" />
      </div>

      {/* Hipótesis Física y Métodos de Dispersión SAR */}
      <div className="nasa-science-card">
        <div className="flex items-center gap-1.5 text-[var(--oj-gold-2)] mb-2">
          <Layers size={15} />
          <h5 className="text-xs uppercase font-mono font-bold tracking-wider">
            {en ? 'Physical interpretation and NISAR applications' : 'Hipótesis Física y Aplicaciones Científicas NISAR'}
          </h5>
        </div>

        {regionData.hipotesis_fisica?.mecanismos_dispersion && (
          <div className="science-item">
            <span className="science-label">{en ? 'Scattering mechanisms:' : 'Mecanismos Físicos de Dispersión:'}</span>
            <p className="science-text">
              {en ? NASA_EN[regionId].science : regionData.hipotesis_fisica.mecanismos_dispersion}
            </p>
          </div>
        )}

        {regionData.hipotesis_fisica?.polarizaciones_optimas && (
          <div className="science-item mt-2">
            <span className="science-label">{en ? 'Suggested polarizations:' : 'Polarizaciones Recomendadas:'}</span>
            <ul className="science-list">
              {(en ? NASA_EN[regionId].polarizations : regionData.hipotesis_fisica.polarizaciones_optimas).map((pol) => (
                <li key={pol}>{pol}</li>
              ))}
            </ul>
          </div>
        )}

        {regionData.hipotesis_fisica?.aplicaciones_futuras_nisar && (
          <div className="science-item mt-2">
            <span className="science-label">{en ? 'Potential applications:' : 'Impacto y Aplicación Operativa NISAR:'}</span>
            <p className="science-text">
              {en ? NASA_EN[regionId].applications : regionData.hipotesis_fisica.aplicaciones_futuras_nisar}
            </p>
          </div>
        )}

        {regionData.productos_recomendados?.length > 0 && (
          <div className="science-item mt-2">
            <span className="science-label">{en ? 'Suggested products:' : 'Productos Oficiales Recomendados:'}</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {regionData.productos_recomendados.map((prod) => (
                <span key={prod} className="nasa-chip">
                  <Orbit size={11} className="inline mr-1" />
                  {en ? prod.replace('Banda L', 'L-band').replace('Archivo Abierto', 'Open Archive').replace('Referencia', 'Reference') : prod}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
    , extrasHost)}
    </>
  )
}
