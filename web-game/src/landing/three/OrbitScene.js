import * as THREE from 'three'
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

  /* No post-processing: keeping the canvas alpha clean lets the CSS nebula
     show through, which matters more than a screen-space bloom halo. */

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

  /** World-space point on the surface right above Peru (follows earth spin). */
  const peruWorldPoint = (target = new THREE.Vector3()) => {
    earthGroup.updateMatrixWorld(true)
    return target
      .copy(PERU_DIR)
      .multiplyScalar(EARTH_RADIUS * 1.004)
      .applyMatrix4(earthGroup.matrixWorld)
  }

  const buildFlightPath = () => {
    const start = station.getWorldPosition(new THREE.Vector3())
    const end = peruWorldPoint(new THREE.Vector3())
    /* A single straight line — no loops, arcs or detours. */
    return new THREE.LineCurve3(start, end)
  }

  const buildCameraPlan = () => {
    const focus = peruWorldPoint(new THREE.Vector3())
    const focusDir = focus.clone().normalize()
    const side = new THREE.Vector3().crossVectors(focusDir, UP)
    if (side.lengthSq() < 1e-6) side.set(1, 0, 0)
    side.normalize()

    return {
      from: camera.position.clone(),
      /* Wide shot: the ship has just reached the planet. */
      wide: focusDir
        .clone()
        .multiplyScalar(EARTH_RADIUS * 5.1)
        .addScaledVector(side, 0.55)
        .addScaledVector(UP, 0.3),
      /* Satellite close-up, dead ahead over the Andes. */
      close: focusDir.clone().multiplyScalar(EARTH_RADIUS * 2.25),
      /* Sunrise for the arrival: bias the key light toward the camera so Peru
         is lit instead of sitting on the terminator. */
      sun: focusDir.clone().multiplyScalar(0.5).addScaledVector(SUN_DIR, 0.8).normalize(),
      focus,
    }
  }

  const playIntro = (callbacks = {}) => {
    if (intro) return
    camera.updateMatrixWorld()
    station.updateMatrixWorld(true)
    scene.updateMatrixWorld(true)

    const duration = prefersReduced ? 2600 : 5200
    ship.visible = true
    ship.scale.setScalar(1)
    ship.position.copy(station.getWorldPosition(new THREE.Vector3()))

    intro = {
      start: performance.now(),
      duration,
      path: buildFlightPath(),
      plan: buildCameraPlan(),
      onClouds: callbacks.onClouds,
      onFlash: callbacks.onFlash,
      onComplete: callbacks.onComplete,
      cloudsFired: false,
      flashFired: false,
      done: false,
    }
    if (labelEl) labelEl.style.opacity = '0'
  }

  const endIntro = () => {
    intro = null
    ship.visible = false
    ship.position.set(0, 0, 0)
    ship.rotation.set(0, 0, 0)
    camera.position.set(0, 0.42, 7.15)
    camera.fov = 38
    camera.updateProjectionMatrix()
    camera.lookAt(0, 0, 0)
    if (peruOverlayMaterial) peruOverlayMaterial.opacity = 0
    earthUniforms.uSunDir.value.copy(SUN_DIR)
    if (labelEl) labelEl.style.opacity = '1'
  }

  const updateIntro = (now) => {
    if (!intro || intro.done) return
    const p = clamp01((now - intro.start) / intro.duration)

    /* 1. The ship flies straight from the station to Peru. */
    const shipT = clamp01(p / 0.5)
    const position = intro.path.getPointAt(shipT)
    ship.position.copy(position)
    const ahead = intro.path.getPointAt(clamp01(shipT + 0.008))
    if (ahead.distanceToSquared(position) > 1e-8) ship.lookAt(ahead)
    if (ship.userData.plume) {
      const flicker = 0.85 + Math.sin(now * 0.05) * 0.15
      ship.userData.plume.scale.setScalar(0.34 * flicker)
    }
    ship.visible = p < 0.54

    /* 2. Camera: settle above the planet, then dolly straight in. */
    const { from, wide, close, focus } = intro.plan
    if (p < 0.5) {
      camera.position.lerpVectors(from, wide, easeInOutCubic(p / 0.5))
    } else {
      camera.position.lerpVectors(wide, close, easeInOutCubic((p - 0.5) / 0.5))
    }
    lookTarget.set(0, 0, 0).lerp(focus, smoothstep(0.28, 0.62, p))
    camera.lookAt(lookTarget)
    camera.fov = 38 - 8 * smoothstep(0.45, 1, p)
    camera.updateProjectionMatrix()

    /* Peru glows brighter, the beacon melts away as we arrive. */
    if (peruOverlayMaterial) peruOverlayMaterial.opacity = 0.12 + 0.2 * p
    peruBeacon.material.opacity *= 1 - smoothstep(0.5, 0.82, p)

    /* Dawn over the Andes: the terminator slides off Peru as we close in. */
    earthUniforms.uSunDir.value
      .copy(SUN_DIR)
      .lerp(intro.plan.sun, smoothstep(0.35, 0.92, p))
      .normalize()

    if (!intro.cloudsFired && p > 0.6) {
      intro.cloudsFired = true
      intro.onClouds?.()
    }
    if (!intro.flashFired && p > 0.9) {
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

    /* Nearly freeze the globe during the intro so Peru stays framed. */
    const spin = (prefersReduced ? 0.012 : 0.035) * (intro ? 0.22 : 1)
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

    renderer.render(scene, camera)
  }

  last = performance.now()
  rafId = window.requestAnimationFrame(renderFrame)

  /* --- Public API --- */
  return {
    get isReady() {
      return ready
    },
    playIntro,
    resetIntro: endIntro,
    setPaused(value) {
      paused = value
      if (!value) last = performance.now()
    },
    dispose() {
      window.cancelAnimationFrame(rafId)
      window.clearTimeout(readyFallback)
      resizeObserver.disconnect()
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
