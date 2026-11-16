import { useEffect, useRef, useState } from 'react'
import audio from '../landing/audio/audioEngine.js'

export default function LaboratorioView({ regionId, lang, onCompletado }) {
  const en = lang === 'en'
  const translate = (value) => en ? ({
    'Laguna principal': 'Main lagoon', 'Canal obstruido': 'Blocked channel', 'Poza': 'Pool',
    'Domo con señal': 'Dome with signal', 'Punto exterior estable': 'Stable external point', 'Segunda marca dentro del domo': 'Second point inside the dome', 'Ladera sin referencia previa': 'Slope without a reference',
    '¡Excelente! Canal despejado.': 'Excellent! The channel is clear.', '¡Parcela delimitada correctamente!': 'Plot correctly marked!', '¡Red geodésica configurada!': 'Monitoring network configured!',
    'Un sensor debe estar en la zona que cambió y el otro sobre una referencia estable.': 'Place one sensor in the changed area and the other on a stable reference.',
    '¡Picos alineados! Desplazamiento confirmado: 12 m.': 'Peaks aligned! Displacement: 12 m.',
    'Los picos aún no coinciden. Desplaza la línea turquesa hasta la línea dorada.': 'The peaks do not line up yet. Move the turquoise line to the gold line.',
    '¡Nivelación registrada! Altura final: 982 mm.': 'Level recorded! Final height: 982 mm.',
    'Revisa la lectura del peldaño. La nivelación y la medición del radar están en direcciones diferentes.': 'Check the step reading. Ground leveling and radar measure different directions.',
    'Comprueba el signo y la magnitud. Las caídas de al menos 5 dB delimitan el claro en este ejemplo.': 'Check the sign and magnitude. Decreases of at least 5 dB mark the clearing in this example.'
  }[value] || value) : value
  const [mensaje, setMensaje] = useState('')

  // Andes
  const [pasoAndes, setPasoAndes] = useState(0)
  const secuenciaAndes = ['Laguna principal', 'Canal obstruido', 'Poza']

  // Amazonia
  const [selAmazonia, setSelAmazonia] = useState(new Set())
  const datosAmazonia = [
    'A · 0 dB',
    'B · −7 dB',
    'C · −6 dB',
    'D · +1 dB',
    'E · −8 dB',
    'F · −1 dB'
  ]

  // Volcan
  const [selVolcan, setSelVolcan] = useState(new Set())
  const datosVolcan = [
    'Domo con señal',
    'Punto exterior estable',
    'Segunda marca dentro del domo',
    'Ladera sin referencia previa'
  ]

  // Bafin & Yakarta sliders
  const [sliderVal, setSliderVal] = useState(() => (regionId === 'bafin' ? 0 : 1000))
  const canvasRef = useRef(null)

  // Canvas drawing for Bafin & Yakarta
  useEffect(() => {
    if (regionId !== 'bafin' && regionId !== 'yakarta') return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const w = 256
    const h = 67

    ctx.fillStyle = '#183731'
    ctx.fillRect(0, 0, w, h)

    ctx.lineWidth = 1
    ctx.strokeStyle = '#355349'
    for (let x = 0; x < w; x += 16) {
      ctx.beginPath()
      ctx.moveTo(x, 0)
      ctx.lineTo(x, h)
      ctx.stroke()
    }

    ctx.lineWidth = 2
    if (regionId === 'bafin') {
      const perfiles = [
        [12, '#eed493', 0],
        [sliderVal, '#8be7dc', 3]
      ]
      const pts = [
        [8, 48],
        [34, 48],
        [44, 27],
        [53, 46],
        [73, 46],
        [87, 12],
        [100, 44],
        [130, 44],
        [145, 22],
        [154, 47],
        [179, 47]
      ]
      for (const [dx, color, dy] of perfiles) {
        ctx.strokeStyle = color
        ctx.beginPath()
        pts.forEach(([px, py], i) => {
          if (i === 0) ctx.moveTo(px + dx * 2, py + dy)
          else ctx.lineTo(px + dx * 2, py + dy)
        })
        ctx.stroke()
      }
    } else {
      const lineas = [
        [1000, '#eed493'],
        [sliderVal, '#8be7dc']
      ]
      ctx.font = '10px monospace'
      for (const [val, color] of lineas) {
        const y = 56 - (val - 970) * 1.15
        ctx.fillStyle = color
        ctx.fillRect(35, y, 165, 2)
        ctx.fillText(`${val} mm`, 204, y + 3)
      }
    }
  }, [regionId, sliderVal])

  /* Andes handlers */
  const handleAndesClick = (nombre) => {
    audio.sfx('click')
    if (nombre !== secuenciaAndes[pasoAndes]) {
      setMensaje(
        (en ? 'Follow the water. ' : 'Sigue la corriente. ') +
          (pasoAndes === 0
            ? (en ? 'Start where water was present on both dates.' : 'Empieza donde había agua en las dos fechas.')
            : (en ? 'Find the next downstream section.' : 'Busca el siguiente tramo aguas abajo.'))
      )
      return
    }
    const nuevoPaso = pasoAndes + 1
    setPasoAndes(nuevoPaso)
    if (nuevoPaso === 3) {
      audio.sfx('ready')
      setMensaje('¡Excelente! Canal despejado.')
      onCompletado()
    } else {
      setMensaje(secuenciaAndes.slice(0, nuevoPaso).map(translate).join(' → ') + ' → …')
    }
  }

  /* Amazonia handlers */
  const toggleAmazonia = (idx) => {
    audio.sfx('click')
    setSelAmazonia((prev) => {
      const next = new Set(prev)
      if (next.has(idx)) next.delete(idx)
      else next.add(idx)
      setMensaje(en ? `${next.size} of 3 selected.` : `${next.size} de 3 seleccionados.`)
      return next
    })
  }

  const validarAmazonia = () => {
    audio.sfx('click')
    const correctas = [1, 2, 4]
    const acierto =
      selAmazonia.size === correctas.length && correctas.every((i) => selAmazonia.has(i))
    if (acierto) {
      audio.sfx('ready')
      setMensaje('¡Parcela delimitada correctamente!')
      onCompletado()
    } else {
      setMensaje(
        'Comprueba el signo y la magnitud. Las caídas de al menos 5 dB delimitan el claro en este ejemplo.'
      )
    }
  }

  /* Volcan handlers */
  const toggleVolcan = (idx) => {
    audio.sfx('click')
    setSelVolcan((prev) => {
      const next = new Set(prev)
      if (next.has(idx)) next.delete(idx)
      else next.add(idx)
      setMensaje(en ? `${next.size} of 2 selected.` : `${next.size} de 2 seleccionados.`)
      return next
    })
  }

  const validarVolcan = () => {
    audio.sfx('click')
    const correctas = [0, 1]
    const acierto = selVolcan.size === correctas.length && correctas.every((i) => selVolcan.has(i))
    if (acierto) {
      audio.sfx('ready')
      setMensaje('¡Red geodésica configurada!')
      onCompletado()
    } else {
      setMensaje(
        'Un sensor debe estar en la zona que cambió y el otro sobre una referencia estable.'
      )
    }
  }

  /* Bafin handler */
  const validarBafin = () => {
    audio.sfx('click')
    if (sliderVal === 12) {
      audio.sfx('ready')
      setMensaje('¡Picos alineados! Desplazamiento confirmado: 12 m.')
      onCompletado()
    } else {
      setMensaje(
        'Los picos aún no coinciden. Desplaza la línea turquesa hasta la línea dorada.'
      )
    }
  }

  /* Yakarta handler */
  const validarYakarta = () => {
    audio.sfx('click')
    if (sliderVal === 982) {
      audio.sfx('ready')
      setMensaje('¡Nivelación registrada! Altura final: 982 mm.')
      onCompletado()
    } else {
      setMensaje(
        'Revisa la lectura del peldaño. La nivelación y la medición del radar están en direcciones diferentes.'
      )
    }
  }

  return (
    <div className="lab-box">
      {regionId === 'andes' && (
        <div className="lab-opciones">
          <p className="lab-hint">{en ? 'Select the areas in water-flow order:' : 'Toca las zonas en orden hidrológico:'}</p>
          <div className="flex gap-2 flex-wrap">
            {['Poza', 'Laguna principal', 'Canal obstruido'].map((nom) => {
              const completado = secuenciaAndes.slice(0, pasoAndes).includes(nom)
              return (
                <button
                  key={nom}
                  type="button"
                  className={`lab-btn ${completado ? 'is-done' : ''}`}
                  disabled={completado}
                  onClick={() => handleAndesClick(nom)}
                >
                  {translate(nom)}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {regionId === 'amazonia' && (
        <div className="lab-opciones">
          <div className="parches-grid">
            {datosAmazonia.map((txt, i) => (
              <button
                key={txt}
                type="button"
                className={`lab-btn ${selAmazonia.has(i) ? 'is-active' : ''}`}
                aria-pressed={selAmazonia.has(i)}
                onClick={() => toggleAmazonia(i)}
              >
                {txt}
              </button>
            ))}
          </div>
          <button type="button" className="lab-btn primario mt-3" onClick={validarAmazonia}>
            {en ? 'Mark plot' : 'Delimitar parcela'}
          </button>
        </div>
      )}

      {regionId === 'volcan' && (
        <div className="lab-opciones">
          <div className="sensores-grid">
            {datosVolcan.map((txt, i) => (
              <button
                key={txt}
                type="button"
                className={`lab-btn ${selVolcan.has(i) ? 'is-active' : ''}`}
                aria-pressed={selVolcan.has(i)}
                onClick={() => toggleVolcan(i)}
              >
                {translate(txt)}
              </button>
            ))}
          </div>
          <button type="button" className="lab-btn primario mt-3" onClick={validarVolcan}>
            {en ? 'Install stations' : 'Instalar estaciones'}
          </button>
        </div>
      )}

      {(regionId === 'bafin' || regionId === 'yakarta') && (
        <div className="lab-opciones">
          <canvas
            ref={canvasRef}
            width={256}
            height={67}
            className="perfil-canvas"
            aria-label={
              regionId === 'bafin'
                ? (en ? 'Crack profiles from both dates' : 'Perfiles de la grieta en ambas fechas')
                : (en ? 'Vertical height relative to the benchmark' : 'Altura vertical respecto al banco')
            }
          />
          <div className="slider-row mt-2">
            <label className="text-xs text-[var(--oj-ink)] font-mono">
              {regionId === 'bafin' ? (en ? 'Eastward displacement: ' : 'Desplazamiento este: ') : (en ? 'Final height: ' : 'Altura final: ')}
              <strong>
                {sliderVal} {regionId === 'bafin' ? 'm' : 'mm'}
              </strong>
            </label>
            <input
              type="range"
              min={regionId === 'bafin' ? 0 : 970}
              max={regionId === 'bafin' ? 24 : 1010}
              step={regionId === 'bafin' ? 1 : 2}
              value={sliderVal}
              onChange={(e) => setSliderVal(Number(e.target.value))}
              className="oj-range w-full mt-1"
            />
          </div>
          <button
            type="button"
            className="lab-btn primario mt-3"
            onClick={regionId === 'bafin' ? validarBafin : validarYakarta}
          >
            {regionId === 'bafin' ? (en ? 'Set displacement' : 'Fijar desplazamiento') : (en ? 'Record level' : 'Registrar nivel')}
          </button>
        </div>
      )}

      {mensaje && <p className="lab-status mt-2 text-xs font-semibold text-[#f0c46a]">{translate(mensaje)}</p>}
    </div>
  )
}
