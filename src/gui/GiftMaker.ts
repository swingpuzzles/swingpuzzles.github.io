import { ColorPicker, Control, Image, StackPanel } from "@babylonjs/gui";
import popupHint, { PopupMode } from "./PopupHint";
import { ShaderMode } from "./ScreenShader";
import { FormInputModel } from "../model/FormInputModel";
import LanguageSelector from "./LanguageSelector";
import gameModeManager from "../components/behaviors/GameModeManager";
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
    private _bgImage!: Image;
    private _fgImage!: Image;

    constructor() {
    }

    public init() {
        this._bgImage = new Image("gift bg");
        this._bgImage.stretch = Image.STRETCH_EXTEND;

        guiManager.advancedTexture.addControl(this._bgImage);

        this._fgImage = new Image("gift fg");
        this._fgImage.stretch = Image.STRETCH_UNIFORM;
        //this._fgImage.height = "auto"; // preserve ratio

        guiManager.advancedTexture.addControl(this._fgImage);

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
            this._wishTextDropdown.foreground = color; // convert Color3 to CSS hex string
        });
        this._stack2.addControl(this._colorPicker);

        this._foregroundDropdown = new ForegroundDropdownBuilder().build(true);
        this._stack2.addControl(this._foregroundDropdown);

        this._backgroundDropdown = new BackgroundDropdownBuilder().build(true);
        this._stack2.addControl(this._backgroundDropdown);

        this._dropdownStack = new StackPanel();
        this._dropdownStack.addControl(this._stack1);
        this._dropdownStack.addControl(this._stack2);

        guiManager.advancedTexture.addControl(this._dropdownStack);

        this.resize();

        sceneInitializer.addResizeObserver((width, height) => {
            this.resize();
        });
    }

    public fontFamilyChanged(fontFamily: string): void {
        this._wishTextDropdown.fontFamily = fontFamily;
    }

    public fgChanged(url: string): void {
        this._fgImage.source = url;
        puzzleAssetsManager.addGuiImageSource(this._fgImage, url.replace("-small", ""));
    }

    public bgChanged(url: string): void {
        this._bgImage.source = url;
        puzzleAssetsManager.addGuiImageSource(this._bgImage, url.replace("-small", ""));
    }

    private resize() {
        const renderWidth = ctx.engine.getRenderWidth();
        const renderHeight = ctx.engine.getRenderHeight();

        const vertical = renderHeight > renderWidth;

        this._dropdownStack.isVertical = vertical;

        const dropdownWidth = renderWidth * (vertical ? 0.4 : 0.2);
        const dropdownHeight = dropdownWidth / 7;

        this._colorPicker.widthInPixels = dropdownHeight;
        this._colorPicker.heightInPixels = dropdownHeight;
        this._colorPicker.topInPixels = dropdownHeight / 4;

        this._wishTextDropdown.resize(dropdownHeight);
        this._fontFamilyDropdown.resize(dropdownHeight);
        this._foregroundDropdown.resize(dropdownHeight);
        this._backgroundDropdown.resize(dropdownHeight);

        let ratio = 1.5;  // TODO do it everywhere
        const horizMax = 0.9 * renderWidth;
        const vertMax = 0.8 * renderHeight;
        let maxRatio = horizMax / vertMax;

        if (vertical) {
            ratio = 1 / ratio;
            maxRatio = 1 / maxRatio;
        }

        if (maxRatio > ratio) {
            this._bgImage.widthInPixels = vertMax * ratio;
            this._bgImage.heightInPixels = vertMax;
        } else {
            this._bgImage.widthInPixels = horizMax;
            this._bgImage.heightInPixels = horizMax / ratio;
        }

        this._fgImage.widthInPixels = Math.min(this._bgImage.widthInPixels, this._bgImage.heightInPixels) * 0.9;
    }

    public start() {
        const introText = `Create a unique gift for someone special.

At the top, choose the puzzle dimensions to match your preferred difficulty.

Then, fill in the details below to personalize your custom puzzle — enter your friend's name, the age they're turning, and the language of your wish.`;

        this._languageSelector.selectionObserver = () => {
            console.log('selected');
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

        popupHint.show(introText, "GIFT MAKING", 0.9, ShaderMode.SHADOW_FULL, Control.VERTICAL_ALIGNMENT_BOTTOM,
            () => { popupHint.hide(); gameModeManager.enterGiftAdjustmentMode(); },
            () => { alert('close') },
            null,
            PopupMode.Gift,
            formInputModel
        )
    }

    public enterAdjustments() {

    }
}

const giftMaker = new GiftMaker();
export default giftMaker;