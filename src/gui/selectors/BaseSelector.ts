import { Button, Control, StackPanel } from "@babylonjs/gui";
import ISelector from "../../interfaces/ISelector";
import Constants from "../../core3d/common/Constants";
import { SelectorModel } from "../../model/SelectorModel";
import ctx from "../../core3d/common/SceneContext";

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

                this.resize(this.heightInPixels);

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
        const buttonsCount = Object.keys(this._selectorButtons).length;
        this.heightInPixels = height;
        let buttonHeight = height;
        let buttonwidth = buttonHeight * this.widthCoef;
        let border = buttonHeight / 6;

        if (buttonwidth * buttonsCount > ctx.engine.getRenderWidth()) {
            buttonwidth = ctx.engine.getRenderWidth() / buttonsCount * 0.9;
            buttonHeight = buttonwidth / this.widthCoef;
            border = buttonHeight / 18;
        }

        const cornerRadius = buttonHeight / 5;
        // Update visual state of all buttons
        Object.entries(this._selectorButtons).forEach(([id, button]) => {
            button.widthInPixels = buttonwidth;
            button.heightInPixels = buttonHeight;
            button.cornerRadius = cornerRadius;
            button.color = id === this._selectedId ? "#EA6A15" : "#cccccc";
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