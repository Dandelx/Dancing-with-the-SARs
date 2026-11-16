import { useEffect, useState } from 'react'
import { TRIVIAS } from './triviasData.js'
import { TRIVIAS_EN } from './englishData.js'
import neutral from '../../images/QIPU/qipu2-transparent.png'
import feliz from '../../images/QIPU/qipu1-transparent.png'
import pensando from '../../images/QIPU/qipu5-transparent.png'
import check from '../../images/funds/2dba7415-c9f7-4ce4-9940-ba6d321e9f73.png'
import cruz from '../../images/funds/42bc5d29-49fa-41bb-95ac-7893ac181f65.png'
import './trivia.css'

function Typewriter({ texto, en }) {
  const [visible, setVisible] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches ? texto.length : 0)
  useEffect(() => {
    if (visible >= texto.length) return
    const timer = window.setTimeout(() => setVisible(n => n + 1), 18)
    return () => window.clearTimeout(timer)
  }, [visible, texto])
  return <>
    <p aria-hidden="true">{texto.slice(0, visible)}<span className="trivia-caret" aria-hidden="true">|</span></p>
    <span className="trivia-sr-only" aria-live="polite">{texto}</span>
    {visible < texto.length && <button type="button" className="trivia-skip" onClick={() => setVisible(texto.length)}>{en ? 'Show full text' : 'Mostrar texto completo'}</button>}
  </>
}

export default function TriviaQuipu({ regionId, lang, onFinalizar }) {
  const en = lang === 'en'
  const preguntas = (en ? TRIVIAS_EN : TRIVIAS)[regionId]
  const [indice, setIndice] = useState(0)
  const [intentos, setIntentos] = useState([])
  const [acertada, setAcertada] = useState(false)
  const pregunta = preguntas[indice]
  const texto = acertada ? pregunta.explicacion : pregunta.pregunta



  const responder = (i) => {
    if (acertada || intentos.includes(i)) return
    if (i === pregunta.correcta) setAcertada(true)
    else setIntentos(prev => [...prev, i])
  }
  const continuar = () => {
    if (indice + 1 === preguntas.length) { onFinalizar(); return }
    setIndice(i => i + 1)
    setIntentos([])
    setAcertada(false)
  }

  return (
    <section className="quipu-trivia" aria-labelledby="trivia-title">
      <div className="trivia-heading"><h3 id="trivia-title">{en ? 'QIPU’s trivia' : 'La trivia de QIPU'}</h3><span>{en ? 'Question' : 'Pregunta'} {indice + 1} {en ? 'of' : 'de'} {preguntas.length}</span></div>
      <div className="trivia-dialogue">
        <img className="trivia-portrait" src={acertada ? feliz : intentos.length ? pensando : neutral} alt={acertada ? (en ? 'QIPU celebrates the correct answer' : 'QIPU celebra la respuesta correcta') : 'QIPU'} />
        <div className="trivia-speech">
          <strong>QIPU</strong>
          <Typewriter key={`${indice}-${acertada}-${lang}`} texto={texto} en={en} />
        </div>
      </div>
      <p className="trivia-instruction">{acertada ? (en ? 'Correct!' : '¡Respuesta correcta!') : intentos.length ? (en ? 'Almost! Try another answer.' : 'Casi. Prueba otra respuesta.') : (en ? 'Choose an answer:' : 'Elige una respuesta:')}</p>
      <div className="trivia-choices" role="group" aria-label={`${en ? 'Answers for' : 'Opciones para'}: ${pregunta.pregunta}`}>
        {pregunta.opciones.map((opcion, i) => {
          const incorrecta = intentos.includes(i)
          const correcta = acertada && i === pregunta.correcta
          return <button type="button" key={opcion} className={`trivia-choice${correcta ? ' is-correct' : ''}${incorrecta ? ' is-wrong' : ''}`} disabled={acertada || incorrecta} onClick={() => responder(i)}><span className="trivia-letter">{String.fromCharCode(65 + i)}</span><span>{opcion}</span>{(correcta || incorrecta) && <img src={correcta ? check : cruz} alt={correcta ? (en ? 'Correct' : 'Correcta') : (en ? 'Incorrect' : 'Incorrecta')} />}</button>
        })}
      </div>
      {acertada && <button type="button" className="trivia-next" onClick={continuar}>{indice + 1 === preguntas.length ? (en ? 'View NASA / ASF evidence' : 'Ver evidencia NASA / ASF') : (en ? 'Next question' : 'Siguiente pregunta')} <span aria-hidden="true">→</span></button>}
      <p className="trivia-source">{en ? 'Based on' : 'Basado en'} <a href="https://www.earthdata.nasa.gov/learn/earth-observation-data-basics/sar" target="_blank" rel="noreferrer">{en ? 'NASA Earthdata: SAR basics' : 'NASA Earthdata: fundamentos de SAR'}</a>.</p>
    </section>
  )
}
