import gameModeManager from "../core3d/behaviors/GameModeManager";
import giftMaker from "../gui/GiftMaker";

class UrlDecoder {
    constructor() {}

    async init() {
        const urlParams = new URLSearchParams(window.location.search);
        const encodedGiftData = urlParams.get("giftData");

        if (encodedGiftData) {
            const giftData = this.decodeGiftDataFromUrlParam(encodedGiftData);
            
            if (await giftMaker.parseUrlData(giftData)) {
                gameModeManager.enterGiftReceivedMode();
            }   
        }
    }

    decodeGiftDataFromUrlParam(encoded: string): Record<string, string> {
        try {
            const json = decodeURIComponent(atob(encoded));
            return JSON.parse(json);
        } catch (e) {
            console.warn("Failed to decode gift data:", e);
            return {};
        }
    }
}

const urlDecoder = new UrlDecoder();
export default urlDecoder;
