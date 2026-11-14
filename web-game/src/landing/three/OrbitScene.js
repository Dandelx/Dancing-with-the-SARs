import * as THREE from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js'
import {
  createGlowTexture,
  createNisarSatellite,
  createShip,
  createSpaceStation,
  disposeObject,
} from './models.js'

export const EARTH_RADIUS = 2.05
export const PERU = { lat: -9.19, lon: -75.02 }

const SUN_DIR = new THREE.Vector3(0.72, 0.28, 0.62).normalize()
const UP = new THREE.Vector3(0, 1, 0)

const clamp01 = (v) => Math.min(1, Math.max(0, v))
const smoothstep = (edge0, edge1, x) => {
  const t = clamp01((x - edge0) / (edge1 - edge0))
  return t * t * (3 - 2 * t)
}
const easeInOutCubic = (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

/** Equirectangular lat/lon -> point on a sphere of the given radius. */
export function latLonToVec3(lat, lon, radius = 1, target = new THREE.Vector3()) {
  const phi = THREE.MathUtils.degToRad(lat)
  const lambda = THREE.MathUtils.degToRad(lon)
  const cosPhi = Math.cos(phi)
  return target
    .set(Math.cos(lambda) * cosPhi, Math.sin(phi), -Math.sin(lambda) * cosPhi)
    .multiplyScalar(radius)
}

const PERU_DIR = latLonToVec3(PERU.lat, PERU.lon, 1).normalize()

/* ------------------------------------------------------------------ */
/* Earth shader                                                        */
/* ------------------------------------------------------------------ */

const EARTH_VERTEX = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vNormalW;
  varying vec3 vPosW;
  void main() {
    vUv = uv;
    vNormalW = normalize(mat3(modelMatrix) * normal);
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vPosW = worldPosition.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`

const EARTH_FRAGMENT = /* glsl */ `
  uniform sampler2D uDay;
  uniform sampler2D uNight;
  uniform vec3 uSunDir;
  uniform vec3 uAtmosphere;
  uniform float uHasDay;
  uniform float uHasNight;

  varying vec2 vUv;
  varying vec3 vNormalW;
  varying vec3 vPosW;

  void main() {
    vec3 n = normalize(vNormalW);
    vec3 v = normalize(cameraPosition - vPosW);
    float ndl = dot(n, normalize(uSunDir));

    vec3 dayColor = uHasDay > 0.5 ? texture2D(uDay, vUv).rgb : vec3(0.09, 0.16, 0.28);
    vec3 nightColor = uHasNight > 0.5 ? texture2D(uNight, vUv).rgb : vec3(0.0);

    float dayMix = smoothstep(-0.14, 0.34, ndl);
    vec3 lit = dayColor * (0.055 + 1.08 * clamp(ndl, 0.0, 1.0));
    vec3 night = nightColor * 1.5 + vec3(0.006, 0.011, 0.028);

    vec3 color = mix(night, lit, dayMix);

    /* Warm rim where sunlight grazes the limb. */
    float fresnel = pow(1.0 - clamp(dot(n, v), 0.0, 1.0), 3.0);
    color += uAtmosphere * fresnel * 0.85;

    gl_FragColor = vec4(color, 1.0);
  }
`

const ATMO_VERTEX = /* glsl */ `
  varying vec3 vNormalW;
  varying vec3 vPosW;
  void main() {
    vNormalW = normalize(mat3(modelMatrix) * normal);
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vPosW = worldPosition.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`

const ATMO_FRAGMENT = /* glsl */ `
  uniform vec3 uColor;
  uniform float uIntensity;
  varying vec3 vNormalW;
  varying vec3 vPosW;
  void main() {
    vec3 n = normalize(vNormalW);
    vec3 v = normalize(cameraPosition - vPosW);
    float rim = pow(1.0 - abs(dot(n, v)), 2.6);
    gl_FragColor = vec4(uColor, rim * uIntensity);
  }
`

/* ------------------------------------------------------------------ */
/* Peru mask                                                           */
/* ------------------------------------------------------------------ */

function buildPeruMask(geojson, width = 2048, height = 1024) {
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, width, height)

  const path = new Path2D()
  const project = (lon, lat) => [((lon + 180) / 360) * width, ((90 - lat) / 180) * height]
  const addRing = (ring) => {
    ring.forEach(([lon, lat], index) => {
      const [x, y] = project(lon, lat)
      if (index === 0) path.moveTo(x, y)
      else path.lineTo(x, y)
    })
    path.closePath()
  }

  for (const feature of geojson.features ?? []) {
    const geometry = feature.geometry
    if (!geometry) continue
    const polygons =
      geometry.type === 'Polygon'
        ? [geometry.coordinates]
        : geometry.type === 'MultiPolygon'
          ? geometry.coordinates
          : []
    for (const polygon of polygons) polygon.forEach(addRing)
  }

  ctx.shadowColor = 'rgba(255, 255, 255, 0.85)'
  ctx.shadowBlur = 14
  ctx.fillStyle = '#ffffff'
  ctx.fill(path, 'evenodd')
  ctx.shadowBlur = 0
  ctx.fill(path, 'evenodd')

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.NoColorSpace
  texture.anisotropy = 4
  texture.needsUpdate = true
  return texture
}

function createStars() {
  const count = 2800
  const positions = new Float32Array(count * 3)
  const colors = new Float32Array(count * 3)
  const color = new THREE.Color()
  for (let i = 0; i < count; i += 1) {
    const radius = 26 + Math.random() * 70
    const theta = Math.random() * Math.PI * 2
    const phi = Math.acos(THREE.MathUtils.randFloatSpread(2))
    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta)
    positions[i * 3 + 1] = radius * Math.cos(phi)
    positions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta)

    color.setHSL(0.56 + Math.random() * 0.12, 0.25, 0.72 + Math.random() * 0.24)
    colors[i * 3] = color.r
    colors[i * 3 + 1] = color.g
    colors[i * 3 + 2] = color.b
  }
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))
  const material = new THREE.PointsMaterial({
    size: 0.42,
    sizeAttenuation: true,
    vertexColors: true,
    transparent: true,
    opacity: 0.85,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  })
  const points = new THREE.Points(geometry, material)
  points.frustumCulled = false
  return points
}

function orbitLine(radius, color = 0x6fa8ff, opacity = 0.16) {
  const segments = 128
  const points = []
  for (let i = 0; i <= segments; i += 1) {
    const angle = (i / segments) * Math.PI * 2
    points.push(new THREE.Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius))
  }
  const geometry = new THREE.BufferGeometry().setFromPoints(points)
  const material = new THREE.LineBasicMaterial({
    color,
    transparent: true,
    opacity,
    depthWrite: false,
  })
  return new THREE.Line(geometry, material)
}

/* ------------------------------------------------------------------ */
/* Scene factory                                                       */
/* ------------------------------------------------------------------ */

export function createOrbitScene(container, options = {}) {
  const { labelEl = null, onReady = null, reducedMotion = false } = options

  const prefersReduced =
    reducedMotion ||
    (typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(38, 1, 0.05, 400)
  camera.position.set(0, 0.42, 7.15)
  camera.lookAt(0, 0, 0)

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
  })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
  renderer.outputColorSpace = THREE.SRGBColorSpace
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.02
  renderer.domElement.className = 'oj-canvas'
  renderer.domElement.setAttribute('aria-hidden', 'true')
  container.appendChild(renderer.domElement)

  const maxAnisotropy = renderer.capabilities.getMaxAnisotropy()

  /* --- Lights (they only affect the vehicles and clouds) --- */
  const sunLight = new THREE.DirectionalLight(0xfff4e2, 3.2)
  sunLight.position.copy(SUN_DIR).multiplyScalar(14)
  scene.add(sunLight)

  const rimLight = new THREE.DirectionalLight(0x5f8dff, 0.9)
  rimLight.position.set(-7, -2.5, -5)
  scene.add(rimLight)

  scene.add(new THREE.AmbientLight(0x2c3d63, 1.35))

  /* --- Stars --- */
  const stars = createStars()
  scene.add(stars)

  /* --- Earth group --- */
  const earthGroup = new THREE.Group()
  earthGroup.rotation.y = -0.9
  scene.add(earthGroup)

  const earthUniforms = {
    uDay: { value: null },
    uNight: { value: null },
    uSunDir: { value: SUN_DIR.clone() },
    uAtmosphere: { value: new THREE.Color(0x3f7fd6) },
    uHasDay: { value: 0 },
    uHasNight: { value: 0 },
  }

  const earthMaterial = new THREE.ShaderMaterial({
    uniforms: earthUniforms,
    vertexShader: EARTH_VERTEX,
    fragmentShader: EARTH_FRAGMENT,
  })

  const earth = new THREE.Mesh(
    new THREE.SphereGeometry(EARTH_RADIUS, 96, 64),
    earthMaterial,
  )
  earthGroup.add(earth)

  /* Thin atmospheric shell. */
  const atmosphereMaterial = new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: new THREE.Color(0x63a7ff) },
      uIntensity: { value: 0.85 },
    },
    vertexShader: ATMO_VERTEX,
    fragmentShader: ATMO_FRAGMENT,
    transparent: true,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide,
    depthWrite: false,
  })
  const atmosphere = new THREE.Mesh(
    new THREE.SphereGeometry(EARTH_RADIUS * 1.13, 64, 48),
    atmosphereMaterial,
  )
  earthGroup.add(atmosphere)

  /* Clouds. */
  const cloudsMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.5,
    depthWrite: false,
    roughness: 1,
    metalness: 0,
  })
  const clouds = new THREE.Mesh(
    new THREE.SphereGeometry(EARTH_RADIUS * 1.008, 72, 48),
    cloudsMaterial,
  )
  earthGroup.add(clouds)

  /* --- Peru highlight --- */
  const peruOverlayMaterial = new THREE.MeshBasicMaterial({
    color: 0xffc46b,
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    side: THREE.FrontSide,
  })
  const peruOverlay = new THREE.Mesh(
    new THREE.SphereGeometry(EARTH_RADIUS * 1.0025, 96, 64),
    peruOverlayMaterial,
  )
  earthGroup.add(peruOverlay)

  const beaconTexture = createGlowTexture([255, 196, 110], 128)
  const peruBeacon = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: beaconTexture,
      color: 0xffc46b,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  )
  peruBeacon.position.copy(PERU_DIR).multiplyScalar(EARTH_RADIUS * 1.012)
  peruBeacon.scale.setScalar(0.8)
  earthGroup.add(peruBeacon)

  /* --- NISAR orbit --- */
  const nisarOrbit = new THREE.Group()
  nisarOrbit.rotation.set(0.58, 0, 0.3)
  scene.add(nisarOrbit)

  const nisarRadius = 2.92
  nisarOrbit.add(orbitLine(nisarRadius, 0x8fb7ff, 0.13))

  const nisar = createNisarSatellite()
  nisar.position.set(nisarRadius, 0, 0)
  nisarOrbit.add(nisar)

  /* --- Station orbit --- */
  const stationOrbit = new THREE.Group()
  stationOrbit.rotation.set(-0.3, 0.85, -0.12)
  scene.add(stationOrbit)

  const stationRadius = 3.42
  stationOrbit.add(orbitLine(stationRadius, 0xffc46b, 0.1))

  const station = createSpaceStation()
  station.position.set(stationRadius, 0, 0)
  stationOrbit.add(station)

  /* --- Ship (hidden until launch) --- */
  const ship = createShip()
  ship.visible = false
  scene.add(ship)

  /* --- Post processing --- */
  const useBloom = false
  let composer = null
  let bloomPass = null
  if (useBloom) {
    composer = new EffectComposer(renderer)
    composer.addPass(new RenderPass(scene, camera))
    bloomPass = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.62, 0.72, 0.72)
    composer.addPass(bloomPass)
    composer.addPass(new OutputPass())
  }

  /* --- Texture loading --- */
  let ready = false
  let readySent = false
  const markReady = () => {
    if (readySent) return
    readySent = true
    ready = true
    onReady?.()
  }

  const manager = new THREE.LoadingManager()
  manager.onLoad = markReady
  manager.onError = markReady
  const textureLoader = new THREE.TextureLoader(manager)

  textureLoader.load(
    '/textures/earth_day.jpg',
    (texture) => {
      texture.colorSpace = THREE.SRGBColorSpace
      texture.anisotropy = maxAnisotropy
      earthUniforms.uDay.value = texture
      earthUniforms.uHasDay.value = 1
    },
    undefined,
    () => {},
  )

  textureLoader.load(
    '/textures/earth_night.png',
    (texture) => {
      texture.colorSpace = THREE.SRGBColorSpace
      texture.anisotropy = maxAnisotropy
      earthUniforms.uNight.value = texture
      earthUniforms.uHasNight.value = 1
    },
    undefined,
    () => {},
  )

  textureLoader.load(
    '/textures/earth_clouds.png',
    (texture) => {
      texture.colorSpace = THREE.SRGBColorSpace
      texture.anisotropy = maxAnisotropy
      cloudsMaterial.map = texture
      cloudsMaterial.alphaMap = texture
      cloudsMaterial.needsUpdate = true
    },
    undefined,
    () => {},
  )

  /* Safety net: never leave the PLAY button locked forever. */
  const readyFallback = window.setTimeout(markReady, 5000)

  fetch('/geo/peru.geo.json')
    .then((response) => (response.ok ? response.json() : null))
    .then((geojson) => {
      if (!geojson) return
      const mask = buildPeruMask(geojson)
      mask.anisotropy = maxAnisotropy
      peruOverlayMaterial.map = mask
      peruOverlayMaterial.needsUpdate = true
    })
    .catch(() => {})

  /* --- Intro flight --- */
  let intro = null
  const lookTarget = new THREE.Vector3()
  const peruWorld = new THREE.Vector3()
  const tmpVec = new THREE.Vector3()

  const buildFlightPath = () => {
    const start = station.getWorldPosition(new THREE.Vector3())
    const startDir = start.clone().normalize()
    const endDir = PERU_DIR.clone()

    let axis = new THREE.Vector3().crossVectors(startDir, endDir)
    if (axis.lengthSq() < 1e-6) axis.copy(UP)
    axis.normalize()

    const baseAngle = Math.acos(THREE.MathUtils.clamp(startDir.dot(endDir), -1, 1))
    const total = baseAngle + Math.PI * 1.85
    const startRadius = start.length()
    const endRadius = EARTH_RADIUS * 1.14

    const points = []
    for (let i = 0; i <= 56; i += 1) {
      const t = i / 56
      const dir = startDir.clone().applyAxisAngle(axis, total * t)
      const radius = THREE.MathUtils.lerp(startRadius, endRadius, smoothstep(0.1, 1, t))
      points.push(dir.multiplyScalar(radius))
    }
    return new THREE.CatmullRomCurve3(points)
  }

  const buildCameraPath = () => {
    const side = new THREE.Vector3().crossVectors(PERU_DIR, UP)
    if (side.lengthSq() < 1e-6) side.set(1, 0, 0)
    side.normalize()

    const start = camera.position.clone()
    const a = new THREE.Vector3(2.35, 1.5, 5.7)
    const b = PERU_DIR.clone()
      .multiplyScalar(4.9)
      .addScaledVector(side, 1.35)
      .addScaledVector(UP, 1.0)
    const c = PERU_DIR.clone()
      .multiplyScalar(EARTH_RADIUS * 1.34)
      .addScaledVector(side, 0.16)
      .addScaledVector(UP, 0.1)

    return new THREE.CatmullRomCurve3([start, a, b, c])
  }

  const playIntro = (callbacks = {}) => {
    if (intro) return
    camera.updateMatrixWorld()
    station.updateMatrixWorld(true)
    scene.updateMatrixWorld(true)

    const duration = prefersReduced ? 2200 : 4200
    ship.visible = true
    ship.position.copy(station.getWorldPosition(new THREE.Vector3()))

    intro = {
      start: performance.now(),
      duration,
      path: buildFlightPath(),
      cameraPath: buildCameraPath(),
      onWarp: callbacks.onWarp,
      onFlash: callbacks.onFlash,
      onComplete: callbacks.onComplete,
      warpFired: false,
      flashFired: false,
      done: false,
    }
    if (labelEl) labelEl.style.opacity = '0'
  }

  const updateIntro = (now) => {
    if (!intro || intro.done) return
    const p = clamp01((now - intro.start) / intro.duration)

    /* Ship sweeps around the globe. */
    const shipT = clamp01(p * 1.06)
    const position = intro.path.getPointAt(shipT)
    ship.position.copy(position)
    const ahead = intro.path.getPointAt(clamp01(shipT + 0.012))
    if (ahead.distanceToSquared(position) > 1e-6) ship.lookAt(ahead)
    ship.rotateZ(Math.sin(shipT * Math.PI * 4) * 0.16)
    if (ship.userData.plume) {
      const flicker = 0.8 + Math.sin(now * 0.05) * 0.2
      ship.userData.plume.scale.setScalar(0.26 * flicker)
    }

    /* Camera: arc out, then dive into the Andes. */
    const camT = easeInOutCubic(p)
    camera.position.copy(intro.cameraPath.getPointAt(camT))
    const focus = smoothstep(0.5, 0.98, p)
    lookTarget.set(0, 0, 0).lerp(peruWorld, focus)
    camera.lookAt(lookTarget)
    camera.fov = 38 + 50 * Math.pow(smoothstep(0.45, 1, p), 1.25)
    camera.updateProjectionMatrix()

    if (bloomPass) bloomPass.strength = 0.62 + 1.15 * Math.pow(p, 2)
    if (peruOverlayMaterial) peruOverlayMaterial.opacity = 0.35 + 0.5 * p

    if (!intro.warpFired && p > 0.66) {
      intro.warpFired = true
      intro.onWarp?.()
    }
    if (!intro.flashFired && p > 0.88) {
      intro.flashFired = true
      intro.onFlash?.()
    }
    if (p >= 1) {
      intro.done = true
      intro.onComplete?.()
    }
  }

  /* --- Resize --- */
  const resize = () => {
    const width = container.clientWidth || 1
    const height = container.clientHeight || 1
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    renderer.setSize(width, height, false)
    camera.aspect = width / height
    camera.updateProjectionMatrix()
    if (composer) {
      composer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
      composer.setSize(width, height)
    }
  }
  const resizeObserver = new ResizeObserver(resize)
  resizeObserver.observe(container)
  resize()

  /* --- Animation loop --- */
  let rafId = 0
  let paused = false
  let last = performance.now()
  let elapsed = 0
  let nisarAngle = 0.6
  let stationAngle = 2.4

  const projectPeru = () => {
    if (!labelEl) return
    peruWorld.copy(PERU_DIR).multiplyScalar(EARTH_RADIUS)
    peruWorld.applyMatrix4(earthGroup.matrixWorld)
    tmpVec.copy(peruWorld).project(camera)
    const x = (tmpVec.x * 0.5 + 0.5) * container.clientWidth
    const y = (-tmpVec.y * 0.5 + 0.5) * container.clientHeight
    const normal = peruWorld.clone().normalize()
    const toCamera = camera.position.clone().sub(peruWorld).normalize()
    const facing = normal.dot(toCamera)
    const visible = facing > 0.15 && tmpVec.z < 1 && !intro
    labelEl.style.transform = `translate(-50%, -50%) translate3d(${x.toFixed(1)}px, ${(y - 30).toFixed(1)}px, 0)`
    labelEl.style.opacity = visible ? '1' : '0'
  }

  const renderFrame = (now) => {
    rafId = window.requestAnimationFrame(renderFrame)
    if (paused) return

    const delta = Math.min(0.05, (now - last) / 1000)
    last = now
    elapsed += delta

    const spin = prefersReduced ? 0.012 : 0.035
    earthGroup.rotation.y += delta * spin
    clouds.rotation.y += delta * 0.008

    nisarAngle += delta * 0.19
    nisar.position.set(Math.cos(nisarAngle) * nisarRadius, 0, Math.sin(nisarAngle) * nisarRadius)
    nisar.rotation.y += delta * 0.35
    nisar.rotation.x = Math.sin(elapsed * 0.5) * 0.08

    stationAngle += delta * 0.12
    station.position.set(
      Math.cos(stationAngle) * stationRadius,
      0,
      Math.sin(stationAngle) * stationRadius,
    )
    station.rotation.y -= delta * 0.25

    /* Peru pulse. */
    const pulse = 0.5 + 0.5 * Math.sin(elapsed * (prefersReduced ? 0.9 : 2.1))
    peruBeacon.scale.setScalar(0.72 + pulse * 0.3)
    peruBeacon.material.opacity = 0.6 + pulse * 0.35
    if (!intro) peruOverlayMaterial.opacity = 0.34 + pulse * 0.3

    stars.rotation.y += delta * 0.004

    earthGroup.updateMatrixWorld(true)
    projectPeru()

    if (intro) updateIntro(now)

    if (composer) composer.render()
    else renderer.render(scene, camera)
  }

  last = performance.now()
  rafId = window.requestAnimationFrame(renderFrame)

  /* --- Public API --- */
  return {
    get isReady() {
      return ready
    },
    playIntro,
    setPaused(value) {
      paused = value
      if (!value) last = performance.now()
    },
    dispose() {
      window.cancelAnimationFrame(rafId)
      window.clearTimeout(readyFallback)
      resizeObserver.disconnect()
      if (composer) {
        composer.dispose()
      }
      scene.traverse((object) => {
        if (object.geometry) object.geometry.dispose()
      })
      disposeObject(scene)
      renderer.dispose()
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement)
      }
      scene.clear()
    },
  }
}
