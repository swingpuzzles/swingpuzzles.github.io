import { Control } from "@babylonjs/gui";
import { Categories, Category, CategoryKeys } from "../../core3d/common/Constants";
import DropdownBuilder from "./DropdownBuilder";
import gameModeManager, { MainMode } from "../../core3d/behaviors/GameModeManager";
import localStorageManager, { CommonStorageKeys } from "../../common/LocalStorageManager";
import puzzleUrlHelper from "../../common/PuzzleUrlHelper";
import analyticsManager from "../../common/AnalyticsManager";

export default class CategoryDropdownBuilder extends DropdownBuilder {
    private _optionSelected: boolean = false;

    constructor() {
        super({
            gameModes: [ MainMode.Initial ],
            halign: Control.HORIZONTAL_ALIGNMENT_LEFT,
            thickness: 0,
            isImageCollapsedAlsoTextExpanded: true,
            isImageOnly: true,
            translationSectionKey: "categories",
            selectionCallback: (key, userAction) => { this.selectionCallback(key, userAction); }
        });

        const urlData = puzzleUrlHelper.readFromUrl();

        if (urlData.mode) {
            localStorageManager.set(this.storageItemName, urlData.mode);
        }

        this.addImageOption(Categories.General);
        this.addImageOption(Categories.Animals);
        this.addImageOption(Categories.Beach);
        this.addImageOption(Categories.Flowers, true);
    }

    protected get storageItemName(): string {
        return CommonStorageKeys.Mode;
    }

    private selectionCallback(key: string, userAction: boolean = true) {
        const category = Object.values(Categories).find(c => c.key === key);

        if (category) {
            this.selectAction(category, userAction);
        }
    }

    addImageOption(category: Category, last: boolean = false) {
        this.addOption(category.key, category.url);

        if (!localStorageManager.getString(this.storageItemName) || (CategoryKeys.indexOf(localStorageManager.getString(this.storageItemName)!) <= -1)) {
            localStorageManager.set(this.storageItemName, category.key);
        }

        if (localStorageManager.getString(this.storageItemName) === category.key || last && !this._optionSelected) {
            this.dropdown.doSelectAction(category.key, category.url, null, false, false);
            this._optionSelected = true;
        }
    }

    async selectAction(category: Category, userAction: boolean = true) {
        localStorageManager.set(this.storageItemName, category.key);

        // Track category change in dropdown
        if (userAction) {
            analyticsManager.trackDropdownInteraction('category_dropdown', category.key);
        }

        await gameModeManager.handleCategoryChange(category, userAction);

        if (userAction) {
            //tutorialManager.showPuzzleChooserHint();    // TODO tutorial action?
        }
    }
}
