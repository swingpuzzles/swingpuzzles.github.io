import { Button, Control, StackPanel } from "@babylonjs/gui";
import ISelector from "../../interfaces/ISelector";
import Constants from "../../core3d/common/Constants";
import { SelectorModel } from "../../model/SelectorModel";

export default abstract class BaseSelector extends StackPanel implements ISelector {
    protected _selectionObserver: ((code: string) => void) | null = null;
    protected _selectorButtons: Record<string, Button> = {};
    protected _selectedId!: string;

    constructor(model: SelectorModel[]) {
        super(Constants.ISELECTOR);

        this.isVertical = false;
        this.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
        this.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;

        model.forEach(row => {
            const btn = this.createButton(row);

            if (row.selected === true) {
                this._selectedId = row.id;
                btn.color = "#EA6A15"
            } else {
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

    abstract get id(): string;
    abstract createButton(row: SelectorModel): Button;
    abstract get widthCoef(): number;

    get selectedId(): any {
        return this._selectedId;
    }

    set selectedId(value: any) {
        this._selectedId = value;
        this.resize(this.heightInPixels);
    }

    resize(height: number): void {
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

    get ui(): Control {
        return this;
    }

    public set selectionObserver(value: (id: string) => void) {
        this._selectionObserver = value;
    }
}