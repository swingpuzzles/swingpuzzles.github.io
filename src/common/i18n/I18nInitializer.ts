import { languageManager, i18nManager } from "./index";
import { LanguageDetector } from "./LanguageDetector";

/**
 * Initializes the i18n system with proper language detection and setup
 */
export class I18nInitializer {
    /**
     * Initialize the i18n system
     * Should be called early in the application lifecycle
     */
    public static initialize(): void {
        // Detect the best available language
        const detectedLanguage = LanguageDetector.detectBestLanguage();
        
        // Set the detected language as current
        languageManager.setLanguage(detectedLanguage);
        
        // Log initialization for debugging
        console.log(`i18n initialized with language: ${detectedLanguage}`);
        
        // Make i18n system globally available for debugging
        (window as any).i18nManager = i18nManager;
        (window as any).languageManager = languageManager;
    }

    /**
     * Get the current language for display purposes
     */
    public static getCurrentLanguageInfo(): { code: string; name: string; nativeName: string } {
        const currentLang = languageManager.currentLanguage;
        return {
            code: currentLang,
            name: LanguageDetector.getEnglishName(currentLang),
            nativeName: LanguageDetector.getNativeName(currentLang)
        };
    }

    /**
     * Check if translations are available for the current language
     */
    public static hasTranslationsForCurrentLanguage(): boolean {
        return i18nManager.hasTranslations(languageManager.currentLanguage);
    }

    /**
     * Get list of available languages with translation status
     */
    public static getAvailableLanguagesWithStatus(): Array<{
        code: string;
        name: string;
        nativeName: string;
        hasTranslations: boolean;
    }> {
        const allLanguages = languageManager.getAllSupportedLanguages();
        
        return allLanguages.map(lang => ({
            code: lang,
            name: LanguageDetector.getEnglishName(lang),
            nativeName: LanguageDetector.getNativeName(lang),
            hasTranslations: i18nManager.hasTranslations(lang)
        }));
    }
}
