import { useRef } from 'react'
import audio from '../audio/audioEngine.js'

/**
 * Throttled hover blip so sweeping the pointer across controls does not turn
 * into a machine-gun of SFX.
 */
export function useHoverSfx() {
  const last = useRef(0)
  return () => {
    const now = Date.now()
    if (now - last.current < 350) return
    last.current = now
    audio.sfx('hover')
  }
}

export default useHoverSfx
