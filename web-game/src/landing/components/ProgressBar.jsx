/**
 * Loading bar with a single ship riding the fill. Both the golden fill and the
 * ship are driven by the same CSS variable (--p), so they can never drift.
 */
export default function ProgressBar({ progress }) {
  const p = Math.min(1, Math.max(0, progress / 100))

  return (
    <div
      className="oj-progress"
      style={{ '--p': p }}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progress)}
    >
      <div className="oj-progress-track">
        <div className="oj-progress-fill" />
      </div>

      <div className="oj-progress-ship" aria-hidden="true">
        <svg viewBox="0 0 24 24" className="oj-bar-ship-svg">
          <path
            d="M12 1.4c2.5 2.2 3.9 5.1 3.9 8.2v5.6H8.1V9.6c0-3.1 1.4-6 3.9-8.2Z"
            fill="currentColor"
          />
          <path d="M8.1 12.4 5 16.2l3.1.6Zm7.8 0 3.1 3.8-3.1.6Z" fill="currentColor" opacity="0.82" />
          <circle cx="12" cy="7.4" r="1.55" fill="#0a0d18" opacity="0.9" />
          <path
            className="oj-bar-ship-flame"
            d="M9.5 15.4c0 2.3 1 4 2.5 5.2 1.5-1.2 2.5-2.9 2.5-5.2Z"
            fill="currentColor"
          />
        </svg>
      </div>
    </div>
  )
}
