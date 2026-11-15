const cache = new WeakMap()

const POSICION = {
  andes: [0.65, 0.53],
  amazonia: [0.67, 0.55],
  yakarta: [0.64, 0.53],
  volcan: [0.6, 0.49],
  bafin: [0.47, 0.53]
}

const PALETA = {
  neutro: [42, 53, 61],
  sube: [251, 185, 91],
  baja: [70, 203, 220]
}

const formato = (numero) => (numero > 0 ? '+' : '') + String(numero).replace('-', '−')
const limitar = (n, min, max) => Math.max(min, Math.min(max, n))
const mezclar = (inicial, final, t) => inicial.map((v, i) => v + (final[i] - v) * t)

function ruido(x, y, semilla = 1) {
  let n = Math.imul(x, 374761393) + Math.imul(y, 668265263) + semilla * 60493
  n = Math.imul(n ^ (n >>> 13), 1274126177)
  return ((n ^ (n >>> 16)) >>> 0) / 4294967295
}

function parche(id, x, y) {
  const [cx, cy] = POSICION[id]
  const dx = x - cx
  const dy = y - cy
  if (id === 'andes') {
    const costa = Math.hypot((dx + 0.06 * Math.sin(dy * 11)) / 0.215, dy / 0.31)
    return limitar((1 - costa) * 9 + 0.05 * Math.sin(y * 80), 0, 1)
  }
  if (id === 'amazonia') {
    const parcela = Math.max(Math.abs(dx + 0.13 * dy) / 0.17, Math.abs(dy - 0.14 * dx) / 0.255)
    return limitar((1 - parcela) * 16, 0, 1)
  }
  const radio = Math.hypot((dx + (id === 'yakarta' ? dy * 0.19 : 0)) / 0.31, dy / 0.47)
  return Math.max(0, 1 - radio * radio) ** 2
}

function tonoCambio(valor, m, granulado) {
  const amplitud = Math.abs(m.despues - m.antes) || 1
  const tono = mezclar(
    PALETA.neutro,
    valor < 0 ? PALETA.baja : PALETA.sube,
    limitar(Math.abs(valor) / amplitud, 0, 1)
  )
  return tono.map((v) => limitar(v + granulado * 12, 0, 255))
}

function mostrarEco(m, modo, x, y, ix, iy) {
  const peso = parche(m.id, x, y)
  const granulado = ruido(ix, iy) - 0.5
  if (modo === 'cambio') return tonoCambio((m.despues - m.antes) * peso, m, granulado)
  const relieve = Math.sin(29 * x + 11 * y) + Math.sin(45 * y - 18 * x)
  let fondo = -14 + 1.5 * relieve
  if (m.id === 'amazonia' && Math.abs(x - 0.23 - 0.1 * Math.sin(7 * y)) < 0.027) fondo = -23
  const db = fondo * (1 - peso) + (modo === 'antes' ? m.antes : m.despues) * peso
  const gris = limitar(20 + (db + 25) * 8 + granulado * 57, 8, 239)
  return [gris, gris, gris]
}

function mostrarDeformacion(m, modo, x, y, ix, iy) {
  const peso = parche(m.id, x, y)
  const amplitud = modo === 'antes' ? m.antes : modo === 'despues' ? m.despues : m.despues - m.antes
  return tonoCambio(amplitud * peso, m, ruido(ix, iy, 3) - 0.5)
}

function texturaHielo(x, y, desplazamiento, ix, iy) {
  const dentro = Math.abs(y - 0.57 - 0.06 * Math.cos(x * 6)) < 0.23
  const u = dentro ? x - desplazamiento : x
  const grano = ruido(Math.floor(u * 250), Math.floor(y * 105), 9) - 0.5
  let gris = dentro ? 146 + 32 * Math.sin(32 * u + 9 * y) : 70 + 19 * Math.cos(25 * x - 19 * y)
  if (dentro) {
    const grieta = Math.abs(Math.sin(33 * u + 5 * Math.sin(6 * y)))
    if (grieta < 0.135) gris -= 66
    const rasgo = Math.hypot((u - 0.47) / 0.035, (y - 0.53) / 0.055)
    if (rasgo < 0.85) gris -= 77
  }
  gris = limitar(gris + 48 * grano + ruido(ix, iy, 6) * 3, 12, 241)
  return [gris, gris, gris]
}

