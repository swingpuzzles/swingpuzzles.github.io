import { Control } from "@babylonjs/gui";
import tutorialManager from "../TutorialManager";
import ctx, { Categories, Category } from "../../components/common/SceneContext";
import puzzleCircleBuilder from "../../components/builders/PuzzleCircleBuilder";
import DropdownBuilder from "./DropdownBuilder";
import gameModeManager, { GameMode } from "../../components/behaviors/GameModeManager";

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

        this.addImageOption(Categories.General);
        this.addImageOption(Categories.Animals);
        this.addImageOption(Categories.Beach);
        this.addImageOption(Categories.Flowers);
        this.addImageOption(Categories.Gift, true);
    }

    protected get storageItemName(): string {
        return "category";
    }

    private selectionCallback(key: string, userAction: boolean = true) {
        const category = Object.values(Categories).find(c => c.text === key);

        if (category) {
            this.selectAction(category, userAction);
        }
    }

    addImageOption(category: Category, last: boolean = false) {
        this.addOption(category.text, category.url);

        if (!localStorage.getItem(this.storageItemName) || !(localStorage.getItem(this.storageItemName)! in Categories)) {
            localStorage.setItem(this.storageItemName, category.key);
        }

        if (localStorage.getItem(this.storageItemName) === category.key || last && !this._optionSelected) {
            this.dropdown.doSelectAction(category.text, category.url, null, false);
            this._optionSelected = true;
        }
    }

    selectAction(category: Category, userAction: boolean = true) {
        localStorage.setItem(this.storageItemName, category.key);

        if (ctx.category !== category) {
            ctx.category = category;

            if (!userAction) {
                gameModeManager.enterInitialMode();
            }

            if (category == Categories.Gift) {
                gameModeManager.enterGiftInitialMode();
            } else {
                puzzleCircleBuilder.build();
            }
        }

        if (userAction) {
            //tutorialManager.showPuzzleChooserHint();    // TODO tutorial action?
        }
    }
}
