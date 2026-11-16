import { useEffect, useState } from 'react'
import OrbitJumpLanding from './landing/OrbitJumpLanding.jsx'
import AtlasQuipuView from './atlas/AtlasQuipuView.jsx'
import NarrativeIntro from './story/NarrativeIntro.jsx'
import LoadingScreen from './landing/components/LoadingScreen.jsx'
import { getStrings } from './landing/i18n.js'

function App() {
  const [view, setView] = useState('orbit')
  const [lang, setLang] = useState('en')
  const [tutorialVisto, setTutorialVisto] = useState(false)

  useEffect(() => { document.documentElement.lang = lang }, [lang])

  useEffect(() => {
    const handleOrbitReady = () => {
      setView('intro')
    }

    window.addEventListener('orbitjump:ready', handleOrbitReady)
    return () => {
      window.removeEventListener('orbitjump:ready', handleOrbitReady)
    }
  }, [])

  if (view === 'atlas') {
    return <AtlasQuipuView lang={lang} onLanguageChange={setLang} mostrarBienvenida={!tutorialVisto} onTutorialFinish={() => setTutorialVisto(true)} onReturnToOrbit={() => setView('orbit')} />
  }

  if (view === 'intro') {
    return <NarrativeIntro lang={lang} onComplete={() => setView('bridge')} />
  }

  if (view === 'bridge') {
    return <LoadingScreen t={getStrings(lang)} onComplete={() => setView('atlas')} />
  }

  return <OrbitJumpLanding lang={lang} onLanguageChange={setLang} />
}

export default App
