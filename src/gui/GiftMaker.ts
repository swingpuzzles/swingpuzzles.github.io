import { Control, StackPanel } from "@babylonjs/gui";
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

class GiftMaker {
    private _languageSelector!: LanguageSelector;
    private _dropdownStack!: StackPanel;
    private _stack1!: StackPanel;
    private _stack2!: StackPanel;
    private _fontFamilyDropdown!: Dropdown;
    private _wishTextDropdown!: Dropdown;

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

        this._dropdownStack = new StackPanel();
        this._dropdownStack.addControl(this._stack1);

        guiManager.advancedTexture.addControl(this._dropdownStack);

        this.resize();

        sceneInitializer.addResizeObserver((width, height) => {
            this.resize();
        });
    }

    private resize() {
        const renderWidth = ctx.engine.getRenderWidth();
        const renderHeight = ctx.engine.getRenderHeight();

        const vertical = renderHeight > renderWidth;

        this._dropdownStack.isVertical = vertical;

        const dropdownWidth = renderWidth * (vertical ? 0.4 : 0.2);
        const dropdownHeight = dropdownWidth / 7;

        this._wishTextDropdown.resize(dropdownHeight);
        this._fontFamilyDropdown.resize(dropdownHeight);

        /*this._wishTextDropdown.widthInPixels = dropdownWidth;
        this._wishTextDropdown.heightInPixels = dropdownHeight;

        this._fontFamilyDropdown.widthInPixels = dropdownWidth;
        this._fontFamilyDropdown.heightInPixels = dropdownHeight;*/
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
            /*{
                id: "Text",
                label: "Wish Text",
                placeHolder: "e.g. Happy Birthday!"
                type: "selection",
            },
            {
                id: "Font",
                label: "Font",
                placeHolder: "e.g. Comic Sans MS"
                type: "selection",
            },*/
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