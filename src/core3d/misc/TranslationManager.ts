import { ITranslationEntry } from "../../interfaces/ITranslationEntry";
import wishes from '../../assets/data/wishes.json'


export const TranslationSectionKeys = {
    GiftWishText: "giftWishText",
};

class TranslationManager {
    private _rootMap: Map<string, Map<string, Map<string, string>>> = new Map();

    constructor() {
        this.addSection(TranslationSectionKeys.GiftWishText, wishes.wishes);
    }

    private addSection(name: string, entries: ITranslationEntry[]) {
        const sectionMap: Map<string, Map<string, string>> = new Map();

        for (let te of entries) {
            let innerMap: Map<string, string> = new Map();

            for (const [lang, text] of Object.entries(te.translations)) {
                innerMap.set(lang, text);
            }

            sectionMap.set(te.id, innerMap);
        }

        this._rootMap.set(name, sectionMap);
    }

    public getSection(name: string): Map<string, Map<string, string>> | null {
        return this._rootMap.get(name) ?? null;
    }

    public translate(section: string, textId: string, lang: string): string | null {
        return this._rootMap.get(section)?.get(textId)?.get(lang) ?? null;
    }

    public translateWishText(textId: string, lang: string): string | null {
        return this._rootMap.get(TranslationSectionKeys.GiftWishText)?.get(textId)?.get(lang) ?? null;
    }
}

const translationManager = new TranslationManager();
export default translationManager;
