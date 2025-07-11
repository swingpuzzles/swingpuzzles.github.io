import { ColorPicker, Control, Image, Rectangle, StackPanel } from "@babylonjs/gui";
import popupHint, { PopupMode } from "./PopupHint";
import { ShaderMode } from "./ScreenShader";
import { FormInputModel } from "../model/FormInputModel";
import LanguageSelector from "./LanguageSelector";
import gameModeManager, { GameMode } from "../core3d/behaviors/GameModeManager";
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
import localStorageManager, { GiftStorageKeys } from "../common/LocalStorageManager";
import translationManager from "../core3d/misc/TranslationManager";

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
        this._stack2.isVertical = false;
        this._stack2.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;

        this._colorPicker = new ColorPicker();
        this._colorPicker.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        this._colorPicker.paddingRightInPixels = 1;
        this._colorPicker.value = new Color3(0, 0, 0);
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
            this._colorPicker.isVisible = gameModeManager.currentMode === GameMode.GiftAdjustment;
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
        const introText = `Create a unique gift for someone special.

At the top, choose the puzzle dimensions to match your preferred difficulty.

Then, fill in the details below to personalize your custom puzzle — enter your friend's name, the age they're turning, and the language of your wish.`;

        this._languageSelector = new LanguageSelector(localStorageManager.getString("giftLanguage") ?? "en");

        this._languageSelector.selectionObserver = (code: string) => {
            this._wishTextDropdown.lang = code;
        }

        const formInputModel: FormInputModel[] = [
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
                placeHolder: "e.g. English",
                type: "selection",
                selector: this._languageSelector
            },
        ];

        popupHint.show(introText, "GIFT MAKING", 0.9, ShaderMode.SHADOW_WINDOW, Control.VERTICAL_ALIGNMENT_BOTTOM,
            () => { gameModeManager.enterGiftAdjustmentMode(); },
            () => { this.exitGiftMaking(); },
            null,
            null,
            PopupMode.Gift_Initial,
            formInputModel
        )
    }

    public enterAdjustments() {
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

        puzzleEditor.setFormData(this._friendsName, age);

        popupHint.show("", "GIFT MAKING", 0.9, ShaderMode.SHADOW_WINDOW_WIDE, Control.VERTICAL_ALIGNMENT_BOTTOM,
            () => {
                gameModeManager.enterGiftTryMode();
                this.makeGiftUrl();
            },
            () => { this.exitGiftMaking(); },
            () => { gameModeManager.enterGiftInitialMode(); },
            null,
            PopupMode.Gift_Adjustments_Preview
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
        guiManager.enterGeneralCategory();
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

    private makeGiftUrl() {
        const giftData = this.buildGiftDataFromLocalStorage();
        const encodedGiftData = this.encodeToCompressedUrlParam(giftData);

        const shareUrl = `http://localhost:3000/?giftData=${encodedGiftData}`;
        console.log("Compressed Share URL:", shareUrl);
    }

    public parseUrlData(giftData: Record<string, string>) {
        let age = 0;
        let lang = null;
        let textId = null;

        let imageName;
        let imageUrl;

        for (const [key, value] of Object.entries(giftData)) {
            switch (key) {
                case GiftStorageKeys.GiftBackground:
                    imageName = "bg-" + value + "-small.webp";
                    imageUrl = "assets/gift/bgs/" + imageName;

                    puzzleEditor.setBackgroundImage(imageUrl);
                    break;
                case GiftStorageKeys.GiftTables:
                    imageName = "table_" + value + "-small.webp";
                    imageUrl = "assets/gift/tables/" + imageName;
                    puzzleEditor.setTable(imageUrl, Number.parseInt(value));
                    break;

                case GiftStorageKeys.GiftForeground:
                    imageName = "torte_" + value + "-small.webp";
                    imageUrl = "assets/gift/tortes/" + imageName;

                    puzzleEditor.setTorte(imageName, Number.parseInt(value));
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
                    age = Number.parseInt(value, 10);
                    break;
                case GiftStorageKeys.GiftLanguage:
                    lang = value;
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
    }
}

const giftMaker = new GiftMaker();
export default giftMaker;