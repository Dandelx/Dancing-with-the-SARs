import { Settings } from 'lucide-react'
import audio from '../audio/audioEngine.js'
import useHoverSfx from '../hooks/useHoverSfx.js'

export default function SettingsButton({ onClick, label }) {
  const hover = useHoverSfx()

  return (
    <button
      type="button"
      className="oj-settings-btn"
      onClick={() => {
        audio.sfx('click')
        onClick()
      }}
      onPointerEnter={hover}
      aria-label={label}
      title={label}
      aria-haspopup="dialog"
    >
      <Settings size={16} strokeWidth={1.7} aria-hidden="true" />
      <span className="oj-settings-label">{label}</span>
    </button>
  )
}
