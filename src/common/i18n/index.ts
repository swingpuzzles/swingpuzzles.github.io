// Main i18n exports
export { default as i18nManager } from './I18nManager';
export { default as languageManager, SupportedLanguages, type SupportedLanguage } from './LanguageManager';
export { TranslationKeys, type TranslationKey } from './TranslationKeys';
export { LanguageDetector } from './LanguageDetector';
export { I18nInitializer } from './I18nInitializer';

// Re-export existing translation manager for backward compatibility
export { default as translationManager, TranslationSectionKeys } from '../../core3d/misc/TranslationManager';
