import DropdownBuilder from "./DropdownBuilder";
import { GameMode } from "../../core3d/behaviors/GameModeManager";
import giftMaker from "../GiftMaker";
import { GiftStorageKeys } from "../../common/LocalStorageManager";

export default class ForegroundDropdownBuilder extends DropdownBuilder {
    private static readonly fromIndex = 1;
    private static readonly toIndex = 5;

    constructor() {
        super({
            gameModes: [ GameMode.GiftAdjustment ],
            isImageOnly: true,
            selectionCallback: (key, userAction) => { this.selectionCallback(key, userAction); }});

        for (let i = ForegroundDropdownBuilder.fromIndex; i <= ForegroundDropdownBuilder.toIndex; i++) {
            this.addImageOption("" + i);
        }
    }

    protected get storageItemName(): string {
        return GiftStorageKeys.GiftForeground;
    }

    addImageOption(index: string) {
        const imageName = "torte_" + index + "-small.webp";
        const imageUrl = "assets/gift/tortes/" + imageName;

        this.addOption(index, imageUrl, null, true);

        const storedValue = Number(localStorage.getItem(this.storageItemName));
        if (!(Number(storedValue) >= ForegroundDropdownBuilder.fromIndex) || !(Number(storedValue) <= ForegroundDropdownBuilder.toIndex)) {
            localStorage.setItem(this.storageItemName, index);
        }

        if (localStorage.getItem(this.storageItemName) === index) {
            this.dropdown.doSelectAction(index, imageUrl, null, false);
        }
    }

    selectionCallback(index: string, userAction: boolean = true) {
        const imageName = "torte_" + index + "-small.webp";
        const imageUrl = "assets/gift/tortes/" + imageName;

        localStorage.setItem(this.storageItemName, index);

        giftMaker.fgChanged(imageUrl, Number(index));

        if (userAction) {
            //tutorialManager.showPuzzleChooserHint();    // TODO tutorial action?
        }
    }
}
