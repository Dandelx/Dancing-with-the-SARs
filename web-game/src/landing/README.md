# Orbit Jump — landing / splash screen

Standalone React + Three.js landing screen for **Orbit Jump** (NASA Space Apps
Challenge, *Dancing with the SARs*). It is fully self-contained inside
`src/landing/` and mounts through `App.jsx`.

```
src/landing/
├─ OrbitJumpLanding.jsx      state machine: idle → launching → loading → ready
├─ landing.css               layout, settings dialog, clouds/flash, cat + ship
├─ i18n.js                   EN / ES copy, language detection (localStorage)
├─ audio/audioEngine.js      generative Andean ambient + Web Audio SFX
├─ hooks/useHoverSfx.js      throttled hover blip
├─ three/OrbitScene.js       Earth shader, Peru highlight, orbits, ship flight
├─ three/models.js           procedural NISAR, station and ship geometry
└─ components/               TopBar, LanguageSelect, AudioControl,
                             SettingsButton, SettingsModal, PlayButton,
                             LoadingScreen, AndeanCat, ProgressBar
```

## Interaction flow

1. **Idle** — Earth rotates, Peru pulses under a gold overlay, NISAR and the
   station orbit, the PLAY button waits for a click (or `Enter`).
2. **Launching** — a ship leaves the station and flies a single straight line
   to Peru; on arrival the camera dollies in satellite-style through a soft
   cloud layer until the Andes fill the frame (white flash).
   The stage mask fades top and bottom so the WebGL canvas edge never shows.
3. **Loading** — 6.8 s progress simulation; the Andean cat (long banded tail)
   and a single ship ride the golden bar, both driven by the same `--p`.
4. **Ready** — dispatches `window` event `orbitjump:ready` so the game shell can
   take over. Listen with:

```js
window.addEventListener('orbitjump:ready', () => startGame())
```

## Audio

Every sound is synthesised at runtime with the Web Audio API — there is no
third-party sample, loop or melody to license:

- ambient bed: pentatonic quena-like flute, charango plucks and bombo over a
  soft drone, in A minor pentatonic (Am–F–C–G);
- SFX: `click` (bip-bop), `hover`, `play`, `warp`, `ready`;
- generated convolution reverb from decaying noise;
- volume slider + mute, plus independent Music / Sound Effects channels in the
  settings dialog, persisted in `localStorage` (`orbitjump.volume`,
  `orbitjump.music`, `orbitjump.sfx`);
- browsers require a gesture before audio can start, so the context unlocks on
  the first pointer or key press.

## Assets and licences

| Asset | Source | Licence |
| --- | --- | --- |
| `public/textures/earth_day.jpg` | NASA Blue Marble (three.js examples) | public domain |
| `public/textures/earth_night.png` | NASA Earth at night (three.js examples) | public domain |
| `public/textures/earth_clouds.png` | NASA clouds (three.js examples) | public domain |
| `public/geo/peru.geo.json` | Natural Earth via `johan/world.geo.json` | public domain |
| Fonts *Chakra Petch* + *Sora* | Google Fonts | SIL Open Font License |
| Icons | lucide-react | ISC |
| 3D models, cat, rockets, UI | drawn in code for this project | original work |

## Accessibility

- `prefers-reduced-motion` slows the Earth, shortens the flight and disables
  the looping character animations;
- labelled controls (`aria-label` on language, volume, mute, settings, PLAY);
- the settings dialog is a labelled `role="dialog"`, closes with Escape,
  backdrop click or the X button, and its toggles are `role="switch"`;
- the loading block is `role="status"` with `aria-live="polite"`; the progress
  bar exposes `aria-valuenow`;
- keyboard start with `Enter` and visible focus rings.

## Scripts

```bash
npm run dev      # http://localhost:5173
npm run build
npm run preview
npm run lint     # oxlint
```
