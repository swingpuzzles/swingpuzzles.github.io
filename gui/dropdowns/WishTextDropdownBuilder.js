import DropdownBuilder from "./DropdownBuilder";
import { GameMode } from "../../core3d/behaviors/GameModeManager";
import wishes from '../../assets/data/wishes.json';
import giftMaker from "../GiftMaker";
import localStorageManager, { GiftStorageKeys } from "../../common/LocalStorageManager";
import { TranslationSectionKeys } from "../../core3d/misc/TranslationManager";
import tutorialManager from "../TutorialManager";
export default class WishTextDropdownBuilder extends DropdownBuilder {
    constructor() {
        super({ gameModes: [GameMode.GiftAdjustment], translationSectionKey: TranslationSectionKeys.GiftWishText,
            selectionCallback: (key, userAction, text) => { this.selectionCallback(key, userAction, text); } });
        let currentIdText = localStorageManager.getString(this.storageItemName);
        if (!currentIdText || !Object.values(wishes.wishes).find(c => c.id === currentIdText)) {
            currentIdText = wishes.wishes[0].id;
            localStorageManager.set(this.storageItemName, currentIdText);
        }
        for (let wish of wishes.wishes) {
            this.addWishText(wish.id, wish.id === currentIdText);
        }
    }
    get storageItemName() {
        return GiftStorageKeys.GiftWishText;
    }
    selectionCallback(key, userAction, text) {
        this.selectAction(key, userAction, text);
    }
    addWishText(idText, selected) {
        this.addOption(idText);
        if (selected) {
            this.dropdown.doSelectAction(idText, null, null, false);
        }
    }
    selectAction(idText, userAction, text) {
        localStorageManager.set(this.storageItemName, idText);
        giftMaker.wishTextChanged(text);
        if (userAction) {
            tutorialManager.finishGiftTutorial();
        }
    }
}
