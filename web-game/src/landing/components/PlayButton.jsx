import audio from '../audio/audioEngine.js'
import { useHoverSfx } from './TopBar.jsx'

export default function PlayButton({ onClick, disabled, label, hint, ready }) {
  const hover = useHoverSfx()

  return (
    <div className="oj-cta">
      <button
        type="button"
        className="oj-play"
        onClick={onClick}
        disabled={disabled}
        onPointerEnter={hover}
        aria-label={label}
      >
        <span className="oj-play-halo" aria-hidden="true" />
        <span className="oj-play-glyph" aria-hidden="true">
          <svg viewBox="0 0 24 24">
            <path d="M9 6.2 19 12 9 17.8Z" fill="currentColor" />
          </svg>
        </span>
        <span className="oj-play-label">{label}</span>
      </button>

      <p className="oj-hint" data-ready={ready ? 'true' : 'false'}>
        <span className="oj-hint-dot" aria-hidden="true" />
        {hint}
      </p>
    </div>
  )
}
