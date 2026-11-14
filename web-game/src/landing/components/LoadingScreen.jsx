import { useEffect, useRef, useState } from 'react'
import AndeanCat from './AndeanCat.jsx'
import ProgressRockets from './ProgressRockets.jsx'

export default function LoadingScreen({ t, onComplete }) {
  const [progress, setProgress] = useState(0)
  const completedRef = useRef(false)
  const onCompleteRef = useRef(onComplete)
  onCompleteRef.current = onComplete

  useEffect(() => {
    let frame = 0
    const started = performance.now()
    const duration = 6800

    const tick = () => {
      const raw = Math.min(1, (performance.now() - started) / duration)
      /* Ease-out so the last rockets line up with the percentage. */
      const eased = 1 - Math.pow(1 - raw, 2.2)
      setProgress(eased * 100)

      if (raw < 1) {
        frame = requestAnimationFrame(tick)
      } else if (!completedRef.current) {
        completedRef.current = true
        onCompleteRef.current?.()
      }
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [])

  const rounded = Math.round(progress)
  const ready = rounded >= 100

  return (
    <div className="oj-loading" role="status" aria-live="polite">
      <div className="oj-loading-stars" aria-hidden="true" />
      <div className="oj-loading-glow" aria-hidden="true" />
      <div className="oj-loading-scan" aria-hidden="true" />

      <div className="oj-loading-inner">
        <p className="oj-loading-kicker">{t.loadingKicker}</p>

        <h2 className="oj-loading-title">
          {ready ? t.ready : t.loadingTitle}
          {!ready && (
            <span className="oj-dots" aria-hidden="true">
              <i>.</i>
              <i>.</i>
              <i>.</i>
            </span>
          )}
          {ready && <span className="oj-loading-check" aria-hidden="true">✓</span>}
        </h2>

        <p className="oj-loading-sub">{ready ? t.readyHint : t.loadingHint}</p>

        <div className="oj-cat-stage">
          <div className="oj-cat-orbit" aria-hidden="true" />
          <AndeanCat />
        </div>

        <ProgressRockets progress={progress} />

        <div className="oj-progress-meta">
          <span className="oj-progress-pct">{rounded}%</span>
          <span className="oj-progress-label">{t.loadingHint}</span>
        </div>
      </div>
    </div>
  )
}
