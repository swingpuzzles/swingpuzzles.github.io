export const CommonStorageKeys = {
    TutorialDone: "tutorialDone",
    GiftTutorialDone: "giftTutorialDone",
    CookiesAccepted: "cookiesAccepted",
    Category: "category",
    GiftPiecesCount: "giftPiecesCount"
};

export type CommonStorageKey = keyof typeof CommonStorageKeys;

// here is what we export as url data
export const GiftStorageKeys = {
    GiftTextColor: "giftTextColor",
    GiftName:  "giftName",
    GiftAge:  "giftAge",
    GiftLanguage:  "giftLanguage",
    GiftBackground: "giftBackground",
    GiftFontFamily: "giftFontFamily",
    GiftForeground: "giftForeground",
    GiftTables: "giftTables",
    GiftWishText: "giftWishText",
    NumPieces: "numPieces",
};

export type GiftStorageKey = keyof typeof GiftStorageKeys;

class LocalStorageManager {
    public set<T>(key: string, value: T): void {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            console.warn(`Failed to set localStorage item: ${key}`, e);
        }
    }

    public getString(key: string): string | null {
        return this.get<string>(key);
    }

    public getNumber(key: string): number | null {
        return this.get<number>(key);
    }

    public getBoolean(key: string): boolean {
        return this.get<boolean>(key) ?? false;
    }

    public get<T>(key: string): T | null {
        const item = localStorage.getItem(key);
        if (item === null) return null;
        try {
            return JSON.parse(item) as T;
        } catch (e) {
            console.warn(`Failed to parse localStorage item: ${key}`, e);
            return null;
        }
    }

    public remove(key: string): void {
        localStorage.removeItem(key);
    }

    public has(key: string): boolean {
        return localStorage.getItem(key) !== null;
    }

    public clear(): void {
        localStorage.clear();
    }
}

const localStorageManager = new LocalStorageManager();
export default localStorageManager;