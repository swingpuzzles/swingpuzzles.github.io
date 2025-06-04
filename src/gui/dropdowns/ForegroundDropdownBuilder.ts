import DropdownBuilder from "./DropdownBuilder";
import { GameMode } from "../../components/behaviors/GameModeManager";

export default class ForegroundDropdownBuilder extends DropdownBuilder {
    private static readonly fromIndex = 1;
    private static readonly toIndex = 5;

    constructor() {
        super({ gameModes: [ GameMode.GiftAdjustment ], icon: "bubu",
            selectionCallback: (key, userAction) => { this.selectionCallback(key, userAction); }});

        for (let i = ForegroundDropdownBuilder.fromIndex; i <= ForegroundDropdownBuilder.toIndex; i++) {
            this.addImageOption("" + i);
        }
    }

    protected get storageItemName(): string {
        return "giftForeground";
    }

    addImageOption(index: string) {
        const imageName = "torte_" + index + "-small.webp";
        const imageUrl = "assets/gift/tortes/" + imageName;

        this.addOption(imageName, imageUrl);

        const storedValue = Number(localStorage.getItem(this.storageItemName));
        if (!(Number(storedValue) >= ForegroundDropdownBuilder.fromIndex) || !(Number(storedValue) <= ForegroundDropdownBuilder.toIndex)) {
            localStorage.setItem(this.storageItemName, index);
        }

        if (localStorage.getItem(this.storageItemName) === index) {
            this.dropdown.doSelectAction(imageName, imageUrl, null, false);
        }
    }

    selectionCallback(index: string, userAction: boolean = true) {
        localStorage.setItem(this.storageItemName, index);

        if (userAction) {
            //tutorialManager.showPuzzleChooserHint();    // TODO tutorial action?
        }
    }
}
