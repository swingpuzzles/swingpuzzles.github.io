import { AdvancedDynamicTexture, Button, Container, Control, StackPanel } from "@babylonjs/gui";

interface DropdownOptions {
    width?: number;
    height?: number;
    color?: string;
    background?: string;
    align?: number;
    valign?: number;
}

export default class Dropdown {
    private container: Container;
    private button: Button;
    private options: StackPanel;
    private height: string;
    private color: string;
    private background: string;

    constructor(
        private advancedTexture: AdvancedDynamicTexture,
        options: DropdownOptions = {}
    ) {
        const width = (options.width || 240) + "px";
        this.height = (options.height || 40) + "px";
        this.color = options.color || "black";
        this.background = options.background || "white";

        // Container
        this.container = new Container();
        this.container.width = width;
        this.container.verticalAlignment = options.align ?? Control.VERTICAL_ALIGNMENT_TOP;
        this.container.horizontalAlignment = options.valign ?? Control.HORIZONTAL_ALIGNMENT_CENTER;
        this.container.isHitTestVisible = false;

        // Primary button
        this.button = Button.CreateSimpleButton("Please Select", "Please Select ▼");
        this.button.height = this.height;
        this.button.background = this.background;
        this.button.color = this.color;
        this.button.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        
        this.button.textBlock!.paddingRight = "10px";
        this.button.textBlock!.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;

        // Options panel
        this.options = new StackPanel();
        this.options.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        this.options.top = this.height;
        this.options.isVisible = false;
        this.options.isVertical = true;

        this.button.onPointerUpObservable.add(() => {
            this.options.isVisible = !this.options.isVisible;
        });

        this.container.onPointerEnterObservable.add(() => {
            this.container.zIndex = 555;
        });

        this.container.onPointerOutObservable.add(() => {
            this.container.zIndex = 0;
            this.options.isVisible = false;
        });

        // Add controls
        this.advancedTexture.addControl(this.container);
        this.container.addControl(this.button);
        this.container.addControl(this.options);
    }

    get top(): string | number {
        return this.container.top;
    }

    set top(value: string | number) {
        this.container.top = value;
    }

    get left(): string | number {
        return this.container.left;
    }

    set left(value: string | number) {
        this.container.left = value;
    }

    setText(text: string) {
        this.button.textBlock!.text = text;
    }

    addOption(text: string, callback: () => void): void {
        const button = Button.CreateSimpleButton(text, text);
        button.height = this.height;
        button.paddingTop = "-1px";
        button.background = this.background;
        button.color = this.color;
        button.alpha = 1.0;

        button.onPointerUpObservable.add(() => {
            this.options.isVisible = false;
        });

        button.onPointerClickObservable.add(callback);

        this.options.addControl(button);
    }
}
