import { Volume1, Volume2, VolumeX } from 'lucide-react'
import audio from '../audio/audioEngine.js'

export default function AudioControl({ volume, muted, onVolumeChange, onToggleMute, t }) {
  const level = muted ? 0 : volume
  const Icon = muted || volume === 0 ? VolumeX : volume < 0.45 ? Volume1 : Volume2

  return (
    <div className={`oj-audio${muted ? ' is-muted' : ''}`}>
      <button
        type="button"
        className="oj-icon-btn"
        onClick={() => {
          audio.sfx('click')
          onToggleMute()
        }}
        aria-label={muted ? t.unmute : t.mute}
        title={muted ? t.unmute : t.mute}
      >
        <Icon size={17} strokeWidth={1.7} aria-hidden="true" />
      </button>
      <input
        className="oj-range"
        type="range"
        min="0"
        max="1"
        step="0.01"
        value={muted ? 0 : volume}
        onChange={(event) => onVolumeChange(Number(event.target.value))}
        aria-label={t.volume}
        style={{ '--level': `${Math.round(level * 100)}%` }}
      />
    </div>
  )
}
