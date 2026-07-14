'use client'

import * as React from 'react'
import type { Language, TranslationKey, Translations } from './types'
import { enTranslations, LANGUAGES } from './types'
import amTranslations from './am'
import frTranslations from './fr'
import esTranslations from './es'
import arTranslations from './ar'

const allTranslations: Record<Language, Translations> = {
  EN: enTranslations,
  AM: amTranslations,
  FR: frTranslations,
  ES: esTranslations,
  AR: arTranslations,
}

const STORAGE_KEY = 'apex-language'
const DEFAULT_LANG: Language = 'EN'

interface I18nContextValue {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: TranslationKey) => string
  dir: 'ltr' | 'rtl'
}

const I18nContext = React.createContext<I18nContextValue>({
  language: DEFAULT_LANG,
  setLanguage: () => {},
  t: (key) => enTranslations[key] || key,
  dir: 'ltr',
})

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = React.useState<Language>(DEFAULT_LANG)

  // Load saved language on mount
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as Language
      if (saved && allTranslations[saved]) {
        setLanguageState(saved)
      }
    } catch {}
  }, [])

  // Apply language to document
  React.useEffect(() => {
    const config = LANGUAGES.find(l => l.code === language)
    if (config) {
      document.documentElement.lang = language.toLowerCase()
      document.documentElement.dir = config.dir
    }
    try {
      localStorage.setItem(STORAGE_KEY, language)
    } catch {}
  }, [language])

  const setLanguage = React.useCallback((lang: Language) => {
    setLanguageState(lang)
  }, [])

  const t = React.useCallback((key: TranslationKey): string => {
    return allTranslations[language]?.[key] || enTranslations[key] || key
  }, [language])

  const config = LANGUAGES.find(l => l.code === language)
  const dir = config?.dir || 'ltr'

  return (
    <I18nContext.Provider value={{ language, setLanguage, t, dir }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  return React.useContext(I18nContext)
}
