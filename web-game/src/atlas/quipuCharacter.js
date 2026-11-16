import { getAssetUrl } from '../utils/assetUrl.js'

const FILAS = { frente: 0, izquierda: 1, derecha: 2, espalda: 3 }
const VECTORES = { frente: [0, 1], izquierda: [-1, 0], derecha: [1, 0], espalda: [0, -1] }
const DURACION = { saludar: 1.2, saltar: 0.64, explorar: 1.35 }

function cargarImagen(src) {
  return new Promise((resolve, reject) => {
    const imagen = new Image()
    imagen.onload = () => resolve(imagen)
    imagen.onerror = () => reject(new Error('No se pudo cargar ' + src))
    imagen.src = src
  })
}

export class Quipu {
  static async cargar(opciones = {}) {
    const rawBase = opciones.carpeta || getAssetUrl('/atlas/quipu/')
    const basePath = rawBase.endsWith('/') ? rawBase : `${rawBase}/`
    const [caminata, acciones] = await Promise.all([
      cargarImagen(`${basePath}caminata.png`),
      cargarImagen(`${basePath}acciones.png`)
    ])
    return new Quipu(caminata, acciones, opciones)
  }

  constructor(
    caminata,
    acciones,
    { x = 0, y = 0, velocidad = 97, alturaSalto = 16, alExplorar = () => {} } = {}
  ) {
    this.caminata = caminata
    this.acciones = acciones
    this.x = x
    this.y = y
    this.velocidad = velocidad
    this.alturaSalto = alturaSalto
    this.alExplorar = alExplorar
    this.direccion = 'frente'
    this.accion = null
    this.tiempoAccion = 0
    this.tiempoPaso = 0
  }

  hacer(accion) {
    if (this.accion || !Object.hasOwn(DURACION, accion)) return false
    this.accion = accion
    this.tiempoAccion = 0
    this.tiempoPaso = 0
    if (accion === 'saludar') this.direccion = 'frente'
    if (accion === 'explorar' && this.direccion !== 'izquierda') this.direccion = 'derecha'
    return true
  }

  actualizar(segundos, direccion = null, puedeOcupar = () => true) {
    const dt = Math.max(0, segundos)
    if (this.accion) {
      this.tiempoAccion += dt
      if (this.tiempoAccion >= DURACION[this.accion]) {
        const termino = this.accion
        this.accion = null
        if (termino === 'explorar') {
          this.alExplorar({ x: this.x, y: this.y, direccion: this.direccion })
        }
      }
    }
    if (this.accion && this.accion !== 'saltar') return
    if (!direccion || !Object.hasOwn(VECTORES, direccion)) {
      this.tiempoPaso = 0
      return
    }
    this.direccion = direccion
    const [dx, dy] = VECTORES[direccion]
    const x = this.x + dx * this.velocidad * dt
    const y = this.y + dy * this.velocidad * dt
    if (puedeOcupar(x, y)) {
      this.x = x
      this.y = y
      this.tiempoPaso += dt
    } else {
      this.tiempoPaso = 0
    }
  }

  dibujar(ctx) {
    let hoja = this.caminata
    let fila = FILAS[this.direccion]
    let columna = Math.floor(this.tiempoPaso * 7) % 4
    let reflejar = false
    let arco = 0
    if (this.accion === 'saltar') {
      arco = Math.sin((Math.PI * this.tiempoAccion) / DURACION.saltar)
      columna = arco > 0.25 ? 1 : 0
    } else if (this.accion) {
      hoja = this.acciones
      const saludo = this.accion === 'saludar'
      fila = saludo ? 0 : 1
      const secuencia = saludo ? [0, 1, 2, 1, 2, 1, 0] : [0, 1, 2, 2, 1, 0]
      columna = secuencia[Math.floor((this.tiempoAccion / DURACION[this.accion]) * secuencia.length)]
      reflejar = !saludo && this.direccion === 'izquierda'
    }
    ctx.save()
    ctx.imageSmoothingEnabled = false
    ctx.translate(Math.round(this.x), Math.round(this.y))
    ctx.fillStyle = 'rgba(45, 51, 36, ' + (0.29 - arco * 0.13) + ')'
    ctx.beginPath()
    ctx.ellipse(0, -1, 7 - arco * 2.5, 2 - arco * 0.6, 0, 0, Math.PI * 2)
    ctx.fill()
    if (reflejar) ctx.scale(-1, 1)
    ctx.drawImage(
      hoja,
      columna * 32,
      fila * 32,
      32,
      32,
      -16,
      -31 - Math.round(arco * this.alturaSalto),
      32,
      32
    )
    ctx.restore()
  }
}
