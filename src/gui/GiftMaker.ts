import { Control } from "@babylonjs/gui";
import popupHint, { PopupMode } from "./PopupHint";
import { ShaderMode } from "./ScreenShader";
import { FormInputModel } from "../model/FormInputModel";
import LanguageSelector from "./LanguageSelector";

class GiftMaker {
    private _languageSelector!: LanguageSelector;

    constructor() {
    }

    init() {
        this._languageSelector = new LanguageSelector();
    }

    start() {
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

        popupHint.show(introText, "GIFT MAKING", 0.9, ShaderMode.SHADOW_WINDOW, Control.VERTICAL_ALIGNMENT_BOTTOM,
            () => { alert('go next'); },
            () => { alert('close') },
            null,
            PopupMode.Gift,
            formInputModel
        )
    }
}

const giftMaker = new GiftMaker();
export default giftMaker;