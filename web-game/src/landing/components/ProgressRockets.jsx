const ROCKET_COUNT = 12

function RocketGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="oj-rocket-svg" aria-hidden="true">
      <path
        d="M12 2.2c2.9 2.4 4.5 5.7 4.5 9.2L12 14.2 7.5 11.4c0-3.5 1.6-6.8 4.5-9.2Z"
        fill="currentColor"
      />
      <path d="M7.5 11.4 4.9 13.9l3.1.7Zm9 0 2.6 2.5-3.1.7Z" fill="currentColor" opacity="0.75" />
      <circle cx="12" cy="8.1" r="1.7" fill="#0a0d18" opacity="0.85" />
      <path className="oj-rocket-flame" d="M10.4 14.4 12 20.4l1.6-6Z" fill="currentColor" />
    </svg>
  )
}

export default function ProgressRockets({ progress }) {
  const lit = Math.round((progress / 100) * ROCKET_COUNT)

  return (
    <div
      className="oj-progress"
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progress)}
    >
      <div className="oj-progress-track">
        <div className="oj-progress-fill" style={{ width: `${progress}%` }} />
      </div>

      <div className="oj-rockets" aria-hidden="true">
        {Array.from({ length: ROCKET_COUNT }, (_, index) => {
          const active = index < lit
          const lead = index === lit - 1
          return (
            <span
              key={index}
              className={`oj-rocket${active ? ' is-lit' : ''}${lead ? ' is-lead' : ''}`}
              style={{ left: `${(index / (ROCKET_COUNT - 1)) * 100}%` }}
            >
              <RocketGlyph />
            </span>
          )
        })}
      </div>
    </div>
  )
}

export { ROCKET_COUNT }
