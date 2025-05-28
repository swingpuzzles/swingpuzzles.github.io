import { Dropdown } from "./Dropdown";
import guiManager from "../GuiManager";
import sceneInitializer from "../../components/SceneInitializer";

interface DropdownOptions {
    width?: number;
    height?: number;
    color?: string;
    background?: string;
    thickness?: number;
    halign?: number;
    valign?: number;
    icon?: string;
}

interface DropdownItem {
    text: string;
    callback: () => void;
    imageUrl?: string | null;
}

export default class DropdownBuilder {
    private _dropdown: Dropdown;
    private options: DropdownOptions = {};
    private items: DropdownItem[] = [];

    constructor(options: DropdownOptions = {}) {
        this.options = options;

        this._dropdown = new Dropdown({
            color: this.options.color || "black",
            background: this.options.background || "white",
            thickness: this.options.thickness,
            icon: this.options.icon,
            halign: this.options.halign,
            valign: this.options.valign,
        });
    }

    protected get dropdown() {
        return this._dropdown;
    }

    addOption(text: string, callback: () => void, imageUrl: string | null = null): this {
        this.items.push({ text, callback, imageUrl });
        return this;
    }

    build(): Dropdown {
        for (const item of this.items) {
            this._dropdown.addItem(item.text, item.callback, item.imageUrl);
        }

        guiManager.advancedTexture.addControl(this._dropdown);

        sceneInitializer.addResizeObserver((w, h) => {
            this._dropdown.resize(h / 20);
        });

        return this._dropdown;
    }
}
