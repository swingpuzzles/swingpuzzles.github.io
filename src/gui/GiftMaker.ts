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
import { Color3 } from "@babylonjs/core";
import puzzleAssetsManager from "../components/behaviors/PuzzleAssetsManager";
import puzzleEditor from "../components/misc/PuzzleEditor";

class GiftMaker {
    private _languageSelector!: LanguageSelector;
    private _dropdownStack!: StackPanel;
    private _stack1!: StackPanel;
    private _stack2!: StackPanel;
    private _fontFamilyDropdown!: Dropdown;
    private _wishTextDropdown!: Dropdown;
    private _foregroundDropdown!: Dropdown;
    private _backgroundDropdown!: Dropdown;
    private _colorPicker!: ColorPicker;

    constructor() {
    }

    public init() {
        this._languageSelector = new LanguageSelector();

        this._stack1 = new StackPanel();
        this._stack1.isVertical = false;

        this._wishTextDropdown = new WishTextDropdownBuilder().build(true);
        this._stack1.addControl(this._wishTextDropdown);

        this._fontFamilyDropdown = new FontFamilyDropdownBuilder().build(true);
        this._stack1.addControl(this._fontFamilyDropdown);

        this._stack2 = new StackPanel();
        this._stack2.isVertical = false;

        this._colorPicker = new ColorPicker();
        this._colorPicker.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        this._colorPicker.value = new Color3(0, 0, 0);
        this._colorPicker.onValueChangedObservable.add((color) => {
            this._wishTextDropdown.foreground = color;
            puzzleEditor.setTextColor(color);
        });
        this._stack2.addControl(this._colorPicker);

        this._foregroundDropdown = new ForegroundDropdownBuilder().build(true);
        this._stack2.addControl(this._foregroundDropdown);

        this._backgroundDropdown = new BackgroundDropdownBuilder().build(true);
        this._stack2.addControl(this._backgroundDropdown);

        this._dropdownStack = new StackPanel();
        this._dropdownStack.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        this._dropdownStack.addControl(this._stack1);
        this._dropdownStack.addControl(this._stack2);

        guiManager.advancedTexture.addControl(this._dropdownStack);

        this.resize();

        sceneInitializer.addResizeObserver((width, height) => {
            this.resize();
        });

        gameModeManager.addGameModeChangedObserver(() => {
            this._colorPicker.isVisible = gameModeManager.currentMode === GameMode.GiftAdjustment;
        });

        puzzleEditor.setTable("assets/gift/tables/table_1-small.webp");// TODO
    }

    public fontFamilyChanged(fontFamily: string): void {
        puzzleEditor.setFontFamily(fontFamily);
        this._wishTextDropdown.dropdownFontFamily = fontFamily;
    }

    public wishTextChanged(wishText: string): void {
        puzzleEditor.setWishText(wishText);
    }

    public fgChanged(url: string): void {
        puzzleEditor.setPopupForeground(url);
    }

    public bgChanged(url: string): void {
        puzzleEditor.setPopupBackground(url);
    }

    private resize() {
        const renderWidth = ctx.engine.getRenderWidth();
        const renderHeight = ctx.engine.getRenderHeight();

        const vertical = renderHeight > renderWidth;

        this._dropdownStack.isVertical = vertical;

        const dropdownWidth = renderWidth * (vertical ? 0.4 : 0.2);
        const dropdownHeight = dropdownWidth / 5;

        this._dropdownStack.top = dropdownHeight / 4;
        this._dropdownStack.heightInPixels = (vertical ? 2 * dropdownHeight : dropdownHeight) + 1;

        this._stack1.widthInPixels = dropdownWidth * 2;
        this._stack1.heightInPixels = dropdownHeight;

        this._stack2.widthInPixels = dropdownWidth * 2;
        this._stack2.heightInPixels = dropdownHeight;

        this._colorPicker.widthInPixels = dropdownHeight;
        this._colorPicker.heightInPixels = dropdownHeight;
        //this._colorPicker.topInPixels = dropdownHeight / 4;

        this._wishTextDropdown.resize(dropdownWidth, dropdownHeight, dropdownWidth, true);
        this._fontFamilyDropdown.resize(dropdownWidth, dropdownHeight, dropdownWidth, true);
        this._foregroundDropdown.resize(dropdownHeight, dropdownHeight, dropdownHeight, true);
        this._backgroundDropdown.resize(dropdownHeight, dropdownHeight, dropdownHeight, true);

        let ratio = 1.5;  // TODO do it everywhere
        const horizMax = 0.9 * renderWidth;
        const vertMax = 0.8 * renderHeight;
        let maxRatio = horizMax / vertMax;

        if (vertical) {
            ratio = 1 / ratio;
            maxRatio = 1 / maxRatio;
        }
    }

    public start() {
        const introText = `Create a unique gift for someone special.

At the top, choose the puzzle dimensions to match your preferred difficulty.

Then, fill in the details below to personalize your custom puzzle — enter your friend's name, the age they're turning, and the language of your wish.`;

        this._languageSelector.selectionObserver = (code: string) => {
            this._wishTextDropdown.lang = code;
        }

        const formInputModel: FormInputModel[] = [
            {
                id: "Name",
                label: "Friend's Name",
                placeHolder: "e.g. Alex",
                type: "text",
                maxLength: 30
            },
            {
                id: "Age",
                label: "Coming Age",
                placeHolder: "e.g. 30",
                type: "number",
                min: 0,
                max: 150
            },
            {
                id: "Language",
                label: "Wish Language",
                placeHolder: "e.g. English",
                type: "selection",
                selector: this._languageSelector
            },
        ];

        popupHint.show(introText, "GIFT MAKING", 0.9, ShaderMode.SHADOW_WINDOW, Control.VERTICAL_ALIGNMENT_BOTTOM,
            () => { this.enterAdjustments(); },
            () => { alert('close') },
            null,
            PopupMode.Gift_Initial,
            formInputModel
        )
    }

    public enterAdjustments() {
        //popupHint.hide();

        let friendsName!: string;
        let age!: number;
        let lang!: string;

        for (const formRow of popupHint.formData) {
            switch (formRow.id) {
                case "Name": friendsName = formRow.value as string; break;
                case "Age": age = formRow.value as number; break;
                case "Language": lang = formRow.value as string; break;
            }
        }

        puzzleEditor.setFormData(friendsName, age);
        gameModeManager.enterGiftAdjustmentMode();

        popupHint.show("", "GIFT MAKING", 0.9, ShaderMode.SHADOW_WINDOW, Control.VERTICAL_ALIGNMENT_BOTTOM,
            () => { alert('next') },
            () => { alert('close') },
            null,
            PopupMode.Gift_Adjustments_Preview
        )
    }
}

const giftMaker = new GiftMaker();
export default giftMaker;