var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { ColorPicker, Control, StackPanel } from "@babylonjs/gui";
import popupHint, { PopupMode } from "./PopupHint";
import { ShaderMode } from "./ScreenShader";
import LanguageSelector from "./selectors/LanguageSelector";
import gameModeManager, { GameMode } from "../core3d/behaviors/GameModeManager";
import FontFamilyDropdownBuilder from "./dropdowns/FontFamilyDropdownBuilder";
import WishTextDropdownBuilder from "./dropdowns/WishTextDropdownBuilder";
import guiManager from "./GuiManager";
import sceneInitializer from "../core3d/SceneInitializer";
import ctx from "../core3d/common/SceneContext";
import ForegroundDropdownBuilder from "./dropdowns/ForegroundDropdownBuilder";
import BackgroundDropdownBuilder from "./dropdowns/BackgroundDropdownBuilder";
import { Color3 } from "@babylonjs/core";
import puzzleEditor from "../core3d/misc/PuzzleEditor";
import TablesDropdownBuilder from "./dropdowns/TablesDropdownBuilder";
import { GiftBoxBuilder } from "../core3d/builders/GiftBoxBuilder";
import puzzleCircleBuilder from "../core3d/builders/PuzzleCircleBuilder";
import localStorageManager, { CommonStorageKeys, GiftStorageKeys } from "../common/LocalStorageManager";
import translationManager from "../core3d/misc/TranslationManager";
import PiecesCountSelector from "./selectors/PiecesCountSelector";
import profanityGuard from "../common/ProfanityGuard";
import analyticsManager from "../common/AnalyticsManager";
class GiftMaker {
    constructor() {
    }
    init() {
        this._wishTextDropdown = new WishTextDropdownBuilder().build(true);
        this._wishTextDropdown.paddingRightInPixels = 1;
        guiManager.advancedTexture.addControl(this._wishTextDropdown);
        this._fontFamilyDropdown = new FontFamilyDropdownBuilder().build(true);
        this._fontFamilyDropdown.paddingRightInPixels = 1;
        guiManager.advancedTexture.addControl(this._fontFamilyDropdown);
        this._stack2 = new StackPanel();
        this._stack2.zIndex = 300;
        this._stack2.isVertical = false;
        this._stack2.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        this._colorPicker = new ColorPicker();
        this._colorPicker.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        this._colorPicker.paddingRightInPixels = 1;
        this._colorPicker.value = new Color3(0, 0, 0);
        this._colorPicker.hoverCursor = "pointer";
        this._colorPicker.onValueChangedObservable.add((color) => {
            this.textColorChanged(color);
        });
        const giftTextColor = localStorageManager.getString(GiftStorageKeys.GiftTextColor);
        if (giftTextColor) {
            this.textColorChanged(Color3.FromHexString(giftTextColor));
        }
        else {
            this.textColorChanged(Color3.FromHexString("#FF6F61"));
        }
        this._stack2.addControl(this._colorPicker);
        this._foregroundDropdown = new ForegroundDropdownBuilder().build(true);
        this._foregroundDropdown.paddingRightInPixels = 1;
        this._stack2.addControl(this._foregroundDropdown);
        this._tableDropdown = new TablesDropdownBuilder().build(true);
        this._tableDropdown.paddingRightInPixels = 1;
        this._stack2.addControl(this._tableDropdown);
        this._backgroundDropdown = new BackgroundDropdownBuilder().build(true);
        this._backgroundDropdown.paddingRightInPixels = 1;
        this._stack2.addControl(this._backgroundDropdown);
        guiManager.advancedTexture.addControl(this._stack2);
        this.resize();
        sceneInitializer.addResizeObserver((width, height) => {
            this.resize();
        });
        gameModeManager.addGameModeChangedObserver(() => {
            this._colorPicker.isVisible = gameModeManager.currentMode === GameMode.GiftAdjustment;
            this._stack2.isVisible = gameModeManager.currentMode === GameMode.GiftAdjustment;
        });
    }
    get friendsName() {
        return this._friendsName;
    }
    get fontFamily() {
        return this._fontFamily;
    }
    get textColor() {
        return this._textColor;
    }
    textColorChanged(color) {
        this._textColor = color.toHexString();
        localStorageManager.set(GiftStorageKeys.GiftTextColor, this._textColor);
        this._wishTextDropdown.foreground = color;
        puzzleEditor.setTextColor(color);
    }
    fontFamilyChanged(fontFamily) {
        this._fontFamily = fontFamily;
        puzzleEditor.setFontFamily(fontFamily);
        this._wishTextDropdown.dropdownFontFamily = fontFamily;
    }
    wishTextChanged(wishText) {
        puzzleEditor.setWishText(wishText);
    }
    fgChanged(url, index) {
        puzzleEditor.setTorte(url, index);
    }
    tableChanged(url, index) {
        puzzleEditor.setTable(url, index);
    }
    bgChanged(url) {
        puzzleEditor.setBackgroundImage(url);
    }
    resize() {
        const renderWidth = ctx.engine.getRenderWidth();
        const renderHeight = ctx.engine.getRenderHeight();
        const vertical = renderHeight > renderWidth;
        const dropdownWidth = Math.min(renderWidth, renderHeight * (vertical ? 1 / 1.5 : 1.5)) * (vertical ? 0.45 : 0.3);
        const dropdownHeight = dropdownWidth / 5;
        const iconHeight = vertical ? dropdownHeight * 1.25 : dropdownHeight;
        this._wishTextDropdown.top = dropdownHeight / 4;
        this._stack2.top = dropdownHeight / 4;
        this._stack2.widthInPixels = dropdownWidth;
        this._stack2.heightInPixels = iconHeight;
        if (vertical) {
            this._wishTextDropdown.leftInPixels = -dropdownWidth / 2;
            this._fontFamilyDropdown.leftInPixels = -dropdownWidth / 2;
            this._fontFamilyDropdown.top = dropdownHeight / 4 + dropdownHeight + 1;
            this._stack2.leftInPixels = dropdownWidth / 2;
        }
        else {
            this._wishTextDropdown.leftInPixels = -dropdownWidth;
            this._fontFamilyDropdown.leftInPixels = 0;
            +dropdownHeight + 1;
            this._fontFamilyDropdown.top = dropdownHeight / 4;
            this._stack2.leftInPixels = dropdownWidth;
        }
        this._colorPicker.widthInPixels = iconHeight;
        this._colorPicker.heightInPixels = iconHeight;
        this._wishTextDropdown.resize(dropdownWidth, dropdownHeight, dropdownWidth, true);
        this._fontFamilyDropdown.resize(dropdownWidth, dropdownHeight, dropdownWidth, true);
        this._foregroundDropdown.resize(iconHeight, iconHeight, iconHeight, true);
        this._tableDropdown.resize(iconHeight, iconHeight, iconHeight, true);
        this._backgroundDropdown.resize(iconHeight, iconHeight, iconHeight, true);
    }
    start() {
        var _a;
        const introText = `Create a unique gift for someone special.

At the top, choose the puzzle dimensions to match your preferred difficulty.

Then, fill in the details below to personalize your custom puzzle — enter your friend's name, the age they're turning, and the language of your wish.`;
        const selectedLang = (_a = localStorageManager.getString(GiftStorageKeys.GiftLanguage)) !== null && _a !== void 0 ? _a : "en";
        this._languageSelector = new LanguageSelector(selectedLang);
        this._wishTextDropdown.lang = selectedLang;
        this._languageSelector.selectionObserver = (id) => {
            this._wishTextDropdown.lang = id;
        };
        const formInputModel = [
            {
                id: GiftStorageKeys.GiftName,
                label: "Friend's Name",
                placeHolder: "e.g. Alex",
                type: "text",
                maxLength: 30
            },
            {
                id: GiftStorageKeys.GiftAge,
                label: "Coming Age",
                placeHolder: "e.g. 30",
                type: "number",
                min: 0,
                max: 150
            },
            {
                id: GiftStorageKeys.GiftLanguage,
                label: "Wish Language",
                type: "selection",
                selector: this._languageSelector
            },
        ];
        popupHint.show(introText, "↓↑ GIFT MAKING ↖↙", 0.92, ShaderMode.SHADOW_WINDOW, Control.VERTICAL_ALIGNMENT_CENTER, () => { gameModeManager.enterGiftAdjustmentMode(); }, () => { this.exitGiftMaking(); }, null, null, PopupMode.Gift_Initial, formInputModel);
    }
    enterAdjustments(storeValues) {
        return __awaiter(this, void 0, void 0, function* () {
            if (storeValues) {
                let age;
                let lang;
                for (const formRow of popupHint.formData) {
                    localStorageManager.set(formRow.id, formRow.value.toString());
                    switch (formRow.id) {
                        case GiftStorageKeys.GiftName:
                            this._friendsName = formRow.value;
                            break;
                        case GiftStorageKeys.GiftAge:
                            age = formRow.value;
                            break;
                        case GiftStorageKeys.GiftLanguage:
                            lang = formRow.value;
                            break;
                    }
                }
                if (yield profanityGuard.isProfaneName(this._friendsName)) {
                    return false; // 🚫 Bad name → block gift immediately
                }
                puzzleEditor.setFormData(this._friendsName, age);
                // Track gift creation start
                const giftData = {
                    giftId: `gift_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    friendName: this._friendsName,
                    age: age,
                    language: lang,
                    background: localStorageManager.getString(GiftStorageKeys.GiftBackground) || 'default',
                    fontFamily: localStorageManager.getString(GiftStorageKeys.GiftFontFamily) || 'default',
                    foreground: localStorageManager.getString(GiftStorageKeys.GiftForeground) || 'default',
                    wishText: localStorageManager.getString(GiftStorageKeys.GiftWishText) || '',
                    piecesCount: parseInt(localStorageManager.getString(GiftStorageKeys.NumPieces) || '1000'),
                    creationTime: Date.now()
                };
                analyticsManager.trackGiftCreation(giftData);
            }
            popupHint.show("", "↑ ↑ ↑ GIFT STYLING ↑ ↑ ↑", 0.9, ShaderMode.SHADOW_WINDOW_WIDE, Control.VERTICAL_ALIGNMENT_BOTTOM, () => { gameModeManager.enterGiftOverviewMode(); }, () => { this.exitGiftMaking(); }, () => { gameModeManager.enterGiftInitialMode(); }, null, PopupMode.Gift_Adjustments_Preview);
            return true;
        });
    }
    enterOverview() {
        const formModel = [
            {
                id: "giftLink",
                label: "Copy the link or share directly:",
                type: "share",
                link: this.makeGiftUrl()
            },
            {
                id: "tryIt",
                label: "Try the gift first before sending:",
                type: "button",
                buttonText: "🎮 Try Now!",
                background: "#17a2b8",
                action: () => { gameModeManager.enterGiftTryMode(); }
            },
            {
                id: "orderCustom",
                label: "Reveal a quick guide on how to turn the puzzle into a real-life surprise:",
                type: "button",
                buttonText: "🛍️ Order Physical Puzzle",
                background: "#28a745",
                action: () => { gameModeManager.enterGiftPhysicalOrientationMode(); }
            }
        ];
        popupHint.show(`🧩 **Puzzle Gift Created with Love!**

You’ve crafted a custom puzzle — now it’s time to share the surprise.
🎁 Send the link to your friend and let the joy begin.
🌟 Curious? You can preview it yourself.
📦 Want to make it even more special? Order a real-life version as a keepsake.`, "GIFT OVERVIEW", 0.9, ShaderMode.SHADOW_FULL, Control.VERTICAL_ALIGNMENT_CENTER, () => { this.exitGiftMaking(); }, () => { this.exitGiftMaking(); }, () => { gameModeManager.enterGiftAdjustmentMode(); }, null, PopupMode.Gift_Adjustments_Overview, formModel);
    }
    enterGiftPhysicalOrientation() {
        const formModel = [
            {
                id: "horizPhysical",
                label: "🖼️ Horizontal (Landscape) for wide scenes",
                type: "radioButton",
                buttonText: "🖼️ Horizontal",
                background: "#2c3e50",
                action: () => { popupHint.vertical = false; },
                selected: !popupHint.vertical
            },
            {
                id: "vertPhysical",
                label: "📱 Vertical (Portrait) for tall layouts",
                type: "radioButton",
                buttonText: "📱 Vertical",
                background: "#34495e",
                action: () => { popupHint.vertical = true; },
                selected: popupHint.vertical
            }
        ];
        popupHint.show(`🧩 Before ordering your physical puzzle, pick the image orientation.

When you tap Next, your custom puzzle image will be automatically downloaded.

Then we’ll guide you to Amazon, where you can upload it and complete your gift order.

Image orientation:`, "PUZZLE ORIENTATION", 1.02, ShaderMode.SHADOW_FULL, Control.VERTICAL_ALIGNMENT_CENTER, () => {
            const now = new Date();
            const timestamp = now.toISOString().replace(/[:.]/g, "-");
            const orientation = popupHint.vertical ? "portrait" : "landscape";
            const linkElement = document.createElement("a");
            linkElement.href = puzzleEditor.dataUrl;
            linkElement.download = `PUZZLE-${orientation}-${timestamp}.png`;
            linkElement.style.display = "none";
            document.body.appendChild(linkElement);
            linkElement.click();
            document.body.removeChild(linkElement);
            gameModeManager.enterGiftPhysicalFinalMode();
        }, () => { this.exitGiftMaking(); }, () => { gameModeManager.enterGiftOverviewMode(); }, null, PopupMode.Gift_Physical_Initial, formModel);
    }
    enterGiftPhysicalFinal() {
        var _a;
        const vertMap = new Map();
        const horizMap = new Map();
        vertMap.set("300", "https://amzn.to/4l1UOs5");
        vertMap.set("500", "https://amzn.to/3UBvGNM");
        vertMap.set("1000", "https://amzn.to/3UFp4xW");
        horizMap.set("300", "https://amzn.to/4la3QmS");
        horizMap.set("500", "https://amzn.to/40JAhBe");
        horizMap.set("1000", "https://amzn.to/4fq6kw3");
        const vertical = popupHint.vertical;
        const selectedPiecesCount = (_a = localStorageManager.getString(CommonStorageKeys.GiftPiecesCount)) !== null && _a !== void 0 ? _a : "1000";
        const piecesSelector = new PiecesCountSelector(selectedPiecesCount);
        let link = vertical ? vertMap.get(selectedPiecesCount) : horizMap.get(selectedPiecesCount);
        piecesSelector.selectionObserver = (id) => {
            link = vertical ? vertMap.get(id) : horizMap.get(id);
        };
        const formModel = [
            {
                id: CommonStorageKeys.GiftPiecesCount,
                label: "Count of Puzzle Pieces",
                type: "selection",
                selector: piecesSelector
            },
        ];
        popupHint.show(`🧩 **Your Puzzle Image Is Downloading!**

You're just one step away from turning it into a real gift.

1. **Choose the puzzle size** (# of pieces) below.
2. Tap **"Get it on Amazon"** to open the product page.
3. On Amazon:
   • Click **Customize Now**
   • Click **Upload** and select the image you just downloaded (starts with “PUZZLE-...” and you'll find it under your downloads folder)
   • Click **Add to Cart**, then **Go to Cart** and **Proceed to Checkout**

You’ll soon have your custom puzzle delivered! 🎁`, "PUZZLE SIZE", 1.02, ShaderMode.SHADOW_FULL, Control.VERTICAL_ALIGNMENT_CENTER, () => {
            analyticsManager.trackGiftShared('gift_shared', 'amazon');
            window.open(link, "_blank");
        }, () => { this.exitGiftMaking(); }, () => { gameModeManager.enterGiftPhysicalOrientationMode(); }, null, PopupMode.Gift_Physical_Final, formModel);
    }
    tryGift() {
        return __awaiter(this, void 0, void 0, function* () {
            puzzleCircleBuilder.clear();
            popupHint.hide();
            if (!this._gift) {
                const builder = new GiftBoxBuilder();
                this._gift = yield builder.build(this._friendsName, this._fontFamily, this._textColor);
            }
        });
    }
    exitGiftMaking() {
        popupHint.hide();
        guiManager.enterGeneralCategory();
    }
    buildGiftDataFromLocalStorage() {
        const data = {};
        for (const key of Object.values(GiftStorageKeys)) {
            const value = localStorageManager.getString(key);
            if (value !== null) {
                data[key] = value;
            }
        }
        return data;
    }
    encodeToCompressedUrlParam(data) {
        const json = JSON.stringify(data);
        return btoa(encodeURIComponent(json)); // Simple compression via encodeURIComponent + Base64
    }
    makeGiftUrl() {
        const giftData = this.buildGiftDataFromLocalStorage();
        const encodedGiftData = this.encodeToCompressedUrlParam(giftData);
        return `http://localhost:3000/?giftData=${encodedGiftData}`;
    }
    parseUrlData(giftData) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            let friendsName = null;
            // First pass: just extract the name and validate it
            if (GiftStorageKeys.GiftName in giftData) {
                friendsName = (_a = giftData[GiftStorageKeys.GiftName]) !== null && _a !== void 0 ? _a : "";
                if (yield profanityGuard.isProfaneName(friendsName)) {
                    return false; // 🚫 Bad name → block gift immediately
                }
            }
            // Now safely parse the rest
            let age = 0;
            let lang = null;
            let textId = null;
            for (const [key, value] of Object.entries(giftData)) {
                switch (key) {
                    case GiftStorageKeys.GiftBackground:
                        puzzleEditor.setBackgroundImage(`assets/gift/bgs/bg-${value}-small.webp`);
                        break;
                    case GiftStorageKeys.GiftTables:
                        puzzleEditor.setTable(`assets/gift/tables/table_${value}-small.webp`, Number.parseInt(value) || 0);
                        break;
                    case GiftStorageKeys.GiftForeground:
                        puzzleEditor.setTorte(`torte_${value}-small.webp`, Number.parseInt(value) || 0);
                        break;
                    case GiftStorageKeys.GiftFontFamily:
                        this._fontFamily = value;
                        puzzleEditor.setFontFamily(value);
                        break;
                    case GiftStorageKeys.GiftTextColor:
                        this._textColor = value;
                        puzzleEditor.setTextColor(Color3.FromHexString(value));
                        break;
                    case GiftStorageKeys.GiftWishText:
                        textId = value;
                        break;
                    case GiftStorageKeys.GiftName:
                        this._friendsName = value;
                        break;
                    case GiftStorageKeys.GiftAge:
                        age = Number.parseInt(value, 10) || 0;
                        break;
                    case GiftStorageKeys.GiftLanguage:
                        lang = value;
                        break;
                    case GiftStorageKeys.NumPieces:
                        guiManager.setPiecesCount(Number.parseInt(value) || 0);
                        break;
                    default:
                        console.warn(`Unhandled gift data key: ${key}`);
                        break;
                }
            }
            puzzleEditor.setFormData(this._friendsName, age);
            if (textId && lang) {
                const wishText = translationManager.translateWishText(textId, lang);
                if (wishText) {
                    puzzleEditor.setWishText(wishText);
                }
            }
            // Track gift received
            analyticsManager.trackGiftReceived('gift_received_from_url');
            return true; // ✅ Safe gift
        });
    }
}
const giftMaker = new GiftMaker();
export default giftMaker;
