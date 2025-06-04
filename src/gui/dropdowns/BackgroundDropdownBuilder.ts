import DropdownBuilder from "./DropdownBuilder";
import { GameMode } from "../../components/behaviors/GameModeManager";

export default class BackgroundDropdownBuilder extends DropdownBuilder {
    private static readonly bgs = [ "confetti", "fireworks", "gifts", "stars" ];

    constructor() {
        super({ gameModes: [ GameMode.GiftAdjustment ], icon: "bubu",
            selectionCallback: (key, userAction) => { this.selectionCallback(key, userAction); }});

        for (let bg of BackgroundDropdownBuilder.bgs) {
            this.addImageOption(bg);
        }
    }

    protected get storageItemName(): string {
        return "giftForeground";
    }

    addImageOption(index: string) {
        const imageName = "bg-" + index + "-small.webp";
        const imageUrl = "assets/gift/bgs/" + imageName;

        this.addOption(imageName, imageUrl);

        const storedValue = localStorage.getItem(this.storageItemName);
        if (!storedValue || !BackgroundDropdownBuilder.bgs.includes(storedValue)) {
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
