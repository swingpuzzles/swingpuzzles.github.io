import { Button, Container, Control, StackPanel } from "@babylonjs/gui";
import sceneInitializer from "../components/SceneInitializer";
import guiManager from "./GuiManager";

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
    private width!: number;
    private height!: number;
    private color: string;
    private background: string;

    constructor(
        options: DropdownOptions = {}
    ) {
        this.color = options.color || "black";
        this.background = options.background || "white";

        // Container
        this.container = new Container();
        this.container.verticalAlignment = options.align ?? Control.VERTICAL_ALIGNMENT_TOP;
        this.container.horizontalAlignment = options.valign ?? Control.HORIZONTAL_ALIGNMENT_CENTER;
        this.container.isHitTestVisible = false;
        this.container.zIndex = 3;

        // Primary button
        this.button = Button.CreateSimpleButton("Please Select", "Please Select ▼");
        this.button.background = this.background;
        this.button.color = this.color;
        this.button.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        
        this.button.textBlock!.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;

        // Options panel
        this.options = new StackPanel();
        this.options.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;
        this.options.isVisible = false;
        this.options.isVertical = true;

        this.button.onPointerUpObservable.add(() => {
            this.options.isVisible = !this.options.isVisible;
        });

        this.container.onPointerEnterObservable.add(() => {
            this.container.zIndex = 555;
        });

        this.container.onPointerOutObservable.add(() => {
            this.container.zIndex = 3;
            this.options.isVisible = false;
        });

        // Add controls
        guiManager.advancedTexture.addControl(this.container);
        this.container.addControl(this.button);
        this.container.addControl(this.options);

        sceneInitializer.addResizeObserver((width, height) => {
            this.height = height / 20;
            this.width = this.height * 7;

            this.resize();
        });
    }

    get left(): string | number {
        return this.container.left;
    }

    set left(value: string | number) {
        this.container.left = value;
    }

    set isVisible(value: boolean) {
        this.container.isVisible = value;
    }

    private resize() {
        this.container.width = this.width + "px";
        this.button.height = this.height + "px";
        this.options.top = this.height + "px";
        this.container.top = this.height / 4 + "px";
        this.button.textBlock!.paddingRight = this.height / 4 + "px";
        this.button.textBlock!.fontSize = this.height / 2 + "px";

        for (let o of this.options.children) {
            o.height = this.height + "px";
            (o as Button).textBlock!.fontSize = this.height / 2 + "px";
        }
    }

    setText(text: string) {
        this.button.textBlock!.text = text;
    }

    addOption(text: string, callback: () => void): void {
        const button = Button.CreateSimpleButton(text, text);
        button.height = this.height + "px";
        button.paddingTop = "-1px";
        button.background = this.background;
        button.color = this.color;
        button.alpha = 1.0;

        button.onPointerUpObservable.add(() => {
            this.options.isVisible = false;
        });

        button.onPointerClickObservable.add(callback);

        this.options.addControl(button);

        this.resize();
    }
}
