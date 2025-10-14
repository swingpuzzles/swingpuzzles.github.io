import { ColorPicker, Control, Image, Rectangle, StackPanel } from "@babylonjs/gui";
import popupHint from "./popups/PopupHint";
import { PopupMode } from "./popups/modes/PopupMode";
import { ShaderMode } from "./ScreenShader";
import { FormRowModel } from "../model/FormRowModel";
import LanguageSelector from "./selectors/LanguageSelector";
import gameModeManager, { MainMode } from "../core3d/behaviors/GameModeManager";
import { Dropdown } from "./dropdowns/Dropdown";
import FontFamilyDropdownBuilder from "./dropdowns/FontFamilyDropdownBuilder";
import WishTextDropdownBuilder from "./dropdowns/WishTextDropdownBuilder";
import guiManager from "./GuiManager";
import sceneInitializer from "../core3d/SceneInitializer";
import ctx from "../core3d/common/SceneContext";
import ForegroundDropdownBuilder from "./dropdowns/ForegroundDropdownBuilder";
import BackgroundDropdownBuilder from "./dropdowns/BackgroundDropdownBuilder";
import { Color3, AbstractMesh } from "@babylonjs/core";
import puzzleEditor from "../core3d/misc/PuzzleEditor";
import TablesDropdownBuilder from "./dropdowns/TablesDropdownBuilder";
import { GiftBoxBuilder } from "../core3d/builders/GiftBoxBuilder";
import puzzleCircleBuilder from "../core3d/builders/PuzzleCircleBuilder";
import localStorageManager, { CommonStorageKeys, GiftStorageKeys } from "../common/LocalStorageManager";
import translationManager from "../core3d/misc/TranslationManager";
import PiecesCountSelector from "./selectors/PiecesCountSelector";
import profanityGuard from "../common/ProfanityGuard";
import analyticsManager, { GiftCreationData } from "../common/AnalyticsManager";
import { i18nManager, TranslationKeys } from "../common/i18n";

class GiftMaker {
    private _languageSelector!: LanguageSelector;
    private _stack2!: StackPanel;
    private _fontFamilyDropdown!: Dropdown;
    private _wishTextDropdown!: Dropdown;
    private _foregroundDropdown!: Dropdown;
    private _tableDropdown!: Dropdown;
    private _backgroundDropdown!: Dropdown;
    private _colorPicker!: ColorPicker;
    private _gift?: AbstractMesh;

    private _friendsName!: string;
    private _fontFamily!: string;
    private _textColor!: string;

    constructor() {
    }

