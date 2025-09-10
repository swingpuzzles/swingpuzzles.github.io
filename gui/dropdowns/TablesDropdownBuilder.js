import DropdownBuilder from "./DropdownBuilder";
import { GameMode } from "../../core3d/behaviors/GameModeManager";
import giftMaker from "../GiftMaker";
import localStorageManager, { GiftStorageKeys } from "../../common/LocalStorageManager";
import tutorialManager from "../TutorialManager";
class TablesDropdownBuilder extends DropdownBuilder {
    constructor() {
        super({
            gameModes: [GameMode.GiftAdjustment],
            isImageOnly: true,
            selectionCallback: (key, userAction) => { this.selectionCallback(key, userAction); }
        });
        for (let i = TablesDropdownBuilder.fromIndex; i <= TablesDropdownBuilder.toIndex; i++) {
            this.addImageOption("" + i);
        }
    }
    get storageItemName() {
        return GiftStorageKeys.GiftTables;
    }
    addImageOption(index) {
        const imageName = "table_" + index + "-small.webp";
        const imageUrl = "assets/gift/tables/" + imageName;
        this.addOption(index, imageUrl, null, true);
        const storedValue = Number(localStorageManager.getString(this.storageItemName));
        if (!(Number(storedValue) >= TablesDropdownBuilder.fromIndex) || !(Number(storedValue) <= TablesDropdownBuilder.toIndex)) {
            localStorageManager.set(this.storageItemName, index);
        }
        if (localStorageManager.getString(this.storageItemName) === index) {
            this.dropdown.doSelectAction(index, imageUrl, null, false);
        }
    }
    selectionCallback(index, userAction = true) {
        const imageName = "table_" + index + "-small.webp";
        const imageUrl = "assets/gift/tables/" + imageName;
        localStorageManager.set(this.storageItemName, index);
        giftMaker.tableChanged(imageUrl, Number(index));
        if (userAction) {
            tutorialManager.finishGiftTutorial();
        }
    }
}
TablesDropdownBuilder.fromIndex = 1;
TablesDropdownBuilder.toIndex = 3;
export default TablesDropdownBuilder;
