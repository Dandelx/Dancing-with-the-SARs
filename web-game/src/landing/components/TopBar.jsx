export default function TopBar({ children }) {
  return (
    <header className="oj-topbar">
      <div className="oj-brand">
        <span className="oj-brand-mark" aria-hidden="true">
          <svg viewBox="0 0 40 40" fill="none">
            <ellipse cx="20" cy="20" rx="18" ry="7.4" stroke="currentColor" strokeWidth="1.1" transform="rotate(-22 20 20)" opacity="0.55" />
            <ellipse cx="20" cy="20" rx="18" ry="7.4" stroke="currentColor" strokeWidth="1.1" transform="rotate(38 20 20)" opacity="0.3" />
            <circle cx="20" cy="20" r="5.2" fill="currentColor" />
            <circle cx="34.5" cy="12.6" r="2" fill="currentColor" />
          </svg>
        </span>
        <span className="oj-brand-text">
          <span className="oj-brand-name">Orbit Jump</span>
          <span className="oj-brand-chip">NASA Space Apps</span>
        </span>
      </div>

      <div className="oj-controls">{children}</div>
    </header>
  )
}
