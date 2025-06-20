import { Control } from "@babylonjs/gui";
import ctx, { Categories, Category } from "../../core3d/common/SceneContext";
import puzzleCircleBuilder from "../../core3d/builders/PuzzleCircleBuilder";
import DropdownBuilder from "./DropdownBuilder";
import gameModeManager, { GameMode } from "../../core3d/behaviors/GameModeManager";
import localStorageManager, { CommonStorageKeys } from "../../common/LocalStorageManager";
import puzzleUrlHelper from "../../common/PuzzleUrlHelper";

export default class CategoryDropdownBuilder extends DropdownBuilder {
    private _optionSelected: boolean = false;

    constructor() {
        super({
            gameModes: [ GameMode.Initial ],
            halign: Control.HORIZONTAL_ALIGNMENT_LEFT,
            thickness: 0,
            isCategory: true,
            isImageOnly: true,
            selectionCallback: (key, userAction) => { this.selectionCallback(key, userAction); }
        });

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

    protected get storageItemName(): string {
        return CommonStorageKeys.Category;
    }

    private selectionCallback(key: string, userAction: boolean = true) {
        const category = Object.values(Categories).find(c => c.text === key);

        if (category) {
            this.selectAction(category, userAction);
        }
    }

    addImageOption(category: Category, last: boolean = false) {
        this.addOption(category.text, category.url);

        if (!localStorageManager.getString(this.storageItemName) || !(localStorageManager.getString(this.storageItemName)! in Categories)) {
            localStorageManager.set(this.storageItemName, category.key);
        }

        if (localStorageManager.getString(this.storageItemName) === category.key || last && !this._optionSelected) {
            this.dropdown.doSelectAction(category.text, category.url, null, false);
            this._optionSelected = true;
        }
    }

    selectAction(category: Category, userAction: boolean = true) {
        localStorageManager.set(this.storageItemName, category.key);

        if (ctx.category !== category) {
            ctx.category = category;

            if (!gameModeManager.giftReceived) {
                puzzleUrlHelper.setCategory(category.key, userAction);

                if (category == Categories.Gift) {
                    gameModeManager.enterGiftInitialMode();
                } else {
                    if (!userAction) {
                        gameModeManager.enterInitialMode();
                    }

                    puzzleCircleBuilder.build();
                }
            }
        }

        if (userAction) {
            //tutorialManager.showPuzzleChooserHint();    // TODO tutorial action?
        }
    }
}
