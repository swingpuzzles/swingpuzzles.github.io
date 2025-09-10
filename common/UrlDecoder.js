var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import gameModeManager from "../core3d/behaviors/GameModeManager";
import giftMaker from "../gui/GiftMaker";
class UrlDecoder {
    constructor() { }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            const urlParams = new URLSearchParams(window.location.search);
            const encodedGiftData = urlParams.get("giftData");
            if (encodedGiftData) {
                yield this.processGiftData(encodedGiftData);
            }
        });
    }
    decodeGiftDataFromUrlParam(encoded) {
        try {
            const json = decodeURIComponent(atob(encoded));
            return JSON.parse(json);
        }
        catch (e) {
            console.warn("Failed to decode gift data:", e);
            return {};
        }
    }
    processGiftData(encodedGiftData) {
        return __awaiter(this, void 0, void 0, function* () {
            const giftData = this.decodeGiftDataFromUrlParam(encodedGiftData);
            if (yield giftMaker.parseUrlData(giftData)) {
                gameModeManager.enterGiftReceivedMode();
            }
        });
    }
}
const urlDecoder = new UrlDecoder();
export default urlDecoder;
