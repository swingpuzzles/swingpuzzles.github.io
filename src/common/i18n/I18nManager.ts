import languageManager, { SupportedLanguage } from "./LanguageManager";
import { TranslationKey } from "./TranslationKeys";

// Import translation files
import enTranslations from "./translations/en.json";
import esTranslations from "./translations/es.json";

type TranslationData = Record<string, any>;

class I18nManager {
    private _translations: Map<SupportedLanguage, TranslationData> = new Map();
    private _fallbackLanguage: SupportedLanguage = "en";

    constructor() {
        this.initializeTranslations();
    }

    private initializeTranslations(): void {
        // Load all translation files
        this._translations.set("en", enTranslations);
        this._translations.set("es", esTranslations);
        
        // TODO: Add more language files as they become available
        // this._translations.set("de", deTranslations);
        // this._translations.set("fr", frTranslations);
        // this._translations.set("it", itTranslations);
        // this._translations.set("cs", csTranslations);
        // this._translations.set("sk", skTranslations);
    }

    /**
     * Get a translated string by key
     * @param key Translation key (e.g., "tutorial.welcome.title")
     * @param params Optional parameters to replace in the string (e.g., {name: "John", time: "2:30"})
     * @param language Optional language override (defaults to current language)
     * @returns Translated string or the key if translation not found
     */
    public translate(key: TranslationKey, params?: Record<string, string | number>, language?: SupportedLanguage): string {
        const targetLanguage = language || languageManager.currentLanguage;
        
        // Try to get translation from target language
        let translation = this.getTranslationByKey(key, targetLanguage);
        
        // Fallback to English if translation not found
        if (!translation && targetLanguage !== this._fallbackLanguage) {
            translation = this.getTranslationByKey(key, this._fallbackLanguage);
        }
        
        // Return key if no translation found
        if (!translation) {
            console.warn(`Translation not found for key: ${key}`);
            return key;
        }

        // Replace parameters in the translation
        if (params) {
            return this.replaceParameters(translation, params);
        }

        return translation;
    }

    /**
     * Get translation by key from specific language
     */
    private getTranslationByKey(key: TranslationKey, language: SupportedLanguage): string | null {
        const translations = this._translations.get(language);
        if (!translations) {
            return null;
        }

        const keys = key.split('.');
        let current: any = translations;

        for (const k of keys) {
            if (current && typeof current === 'object' && k in current) {
                current = current[k];
            } else {
                return null;
            }
        }

        return typeof current === 'string' ? current : null;
    }

    /**
     * Replace parameters in a translation string
     * Supports {paramName} and {0}, {1} style parameters
     */
    private replaceParameters(text: string, params: Record<string, string | number>): string {
        return text.replace(/\{([^}]+)\}/g, (match, paramName) => {
            const value = params[paramName];
            return value !== undefined ? String(value) : match;
        });
    }

    /**
     * Get all available languages with translations
     */
    public getAvailableLanguages(): SupportedLanguage[] {
        return Array.from(this._translations.keys());
    }

    /**
     * Check if a language has translations available
     */
    public hasTranslations(language: SupportedLanguage): boolean {
        return this._translations.has(language);
    }

    /**
     * Get a nested translation object (useful for components that need multiple related translations)
     */
    public getTranslationGroup(groupKey: string, language?: SupportedLanguage): Record<string, string> {
        const targetLanguage = language || languageManager.currentLanguage;
        const translations = this._translations.get(targetLanguage);
        
        if (!translations) {
            return {};
        }

        const group = translations[groupKey];
        return group && typeof group === 'object' ? group : {};
    }

    /**
     * Pluralization helper (basic implementation)
     * @param key Base translation key
     * @param count Number to determine pluralization
     * @param params Additional parameters
     * @returns Translated string with proper pluralization
     */
    public translatePlural(key: TranslationKey, count: number, params?: Record<string, string | number>): string {
        const baseKey = key.replace(/\.(one|other)$/, '');
        const pluralKey = count === 1 ? `${baseKey}.one` : `${baseKey}.other`;
        
        const translationParams = { ...params, count };
        return this.translate(pluralKey, translationParams);
    }

    /**
     * Get current language
     */
    public getCurrentLanguage(): SupportedLanguage {
        return languageManager.currentLanguage;
    }

    /**
     * Set language and reload translations if needed
     */
    public setLanguage(language: SupportedLanguage): void {
        languageManager.setLanguage(language);
    }

    /**
     * Format a number according to the current locale
     */
    public formatNumber(number: number): string {
        try {
            return new Intl.NumberFormat(languageManager.currentLanguage).format(number);
        } catch {
            return number.toString();
        }
    }

    /**
     * Format a date according to the current locale
     */
    public formatDate(date: Date): string {
        try {
            return new Intl.DateTimeFormat(languageManager.currentLanguage).format(date);
        } catch {
            return date.toLocaleDateString();
        }
    }
}

const i18nManager = new I18nManager();
export default i18nManager;
