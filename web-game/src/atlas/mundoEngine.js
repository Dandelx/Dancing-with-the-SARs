const datos = {
  grid: [
    "rrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr",
    "rrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrr",
    "rr.................................r..r.......rr.r......................r....r.r......rr",
    "rr.r....r..r..........r.............r..............................r....v...r.........rr",
    "rrr........rrr..........r............................r............r..vvvvvvvr.........rr",
    "rr..........r...pppppbb.r........r.......rr..r....r.....r....rmmmmmmmmmmmmvvv...r...rrrr",
    "rr............pppppppbbbi............r...r...rr..r............m....r.....mvvr.r.......rr",
    "rr....r..r..pppp.......bbii..iii..r...........rr..............m..........mr....r......rr",
    "rr........rppp.....r....pbbbiiii..........r...rr..r..rr.......m..........mr..r.......rrr",
    "rrr.....r..p...r........rppbbiiir.................r.....rr....m..........m.........r..rr",
    "rr.........pr......r........piii...rr............r.r..........m....p.....m.......r...rrr",
    "rr.........p................p........r..r......r......r...r...m....p..r..m.r..........rr",
    "rr......iiipr....hhh...r....p.........r........r...........r..m....p.....mr.....r...r.rr",
    "rr.....r...bii...hhh........p...................r....r........m....p.....m.pp.......r.rr",
    "rr....r....pppiii.p......r..p.....r.........r.......rr......rrm....p.....mpppp.......rrr",
    "rr.r........pppp.ibi........p.................r.........r.....mmmmsssmmmmmp..pp.rr....rr",
    "rr............ppppp.ii.....pp..............r........rr...p.........p..........ppr.....rr",
    "rr............ppppp...r.l.pp..........................rrpp........pp........r.rbp.r.r.rr",
    "rr............pppp.......pp.............ppppppppppp..rrphhh.rppppppp........vvvvp..r..rr",
    "rr.............ppr.r..r.pp.......r.....ppppppppppppp...phhh.pppppppp.r..rvvvv..pp...r.rr",
    "rr.......r.r...pppppppppp............ppp.........rrppp.p.p.ppr...r....vvvv.....p......rr",
    "rr......r.....rppppppppp..r.........ppp....t.......rpppppppp.r.....vvvvr.r....rp......rr",
    "rr...t...rwww..pr.............r....pp............t....ppppp.....vvvv........r..p......rr",
    "rr.t..tt.twww..p...................p.............t...r.ppppppp..v.r..r.......rpprrrr..rr",
    "rr..ttrt..www.tpr..................p....t.t.............pppppppp.r..r....l....pr..r..rrr",
    "rrt...t....wwwtpt.t................p.mmmmmmmmmmmmmmmmm..pp....pppp.r.........pp.......rr",
    "rr.t.......wwwppppppppp.t....tt....p.m.............t.m.ttpt.....pppp.......ppp...r....rr",
    "rr.t...t...wwbpppppppppp.t.........p.m...............m.t.p....r.r.pppp....ppp.........rr",
    "rr....r....pbbw.ttt...tpp.tt..r...pp.m...............m...pt.........pppp.pp...........rr",
    "rr........ppbww..t......ppt....t.rp..m.....t.........m..pp.t.....ppppppppppp.......wwwww",
    "rr.t.t..tppt.wwwt...ttt..pp.......p..m.....pppppp....m..p......ppbbbp...pppppp....wwwwww",
    "rr.trt...pt.rwww.......t..ppppppppp..m.....p..t...t..m..pt....pppwww........pp....wwwwww",
    "rrt....t.hhh.www..p...t..ttppppppp...m.....p.........m..p....ppt.www.t...t...phhhwwwwwww",
    "rrt..tt..hhh..www.pl...t....t.......tm.....p.........m.ppt..pp...www...t....tphhhwwwwwww",
    "rr..tr.t.pp...www.p..ttt.......mmmm..mmmmmsssmmmmmmmmmpp...pp....www.........p...wwwwwww",
    "rr..t.....p..rwww.p..tt.t...m......t.t.t...p...t....ppp....p.....www....t....p...wwwwwww",
    "rr........ppppbbbpppppppppt.m......t.......p......ppp......p.....www.......t.p..r.wwwwww",
    "rrt..t..t.ppppbbbpppppppppppm.hhh..........l.....ppmmmm.t.tpp....wwwt....hhh.p....wwwwww",
    "rr....tt.pp...www...t.ttt.ppmphhh..hhh...p.p....pp.........tp....www.....hhh.p.....wwwww",
    "rrt....tppp..www..t.tt....t.mpppppphhhppppppppppppppppppppp.p....www..t......pp.....wwww",
    "rr..t...p.pp.www..t...tt....m.ppppppppppppppppppppppppppppppp....www.........pp.....wwww",
    "rr..r.t.p..p.www.t.t.....r..mtp.....p.....t..t.........t.ttppp...www.........p...tt.twww",
    "rr......p...www.wwww......t..pp.t...p.....t........d...t....ppp..wbw............t....www",
    "rr.t..t.pt..wwwwwwwwwww...t..mmm....pppppppppppppddddd........pppbbbbbbbbbbbbbbbwwwwwwww",
    "ww...t..p..wwwwwwwwwwwwww.pppp.t..t.pppppppppppppdddddd.t......ppbbbbbbbbbbbbbbbwwwwwwww",
    "wwww....bwwwwwww...twwwbbbppp...............wwwwwddddd.......t.p.wbwt..........p.....www",
    "wwwwwwhhhwwwww.t.t....pbbb.t..r.t.........wwwwwwwwwdwww......hhh.hhh......r....p....wwww",
    "rrwwwwhhhwwww.......tpp..w......t.mmmmmm..wwwwwwwwwwwww......hhh.hhhppppppppppppppbbbbww",
    "rr..wwwpp.www...t...pptt..t...t..r...t...wwwwwwwwwwwwwww.......ppbppppppppppppppppbbbbww",
    "rrt.t...p.www.t.t..pp......t...........tt.wwwwwwwwwwwww........ppbbbpppppppppppp..wwwwww",
    "rrrr.tttppbbbpt...pp......................wwwwwwwwwwwww..........wbbpppppppppppp..wwwwww",
    "rr...t.rrpbbbpppppp......ttr...............twwwwwwwww.....www....wwwt....wwwwr...wwwwwww",
    "rr........www.pppp......t..t............tt......wt......wwwwwww.rwwwt..rwwwwww...wwwwwww",
    "rrt....r..www...t.....t....t..........................twwwwwwwwwt......wwwwwwwww.wwwwwww",
    "rr...t..t..www.tt.t....tt.tt..r........t...............wwwwwwwwwwt...wwwwwwwwwwwwwwwwwww",
    "rr...t....rwww...t....t...ttt.t........................wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww",
    "rr...r......www.....t..t.trr..t.......r............r...wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww",
    "rrt.........www...t...t...tt.......t...........t.......wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww",
    "rrrrrrrrrrrrwwwrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww",
    "rrrrrrrrrrrrrwwwrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww"
  ],
  bio: [
    "2222222222222222222222222222222222222222222244444444444444444444444444444444444444444444",
    "2222222222222222222222222222222222222222222244444444444444444444444444444444444444444444",
    "2222222222222222222222222222222222222222222244444444444444444444444444444444444444444444",
    "2222222222222222222222222222222222222222222244444444444444444444444444444444444444444444",
    "2222222222222222222222222222222222222222222244444444444444444444444444444444444444444444",
    "2222222222222222222222222222222222222222222244444444444444444444444444444444444444444444",
    "2222222222222222222222222222222222222222222244444444444444444444444444444444444444444444",
    "2222222222222222222222222222222222222222222244444444444444444444444444444444444444444444",
    "2222222222222222222222222222222222222222222244444444444444444444444444444444444444444444",
    "2222222222222222222222222222222222222222222244444444444444444444444444444444444444444444",
    "2222222222222222222222222222222222222222222244444444444444444444444444444444444444444444",
    "2222222222222222222222222222222222222222222244444444444444444444444444444444444444444444",
    "2222222222222222222222222222222222222222222244444444444444444444444444444444444444444444",
    "2222222222222222222222222222222222222222222244444444444444444444444444444444444444444444",
    "2222222222222222222222222222222222222222222244444444444444444444444444444444444444444444",
    "2222222222222222222222222222222222222222222244444444444444444444444444444444444444444444",
    "2222222222222222222222222222222222222222222244444444444444444444444444444444444444444444",
    "2222222222222222222222222222222222222222222004444444444444444444444444444444444444444444",
    "2222222222222222222222222222222222222222200000444444444444444444444444444444444444444444",
    "2222222222222222222222222222222222222220000000004444444444444444444444444444444444444444",
    "2222222222222222222222222222222222222200000000000444444444444444444444444444444444444444",
    "1112222222222222222222222222222222220000000000000004444444444444444444444444444444444444",
    "1111111222222222222222222222222222000000000000000000444444444444444444444444444444444444",
    "1111111111112222222222222222222220000000000000000000004444444444444444444444444444444444",
    "1111111111111111222222222222222000000000000000000000000044444444444444444444444444444444",
    "1111111111111111111122222222220000000000000000000000000004444444444444444444444444444444",
    "1111111111111111111111111222000000000000000000000000000000044444444444444444444444333333",
    "1111111111111111111111111110000000000000000000000000000000004444444444444433333333333333",
    "1111111111111111111111111110000000000000000000000000000000000044444333333333333333333333",
    "1111111111111111111111111110000000000000000000000000000000000033333333333333333333333333",
    "1111111111111111111111111110000000000000000000000000000000000033333333333333333333333333",
    "1111111111111111111111111110000000000000000000000000000000000033333333333333333333333333",
    "1111111111111111111111111110000000000000000000000000000000000333333333333333333333333333",
    "1111111111111111111111111110000000000000000000000000000000000333333333333333333333333333",
    "1111111111111111111111111110000000000000000000000000000000000333333333333333333333333333",
    "1111111111111111111111111110000000000000000000000000000000000333333333333333333333333333",
    "1111111111111111111111111110000000000000000000000000000000003333333333333333333333333333",
    "1111111111111111111111111110000000000000000000000000000000003333333333333333333333333333",
    "1111111111111111111111111110000000000000000000000000000000003333333333333333333333333333",
    "1111111111111111111111111111000000000000000000000000000000033333333333333333333333333333",
    "1111111111111111111111111111000000000000000000000000000000033333333333333333333333333333",
    "1111111111111111111111111111000000000000000000000000000000033333333333333333333333333333",
    "1111111111111111111111111111000000000000000000000000000000333333333333333333333333333333",
    "1111111111111111111111111111000000000000000000000000000000333333333333333333333333333333",
    "1111111111111111111111111111000000000000000000000000000000333333333333333333333333333333",
    "1111111111111111111111111111000000000000000000000000000003333333333333333333333333333333",
    "1111111111111111111111111111000000000000000000000000000003333333333333333333333333333333",
    "1111111111111111111111111111000000000000000000000000000003333333333333333333333333333333",
    "1111111111111111111111111111000000000000000000000000000033333333333333333333333333333333",
    "1111111111111111111111111111000000000000000000000000000033333333333333333333333333333333",
    "1111111111111111111111111111000000000000000000000000000033333333333333333333333333333333",
    "1111111111111111111111111111000000000000000000000000000033333333333333333333333333333333",
    "1111111111111111111111111111000000000000000000000000000333333333333333333333333333333333",
    "1111111111111111111111111111000000000000000000000000000333333333333333333333333333333333",
    "1111111111111111111111111111000000000000000000000000000333333333333333333333333333333333",
    "1111111111111111111111111111000000000000000000000000003333333333333333333333333333333333",
    "1111111111111111111111111111000000000000000000000000003333333333333333333333333333333333",
    "1111111111111111111111111111000000000000000000000000003333333333333333333333333333333333",
    "1111111111111111111111111111000000000000000000000000033333333333333333333333333333333333",
    "1111111111111111111111111111000000000000000000000000033333333333333333333333333333333333"
  ],
  patches: {
    andes: [736, 656],
    amazonia: [240, 464],
    bafin: [336, 96],
    yakarta: [1200, 592],
    volcan: [1056, 128]
  },
  inicio: [664, 632],
  sitios: {
    andes: {
      puerta: [584, 648],
      muestras: [
        [776, 696],
        [776, 488]
      ],
      nombre: 'Archivo de Namora'
    },
    amazonia: {
      puerta: [120, 776],
      muestras: [
        [184, 648],
        [296, 520]
      ],
      nombre: 'Cabaña del dosel'
    },
    bafin: {
      puerta: [296, 232],
      muestras: [
        [232, 280],
        [392, 120]
      ],
      nombre: 'Refugio de Bafín'
    },
    yakarta: {
      puerta: [1064, 776],
      muestras: [
        [1000, 696],
        [1256, 632]
      ],
      nombre: 'Archivo del puerto'
    },
    volcan: {
      puerta: [920, 328],
      muestras: [
        [904, 376],
        [1080, 168]
      ],
      nombre: 'Observatorio del domo'
    }
  }
}

