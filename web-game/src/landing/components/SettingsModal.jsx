import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'
import audio from '../audio/audioEngine.js'

function Toggle({ id, label, checked, onChange }) {
  return (
    <div className="oj-modal-row">
      <span className="oj-modal-label" id={`${id}-label`}>
        {label}
      </span>
      <button
        type="button"
        id={id}
        className="oj-switch"
        role="switch"
        aria-checked={checked}
        aria-labelledby={`${id}-label`}
        onClick={() => {
          audio.sfx(checked ? 'back' : 'click')
          onChange(!checked)
        }}
      />
    </div>
  )
}

export default function SettingsModal({
  t,
  musicOn,
  sfxOn,
  onToggleMusic,
  onToggleSfx,
  onExit,
  onClose,
}) {
  const closeRef = useRef(null)

  useEffect(() => {
    closeRef.current?.focus()
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  return (
    <div
      className="oj-modal-layer"
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div
        className="oj-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="oj-settings-title"
      >
        <button
          ref={closeRef}
          type="button"
          className="oj-modal-close"
          onClick={() => {
            audio.sfx('back')
            onClose()
          }}
          aria-label={t.close}
          title={t.close}
        >
          <X size={16} strokeWidth={1.8} aria-hidden="true" />
        </button>

        <h2 className="oj-modal-title" id="oj-settings-title">
          {t.settings}
        </h2>
        <p className="oj-modal-sub">{t.settingsHint}</p>

        <div className="oj-modal-list">
          <Toggle
            id="oj-music"
            label={t.music}
            checked={musicOn}
            onChange={onToggleMusic}
          />
          <Toggle
            id="oj-sfx"
            label={t.soundEffects}
            checked={sfxOn}
            onChange={onToggleSfx}
          />
        </div>

        <button
          type="button"
          className="oj-modal-exit"
          onClick={() => {
            audio.sfx('back')
            onExit()
          }}
        >
          {t.exitGame}
        </button>
      </div>
    </div>
  )
}
