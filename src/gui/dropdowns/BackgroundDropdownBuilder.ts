import DropdownBuilder from "./DropdownBuilder";
import { GameMode } from "../../components/behaviors/GameModeManager";
import giftMaker from "../GiftMaker";

export default class BackgroundDropdownBuilder extends DropdownBuilder {
    private static readonly bgs = [ "confetti", "fireworks", "gifts", "stars", "people" ];

    constructor() {
        super({ gameModes: [ GameMode.GiftAdjustment ], icon: "bubu",
            selectionCallback: (key, userAction) => { this.selectionCallback(key, userAction); }});

        for (let bg of BackgroundDropdownBuilder.bgs) {
            this.addImageOption(bg);
        }
    }

    protected get storageItemName(): string {
        return "giftBackground";
    }

    addImageOption(option: string) {
        const imageName = "bg-" + option + "-small.webp";
        const imageUrl = "assets/gift/bgs/" + imageName;

        this.addOption(option, imageUrl);

        const storedValue = localStorage.getItem(this.storageItemName);
        if (!storedValue || !BackgroundDropdownBuilder.bgs.includes(storedValue)) {
            localStorage.setItem(this.storageItemName, option);
        }

        if (localStorage.getItem(this.storageItemName) === option) {
            this.dropdown.doSelectAction(option, imageUrl, null, false);
        }
    }

    selectionCallback(option: string, userAction: boolean = true) {
        const imageName = "bg-" + option + "-small.webp";
        const imageUrl = "assets/gift/bgs/" + imageName;

        localStorage.setItem(this.storageItemName, option);

        giftMaker.bgChanged(imageUrl);

        if (userAction) {
            //tutorialManager.showPuzzleChooserHint();    // TODO tutorial action?
        }
    }
}
