import { useState } from 'react'
import { BookOpen, Compass, Footprints, Hand, Radar, Satellite } from 'lucide-react'
import quipuHello from '../../images/QIPU/qipu1-transparent.png'
import quipuGuide from '../../images/QIPU/qipu2-transparent.png'
import './quipuWelcome.css'

const STEPS = [
  {
    icon: Hand, keys: [],
    es: '¡Hola! Soy QIPU. Bienvenido a la expedición. Juntos exploraremos la Tierra y aprenderemos a interpretar las observaciones de NISAR.',
    en: 'Hello! I’m QIPU. Welcome to the expedition. Together we’ll explore Earth and learn how to interpret NISAR observations.'
  },
  {
    icon: Footprints, keys: ['W A S D', '↑ ↓ ← →', 'J', 'H'],
    es: 'Muéveme con WASD o las flechas. También puedes usar los botones de dirección. Pulsa J para saltar obstáculos bajos y H para saludar.',
    en: 'Move me with WASD or the arrow keys. You can also use the direction buttons. Press J to jump over low obstacles and H to wave.'
  },
  {
    icon: Radar, keys: ['E'],
    es: 'Pulsa E o «Investigar» para activar mi exploración radar. Verás un pulso a mi alrededor; la primera exploración revela dos marcas doradas de campo. Acércate a cada marca y pulsa E para recoger sus pistas.',
    en: 'Press E or “Investigate” to start my radar exploration. You’ll see a pulse around me; the first scan reveals two gold field markers. Move close to each marker and press E to collect its clue.'
  },
  {
    icon: BookOpen, keys: ['P', 'C'],
    es: 'Pulsa P para abrir los apuntes de campo. Cuando tengas las dos pistas, resuelve la actividad y responde mi trivia. Al completar el caso, pulsa C para consultar su conclusión.',
    en: 'Press P to open your field notes. Once you have both clues, solve the activity and answer my trivia. After completing the case, press C to read its conclusion.'
  },
  {
    icon: Compass, keys: ['M', 'E', 'Esc'],
    es: 'Pulsa M para abrir la carta, elige una región y marca el rumbo. El minimapa y las flechas te orientarán. Cruza una entrada azul para entrar a un refugio y usa E para investigar allí. Esc cierra la carta o los apuntes.',
    en: 'Press M to open the world map, choose a region and set your destination. The minimap and arrows will guide you. Cross a blue entrance to enter a shelter and press E to investigate inside. Esc closes the map or field notes.'
  },
  {
    icon: Satellite, keys: ['N'],
    es: 'Después de la primera exploración, pulsa N para abrir o cerrar los datos NASA/ASF. Arriba puedes cambiar el idioma, ajustar el audio o volver a la órbita 3D. Si me necesitas de nuevo, abre la guía de controles y elige «Ver bienvenida».',
    en: 'After the first scan, press N to open or close NASA/ASF data. At the top you can change the language, adjust audio or return to 3D orbit. To see this guide again, open Expedition controls and choose “Show welcome”.'
  }
]

export default function QuipuWelcome({ lang, onFinish }) {
  const [step, setStep] = useState(0)
  const en = lang === 'en'
  const current = STEPS[step]
  const Icon = current.icon

  return (
    <div className="quipu-welcome">
      <div className="welcome-top">
        <span className="welcome-name">QUIPU</span>
        <span className="welcome-progress">{en ? 'Guide' : 'Guía'} {step + 1} / {STEPS.length}</span>
      </div>
      <div className="welcome-dialogue">
        <img className="welcome-portrait" src={step === 0 || step === STEPS.length - 1 ? quipuHello : quipuGuide} alt="" />
        <div className="welcome-bubble">
          <div className="welcome-topic" aria-hidden="true"><Icon size={17} /></div>
          <p aria-live="polite">{en ? current.en : current.es}</p>
          {current.keys.length > 0 && <div className="welcome-keys" aria-label={en ? 'Controls' : 'Controles'}>
            {current.keys.map((key) => <kbd key={key}>{key}</kbd>)}
          </div>}
        </div>
      </div>
      <div className="welcome-actions">
        <button type="button" className="welcome-skip" onClick={onFinish}>{en ? 'Skip guide' : 'Omitir guía'}</button>
        <div className="welcome-actions-main">
          {step > 0 && <button type="button" className="welcome-back" onClick={() => setStep(value => value - 1)}>{en ? 'Back' : 'Atrás'}</button>}
          <button type="button" className="welcome-next" onClick={() => step === STEPS.length - 1 ? onFinish() : setStep(value => value + 1)}>
            {step === STEPS.length - 1 ? (en ? 'Start exploring' : 'Comenzar a explorar') : (en ? 'Next' : 'Siguiente')}
            <span aria-hidden="true"> →</span>
          </button>
        </div>
      </div>
    </div>
  )
}
