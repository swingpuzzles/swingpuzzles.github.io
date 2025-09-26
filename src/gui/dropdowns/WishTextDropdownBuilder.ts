import DropdownBuilder from "./DropdownBuilder";
import { GameMode } from "../../core3d/behaviors/GameModeManager";
import wishes from '../../assets/data/wishes.json'
import giftMaker from "../GiftMaker";
import localStorageManager, { GiftStorageKeys } from "../../common/LocalStorageManager";
import { TranslationSectionKeys } from "../../core3d/misc/TranslationManager";
import tutorialManager from "../TutorialManager";

export default class WishTextDropdownBuilder extends DropdownBuilder {
    constructor() {
        super({ gameModes: [ GameMode.GiftAdjustment ], translationSectionKey: TranslationSectionKeys.GiftWishText,
            selectionCallback: (key, userAction, text) => { this.selectionCallback(key, userAction, text); },
            alwaysCallCallback: true });

        let currentIdText = localStorageManager.getString(this.storageItemName);

        if (!currentIdText || !Object.values(wishes.wishes).find(c => c.id === currentIdText)) {
            currentIdText = wishes.wishes[0].id;
            localStorageManager.set(this.storageItemName, currentIdText);
        }

        for (let wish of wishes.wishes) {
            this.addWishText(wish.id, wish.id === currentIdText);
        }
    }

    protected get storageItemName(): string {
        return GiftStorageKeys.GiftWishText;
    }

    private selectionCallback(key: string, userAction: boolean, text: string) {
        this.selectAction(key, userAction, text);
    }

    private addWishText(idText: string, selected: boolean) {
        this.addOption(idText);

        if (selected) {
            this.dropdown.doSelectAction(idText, null, null, false);
        }
    }

    private selectAction(idText: string, userAction: boolean, text: string) {
        localStorageManager.set(this.storageItemName, idText);

        giftMaker.wishTextChanged(text);

        if (userAction) {
            tutorialManager.finishGiftTutorial();
        }
    }
}