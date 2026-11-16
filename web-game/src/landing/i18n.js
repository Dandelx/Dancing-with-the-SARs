/**
 * UI copy for Orbit Jump.
 * Only two locales are required by the brief: English and Español.
 */
export const LOCALES = {
  en: { id: 'en', label: 'English', short: 'EN' },
  es: { id: 'es', label: 'Español', short: 'ES' },
}

const STRINGS = {
  en: {
    eyebrow: 'NASA Space Apps Challenge · Dancing with the SARs',
    tagline:
      'Ride NISAR across the Andes and leap from orbit into the heart of Peru.',
    play: 'PLAY',
    hint: 'Press Enter or click PLAY',
    preparing: 'Calibrating orbit…',
    peruLabel: 'Peru · NISAR target',
    language: 'Language',
    volume: 'Volume',
    mute: 'Mute audio',
    unmute: 'Unmute audio',
    audioHint: 'Click anywhere to enable sound',
    audioOn: 'Ambient audio on',
    loadingKicker: 'Orbit Jump',
    loadingTitle: 'Loading game',
    loadingHint: 'Deploying NISAR data over the Andes',
    ready: 'Ready for launch',
    readyHint: 'The adventure starts here.',
    progressTag: 'NISAR · L-band SAR',
    settings: 'Settings',
    settingsHint: 'Audio and game options',
    music: 'Music',
    soundEffects: 'Sound Effects',
    exitGame: 'Exit Game',
    close: 'Close',
    footer: 'Open assets · NASA Blue Marble · Natural Earth',
  },
  es: {
    eyebrow: 'NASA Space Apps Challenge · Dancing with the SARs',
    tagline:
      'Acompaña al NISAR sobre los Andes y salta desde la órbita al corazón del Perú.',
    play: 'JUGAR',
    hint: 'Pulsa Enter o haz clic en JUGAR',
    preparing: 'Calibrando órbita…',
    peruLabel: 'Perú · objetivo NISAR',
    language: 'Idioma',
    volume: 'Volumen',
    mute: 'Silenciar audio',
    unmute: 'Activar audio',
    audioHint: 'Haz clic en cualquier parte para activar el sonido',
    audioOn: 'Audio ambiental activo',
    loadingKicker: 'Orbit Jump',
    loadingTitle: 'Cargando juego',
    loadingHint: 'Desplegando datos NISAR sobre los Andes',
    ready: 'Listo para el salto',
    readyHint: 'La aventura empieza aquí.',
    progressTag: 'NISAR · radar de banda L',
    settings: 'Ajustes',
    settingsHint: 'Opciones de audio y juego',
    music: 'Música',
    soundEffects: 'Efectos de sonido',
    exitGame: 'Salir del juego',
    close: 'Cerrar',
    footer: 'Recursos abiertos · NASA Blue Marble · Natural Earth',
  },
}

export function getStrings(lang) {
  return STRINGS[lang] ?? STRINGS.en
}

export function detectLanguage() {
  try {
    const stored = window.localStorage.getItem('orbitjump.lang')
    if (stored && STRINGS[stored]) return stored
  } catch {
    /* storage may be blocked */
  }
  const nav = typeof navigator !== 'undefined' ? navigator.language : 'en'
  return nav?.toLowerCase().startsWith('es') ? 'es' : 'en'
}