    public init() {
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
        } else {
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
            this._stack2.isVisible = gameModeManager.currentMode === MainMode.GiftAdjustment;
        });
    }

    public get friendsName(): string {
        return this._friendsName;
    }
    public get fontFamily(): string {
        return this._fontFamily;
    }
    public get textColor(): string {
        return this._textColor;
    }

    public textColorChanged(color: Color3) {
        this._textColor = color.toHexString();
        localStorageManager.set(GiftStorageKeys.GiftTextColor, this._textColor);
        this._wishTextDropdown.foreground = color;
        puzzleEditor.setTextColor(color);
    }

    public fontFamilyChanged(fontFamily: string): void {
        this._fontFamily = fontFamily;
        puzzleEditor.setFontFamily(fontFamily);
        this._wishTextDropdown.dropdownFontFamily = fontFamily;
    }

    public wishTextChanged(wishText: string): void {
        puzzleEditor.setWishText(wishText);
    }

    public fgChanged(url: string, index: number): void {
        puzzleEditor.setTorte(url, index);
    }

    public tableChanged(url: string, index: number): void {
        puzzleEditor.setTable(url, index);
    }

    public bgChanged(url: string): void {
        puzzleEditor.setBackgroundImage(url);
    }

    private resize() {
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
        } else {
            this._wishTextDropdown.leftInPixels = -dropdownWidth;
            this._fontFamilyDropdown.leftInPixels = 0; + dropdownHeight + 1;
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

    public start() {
        const introText = i18nManager.translate(TranslationKeys.GIFT.INTRO_MESSAGE);

        const selectedLang = localStorageManager.getString(GiftStorageKeys.GiftLanguage) ?? "en";
        this._languageSelector = new LanguageSelector(selectedLang);
        this._wishTextDropdown.lang = selectedLang;

        this._languageSelector.selectionObserver = (id: string) => {
            this._wishTextDropdown.lang = id;
        }

        const formInputModel: FormRowModel[] = [
            {
                id: GiftStorageKeys.GiftName,
                label: i18nManager.translate(TranslationKeys.UI.LABELS.FRIENDS_NAME),
                placeHolder: i18nManager.translate(TranslationKeys.UI.PLACEHOLDERS.FRIENDS_NAME),
                type: "text",
                maxLength: 30
            },
            {
                id: GiftStorageKeys.GiftAge,
                label: i18nManager.translate(TranslationKeys.UI.LABELS.COMING_AGE),
                placeHolder: i18nManager.translate(TranslationKeys.UI.PLACEHOLDERS.COMING_AGE),
                type: "number",
                min: 0,
                max: 150
            },
            {
                id: GiftStorageKeys.GiftLanguage,
                label: i18nManager.translate(TranslationKeys.UI.LABELS.WISH_LANGUAGE),
                type: "selection",
                selector: this._languageSelector
            },
        ];

        popupHint.show(TranslationKeys.GIFT.INTRO_MESSAGE, TranslationKeys.GIFT.TITLE, {}, {}, 0.98, ShaderMode.SHADOW_WINDOW, Control.VERTICAL_ALIGNMENT_BOTTOM,
            () => { gameModeManager.enterGiftAdjustmentMode(); },
            () => { this.exitGiftMaking(); },
            null,
            null,
            PopupMode.GiftInitial,
            formInputModel
        );
    }

    public async enterAdjustments(storeValues: boolean): Promise<boolean> {
        if (storeValues) {
            let age!: number;
            let lang!: string;

            for (const formRow of popupHint.formData) {
                localStorageManager.set(formRow.id, formRow.value!.toString());

                switch (formRow.id) {
                    case GiftStorageKeys.GiftName: this._friendsName = formRow.value as string; break;
                    case GiftStorageKeys.GiftAge: age = formRow.value as number; break;
                    case GiftStorageKeys.GiftLanguage: lang = formRow.value as string; break;
                }
            }

            if (await profanityGuard.isProfaneName(this._friendsName)) {
                return false; // 🚫 Bad name → block gift immediately
            }

            puzzleEditor.setFormData(this._friendsName, age);
            
            // Track gift creation start
            const giftData: GiftCreationData = {
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

        popupHint.show("", TranslationKeys.GIFT.STYLING_TITLE, {}, {}, 0.9, ShaderMode.SHADOW_WINDOW_WIDE, Control.VERTICAL_ALIGNMENT_BOTTOM,
            () => { gameModeManager.enterGiftOverviewMode(); },
            () => { this.exitGiftMaking(); },
            () => { gameModeManager.enterGiftInitialMode(); },
            null,
            PopupMode.GiftAdjustmentsPreview
        );

        return true;
    }

    public enterOverview() {
        const formModel: FormRowModel[] = [
            {
                id: "giftLink",
                label: i18nManager.translate(TranslationKeys.GIFT.COPY_LINK_LABEL),
                type: "share",
                link: this.makeGiftUrl()
            },
            {
                id: "tryIt",
                label: i18nManager.translate(TranslationKeys.GIFT.TRY_FIRST_LABEL),
                type: "button",
                buttonText: i18nManager.translate(TranslationKeys.GIFT.TRY_NOW_BUTTON),
                background: "#17a2b8",
                action: () => { gameModeManager.enterGiftTryMode(); }
            },
            {
                id: "orderCustom",
                label: i18nManager.translate(TranslationKeys.GIFT.TURN_INTO_REAL_LABEL),
                type: "button",
                buttonText: i18nManager.translate(TranslationKeys.GIFT.ORDER_PHYSICAL_BUTTON),
                background: "#28a745",
                action: () => { gameModeManager.enterGiftPhysicalOrientationMode(); }
            }
        ];

        popupHint.show(TranslationKeys.GIFT_OVERVIEW.MESSAGE, TranslationKeys.GIFT_OVERVIEW.TITLE, {}, {}, 0.99, ShaderMode.SHADOW_FULL, Control.VERTICAL_ALIGNMENT_CENTER,
            () => { this.exitGiftMaking(); },
            () => { this.exitGiftMaking(); },
            () => { gameModeManager.enterGiftAdjustmentMode(); },
            null,
            PopupMode.GiftAdjustmentsOverview,
            formModel
        );
    }

    public enterGiftPhysicalOrientation() {
        const formModel: FormRowModel[] = [
            {
                id: "horizPhysical",
                label: i18nManager.translate(TranslationKeys.GIFT_OVERVIEW.ORIENTATION_HORIZONTAL_LABEL),
                type: "radioButton",
                buttonText: i18nManager.translate(TranslationKeys.GIFT_OVERVIEW.ORIENTATION_HORIZONTAL_BUTTON),
                background: "#2c3e50",
                action: () => { popupHint.vertical = false; },
                selected: !popupHint.vertical
            },
            {
                id: "vertPhysical",
                label: i18nManager.translate(TranslationKeys.GIFT_OVERVIEW.ORIENTATION_VERTICAL_LABEL),
                type: "radioButton",
                buttonText: i18nManager.translate(TranslationKeys.GIFT_OVERVIEW.ORIENTATION_VERTICAL_BUTTON),
                background: "#34495e",
                action: () => { popupHint.vertical = true; },
                selected: popupHint.vertical
            }
        ];

        popupHint.show(TranslationKeys.GIFT_OVERVIEW.ORIENTATION_MESSAGE, TranslationKeys.GIFT_OVERVIEW.ORIENTATION_TITLE, {}, {}, 1.02, ShaderMode.SHADOW_FULL, Control.VERTICAL_ALIGNMENT_CENTER,
            () => {
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
            },
            () => { this.exitGiftMaking(); },
            () => { gameModeManager.enterGiftOverviewMode(); },
            null,
            PopupMode.GiftPhysicalInitial,
            formModel
        )
    }

    public enterGiftPhysicalFinal() {
        const vertMap = new Map();
        const horizMap = new Map();
        vertMap.set("300", "https://amzn.to/46l1v31");
        vertMap.set("500", "https://amzn.to/46a6m6U");
        vertMap.set("1000", "https://amzn.to/46kE35S");
        horizMap.set("300", "https://amzn.to/48fIvFD");
        horizMap.set("500", "https://amzn.to/465Jrv2");
        horizMap.set("1000", "https://amzn.to/4gjZ6tT");

        const vertical = popupHint.vertical;

        const selectedPiecesCount = localStorageManager.getString(CommonStorageKeys.GiftPiecesCount) ?? "1000";
        const piecesSelector = new PiecesCountSelector(selectedPiecesCount);

        let link = vertical ? vertMap.get(selectedPiecesCount) : horizMap.get(selectedPiecesCount);
        piecesSelector.selectionObserver = (id: string) => {
            link = vertical ? vertMap.get(id) : horizMap.get(id);
        }

        const formModel: FormRowModel[] = [
            {
                id: CommonStorageKeys.GiftPiecesCount,
                label: i18nManager.translate(TranslationKeys.GIFT.PIECES_COUNT_LABEL),
                type: "selection",
                selector: piecesSelector
            },
        ];

        popupHint.show(TranslationKeys.GIFT_OVERVIEW.SIZE_INSTRUCTION, TranslationKeys.GIFT_OVERVIEW.SIZE_TITLE, {}, {}, 0.98, ShaderMode.SHADOW_FULL, Control.VERTICAL_ALIGNMENT_CENTER,
            () => {
                analyticsManager.trackGiftShared('gift_shared', 'amazon');
                window.open(link, "_blank");
            },
            () => { this.exitGiftMaking(); },
            () => { gameModeManager.enterGiftPhysicalOrientationMode(); },
            null,
            PopupMode.GiftPhysicalFinal,
            formModel
        )
    }

    public async tryGift() {
        puzzleCircleBuilder.clear();
        popupHint.hide();

        if (!this._gift) {
            const builder = new GiftBoxBuilder();
            this._gift = await builder.build(this._friendsName, this._fontFamily, this._textColor);
        }
    }

    public exitGiftMaking(): void {
        popupHint.hide();
        //guiManager.enterGeneralCategory();
    }

    private buildGiftDataFromLocalStorage(): Record<string, string> {
        const data: Record<string, string> = {};

        for (const key of Object.values(GiftStorageKeys)) {
            const value = localStorageManager.getString(key);
            if (value !== null) {
                data[key] = value;
            }
        }

        return data;
    }

    private encodeToCompressedUrlParam(data: object): string {
        const json = JSON.stringify(data);
        return btoa(encodeURIComponent(json)); // Simple compression via encodeURIComponent + Base64
    }

    private makeGiftUrl(): string {
        const giftData = this.buildGiftDataFromLocalStorage();
        const encodedGiftData = this.encodeToCompressedUrlParam(giftData);

        return `https://swingpuzzles.com/?giftData=${encodedGiftData}`;
    }

    public async parseUrlData(giftData: Record<string, string>): Promise<boolean> {
        let friendsName: string | null = null;

        // First pass: just extract the name and validate it
        if (GiftStorageKeys.GiftName in giftData) {
            friendsName = giftData[GiftStorageKeys.GiftName] ?? "";
            if (await profanityGuard.isProfaneName(friendsName)) {
                return false; // 🚫 Bad name → block gift immediately
            }
        }

        // Now safely parse the rest
        let age = 0;
        let lang: string | null = null;
        let textId: string | null = null;

        for (const [key, value] of Object.entries(giftData)) {
            switch (key) {
                case GiftStorageKeys.GiftBackground:
                    puzzleEditor.setBackgroundImage(`assets/gift/bgs/bg-${value}-small.webp`);
                    break;

                case GiftStorageKeys.GiftTables:
                    puzzleEditor.setTable(`assets/gift/tables/table_${value}-small.webp`, Number.parseInt(value) || 0);
                    break;

                case GiftStorageKeys.GiftForeground:
                    puzzleEditor.setTorte(`"assets/gift/tortes/torte_${value}-small.webp`, Number.parseInt(value) || 0);
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
    }
}

const giftMaker = new GiftMaker();
export default giftMaker;