const ids = ['andes', 'amazonia', 'bafin', 'yakarta', 'volcan']
const ancho = datos.grid[0].length * 16
const alto = datos.grid.length * 16
const imagenes = new Map()
const colores = ['#aeb575', '#709967', '#c7dce1', '#b5af80', '#a78f82']
const dirs = { izquierda: [-1, 0], derecha: [1, 0], espalda: [0, -1], frente: [0, 1] }

const simbolo = (x, y) => datos.grid[Math.floor(y / 16)]?.[Math.floor(x / 16)] || '#'

function region(x, y) {
  const i = Math.max(0, Math.min(datos.grid[0].length - 1, Math.floor(x / 16)))
  const j = Math.max(0, Math.min(datos.grid.length - 1, Math.floor(y / 16)))
  return ids[Number(datos.bio[j][i])]
}

function libre(x, y, resueltas) {
  const celda = simbolo(x, y)
  return '.pbs'.includes(celda) || (celda === 'd' && !resueltas?.has('andes'))
}

function legal(x, y, resueltas) {
  return (
    libre(x - 2, y - 1, resueltas) &&
    libre(x + 2, y - 1, resueltas) &&
    libre(x - 2, y + 1, resueltas) &&
    libre(x + 2, y + 1, resueltas)
  )
}

