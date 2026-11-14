/**
 * Andean cat (Leopardus jacobita) runner — a pure SVG silhouette with a
 * geologist's field hat. Drawn from primitives, so no artwork licence applies.
 */
export default function AndeanCat() {
  return (
    <svg
      className="oj-cat"
      viewBox="0 0 260 150"
      role="img"
      aria-label="Andean cat running with an explorer hat"
    >
      <defs>
        <linearGradient id="ojCatGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffe7b0" />
          <stop offset="45%" stopColor="#eab35c" />
          <stop offset="100%" stopColor="#b06f2e" />
        </linearGradient>
        <linearGradient id="ojCatGradFar" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d9a955" />
          <stop offset="100%" stopColor="#8a5624" />
        </linearGradient>
      </defs>

      {/* ground shadow */}
      <ellipse cx="128" cy="138" rx="82" ry="6.5" fill="rgba(0,0,0,0.42)" />

      <g className="oj-cat-run">
        {/* tail */}
        <g className="oj-cat-tail">
          <path
            d="M96 94C70 99 48 84 42 60c-3-12 2-22 12-27"
            fill="none"
            stroke="url(#ojCatGrad)"
            strokeWidth="13"
            strokeLinecap="round"
          />
          <g stroke="#5a3313" strokeWidth="3" strokeLinecap="round" opacity="0.55">
            <path d="M46 36l7 9" />
            <path d="M40 55l11 3" />
            <path d="M52 76l8-6" />
          </g>
        </g>

        {/* far legs */}
        <g className="oj-leg oj-leg--far" style={{ transformOrigin: '116px 98px' }}>
          <rect x="110" y="92" width="11" height="38" rx="5.5" fill="url(#ojCatGradFar)" />
        </g>
        <g className="oj-leg oj-leg--far oj-leg--delay" style={{ transformOrigin: '170px 98px' }}>
          <rect x="164" y="92" width="11" height="38" rx="5.5" fill="url(#ojCatGradFar)" />
        </g>

        {/* body */}
        <circle cx="108" cy="92" r="27" fill="url(#ojCatGrad)" />
        <ellipse cx="142" cy="86" rx="48" ry="25" fill="url(#ojCatGrad)" />
        <circle cx="176" cy="86" r="21" fill="url(#ojCatGrad)" />

        {/* head */}
        <circle cx="200" cy="66" r="20" fill="url(#ojCatGrad)" />
        <ellipse cx="214" cy="72" rx="10" ry="7.5" fill="url(#ojCatGrad)" />
        <path d="M186 55 183 33 199 47Z" fill="url(#ojCatGrad)" />
        <path d="M204 47 216 33 219 55Z" fill="url(#ojCatGrad)" />
        <ellipse cx="204" cy="64" rx="2.3" ry="3.2" fill="#2a1608" opacity="0.9" />

        {/* explorer hat */}
        <g className="oj-cat-hat" transform="rotate(-9 200 46)">
          <ellipse cx="200" cy="46" rx="33" ry="7.5" fill="#a86a2c" />
          <path d="M182 46c0-18 6-26 18-26s18 8 18 26Z" fill="#c98f45" />
          <rect x="182" y="38" width="36" height="6" rx="2.4" fill="#6b3f16" />
          <path d="M188 32c3-6 8-8 12-8" stroke="#8a5624" strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.7" />
        </g>

        {/* near legs */}
        <g className="oj-leg" style={{ transformOrigin: '104px 98px' }}>
          <rect x="98" y="92" width="12" height="40" rx="6" fill="url(#ojCatGrad)" />
        </g>
        <g className="oj-leg oj-leg--delay" style={{ transformOrigin: '180px 98px' }}>
          <rect x="174" y="92" width="12" height="40" rx="6" fill="url(#ojCatGrad)" />
        </g>
      </g>

      {/* dust puffs */}
      <g className="oj-dust" fill="#e6c489">
        <ellipse className="oj-dust-puff" cx="64" cy="132" rx="10" ry="4" />
        <ellipse className="oj-dust-puff oj-dust-puff--delay" cx="40" cy="130" rx="7" ry="3" />
        <ellipse className="oj-dust-puff oj-dust-puff--delay-2" cx="86" cy="134" rx="6" ry="2.6" />
      </g>
    </svg>
  )
}
