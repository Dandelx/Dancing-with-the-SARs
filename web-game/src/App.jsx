import { useEffect, useState } from 'react'
import OrbitJumpLanding from './landing/OrbitJumpLanding.jsx'
import AtlasQuipuView from './atlas/AtlasQuipuView.jsx'

function App() {
  const [view, setView] = useState('orbit')

  useEffect(() => {
    const handleOrbitReady = () => {
      setView('atlas')
    }

    window.addEventListener('orbitjump:ready', handleOrbitReady)
    return () => {
      window.removeEventListener('orbitjump:ready', handleOrbitReady)
    }
  }, [])

  if (view === 'atlas') {
    return <AtlasQuipuView onReturnToOrbit={() => setView('orbit')} />
  }

  return <OrbitJumpLanding />
}

export default App