function salto(x, y, direccion, resueltas) {
  const v = dirs[direccion]
  if (!v || !legal(x, y, resueltas)) return null
  let obstaculo = false
  for (let d = 1; d <= 41; d++) {
    const xx = x + v[0] * d
    const yy = y + v[1] * d
    const c = simbolo(xx, yy)
    if (c === 'l') {
      if (!obstaculo && d > 15) return null
      obstaculo = true
      continue
    }
    if (!libre(xx, yy, resueltas)) return null
    if (obstaculo && legal(xx, yy, resueltas)) return [xx, yy]
  }
  return null
}

async function cargar(basePath = '/atlas/mundo/') {
  await Promise.all(
    ['paisaje', ...ids].map(
      (nombre) =>
        new Promise((ok, fail) => {
          const im = new Image()
          im.onload = () => {
            imagenes.set(nombre, im)
            ok()
          }
          im.onerror = () => fail(new Error('No se pudo cargar el paisaje: ' + nombre))
          im.src = `${basePath}${nombre}.webp`
        })
    )
  )
}

function dibujar(ctx, camX, camY, resueltas, tiempo) {
  const fondo = imagenes.get('paisaje')
  if (!fondo) return
  const cx = Math.round(camX)
  const cy = Math.round(camY)
  const w = 384
  const h = 256
  ctx.imageSmoothingEnabled = false
  ctx.drawImage(fondo, cx, cy, w, h, 0, 0, w, h)
  for (const id of resueltas || []) {
    const patch = imagenes.get(id)
    const pos = datos.patches[id]
    if (!patch || !pos) continue
    if (pos[0] < cx + w && pos[1] < cy + h && pos[0] + patch.width > cx && pos[1] + patch.height > cy) {
      ctx.drawImage(patch, pos[0] - cx, pos[1] - cy)
    }
  }

  const n = Math.floor((tiempo || 0) * 2.4)
  for (let j = Math.floor(cy / 16); j <= Math.floor((cy + h) / 16); j++) {
    for (let i = Math.floor(cx / 16); i <= Math.floor((cx + w) / 16); i++) {
      const c = datos.grid[j]?.[i]
      if ((c === 'w' || (c === 'd' && resueltas?.has('andes'))) && (i * 7 + j * 11 + n) % 13 === 0) {
        ctx.fillStyle = '#add4cd'
        ctx.fillRect(i * 16 + ((i * 7 + n) % 10) - cx, j * 16 + ((i + j) % 11) + 2 - cy, 3, 1)
      }
    }
  }
}

