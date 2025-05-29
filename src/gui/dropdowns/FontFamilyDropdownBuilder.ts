import ctx from "../../components/common/SceneContext";
import Dropdown from "./DropdownBuilder";
import tutorialManager from "../TutorialManager";
import DropdownBuilder from "./DropdownBuilder";
import { GameMode } from "../../components/behaviors/GameModeManager";
import { Control } from "@babylonjs/gui";

const FONT_FAMILIES = [ "Segoe Script", "Pacifico", "Comic Sans MS", "Brush Script MT" ];

export default class FontFamilyDropdownBuilder extends DropdownBuilder {
    constructor() {
        super({ gameModes: [ GameMode.Initial ] });

        let currentFontFamily = localStorage.getItem("giftFontFamily")
        if (!currentFontFamily || !FONT_FAMILIES.includes(currentFontFamily)) {
            currentFontFamily = FONT_FAMILIES[0];
            localStorage.setItem("giftFontFamily", currentFontFamily);
        }

        for (let family of FONT_FAMILIES) {
            this.addFamily(family, family == currentFontFamily);
        }
    }

    private addFamily(family: string, selected: boolean) {
        this.addOption(family, () => { this.selectAction(family); }, null, family);

        if (selected) {
            this.selectAction(family, false);
        }
    }

    private selectAction(family: string, userAction: boolean = true) {
        localStorage.setItem("giftFontFamily", family);

        this.dropdown.setContent(family + "   ▼", null, family);

        if (userAction) {
            //tutorialManager.showPuzzleChooserHint();// TODO tutorial?
        }
    }
}