import { ColorPicker, Control, Image, Rectangle, StackPanel } from "@babylonjs/gui";
import popupHint, { PopupMode } from "./PopupHint";
import { ShaderMode } from "./ScreenShader";
import { FormInputModel } from "../model/FormInputModel";
import LanguageSelector from "./LanguageSelector";
import gameModeManager, { GameMode } from "../components/behaviors/GameModeManager";
import { Dropdown } from "./dropdowns/Dropdown";
import FontFamilyDropdownBuilder from "./dropdowns/FontFamilyDropdownBuilder";
import WishTextDropdownBuilder from "./dropdowns/WishTextDropdownBuilder";
import guiManager from "./GuiManager";
import sceneInitializer from "../components/SceneInitializer";
import ctx from "../components/common/SceneContext";
import ForegroundDropdownBuilder from "./dropdowns/ForegroundDropdownBuilder";
import BackgroundDropdownBuilder from "./dropdowns/BackgroundDropdownBuilder";
import { Color3, AbstractMesh } from "@babylonjs/core";
import puzzleEditor from "../components/misc/PuzzleEditor";
import TablesDropdownBuilder from "./dropdowns/TablesDropdownBuilder";
import { GiftBoxBuilder } from "../components/builders/GiftBoxBuilder";
import puzzleCircleBuilder from "../components/builders/PuzzleCircleBuilder";

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
        
        if (localStorage.getItem("giftTextColor")) {
            this.textColorChanged(Color3.FromHexString(localStorage.getItem("giftTextColor")!));
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
        localStorage.setItem("giftTextColor", this._textColor);
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

        this._languageSelector = new LanguageSelector(localStorage.getItem("giftLanguage") ?? "en");

        this._languageSelector.selectionObserver = (code: string) => {
            this._wishTextDropdown.lang = code;
        }

        const formInputModel: FormInputModel[] = [
            {
                id: "giftName",
                label: "Friend's Name",
                placeHolder: "e.g. Alex",
                type: "text",
                maxLength: 30
            },
            {
                id: "giftAge",
                label: "Coming Age",
                placeHolder: "e.g. 30",
                type: "number",
                min: 0,
                max: 150
            },
            {
                id: "giftLanguage",
                label: "Wish Language",
                placeHolder: "e.g. English",
                type: "selection",
                selector: this._languageSelector
            },
        ];

        popupHint.show(introText, "GIFT MAKING", 0.9, ShaderMode.SHADOW_WINDOW, Control.VERTICAL_ALIGNMENT_BOTTOM,
            () => { gameModeManager.enterGiftAdjustmentMode(); },
            () => { gameModeManager.enterGiftTryMode(); },
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
            localStorage.setItem(formRow.id, formRow.value!.toString());

            switch (formRow.id) {
                case "giftName": this._friendsName = formRow.value as string; break;
                case "giftAge": age = formRow.value as number; break;
                case "giftLanguage": lang = formRow.value as string; break;
            }
        }

        puzzleEditor.setFormData(this._friendsName, age);

        popupHint.show("", "GIFT MAKING", 0.9, ShaderMode.SHADOW_WINDOW_WIDE, Control.VERTICAL_ALIGNMENT_BOTTOM,
            () => { gameModeManager.enterGiftTryMode(); },
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
}

const giftMaker = new GiftMaker();
export default giftMaker;