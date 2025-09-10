import DropdownBuilder from "./DropdownBuilder";
import { GameMode } from "../../core3d/behaviors/GameModeManager";
import giftMaker from "../GiftMaker";
import localStorageManager, { GiftStorageKeys } from "../../common/LocalStorageManager";
import tutorialManager from "../TutorialManager";
class BackgroundDropdownBuilder extends DropdownBuilder {
    constructor() {
        super({
            gameModes: [GameMode.GiftAdjustment],
            isImageOnly: true,
            selectionCallback: (key, userAction) => { this.selectionCallback(key, userAction); }
        });
        for (let bg of BackgroundDropdownBuilder.bgs) {
            this.addImageOption(bg);
        }
    }
    get storageItemName() {
        return GiftStorageKeys.GiftBackground;
    }
    addImageOption(option) {
        const imageName = "bg-" + option + "-small.webp";
        const imageUrl = "assets/gift/bgs/" + imageName;
        this.addOption(option, imageUrl, null, true);
        const storedValue = localStorageManager.getString(this.storageItemName);
        if (!storedValue || !BackgroundDropdownBuilder.bgs.includes(storedValue)) {
            localStorageManager.set(this.storageItemName, option);
        }
        if (localStorageManager.getString(this.storageItemName) === option) {
            this.dropdown.doSelectAction(option, imageUrl, null, false);
        }
    }
    selectionCallback(option, userAction = true) {
        const imageName = "bg-" + option + "-small.webp";
        const imageUrl = "assets/gift/bgs/" + imageName;
        localStorageManager.set(this.storageItemName, option);
        giftMaker.bgChanged(imageUrl);
        if (userAction) {
            tutorialManager.finishGiftTutorial();
        }
    }
}
BackgroundDropdownBuilder.bgs = ["cartoons", "room", "autumn", "meadow", "trees", "garden", "stars"];
export default BackgroundDropdownBuilder;