let cartaCanvas = null
function mini(ctx, px, py, meta) {
  if (!cartaCanvas && typeof document !== 'undefined') {
    cartaCanvas = document.createElement('canvas')
    cartaCanvas.width = ancho / 16
    cartaCanvas.height = alto / 16
    const g = cartaCanvas.getContext('2d')
    for (let y = 0; y < datos.grid.length; y++) {
      for (let x = 0; x < datos.grid[y].length; x++) {
        const tipo = datos.grid[y][x]
        const zona = Number(datos.bio[y][x])
        g.fillStyle =
          tipo === 'w'
            ? '#5c98a5'
            : tipo === 'b'
              ? '#a98764'
              : tipo === 'v'
                ? '#d07b4e'
                : tipo === 'm'
                  ? '#8c887a'
                  : tipo === 'i'
                    ? '#8bb5c8'
                    : tipo === 'p'
                      ? '#d6c9a6'
                      : tipo === 't'
                        ? '#587d57'
                        : tipo === 'h'
                          ? '#7a6355'
                          : colores[zona]
        g.fillRect(x, y, 1, 1)
      }
    }
  }
  const W = ctx.canvas.width
  const H = ctx.canvas.height
  ctx.imageSmoothingEnabled = false
  if (cartaCanvas) {
    ctx.drawImage(cartaCanvas, 0, 0, W, H)
  }
  for (const id of ids) {
    const [x, y] = datos.sitios[id].puerta
    ctx.fillStyle = '#344a43'
    ctx.fillRect(Math.round((x / ancho) * W) - 1, Math.round((y / alto) * H) - 1, 3, 3)
  }
  if (Array.isArray(meta)) {
    const x = Math.round((meta[0] / ancho) * W)
    const y = Math.round((meta[1] / alto) * H)
    ctx.strokeStyle = '#ffcf55'
    ctx.strokeRect(x - 3, y - 3, 6, 6)
  }
  const x = Math.round((px / ancho) * W)
  const y = Math.round((py / alto) * H)
  ctx.fillStyle = '#2b2820'
  ctx.fillRect(x - 3, y - 3, 7, 7)
  ctx.fillStyle = '#fff5d9'
  ctx.fillRect(x - 2, y - 2, 5, 5)
}

export const Mundo = {
  ancho,
  alto,
  inicio: datos.inicio,
  sitios: datos.sitios,
  cargar,
  region,
  legal,
  salto,
  dibujar,
  mini
}
