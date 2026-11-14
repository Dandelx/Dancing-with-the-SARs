import * as THREE from 'three'

/**
 * All vehicles are built from primitives at runtime. No external 3D model is
 * loaded, so the whole scene is original and licence-free.
 */

function mat(color, opts = {}) {
  return new THREE.MeshStandardMaterial({
    color,
    metalness: opts.metalness ?? 0.55,
    roughness: opts.roughness ?? 0.42,
    emissive: opts.emissive ?? 0x000000,
    emissiveIntensity: opts.emissiveIntensity ?? 0,
    side: opts.side ?? THREE.FrontSide,
  })
}

/** Soft radial sprite used for engine plumes and beacon glows. */
export function createGlowTexture(color = [255, 210, 140], size = 128) {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  g.addColorStop(0, `rgba(${color[0]},${color[1]},${color[2]},1)`)
  g.addColorStop(0.3, `rgba(${color[0]},${color[1]},${color[2]},0.45)`)
  g.addColorStop(1, `rgba(${color[0]},${color[1]},${color[2]},0)`)
  ctx.fillStyle = g
  ctx.fillRect(0, 0, size, size)
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  return texture
}

/* ------------------------------------------------------------------ */
/* NISAR satellite                                                     */
/* ------------------------------------------------------------------ */

export function createNisarSatellite() {
  const group = new THREE.Group()
  group.name = 'nisar'

  const hull = mat(0xdde5f0, { metalness: 0.62, roughness: 0.34 })
  const dark = mat(0x22344f, { metalness: 0.5, roughness: 0.55 })
  const foil = mat(0xc9a227, { metalness: 0.95, roughness: 0.3, emissive: 0x2a1c00 })
  const solar = mat(0x102a5c, {
    metalness: 0.8,
    roughness: 0.25,
    emissive: 0x0a1a3a,
    emissiveIntensity: 0.8,
  })

  const body = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.26, 0.42), hull)
  group.add(body)

  const bus = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.16, 0.2), foil)
  bus.position.set(0, -0.02, -0.24)
  group.add(bus)

  /* Radar dish facing +Y. */
  const dishPivot = new THREE.Group()
  dishPivot.position.set(0, 0.2, 0.02)
  dishPivot.rotation.x = -Math.PI / 2.6
  const dish = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.016, 32), hull)
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.2, 0.008, 8, 40), dark)
  rim.rotation.x = Math.PI / 2
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.2, 8), hull)
  mast.position.y = -0.1
  dishPivot.add(dish, rim, mast)
  group.add(dishPivot)

  /* Solar wings. */
  const wingGeo = new THREE.BoxGeometry(0.62, 0.008, 0.26)
  const armGeo = new THREE.CylinderGeometry(0.01, 0.01, 0.22, 6)
  for (const side of [-1, 1]) {
    const wing = new THREE.Mesh(wingGeo, solar)
    wing.position.set(side * 0.5, 0, 0)
    group.add(wing)

    const arm = new THREE.Mesh(armGeo, hull)
    arm.rotation.z = Math.PI / 2
    arm.position.set(side * 0.23, 0, 0)
    group.add(arm)
  }

  /* Tiny antenna beacon. */
  const beacon = new THREE.Mesh(new THREE.SphereGeometry(0.014, 8, 8), mat(0xff5b4a, { emissive: 0xff3b2a, emissiveIntensity: 2 }))
  beacon.position.set(0.12, 0.16, 0.16)
  group.add(beacon)

  group.scale.setScalar(0.62)
  return group
}

/* ------------------------------------------------------------------ */
/* Space station                                                       */
/* ------------------------------------------------------------------ */

