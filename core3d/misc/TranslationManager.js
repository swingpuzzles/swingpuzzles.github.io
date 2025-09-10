import wishes from '../../assets/data/wishes.json';
export const TranslationSectionKeys = {
    GiftWishText: "giftWishText",
};
class TranslationManager {
    constructor() {
        this._rootMap = new Map();
        this.addSection(TranslationSectionKeys.GiftWishText, wishes.wishes);
    }
    addSection(name, entries) {
        const sectionMap = new Map();
        for (let te of entries) {
            let innerMap = new Map();
            for (const [lang, text] of Object.entries(te.translations)) {
                innerMap.set(lang, text);
            }
            sectionMap.set(te.id, innerMap);
        }
        this._rootMap.set(name, sectionMap);
    }
    getSection(name) {
        var _a;
        return (_a = this._rootMap.get(name)) !== null && _a !== void 0 ? _a : null;
    }
    translate(section, textId, lang) {
        var _a, _b, _c;
        return (_c = (_b = (_a = this._rootMap.get(section)) === null || _a === void 0 ? void 0 : _a.get(textId)) === null || _b === void 0 ? void 0 : _b.get(lang)) !== null && _c !== void 0 ? _c : null;
    }
    translateWishText(textId, lang) {
        var _a, _b, _c;
        return (_c = (_b = (_a = this._rootMap.get(TranslationSectionKeys.GiftWishText)) === null || _a === void 0 ? void 0 : _a.get(textId)) === null || _b === void 0 ? void 0 : _b.get(lang)) !== null && _c !== void 0 ? _c : null;
    }
}
const translationManager = new TranslationManager();
export default translationManager;
