/**
 * Internationalization system utilities
 * Archivo: src/utils/i18n.ts
 */

import enMessages from '../i18n/locales/en.json';
import esMessages from '../i18n/locales/es.json';

export type Language = 'en' | 'es';
type TranslationValue = string | Record<string, TranslationValue>;
type LocaleMessages = Record<string, TranslationValue>;
type TranslationMap = Record<Language, LocaleMessages>;

const TRANSLATIONS: TranslationMap = {
  en: enMessages as LocaleMessages,
  es: esMessages as LocaleMessages
};

const isBrowser = typeof window !== 'undefined';

export class I18nManager {
  private currentLanguage: Language;
  private ready: boolean;
  private initialized: boolean;
  private listenersBound: boolean;

  constructor() {
    this.currentLanguage = 'es';
    this.ready = false;
    this.initialized = false;
    this.listenersBound = false;

    if (isBrowser) {
      const stored = window.localStorage?.getItem('language') as Language | null;
      if (stored && stored in TRANSLATIONS) {
        this.currentLanguage = stored;
      }
    }
  }

  public init(): void {
    if (typeof document === 'undefined') {
      return;
    }

    this.ready = true;
    this.initialized = true;

    if (!this.listenersBound) {
      this.bindLanguageButtons();
    }

    this.updatePage();
    this.updateLanguageButtons();
    document.documentElement.lang = this.currentLanguage;
  }

  public isReady(): boolean {
    return this.ready;
  }

  public getCurrentLanguage(): Language {
    return this.currentLanguage;
  }

  public setLanguage(lang: Language): void {
    if (!(lang in TRANSLATIONS)) {
      console.warn(`Unsupported language: ${lang}`);
      return;
    }

    this.currentLanguage = lang;
    this.ready = true;

    if (isBrowser) {
      window.localStorage?.setItem('language', lang);
    }

    if (typeof document !== 'undefined') {
      document.documentElement.lang = this.currentLanguage;
    }

    this.updatePage();
    this.updateLanguageButtons();
  }

  public t(key: string): string {
    const segments = key.split('.');
    const fromCurrent = this.resolveTranslation(this.currentLanguage, segments);

    if (fromCurrent) {
      return fromCurrent;
    }

    const fallback = this.currentLanguage === 'en' ? 'es' : 'en';
    const fromFallback = this.resolveTranslation(fallback as Language, segments);
    return fromFallback ?? key;
  }

  public updatePage(): void {
    if (typeof document === 'undefined') {
      return;
    }

    document.querySelectorAll<HTMLElement>('[data-i18n]').forEach(element => {
      const key = element.dataset.i18n;
      if (!key) {
        return;
      }

      const translation = this.t(key);

      if (element instanceof HTMLInputElement) {
        if (['text', 'email', 'password', 'search'].includes(element.type)) {
          element.placeholder = translation;
        } else if (['submit', 'button'].includes(element.type)) {
          element.value = translation;
        }
      } else {
        element.textContent = translation;
      }
    });

    const pageTitle = document.querySelector('title');
    if (pageTitle) {
      const currentTitle = pageTitle.textContent ?? '';
      if (currentTitle.includes('Dashboard') || currentTitle.includes('Tablero')) {
        pageTitle.textContent = `${this.t('auth.login.title')} - Social Calendar`;
      } else if (currentTitle.includes('Register') || currentTitle.includes('Registro')) {
        pageTitle.textContent = `${this.t('auth.register.title')} - Social Calendar`;
      } else if (currentTitle.includes('Login') || currentTitle.includes('Iniciar')) {
        pageTitle.textContent = `${this.t('auth.login.title')} - Social Calendar`;
      }
    }
  }

  private resolveTranslation(lang: Language, segments: string[]): string | null {
    let cursor: TranslationValue | undefined = TRANSLATIONS[lang];

    for (const segment of segments) {
      if (!cursor || typeof cursor !== 'object') {
        return null;
      }

      cursor = (cursor as Record<string, TranslationValue>)[segment];
      if (cursor === undefined) {
        return null;
      }
    }

    return typeof cursor === 'string' ? cursor : null;
  }

  private updateLanguageButtons(): void {
    if (typeof document === 'undefined') {
      return;
    }

    const enButton = document.getElementById('lang-en');
    const esButton = document.getElementById('lang-es');

    if (enButton && esButton) {
      enButton.className = 'text-xs text-gray-400 hover:text-gray-600 mr-2 px-2 py-1 rounded';
      esButton.className = 'text-xs text-gray-400 hover:text-gray-600 ml-2 px-2 py-1 rounded';

      if (this.currentLanguage === 'en') {
        enButton.className = 'text-xs text-blue-600 hover:text-blue-800 mr-2 px-2 py-1 rounded font-semibold';
      } else {
        esButton.className = 'text-xs text-blue-600 hover:text-blue-800 ml-2 px-2 py-1 rounded font-semibold';
      }
    }
  }

  private bindLanguageButtons(): void {
    if (this.listenersBound || typeof document === 'undefined') {
      return;
    }

    const enButton = document.getElementById('lang-en');
    const esButton = document.getElementById('lang-es');

    if (enButton) {
      enButton.addEventListener('click', () => this.setLanguage('en'));
    }

    if (esButton) {
      esButton.addEventListener('click', () => this.setLanguage('es'));
    }

    this.listenersBound = true;
  }
}

export const i18n = new I18nManager();

declare global {
  interface Window {
    i18n: I18nManager;
  }
}

if (typeof window !== 'undefined') {
  window.i18n = i18n;
}