export function createSpaceStation() {
  const group = new THREE.Group()
  group.name = 'station'

  const hull = mat(0xcfd8e6, { metalness: 0.6, roughness: 0.38 })
  const gold = mat(0xd8b45a, { metalness: 0.9, roughness: 0.32 })
  const solar = mat(0x16336b, {
    metalness: 0.75,
    roughness: 0.28,
    emissive: 0x0b1e42,
    emissiveIntensity: 0.7,
  })

  /* Pressurised modules along a spine. */
  const spine = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.92, 10), hull)
  spine.rotation.z = Math.PI / 2
  group.add(spine)

  const moduleGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.2, 16)
  for (const x of [-0.32, -0.08, 0.18, 0.36]) {
    const module = new THREE.Mesh(moduleGeo, x === 0.18 ? gold : hull)
    module.rotation.z = Math.PI / 2
    module.position.x = x
    group.add(module)
  }

  /* Habitation ring, a stylised nod to a rotating station. */
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.028, 10, 48), hull)
  group.add(ring)
  for (let i = 0; i < 4; i += 1) {
    const angle = (i * Math.PI) / 2
    const spoke = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.3, 6), hull)
    spoke.position.set(Math.cos(angle) * 0.15, Math.sin(angle) * 0.15, 0)
    spoke.rotation.z = angle - Math.PI / 2
    group.add(spoke)
  }

  /* Double solar wings, ISS style. */
  const panel = new THREE.BoxGeometry(0.3, 0.46, 0.012)
  for (const side of [-1, 1]) {
    for (const tier of [-1, 1]) {
      const array = new THREE.Mesh(panel, solar)
      array.position.set(side * 0.63, tier * 0.3, 0)
      array.rotation.z = side * 0.04
      group.add(array)
    }
    const boom = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.5, 6), hull)
    boom.rotation.z = Math.PI / 2
    boom.position.set(side * 0.42, 0, 0)
    group.add(boom)
  }

  const beacon = new THREE.Mesh(
    new THREE.SphereGeometry(0.018, 10, 10),
    mat(0x7fd4ff, { emissive: 0x54c8ff, emissiveIntensity: 2.4 }),
  )
  beacon.position.set(0, 0.3, 0)
  group.add(beacon)

  group.scale.setScalar(0.88)
  return group
}

/* ------------------------------------------------------------------ */
/* Explorer ship                                                       */
/* ------------------------------------------------------------------ */

export function createShip() {
  const group = new THREE.Group()
  group.name = 'ship'

  const hull = mat(0xf2f5fb, { metalness: 0.5, roughness: 0.28 })
  const accent = mat(0xd99a3e, { metalness: 0.85, roughness: 0.3, emissive: 0x2a1600 })
  const glass = mat(0x7fd4ff, {
    metalness: 0.2,
    roughness: 0.1,
    emissive: 0x2fa8ff,
    emissiveIntensity: 1.6,
  })

  const body = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.34, 14), hull)
  body.rotation.x = Math.PI / 2
  group.add(body)

  const cockpit = new THREE.Mesh(new THREE.SphereGeometry(0.045, 14, 12), glass)
  cockpit.position.set(0, 0.035, 0.07)
  cockpit.scale.set(1, 0.7, 1.3)
  group.add(cockpit)

  for (const side of [-1, 1]) {
    const wing = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.012, 0.11), accent)
    wing.position.set(side * 0.1, -0.012, -0.06)
    wing.rotation.z = side * 0.22
    group.add(wing)

    const fin = new THREE.Mesh(new THREE.BoxGeometry(0.014, 0.08, 0.1), accent)
    fin.position.set(side * 0.045, 0.05, -0.1)
    fin.rotation.z = side * 0.3
    group.add(fin)
  }

  const glowTexture = createGlowTexture([255, 196, 120], 96)
  const plume = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: glowTexture,
      color: 0xffc887,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      transparent: true,
    }),
  )
  plume.scale.set(0.28, 0.28, 1)
  plume.position.z = -0.2
  group.add(plume)

  group.userData.plume = plume
  group.scale.setScalar(0.9)
  return group
}

/** Destroys every geometry/material/texture inside a subtree. */
export function disposeObject(root) {
  root.traverse((obj) => {
    if (obj.geometry) obj.geometry.dispose()
    const materials = Array.isArray(obj.material) ? obj.material : obj.material ? [obj.material] : []
    for (const material of materials) {
      for (const value of Object.values(material)) {
        if (value && value.isTexture) value.dispose()
      }
      material.dispose()
    }
  })
}
