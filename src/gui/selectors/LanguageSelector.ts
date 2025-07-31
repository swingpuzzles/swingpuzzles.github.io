import { GiftStorageKeys } from "../../common/LocalStorageManager";
import ImageSelector from "./ImageSelector";

export default class LanguageSelector extends ImageSelector {
    constructor(selectedLanguage: string) {
        const languageCodes = ["en", "es", "de", "fr", "it", "cs", "sk"];

        const languages = languageCodes.map(code => ({
            id: code,
            highResUrl: `assets/flags/${code}.webp`,
            lowResUrl: `assets/flags/${code}-small.webp`,
            selected: selectedLanguage === code
        }));

        super(languages);
    }

    get id(): string {
        return GiftStorageKeys.GiftLanguage;
    }

    get widthCoef(): number {
        return 4 / 3;
    }
}