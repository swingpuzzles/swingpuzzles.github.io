import { Control } from "@babylonjs/gui";
import Dropdown from "./Dropdown";
import tutorialManager from "./TutorialManager";
import ctx, { Categories, Category } from "../components/common/SceneContext";
import puzzleCircleBuilder from "../components/builders/PuzzleCircleBuilder";

export default class CategoryDropdown extends Dropdown {
    private _optionSelected: boolean = false;

    constructor() {
        super({ halign: Control.HORIZONTAL_ALIGNMENT_LEFT, thickness: 0, icon: "assets/category-button.webp" });

        this.addImageOption(Categories.General);
        this.addImageOption(Categories.Animals);
        this.addImageOption(Categories.Beach);
        this.addImageOption(Categories.Flowers);
        this.addImageOption(Categories.Gift, true);
    }

    addImageOption(category: Category, last: boolean = false) {
        this.addOption(category.text, () => { this.selectAction(category); }, category.url);

        if (!localStorage.getItem("category") || !(localStorage.getItem("category")! in Categories)) {
            localStorage.setItem("category", category.key);
        }

        if (localStorage.getItem("category") === category.key || last && !this._optionSelected) {
            this.selectAction(category, false);
            this._optionSelected = true;
        }
    }

    selectAction(category: Category, userAction: boolean = true) {
        localStorage.setItem("category", category.key);

        this.setContent(category.text, category.url);

        if (ctx.category !== category) {
            ctx.category = category;

            if (category == Categories.Gift) {
                console.log('GIFT!'); // TODO
            } else {
                puzzleCircleBuilder.build();
            }
        }

        if (userAction) {
            //tutorialManager.showPuzzleChooserHint();    // TODO action?
        }
    }
}
