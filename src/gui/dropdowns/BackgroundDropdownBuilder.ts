import DropdownBuilder from "./DropdownBuilder";
import { GameMode } from "../../core3d/behaviors/GameModeManager";
import giftMaker from "../GiftMaker";
import localStorageManager, { GiftStorageKeys } from "../../common/LocalStorageManager";
import tutorialManager from "../TutorialManager";

export default class BackgroundDropdownBuilder extends DropdownBuilder {
    private static readonly bgs = [ "cartoons", "room", "autumn", "meadow", "trees", "garden", "stars" ];

    constructor() {
        super({
            gameModes: [ GameMode.GiftAdjustment ],
            isImageOnly: true,
            selectionCallback: (key, userAction) => { this.selectionCallback(key, userAction); }});

        for (let bg of BackgroundDropdownBuilder.bgs) {
            this.addImageOption(bg);
        }
    }

    protected get storageItemName(): string {
        return GiftStorageKeys.GiftBackground;
    }

    addImageOption(option: string) {
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

    selectionCallback(option: string, userAction: boolean = true) {
        const imageName = "bg-" + option + "-small.webp";
        const imageUrl = "assets/gift/bgs/" + imageName;

        localStorageManager.set(this.storageItemName, option);

        giftMaker.bgChanged(imageUrl);

        if (userAction) {
            tutorialManager.finishGiftTutorial();
        }
    }
}
