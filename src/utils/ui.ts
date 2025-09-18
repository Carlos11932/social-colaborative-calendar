/**
 * UI utilities for translation initialization and language switching
 */

import { i18n } from './i18n';
import { LANGUAGE_BUTTON_CLASSES } from './constants';

/**
 * Translation UI Manager
 */
export class TranslationUI {
  /**
   * Initialize translations for all elements with data-i18n attributes
   */
  static async initTranslations(): Promise<void> {
    if (!i18n.isReady()) {
      i18n.init();
    } else {
      i18n.updatePage();
    }

    if (typeof document !== 'undefined') {
      document.documentElement.lang = i18n.getCurrentLanguage();
    }
  }

  /**
   * Update input placeholders based on translation keys
   */
  static updatePlaceholders(placeholderMap: Record<string, string>): void {
    Object.entries(placeholderMap).forEach(([elementId, translationKey]) => {
      const element = document.getElementById(elementId) as HTMLInputElement;
      if (element) {
        element.placeholder = i18n.t(translationKey);
      }
    });
  }
}

/**
 * Language Switcher Manager
 */
export class LanguageSwitcher {
  private enBtn: HTMLButtonElement | null;
  private esBtn: HTMLButtonElement | null;

  constructor() {
    this.enBtn = document.getElementById('lang-en') as HTMLButtonElement;
    this.esBtn = document.getElementById('lang-es') as HTMLButtonElement;
  }

  /**
   * Initialize language switcher
   */
  init(): void {
    this.setupEventListeners();
    this.updateButtons();
  }

  private setupEventListeners(): void {
    if (this.enBtn) {
      this.enBtn.addEventListener('click', () => {
        i18n.setLanguage('en');
        this.updateButtons();
        document.dispatchEvent(new CustomEvent('languageChanged', { detail: 'en' }));
      });
    }
    
    if (this.esBtn) {
      this.esBtn.addEventListener('click', () => {
        i18n.setLanguage('es');
        this.updateButtons();
        document.dispatchEvent(new CustomEvent('languageChanged', { detail: 'es' }));
      });
    }
  }

  private updateButtons(): void {
    const currentLang = i18n.getCurrentLanguage();
    
    if (this.enBtn) {
      this.enBtn.className = currentLang === 'en' 
        ? LANGUAGE_BUTTON_CLASSES.enButton.active
        : LANGUAGE_BUTTON_CLASSES.enButton.inactive;
    }
    
    if (this.esBtn) {
      this.esBtn.className = currentLang === 'es' 
        ? LANGUAGE_BUTTON_CLASSES.esButton.active
        : LANGUAGE_BUTTON_CLASSES.esButton.inactive;
    }
  }
}

/**
 * Page initialization utility
 */
export class PageInitializer {
  /**
   * Initialize common page functionality
   */
  static async init(options: {
    placeholders?: Record<string, string>;
    customInit?: () => Promise<void> | void;
  } = {}): Promise<void> {
    // Initialize translations
    await TranslationUI.initTranslations();
    
    // Update placeholders if provided
    if (options.placeholders) {
      TranslationUI.updatePlaceholders(options.placeholders);
    }
    
    // Initialize language switcher
    const languageSwitcher = new LanguageSwitcher();
    languageSwitcher.init();
    
    // Listen for language changes to update placeholders
    if (options.placeholders) {
      document.addEventListener('languageChanged', () => {
        TranslationUI.updatePlaceholders(options.placeholders!);
      });
    }
    
    // Run custom initialization if provided
    if (options.customInit) {
      await options.customInit();
    }
  }
}
