import localStorageManager, { CommonStorageKeys, GiftStorageKeys } from "../LocalStorageManager";

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
    [SupportedLanguages.SK]: "Slovenčina",
    [SupportedLanguages.CS]: "Čeština",
};

class LanguageManager {
    private _currentLanguage: SupportedLanguage = SupportedLanguages.EN;
    private _fallbackLanguage: SupportedLanguage = SupportedLanguages.EN;
    private _languageChangeObservers: ((newLanguage: SupportedLanguage) => void)[] = [];

    constructor() {
        this.initializeLanguage();
    }

    private initializeLanguage(): void {
        // Try to get language from localStorage first
        const storedLanguage = localStorageManager.getString(CommonStorageKeys.Language) as SupportedLanguage;
        
        if (storedLanguage && Object.values(SupportedLanguages).includes(storedLanguage)) {
            this._currentLanguage = storedLanguage;
        } else {
            // Try to detect from browser language
            const browserLanguage = this.detectBrowserLanguage();
            this._currentLanguage = browserLanguage;
            localStorageManager.set(CommonStorageKeys.Language, browserLanguage);
            localStorageManager.set(GiftStorageKeys.GiftLanguage, browserLanguage);console.trace('first set language: ', browserLanguage);
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
        if (Object.values(SupportedLanguages).includes(language) && language !== this._currentLanguage) {
            this._currentLanguage = language;console.trace('set language: ', language);
            localStorageManager.set(CommonStorageKeys.Language, language);
            
            // Notify all observers about the language change
            this._languageChangeObservers.forEach(observer => observer(language));
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

    public addLanguageChangeObserver(observer: (newLanguage: SupportedLanguage) => void): void {
        this._languageChangeObservers.push(observer);
    }

    public removeLanguageChangeObserver(observer: (newLanguage: SupportedLanguage) => void): void {
        const index = this._languageChangeObservers.indexOf(observer);
        if (index > -1) {
            this._languageChangeObservers.splice(index, 1);
        }
    }
}

const languageManager = new LanguageManager();
export default languageManager;
