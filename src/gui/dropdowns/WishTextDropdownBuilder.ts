import DropdownBuilder from "./DropdownBuilder";
import { GameMode } from "../../components/behaviors/GameModeManager";
import wishes from '../../assets/wishes.json'

export default class WishTextDropdownBuilder extends DropdownBuilder {
    constructor() {
        super({ gameModes: [ GameMode.GiftAdjustment ], translationEntry: wishes.wishes,
            selectionCallback: (key, userAction) => { this.selectionCallback(key, userAction); } });

        let currentIdText = localStorage.getItem("giftWishText");

        if (!currentIdText || !Object.values(wishes.wishes).find(c => c.id === currentIdText)) {
            currentIdText = wishes.wishes[0].id;
            localStorage.setItem("giftWishText", currentIdText);
        }

        for (let wish of wishes.wishes) {
            this.addWishText(wish.id, wish.id === currentIdText);
        }
    }

    private selectionCallback(key: string, userAction: boolean = true) {
        this.selectAction(key, userAction);
    }

    private addWishText(idText: string, selected: boolean) {
        this.addOption(idText);

        if (selected) {
            this.dropdown.doSelectAction(idText, null, null, false);
        }
    }

    private selectAction(idText: string, userAction: boolean = true) {
        localStorage.setItem("giftWishText", idText);

        if (userAction) {
            //tutorialManager.showPuzzleChooserHint();// TODO tutorial?
        }
    }
}