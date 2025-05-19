import { Control } from "@babylonjs/gui";
import Dropdown from "./Dropdown";
import tutorialManager from "./TutorialManager";

const Categories = {
    General: { key: "General", text: "General", url: "assets/category-general.webp" },
    Animals: { key: "Animals", text: "Animals", url: "assets/category-animal.webp" },
    Beach: { key: "Beach", text: "Beach", url: "assets/category-beach.webp" },
    Flowers: { key: "Flowers", text: "Flowers", url: "assets/category-floral.webp" },
}

export type Category = (typeof Categories)[keyof typeof Categories];

export default class CategoryDropdown extends Dropdown {
    private _optionSelected: boolean = false;

    constructor() {
        super({ halign: Control.HORIZONTAL_ALIGNMENT_LEFT, thickness: 0, icon: "assets/category-button.webp" });

        this.addImageOption(Categories.General);
        this.addImageOption(Categories.Animals);
        this.addImageOption(Categories.Beach);
        this.addImageOption(Categories.Flowers, true);
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

        if (userAction) {
            //tutorialManager.showPuzzleChooserHint();    // TODO action?
        }
    }
}
