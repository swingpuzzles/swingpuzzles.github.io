import DropdownBuilder from "./DropdownBuilder";
import { GameMode } from "../../core3d/behaviors/GameModeManager";
import giftMaker from "../GiftMaker";
import localStorageManager, { GiftStorageKeys } from "../../common/LocalStorageManager";
import tutorialManager from "../TutorialManager";
class ForegroundDropdownBuilder extends DropdownBuilder {
    constructor() {
        super({
            gameModes: [GameMode.GiftAdjustment],
            isImageOnly: true,
            selectionCallback: (key, userAction) => { this.selectionCallback(key, userAction); }
        });
        for (let i = ForegroundDropdownBuilder.fromIndex; i <= ForegroundDropdownBuilder.toIndex; i++) {
            this.addImageOption("" + i);
        }
    }
    get storageItemName() {
        return GiftStorageKeys.GiftForeground;
    }
    addImageOption(index) {
        const imageName = "torte_" + index + "-small.webp";
        const imageUrl = "assets/gift/tortes/" + imageName;
        this.addOption(index, imageUrl, null, true);
        const storedValue = Number(localStorageManager.getString(this.storageItemName));
        if (!(Number(storedValue) >= ForegroundDropdownBuilder.fromIndex) || !(Number(storedValue) <= ForegroundDropdownBuilder.toIndex)) {
            localStorageManager.set(this.storageItemName, index);
        }
        if (localStorageManager.getString(this.storageItemName) === index) {
            this.dropdown.doSelectAction(index, imageUrl, null, false);
        }
    }
    selectionCallback(index, userAction = true) {
        const imageName = "torte_" + index + "-small.webp";
        const imageUrl = "assets/gift/tortes/" + imageName;
        localStorageManager.set(this.storageItemName, index);
        giftMaker.fgChanged(imageUrl, Number(index));
        if (userAction) {
            tutorialManager.finishGiftTutorial();
        }
    }
}
ForegroundDropdownBuilder.fromIndex = 1;
ForegroundDropdownBuilder.toIndex = 5;
export default ForegroundDropdownBuilder;
