// Global type definitions for the project

// Language and translation types
export type SupportedLanguage = 'en' | 'es';

export interface TranslationKeys {
  signIn: string;
  email: string;
  password: string;
  emailPlaceholder: string;
  passwordPlaceholder: string;
  signingIn: string;
  noAccount: string;
  registerHere: string;
  loginError: string;
}

export type Translations = Record<SupportedLanguage, TranslationKeys>;

declare global {
  interface Window {
    supabase: {
      createClient: (url: string, key: string) => any;
    };
  }
}

export {};
