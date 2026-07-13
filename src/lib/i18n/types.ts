/**
 * ApexEAPro — Internationalization (i18n) System
 *
 * Lightweight translation system supporting:
 * - English (EN)
 * - Amharic (AM) — አማርኛ
 * - French (FR)
 * - Spanish (ES)
 * - Arabic (AR)
 *
 * Translations are stored in separate files for easy maintenance.
 * The system uses React Context for instant language switching
 * without page reload.
 */

export type Language = 'EN' | 'AM' | 'FR' | 'ES' | 'AR'

export interface LanguageConfig {
  code: Language
  name: string
  nativeName: string
  flag: string
  dir: 'ltr' | 'rtl'
}

export const LANGUAGES: LanguageConfig[] = [
  { code: 'EN', name: 'English', nativeName: 'English', flag: '🇬🇧', dir: 'ltr' },
  { code: 'AM', name: 'Amharic', nativeName: 'አማርኛ', flag: '🇪🇹', dir: 'ltr' },
  { code: 'FR', name: 'French', nativeName: 'Français', flag: '🇫🇷', dir: 'ltr' },
  { code: 'ES', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', dir: 'ltr' },
  { code: 'AR', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', dir: 'rtl' },
]

// Translation keys — all user-facing strings
export type TranslationKey =
  | 'nav.home'
  | 'nav.workspace'
  | 'nav.intelligence'
  | 'nav.aile'
  | 'nav.marketCenter'
  | 'nav.institutionalIntel'
  | 'nav.globalEvents'
  | 'nav.goldStrength'
  | 'nav.riskIntelligence'
  | 'nav.performance'
  | 'nav.priorityIntel'
  | 'nav.apexAcademy'
  | 'nav.multiTimeframe'
  | 'nav.sessionIntel'
  | 'hero.title'
  | 'hero.subtitle'
  | 'hero.launchCta'
  | 'hero.startFree'
  | 'bot.welcome'
  | 'bot.placeholder'
  | 'bot.listening'
  | 'common.launch'
  | 'common.close'
  | 'common.send'
  | 'common.copy'
  | 'common.share'
  | 'common.refresh'
  | 'common.readAloud'
  | 'common.download'
  | 'common.export'
  | 'common.like'
  | 'common.dislike'
  | 'common.clear'
  | 'common.upload'
  | 'common.voice'
  | 'common.settings'
  | 'common.signin'
  | 'common.theme'
  | 'common.language'
  | 'footer.poweredBy'
  | 'footer.educational'
  | 'menu.overview'
  | 'menu.institutionalIntel'
  | 'menu.marketIntel'

// Default English translations (also serves as the key reference)
const enTranslations: Record<TranslationKey, string> = {
  'nav.home': 'Home',
  'nav.workspace': 'Intelligence Workspace',
  'nav.intelligence': 'Intelligence',
  'nav.aile': 'Apex AI',
  'nav.marketCenter': 'Market Intelligence Center',
  'nav.institutionalIntel': 'Institutional Intelligence',
  'nav.globalEvents': 'Global Market Events',
  'nav.goldStrength': 'Gold Strength Index',
  'nav.riskIntelligence': 'Risk Intelligence',
  'nav.performance': 'Performance Intelligence',
  'nav.priorityIntel': 'Priority Intelligence',
  'nav.apexAcademy': 'Apex Academy',
  'nav.multiTimeframe': 'Multi-Timeframe Intelligence',
  'nav.sessionIntel': 'Session Intelligence',
  'hero.title': 'The AI Operating System for Professional Traders',
  'hero.subtitle': 'Institutional-grade market intelligence, powered by advanced artificial intelligence and designed for traders who demand precision.',
  'hero.launchCta': 'Launch AI Intelligence Workspace',
  'hero.startFree': 'Start Free',
  'bot.welcome': 'Welcome to ApexEAPro. I\'m Apex AI. I\'m continuously monitoring global financial markets, institutional liquidity, macroeconomic events, and technical conditions. How can I help you build better market intelligence today?',
  'bot.placeholder': 'Ask Apex AI or upload a chart...',
  'bot.listening': 'Analyzing Institutional Activity...',
  'common.launch': 'Launch AI Intelligence Workspace',
  'common.close': 'Close',
  'common.send': 'Send',
  'common.copy': 'Copy',
  'common.share': 'Share',
  'common.refresh': 'Regenerate',
  'common.readAloud': 'Read aloud',
  'common.download': 'Download',
  'common.export': 'Export',
  'common.like': 'Good response',
  'common.dislike': 'Bad response',
  'common.clear': 'Clear',
  'common.upload': 'Upload file',
  'common.voice': 'Voice input',
  'common.settings': 'Settings',
  'common.signin': 'Sign In',
  'common.theme': 'Theme',
  'common.language': 'Language',
  'footer.poweredBy': 'Powered by',
  'footer.educational': 'Educational only — not financial advice.',
  'menu.overview': 'Overview',
  'menu.institutionalIntel': 'Institutional Intelligence',
  'menu.marketIntel': 'Market Intelligence',
}

export type Translations = Record<TranslationKey, string>

export { enTranslations }
