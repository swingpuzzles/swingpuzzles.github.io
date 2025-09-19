import { Control } from "@babylonjs/gui";
import languageManager, { SupportedLanguages, type SupportedLanguage } from "../../common/i18n/LanguageManager";
import ImageSelector from "./ImageSelector";

export default class I18nLanguageSelector extends ImageSelector {
    constructor(selectedLanguage?: SupportedLanguage) {
        const currentLang = selectedLanguage || languageManager.currentLanguage;
        const languageOptions = languageManager.getAllSupportedLanguages().map(lang => ({
            id: lang,
            highResUrl: languageManager.getLanguageFlagUrl(lang),
            lowResUrl: languageManager.getLanguageFlagSmallUrl(lang),
            selected: currentLang === lang
        }));

        super(languageOptions);
    }

    get id(): string {
        return 'i18n-language';
    }

    get widthCoef(): number {
        return 4 / 3;
    }

    public onSelectionChanged(callback: (language: SupportedLanguage) => void): void {
        this.selectionObserver = (id: string) => {
            const language = id as SupportedLanguage;
            if (Object.values(SupportedLanguages).includes(language)) {
                callback(language);
            }
        };
    }
}
