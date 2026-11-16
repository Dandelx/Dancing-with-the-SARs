import { useEffect, useState } from 'react'
import h1 from '../../images/funds/h1.jpeg'
import h2 from '../../images/funds/h2.jpeg'
import h3 from '../../images/funds/h3.jpeg'
import h4 from '../../images/funds/h4.jpeg'
import h5 from '../../images/funds/h5.jpeg'
import h6 from '../../images/funds/h6.jpeg'
import audio from '../landing/audio/audioEngine.js'
import './narrative.css'

const SCENES = [
  {
    image: h1,
    es: 'Tras la misteriosa extinción de la raza humana y gran parte de la fauna terrestre, ocurrió un cambio extraordinario en el planeta: los felinos evolucionaron de forma acelerada.',
    en: "Following the mysterious extinction of the human race and much of Earth's fauna, an extraordinary change occurred on the planet: felines evolved at an accelerated rate."
  },
  {
    image: h2,
    es: 'Al heredar y preservar los vastos conocimientos que los humanos dejaron atrás, se convirtieron en una especie altamente consciente y tecnológicamente avanzada, capaz de desafiar la gravedad y alcanzar las estrellas.',
    en: 'By inheriting and preserving the vast knowledge left behind by humans, they became a highly conscious and technologically advanced species, capable of defying gravity and reaching the stars.'
  },
  {
    image: h3,
    es: 'Impulsados por una insaciable curiosidad científica y el deseo de expandir sus horizontes, los felinos decidieron explorar el cosmos. Abandonaron la Tierra, convertida en un santuario orbital, dejando a su alrededor una red de antiguos satélites durmientes,',
    en: 'Driven by an insatiable scientific curiosity and the desire to expand their horizons, the felines decided to explore the cosmos. They left Earth behind as an orbital sanctuary, leaving a network of ancient dormant satellites orbiting around it,'
  },
  {
    image: h4,
    es: 'y fundaron una nueva y próspera civilización estelar en Próxima Centauri b, el exoplaneta rocoso más cercano al Sistema Solar, ubicado a tan solo 4,2 años luz de su hogar original.',
    en: 'and founded a new, thriving stellar civilization on Proxima Centauri b, the closest rocky exoplanet to the Solar System, located just 4.2 light-years away from their original home.'
  },
  {
    image: h5,
    es: 'Años más tarde, tras una exitosa misión de reconocimiento vecinal en los confines de su nuevo sistema, Quipu, un destacado geólogo planetario de la MIAUSA, es ascendido a capitán de la avanzada nave exploradora Taruca Explorer.',
    en: 'Years later, after a successful neighboring reconnaissance mission in the outer reaches of their new system, Quipu, a prominent planetary geologist from MIAUSA, is promoted to captain of the advanced exploration vessel Taruca Explorer.'
  },
  {
    image: h6,
    es: 'Debido a sus credenciales y experiencia, se le encomienda una misión de vital importancia: regresar a su olvidado planeta natal, la Tierra, para descifrar y registrar los complejos datos geológicos obtenidos por el satélite que dejaron vigilando la superficie, el poderoso NISAR (NASA-ISRO SAR).',
    en: 'Due to his credentials and experience, he is entrusted with a mission of vital importance: to return to his forgotten home planet, Earth, to decipher and record the complex geological data gathered by the satellite they left watching over the surface, the mighty NISAR (NASA-ISRO SAR).'
  },
  {
    image: null,
    es: 'Sin embargo, al descender a la Tierra, Quipu se embarcará en una aventura inesperada. Descubrirá que los seres humanos han vuelto a existir, pero lamentablemente están cometiendo los mismos errores del pasado, provocando nuevamente la degradación y el colapso de su entorno. Ahora, utilizando la tecnología de radar del NISAR, Quipu deberá realizar un reconocimiento histórico de los cambios terrestres para entender el pasado, guiar el presente y evitar una nueva catástrofe planetaria.',
    en: "However, upon descending to Earth, Quipu will embark on an unexpected adventure. He will discover that humans have come back into existence, yet they are unfortunately repeating the same mistakes of the past, once again causing the degradation and collapse of their environment. Now, using NISAR's radar technology, Quipu must conduct a historical reconnaissance of terrestrial changes to understand the past, guide the present, and prevent a new planetary catastrophe."
  }
]

export default function NarrativeIntro({ lang, onComplete }) {
  const [index, setIndex] = useState(0)
  const [visible, setVisible] = useState(0)
  const scene = SCENES[index]
  const text = scene[lang] || scene.en
  const characters = Array.from(text)
  const finished = visible >= characters.length

  useEffect(() => {
    audio.setMusicScene('space')
    return () => audio.setMusicScene('default')
  }, [])

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const start = performance.now()
    const length = Array.from(text).length
    let frame
    const tick = (now) => {
      const count = reducedMotion ? length : Math.min(length, Math.floor((now - start) / 18))
      setVisible(count)
      if (count < length) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [text])

  const advance = () => {
    if (!finished) return
    audio.sfx('click')
    if (index === SCENES.length - 1) {
      onComplete()
      return
    }
    setVisible(0)
    setIndex((current) => current + 1)
  }

  return (
    <main className="story-screen" aria-label={lang === 'es' ? 'Introducción narrativa' : 'Narrative introduction'}>
      <div className="story-stars" aria-hidden="true" />
      <div className="story-stage" aria-hidden="true">
        {scene.image && <img key={scene.image} className="story-image" src={scene.image} alt="" />}
      </div>
      <section className="story-dialogue" aria-label={lang === 'es' ? 'Narración' : 'Narration'}>
        <div className="story-dialogue-top">
          <span>Orbit Jump</span>
          <span className="story-progress" aria-label={lang === 'es' ? `Escena ${index + 1} de ${SCENES.length}` : `Scene ${index + 1} of ${SCENES.length}`}>
            {String(index + 1).padStart(2, '0')} / {String(SCENES.length).padStart(2, '0')}
          </span>
        </div>
        <div className="story-copy" key={index}>
          <p aria-hidden="true">{characters.slice(0, visible).join('')}<span className="story-caret" data-finished={finished} aria-hidden="true" /></p>
          <span className="story-sr-only" aria-live="polite">{text}</span>
        </div>
        <div className="story-actions">
          {finished && <button className="story-next" type="button" onClick={advance}>{lang === 'es' ? 'Siguiente' : 'Next'} <span aria-hidden="true">→</span></button>}
        </div>
      </section>
    </main>
  )
}
