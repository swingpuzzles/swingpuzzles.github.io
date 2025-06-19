import DropdownBuilder from "./DropdownBuilder";
import { GameMode } from "../../core3d/behaviors/GameModeManager";
import giftMaker from "../GiftMaker";

const FONT_FAMILIES = [ "Segoe Script", "Pacifico", "Comic Sans MS", "Brush Script MT" ];

export default class FontFamilyDropdownBuilder extends DropdownBuilder {
    constructor() {
        super({ gameModes: [ GameMode.GiftAdjustment ],
            selectionCallback: (key, userAction) => { this.selectionCallback(key, userAction); }});

        let currentFontFamily = localStorage.getItem(this.storageItemName)
        if (!currentFontFamily || !FONT_FAMILIES.includes(currentFontFamily)) {
            currentFontFamily = FONT_FAMILIES[0];
            localStorage.setItem(this.storageItemName, currentFontFamily);
        }

        for (let family of FONT_FAMILIES) {
            this.addFamily(family, family == currentFontFamily);
        }
    }

    protected get storageItemName(): string {
        return "giftFontFamily";
    }

    private addFamily(family: string, selected: boolean) {
        this.addOption(family, null, family);

        if (selected) {
            this.dropdown.doSelectAction(family, null, family, false);
        }
    }

    private selectionCallback(family: string, userAction: boolean = true) {
        localStorage.setItem(this.storageItemName, family);

        giftMaker.fontFamilyChanged(family);

        if (userAction) {
            //tutorialManager.showPuzzleChooserHint();// TODO tutorial?
        }
    }
}