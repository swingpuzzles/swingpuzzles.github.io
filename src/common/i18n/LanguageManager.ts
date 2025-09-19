import localStorageManager, { CommonStorageKeys } from "../LocalStorageManager";

export const SupportedLanguages = {
    EN: "en",
    ES: "es", 
    DE: "de",
    FR: "fr",
    IT: "it",
    CS: "cs",
    SK: "sk"
} as const;

export type SupportedLanguage = typeof SupportedLanguages[keyof typeof SupportedLanguages];

export const LanguageNames: Record<SupportedLanguage, string> = {
    [SupportedLanguages.EN]: "English",
    [SupportedLanguages.ES]: "Español",
    [SupportedLanguages.DE]: "Deutsch", 
    [SupportedLanguages.FR]: "Français",
    [SupportedLanguages.IT]: "Italiano",
    [SupportedLanguages.CS]: "Čeština",
    [SupportedLanguages.SK]: "Slovenčina"
};

class LanguageManager {
    private _currentLanguage: SupportedLanguage = SupportedLanguages.EN;
    private _fallbackLanguage: SupportedLanguage = SupportedLanguages.EN;

    constructor() {
        this.initializeLanguage();
    }

    private initializeLanguage(): void {
        // Try to get language from localStorage first
        const storedLanguage = localStorageManager.getString('language') as SupportedLanguage;
        
        if (storedLanguage && Object.values(SupportedLanguages).includes(storedLanguage)) {
            this._currentLanguage = storedLanguage;
        } else {
            // Try to detect from browser language
            const browserLanguage = this.detectBrowserLanguage();
            this._currentLanguage = browserLanguage;
        }
    }

    private detectBrowserLanguage(): SupportedLanguage {
        const browserLang = navigator.language || (navigator as any).userLanguage;
        
        // Extract primary language code (e.g., 'en' from 'en-US')
        const primaryLang = browserLang.split('-')[0].toLowerCase();
        
        // Check if we support this language
        if (Object.values(SupportedLanguages).includes(primaryLang as SupportedLanguage)) {
            return primaryLang as SupportedLanguage;
        }
        
        // Fallback to English
        return SupportedLanguages.EN;
    }

    public get currentLanguage(): SupportedLanguage {
        return this._currentLanguage;
    }

    public setLanguage(language: SupportedLanguage): void {
        if (Object.values(SupportedLanguages).includes(language)) {
            this._currentLanguage = language;
            localStorageManager.set('language', language);
        }
    }

    public getLanguageDisplayName(language: SupportedLanguage): string {
        return LanguageNames[language] || LanguageNames[SupportedLanguages.EN];
    }

    public getAllSupportedLanguages(): SupportedLanguage[] {
        return Object.values(SupportedLanguages);
    }

    public getLanguageFlagUrl(language: SupportedLanguage): string {
        return `assets/flags/${language}.webp`;
    }

    public getLanguageFlagSmallUrl(language: SupportedLanguage): string {
        return `assets/flags/${language}-small.webp`;
    }
}

const languageManager = new LanguageManager();
export default languageManager;
