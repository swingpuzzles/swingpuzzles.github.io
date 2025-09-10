import DropdownBuilder from "./DropdownBuilder";
import { GameMode } from "../../core3d/behaviors/GameModeManager";
import giftMaker from "../GiftMaker";
import localStorageManager, { GiftStorageKeys } from "../../common/LocalStorageManager";
import tutorialManager from "../TutorialManager";
const FONT_FAMILIES = ["Segoe Script", "Pacifico", "Comic Sans MS", "Brush Script MT"];
export default class FontFamilyDropdownBuilder extends DropdownBuilder {
    constructor() {
        super({ gameModes: [GameMode.GiftAdjustment],
            selectionCallback: (key, userAction) => { this.selectionCallback(key, userAction); } });
        let currentFontFamily = localStorageManager.getString(this.storageItemName);
        if (!currentFontFamily || !FONT_FAMILIES.includes(currentFontFamily)) {
            currentFontFamily = FONT_FAMILIES[0];
            localStorageManager.set(this.storageItemName, currentFontFamily);
        }
        for (let family of FONT_FAMILIES) {
            this.addFamily(family, family == currentFontFamily);
        }
    }
    get storageItemName() {
        return GiftStorageKeys.GiftFontFamily;
    }
    addFamily(family, selected) {
        this.addOption(family, null, family);
        if (selected) {
            this.dropdown.doSelectAction(family, null, family, false);
        }
    }
    selectionCallback(family, userAction = true) {
        localStorageManager.set(this.storageItemName, family);
        giftMaker.fontFamilyChanged(family);
        if (userAction) {
            tutorialManager.finishGiftTutorial();
        }
    }
}
