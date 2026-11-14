/**
 * Andean cat (Leopardus jacobita) runner — a pure SVG silhouette drawn from
 * primitives (no artwork licence applies). Slender body, rounded ears and the
 * signature long banded tail, plus a small geologist hat.
 */
export default function AndeanCat() {
  return (
    <svg
      className="oj-cat"
      viewBox="0 0 260 120"
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
      <ellipse cx="128" cy="112" rx="80" ry="5" fill="rgba(0,0,0,0.3)" />

      <g className="oj-cat-run">
        {/* long banded tail */}
        <g className="oj-cat-tail">
          <path
            d="M82 72C60 78 42 70 33 55c-5-9-4-19 3-26"
            fill="none"
            stroke="url(#ojCatGrad)"
            strokeWidth="12"
            strokeLinecap="round"
          />
          <path
            d="M82 72C60 78 42 70 33 55c-5-9-4-19 3-26"
            fill="none"
            stroke="#56310f"
            strokeWidth="11.2"
            strokeDasharray="5.5 8.5"
            strokeLinecap="butt"
            opacity="0.55"
          />
        </g>

        {/* far legs */}
        <g className="oj-leg oj-leg--far" style={{ transformOrigin: '104px 74px' }}>
          <rect x="100" y="68" width="9" height="32" rx="4.5" fill="url(#ojCatGradFar)" />
          <circle cx="104.5" cy="101" r="5" fill="url(#ojCatGradFar)" />
        </g>
        <g className="oj-leg oj-leg--far oj-leg--delay" style={{ transformOrigin: '172px 72px' }}>
          <rect x="168" y="66" width="9" height="32" rx="4.5" fill="url(#ojCatGradFar)" />
          <circle cx="172.5" cy="99" r="5" fill="url(#ojCatGradFar)" />
        </g>

        {/* body, neck and head */}
        <path
          d="M72 58C82 46 104 42 128 44c24 2 42 10 52 20 4 6 2 14-6 18-16 8-42 10-64 8-18-2-34-8-40-18-2-6-1-11 2-14Z"
          fill="url(#ojCatGrad)"
        />
        <path
          d="M168 60c8-8 14-12 22-14"
          fill="none"
          stroke="url(#ojCatGrad)"
          strokeWidth="24"
          strokeLinecap="round"
        />

        {/* ears (small, rounded, wide set) */}
        <path
          d="M191 33 187 21 199 29Z"
          fill="url(#ojCatGrad)"
          stroke="url(#ojCatGrad)"
          strokeWidth="4"
          strokeLinejoin="round"
        />
        <path
          d="M207 29 214 19 217 30Z"
          fill="url(#ojCatGradFar)"
          stroke="url(#ojCatGradFar)"
          strokeWidth="4"
          strokeLinejoin="round"
        />

        <circle cx="200" cy="44" r="14.5" fill="url(#ojCatGrad)" />
        <ellipse cx="212" cy="48" rx="7.4" ry="5.4" fill="url(#ojCatGrad)" />
        <ellipse cx="204" cy="42" rx="1.8" ry="2.5" fill="#2a1608" opacity="0.9" />

        {/* geologist hat */}
        <g className="oj-cat-hat">
          <ellipse cx="200" cy="27" rx="17" ry="4.2" fill="#a86a2c" />
          <path d="M190 27c0-9 4-13 10-13s10 4 10 13Z" fill="#c98f45" />
          <rect x="190" y="21.5" width="20" height="4" rx="1.8" fill="#6b3f16" />
        </g>

        {/* near legs */}
        <g className="oj-leg" style={{ transformOrigin: '91px 76px' }}>
          <rect x="86" y="70" width="10.5" height="33" rx="5" fill="url(#ojCatGrad)" />
          <circle cx="91.5" cy="104" r="5.3" fill="url(#ojCatGrad)" />
        </g>
        <g className="oj-leg oj-leg--delay" style={{ transformOrigin: '159px 74px' }}>
          <rect x="154" y="68" width="10.5" height="33" rx="5" fill="url(#ojCatGrad)" />
          <circle cx="159.5" cy="102" r="5.3" fill="url(#ojCatGrad)" />
        </g>
      </g>

      {/* dust puffs */}
      <g className="oj-dust" fill="#e6c489">
        <ellipse className="oj-dust-puff" cx="54" cy="104" rx="10" ry="4" />
        <ellipse className="oj-dust-puff oj-dust-puff--delay" cx="30" cy="102" rx="7" ry="3" />
        <ellipse className="oj-dust-puff oj-dust-puff--delay-2" cx="72" cy="106" rx="6" ry="2.6" />
      </g>
    </svg>
  )
}
