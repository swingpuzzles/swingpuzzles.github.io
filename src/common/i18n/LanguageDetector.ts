import { SupportedLanguage, SupportedLanguages } from "./LanguageManager";

/**
 * Language detection utilities
 */
export class LanguageDetector {
    /**
     * Detect language from URL parameter
     */
    public static detectFromUrl(): SupportedLanguage | null {
        const urlParams = new URLSearchParams(window.location.search);
        const langParam = urlParams.get('lang') || urlParams.get('language');
        
        if (langParam && Object.values(SupportedLanguages).includes(langParam as SupportedLanguage)) {
            return langParam as SupportedLanguage;
        }
        
        return null;
    }

    /**
     * Detect language from browser settings
     */
    public static detectFromBrowser(): SupportedLanguage {
        const browserLang = navigator.language || (navigator as any).userLanguage;
        const primaryLang = browserLang.split('-')[0].toLowerCase();
        
        if (Object.values(SupportedLanguages).includes(primaryLang as SupportedLanguage)) {
            return primaryLang as SupportedLanguage;
        }
        
        return SupportedLanguages.EN;
    }

    /**
     * Detect language from HTML lang attribute
     */
    public static detectFromHtml(): SupportedLanguage | null {
        const htmlLang = document.documentElement.lang;
        
        if (htmlLang && Object.values(SupportedLanguages).includes(htmlLang as SupportedLanguage)) {
            return htmlLang as SupportedLanguage;
        }
        
        return null;
    }

    /**
     * Get the best available language using all detection methods
     */
    public static detectBestLanguage(): SupportedLanguage {
        // Priority order: URL param > HTML lang > Browser > Default
        return this.detectFromUrl() || 
               this.detectFromHtml() || 
               this.detectFromBrowser();
    }

    /**
     * Check if a language is supported
     */
    public static isSupported(language: string): language is SupportedLanguage {
        return Object.values(SupportedLanguages).includes(language as SupportedLanguage);
    }

    /**
     * Get language name in its native form
     */
    public static getNativeName(language: SupportedLanguage): string {
        const nativeNames: Record<SupportedLanguage, string> = {
            [SupportedLanguages.EN]: "English",
            [SupportedLanguages.ES]: "Español",
            [SupportedLanguages.DE]: "Deutsch",
            [SupportedLanguages.FR]: "Français", 
            [SupportedLanguages.IT]: "Italiano",
            [SupportedLanguages.CS]: "Čeština",
            [SupportedLanguages.SK]: "Slovenčina"
        };
        
        return nativeNames[language];
    }

    /**
     * Get language name in English
     */
    public static getEnglishName(language: SupportedLanguage): string {
        const englishNames: Record<SupportedLanguage, string> = {
            [SupportedLanguages.EN]: "English",
            [SupportedLanguages.ES]: "Spanish",
            [SupportedLanguages.DE]: "German",
            [SupportedLanguages.FR]: "French",
            [SupportedLanguages.IT]: "Italian", 
            [SupportedLanguages.CS]: "Czech",
            [SupportedLanguages.SK]: "Slovak"
        };
        
        return englishNames[language];
    }
}
