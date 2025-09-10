import { Control, StackPanel } from "@babylonjs/gui";
import Constants from "../../core3d/common/Constants";
export default class BaseSelector extends StackPanel {
    constructor(model) {
        super(Constants.ISELECTOR);
        this._selectionObserver = null;
        this._selectorButtons = {};
        this.isVertical = false;
        this.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        this.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
        model.forEach(row => {
            const btn = this.createButton(row);
            if (row.selected === true) {
                this._selectedId = row.id;
                btn.color = "#EA6A15";
            }
            else {
                btn.color = "#cccccc"; // selection border
            }
            btn.onPointerClickObservable.add(() => {
                this.selectedId = row.id;
                const border = this.heightInPixels / 6;
                // Update visual state of all buttons
                Object.entries(this._selectorButtons).forEach(([id, button]) => {
                    button.thickness = id === this._selectedId ? border : 0;
                    button.color = id === this._selectedId ? "#EA6A15" : "#cccccc";
                    button.paddingTopInPixels = id === this._selectedId ? 0 : border;
                    button.paddingBottomInPixels = id === this._selectedId ? 0 : border;
                    button.paddingLeftInPixels = id === this._selectedId ? 0 : border;
                    button.paddingRightInPixels = id === this._selectedId ? 0 : border;
                });
                if (this._selectionObserver) {
                    this._selectionObserver(this._selectedId);
                }
            });
            this._selectorButtons[row.id] = btn;
            this.addControl(btn);
        });
    }
    get selectedId() {
        return this._selectedId;
    }
    set selectedId(value) {
        this._selectedId = value;
        this.resize(this.heightInPixels);
    }
    resize(height) {
        this.heightInPixels = height;
        const buttonwidth = height * this.widthCoef;
        const border = height / 6;
        const cornerRadius = height / 5;
        // Update visual state of all buttons
        Object.entries(this._selectorButtons).forEach(([id, button]) => {
            button.widthInPixels = buttonwidth;
            button.heightInPixels = height;
            button.cornerRadius = cornerRadius;
            button.thickness = id === this._selectedId ? border : 0;
            button.paddingTopInPixels = id === this._selectedId ? 0 : border;
            button.paddingBottomInPixels = id === this._selectedId ? 0 : border;
            button.paddingLeftInPixels = id === this._selectedId ? 0 : border;
            button.paddingRightInPixels = id === this._selectedId ? 0 : border;
        });
    }
    get ui() {
        return this;
    }
    set selectionObserver(value) {
        this._selectionObserver = value;
    }
}
