import { ChevronDown, Globe2 } from 'lucide-react'
import { LOCALES } from '../i18n.js'
import audio from '../audio/audioEngine.js'

export default function LanguageSelect({ lang, onChange, t }) {
  const handleChange = (event) => {
    audio.sfx('click')
    onChange(event.target.value)
  }

  return (
    <div className="oj-select">
      <Globe2 size={15} strokeWidth={1.6} aria-hidden="true" className="oj-select-icon" />
      <select
        value={lang}
        onChange={handleChange}
        aria-label={t.language}
        title={t.language}
      >
        {Object.values(LOCALES).map((locale) => (
          <option key={locale.id} value={locale.id}>
            {locale.label}
          </option>
        ))}
      </select>
      <ChevronDown size={14} strokeWidth={1.8} aria-hidden="true" className="oj-select-chevron" />
    </div>
  )
}
