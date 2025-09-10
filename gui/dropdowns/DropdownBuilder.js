import { Dropdown } from "./Dropdown";
import sceneInitializer from "../../core3d/SceneInitializer";
export default class DropdownBuilder {
    constructor(options) {
        this.items = [];
        this.options = options;
        this._dropdown = new Dropdown({
            gameModes: this.options.gameModes,
            color: this.options.color || "black",
            background: this.options.background || "white",
            thickness: this.options.thickness,
            isCategory: this.options.isCategory,
            isImageOnly: this.options.isImageOnly,
            halign: this.options.halign,
            valign: this.options.valign,
            lang: this.options.lang,
            translationSectionKey: this.options.translationSectionKey,
            selectionCallback: this.options.selectionCallback
        });
    }
    get dropdown() {
        return this._dropdown;
    }
    addOption(idText, imageUrl = null, fontFamily = null, imageOnly = false) {
        this.items.push({ idText: idText, imageUrl, fontFamily, imageOnly });
        return this;
    }
    build(customResize = false) {
        for (const item of this.items) {
            this._dropdown.addItem(item.idText, item.imageUrl, item.fontFamily, item.imageOnly === true);
        }
        if (!customResize) {
            sceneInitializer.addResizeObserver((w, h) => {
                this._dropdown.resize(7 * h / 20, h / 20, 7 * h / 20);
            });
        }
        return this._dropdown;
    }
}