function marca(ctx, ancho, alto, posicion, etiqueta, color) {
  const x = Math.round(posicion[0] * ancho) + 0.5
  const y = Math.round(posicion[1] * alto) + 0.5
  ctx.lineWidth = 3
  ctx.strokeStyle = '#162127'
  ctx.beginPath()
  ctx.moveTo(x - 5, y)
  ctx.lineTo(x - 2, y)
  ctx.moveTo(x + 2, y)
  ctx.lineTo(x + 5, y)
  ctx.moveTo(x, y - 5)
  ctx.lineTo(x, y - 2)
  ctx.moveTo(x, y + 2)
  ctx.lineTo(x, y + 5)
  ctx.stroke()
  ctx.lineWidth = 1
  ctx.strokeStyle = color
  ctx.stroke()
  ctx.fillStyle = '#17242b'
  ctx.fillRect(x + 5, y - 12, etiqueta.length * 6 + 3, 11)
  ctx.font = 'bold 9px monospace'
  ctx.textBaseline = 'top'
  ctx.fillStyle = color
  ctx.fillText(etiqueta, x + 7, y - 11)
}

export function dibujarRadar(canvas, m, modo = 'despues') {
  if (!m || !POSICION[m.id] || !canvas) return
  const w = canvas.width
  const h = canvas.height
  if (!w || !h) return
  const clave = [m.id, m.antes, m.despues, w, h, modo].join('/')
  if (cache.get(canvas) === clave) return
  const ctx = canvas.getContext('2d')
  const frame = ctx.createImageData(w, h)
  const esHielo = m.id === 'bafin'
  const deriva = limitar((m.despues - m.antes) / 100, -0.18, 0.18)
  const esEco = m.id === 'andes' || m.id === 'amazonia'

  for (let j = 0; j < h; j++) {
    for (let i = 0; i < w; i++) {
      const x = (i + 0.5) / w
      const y = (j + 0.5) / h
      let rgb
      if (esHielo) rgb = texturaHielo(x, y, modo === 'antes' ? 0 : deriva, i, j)
      else if (esEco) rgb = mostrarEco(m, modo, x, y, i, j)
      else rgb = mostrarDeformacion(m, modo, x, y, i, j)
      const k = 4 * (j * w + i)
      frame.data[k] = rgb[0]
      frame.data[k + 1] = rgb[1]
      frame.data[k + 2] = rgb[2]
      frame.data[k + 3] = 255
    }
  }
  ctx.putImageData(frame, 0, 0)
  ctx.save()
  const origen = POSICION[m.id]
  if (esHielo) {
    const destino = [origen[0] + deriva, origen[1]]
    if (modo === 'cambio') {
      const y = origen[1] * h
      ctx.strokeStyle = '#fff0a2'
      ctx.lineWidth = 2
      const punta = destino[0] * w
      const signo = Math.sign(deriva || 1)
      ctx.beginPath()
      ctx.moveTo(origen[0] * w, y)
      ctx.lineTo(punta, y)
      ctx.lineTo(punta - 4 * signo, y - 3)
      ctx.moveTo(punta, y)
      ctx.lineTo(punta - 4 * signo, y + 3)
      ctx.stroke()
      marca(ctx, w, h, origen, 'P1', '#8ce2e0')
      marca(ctx, w, h, destino, 'P2', '#fff0a2')
    } else {
      marca(ctx, w, h, modo === 'antes' ? origen : destino, modo === 'antes' ? 'P1' : 'P2', '#fff0a2')
    }
  } else {
    marca(ctx, w, h, origen, 'P', '#fff0a2')
  }
  marca(ctx, w, h, [0.16, 0.23], 'R', '#e2ebed')
  ctx.restore()
  cache.set(canvas, clave)
}

export function obtenerLeyenda(m, modo = 'despues') {
  if (!m || !POSICION[m.id]) return ''
  const cambio = modo === 'cambio'
  const valor = modo === 'antes' ? m.antes : m.despues
  if (m.id === 'bafin') {
    if (cambio) {
      return (
        'La flecha une la misma textura P1 → P2. Avanzó ' +
        Math.abs(m.despues - m.antes) +
        ' m hacia el este respecto a la roca R. Esquema sin escala.'
      )
    }
    return (
      (modo === 'antes' ? 'P1' : 'P2') +
      ' señala la textura del hielo. Posición relativa al primer registro: ' +
      formato(valor) +
      ' m hacia el este. R es una roca estable.'
    )
  }
  if (m.id === 'andes' || m.id === 'amazonia') {
    if (cambio) {
      return (
        (m.despues >= m.antes ? 'Ámbar: aumentó el eco.' : 'Turquesa: disminuyó el eco.') +
        ' Gris: sin cambio. Diferencia en P: ' +
        formato(m.despues - m.antes) +
        ' dB. R es la comparación estable.'
      )
    }
    return (
      'P es la zona investigada (' +
      formato(valor) +
      ' dB). Más claro: eco más intenso. R es una referencia estable. Escala de grises común a ambas fechas.'
    )
  }
  const los = cambio ? m.despues - m.antes : valor
  return (
    (modo === 'antes' ? 'Fecha de referencia. ' : '') +
    'P: ' +
    formato(los) +
    ' mm en la línea de vista. ' +
    'El ámbar indica acercamiento y el turquesa, alejamiento. El gris permanece estable respecto a R.'
  )
}
