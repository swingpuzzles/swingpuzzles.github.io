import DropdownBuilder from "./DropdownBuilder";
import { GameMode } from "../../core3d/behaviors/GameModeManager";
import giftMaker from "../GiftMaker";
import localStorageManager, { GiftStorageKeys } from "../../common/LocalStorageManager";
import tutorialManager from "../TutorialManager";

export default class TablesDropdownBuilder extends DropdownBuilder {
    private static readonly fromIndex = 1;
    private static readonly toIndex = 3;

    constructor() {
        super({
            gameModes: [ GameMode.GiftAdjustment ],
            isImageOnly: true,
            selectionCallback: (key, userAction) => { this.selectionCallback(key, userAction); }});

        for (let i = TablesDropdownBuilder.fromIndex; i <= TablesDropdownBuilder.toIndex; i++) {
            this.addImageOption("" + i);
        }
    }

    protected get storageItemName(): string {
        return GiftStorageKeys.GiftTables;
    }

    addImageOption(index: string) {
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

    selectionCallback(index: string, userAction: boolean = true) {
        const imageName = "table_" + index + "-small.webp";
        const imageUrl = "assets/gift/tables/" + imageName;

        localStorageManager.set(this.storageItemName, index);

        giftMaker.tableChanged(imageUrl, Number(index));

        if (userAction) {
            tutorialManager.finishGiftTutorial();
        }
    }
}
