export const CommonStorageKeys = {
    TutorialDone: "tutorialDone",
    GiftTutorialDone: "giftTutorialDone",
    CookiesAccepted: "cookiesAccepted",
    WelcomeSeen: "welcomeSeen",
    Category: "category",
    GiftPiecesCount: "giftPiecesCount"
};
// here is what we export as url data
export const GiftStorageKeys = {
    GiftTextColor: "giftTextColor",
    GiftName: "giftName",
    GiftAge: "giftAge",
    GiftLanguage: "giftLanguage",
    GiftBackground: "giftBackground",
    GiftFontFamily: "giftFontFamily",
    GiftForeground: "giftForeground",
    GiftTables: "giftTables",
    GiftWishText: "giftWishText",
    NumPieces: "numPieces",
};
class LocalStorageManager {
    set(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        }
        catch (e) {
            console.warn(`Failed to set localStorage item: ${key}`, e);
        }
    }
    getString(key) {
        return this.get(key);
    }
    getNumber(key) {
        return this.get(key);
    }
    getBoolean(key) {
        var _a;
        return (_a = this.get(key)) !== null && _a !== void 0 ? _a : false;
    }
    get(key) {
        const item = localStorage.getItem(key);
        if (item === null)
            return null;
        try {
            return JSON.parse(item);
        }
        catch (e) {
            console.warn(`Failed to parse localStorage item: ${key}`, e);
            return null;
        }
    }
    remove(key) {
        localStorage.removeItem(key);
    }
    has(key) {
        return localStorage.getItem(key) !== null;
    }
    clear() {
        localStorage.clear();
    }
}
const localStorageManager = new LocalStorageManager();
export default localStorageManager;
