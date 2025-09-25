import { Dropdown } from "./Dropdown";
import guiManager from "../GuiManager";
import sceneInitializer from "../../core3d/SceneInitializer";
import { GameMode } from "../../core3d/behaviors/GameModeManager";
import { ITranslationEntry } from "../../interfaces/ITranslationEntry";

interface DropdownOptions {
    gameModes: GameMode[];
    width?: number;
    height?: number;
    color?: string;
    background?: string;
    thickness?: number;
    halign?: number;
    valign?: number;
    isImageCollapsedAlsoTextExpanded?: boolean;
    isImageOnly?: boolean;
    lang?: string;
    translationSectionKey?: string;
    selectionCallback?(key: string, userAction: boolean, text: string): void;
}

interface DropdownItem {
    idText: string;
    imageUrl?: string | null;
    fontFamily?: string | null;
    imageOnly?: boolean | null;
}

export default abstract class DropdownBuilder {
    private _dropdown: Dropdown;
    private options: DropdownOptions;
    private items: DropdownItem[] = [];

    constructor(options: DropdownOptions) {
        this.options = options;

        this._dropdown = new Dropdown({
            gameModes: this.options.gameModes,
            color: this.options.color || "black",
            background: this.options.background || "white",
            thickness: this.options.thickness,
            isImageCollapsedAlsoTextExpanded: this.options.isImageCollapsedAlsoTextExpanded,
            isImageOnly: this.options.isImageOnly,
            halign: this.options.halign,
            valign: this.options.valign,
            lang: this.options.lang,
            translationSectionKey: this.options.translationSectionKey,
            selectionCallback: this.options.selectionCallback
        });
    }

    protected get dropdown() {
        return this._dropdown;
    }

    protected abstract get storageItemName(): string;

    addOption(idText: string, imageUrl: string | null = null, fontFamily: string | null = null, imageOnly: boolean = false): void {
        this.items.push({ idText: idText, imageUrl, fontFamily, imageOnly });
    }

    build(customResize: boolean = false): Dropdown {
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
