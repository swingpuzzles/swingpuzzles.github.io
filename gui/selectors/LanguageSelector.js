import { GiftStorageKeys } from "../../common/LocalStorageManager";
import ImageSelector from "./ImageSelector";
export default class LanguageSelector extends ImageSelector {
    constructor(selectedLanguage) {
        const languageCodes = ["en", "es", "de", "fr", "it", "cs", "sk"];
        const languages = languageCodes.map(code => ({
            id: code,
            highResUrl: `assets/flags/${code}.webp`,
            lowResUrl: `assets/flags/${code}-small.webp`,
            selected: selectedLanguage === code
        }));
        super(languages);
    }
    get id() {
        return GiftStorageKeys.GiftLanguage;
    }
    get widthCoef() {
        return 4 / 3;
    }
}
