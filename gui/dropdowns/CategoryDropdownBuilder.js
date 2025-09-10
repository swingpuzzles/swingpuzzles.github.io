import { Control } from "@babylonjs/gui";
import { Categories, CategoryKeys } from "../../core3d/common/SceneContext";
import DropdownBuilder from "./DropdownBuilder";
import gameModeManager, { GameMode } from "../../core3d/behaviors/GameModeManager";
import localStorageManager, { CommonStorageKeys } from "../../common/LocalStorageManager";
import puzzleUrlHelper from "../../common/PuzzleUrlHelper";
import analyticsManager from "../../common/AnalyticsManager";
export default class CategoryDropdownBuilder extends DropdownBuilder {
    constructor() {
        super({
            gameModes: [GameMode.Initial],
            halign: Control.HORIZONTAL_ALIGNMENT_LEFT,
            thickness: 0,
            isCategory: true,
            isImageOnly: true,
            selectionCallback: (key, userAction) => { this.selectionCallback(key, userAction); }
        });
        this._optionSelected = false;
        const urlData = puzzleUrlHelper.readFromUrl();
        if (urlData.category) {
            localStorageManager.set(this.storageItemName, urlData.category);
        }
        this.addImageOption(Categories.General);
        this.addImageOption(Categories.Animals);
        this.addImageOption(Categories.Beach);
        this.addImageOption(Categories.Flowers);
        this.addImageOption(Categories.Gift, true);
    }
    get storageItemName() {
        return CommonStorageKeys.Category;
    }
    selectionCallback(key, userAction = true) {
        const category = Object.values(Categories).find(c => c.text === key);
        if (category) {
            this.selectAction(category, userAction);
        }
    }
    addImageOption(category, last = false) {
        this.addOption(category.text, category.url);
        if (!localStorageManager.getString(this.storageItemName) || (CategoryKeys.indexOf(localStorageManager.getString(this.storageItemName)) <= -1)) {
            localStorageManager.set(this.storageItemName, category.key);
        }
        if (localStorageManager.getString(this.storageItemName) === category.key || last && !this._optionSelected) {
            this.dropdown.doSelectAction(category.text, category.url, null, false, false);
            this._optionSelected = true;
        }
    }
    selectAction(category, userAction = true) {
        localStorageManager.set(this.storageItemName, category.key);
        // Track category change in dropdown
        if (userAction) {
            analyticsManager.trackDropdownInteraction('category_dropdown', category.key);
        }
        gameModeManager.handleCategoryChange(category, userAction);
        if (userAction) {
            //tutorialManager.showPuzzleChooserHint();    // TODO tutorial action?
        }
    }
}
