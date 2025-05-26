import { Control } from "@babylonjs/gui";
import popupHint, { PopupMode } from "./PopupHint";
import { ShaderMode } from "./ScreenShader";
import FormInputModel from "../model/FormInputModel";

class GiftMaker {
    constructor() {

    }

    start() {
        const introText = `Create a unique gift for someone special.
            
Fill in the details below to personalize your custom puzzle.`;

        const formInputModel: FormInputModel[] = [
            {
                id: "Name",
                defaultLabel: "Friend's Name",
                placeHolder: "e.g. Alex"
            },
            {
                id: "Age",
                defaultLabel: "Coming Age",
                placeHolder: "e.g. 30"
            },
            {
                id: "Language",
                defaultLabel: "Wish Language",
                placeHolder: "e.g. English"
            },
            {
                id: "Text",
                defaultLabel: "Wish Text",
                placeHolder: "e.g. Happy Birthday!"
            },
            {
                id: "Font",
                defaultLabel: "Font",
                placeHolder: "e.g. Comic Sans MS"
            },
        ];

        popupHint.show(introText, "GIFT MAKING", 0.9, ShaderMode.SHADOW_FULL, Control.VERTICAL_ALIGNMENT_CENTER,
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