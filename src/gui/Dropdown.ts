import { Button, Container, Control, StackPanel, Image } from "@babylonjs/gui";
import sceneInitializer from "../components/SceneInitializer";
import guiManager from "./GuiManager";

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

export default class Dropdown {
    private container: Container;
    private button: Button;
    private options: StackPanel;
    private width!: number;
    private height!: number;
    private color: string;
    private background: string;
    private categoryIcon: Image | null;

    constructor(
        options: DropdownOptions = {}
    ) {
        this.color = options.color || "black";
        this.background = options.background || "white";

        // Container
        this.container = new Container();
        this.container.verticalAlignment = options.valign ?? Control.VERTICAL_ALIGNMENT_TOP;
        this.container.horizontalAlignment = options.halign ?? Control.HORIZONTAL_ALIGNMENT_CENTER;
        this.container.isHitTestVisible = false;
        this.container.zIndex = 30;

        // Primary button
        if (options.icon) {
            this.button = Button.CreateImageOnlyButton("Please Select", options.icon)
            
            this.button.background = "";
            this.button.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_LEFT;
            this.button.width = "20%"

            // Create and store the nested image (category icon)
            this.categoryIcon = new Image("categoryIcon", "");
            this.categoryIcon.width = "75%";
            this.categoryIcon.height = "75%";
            this.categoryIcon.horizontalAlignment = Control.HORIZONTAL_ALIGNMENT_CENTER;
            this.categoryIcon.verticalAlignment = Control.VERTICAL_ALIGNMENT_CENTER;
            this.categoryIcon.paddingRight = "5%";
            this.categoryIcon.paddingBottom = "20%";

            this.button.addControl(this.categoryIcon);
        } else {
            this.button = Button.CreateSimpleButton("Please Select", "Please Select ▼");
            this.categoryIcon = null;

            this.button.background = this.background;
        
            this.button.textBlock!.textHorizontalAlignment = Control.HORIZONTAL_ALIGNMENT_RIGHT;
        }

        this.button.hoverCursor = "pointer";
        this.button.thickness = options.thickness ?? 1;
        this.button.color = this.color;
        this.button.verticalAlignment = Control.VERTICAL_ALIGNMENT_TOP;

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
            this.container.zIndex = 30;
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
        this.container.widthInPixels = this.width;
        this.options.topInPixels = this.height;
        this.container.topInPixels = this.height / 4;

        if (this.button.textBlock) {
            this.button.textBlock.paddingRightInPixels = this.height / 4;
            this.button.textBlock.fontSizeInPixels = this.height / 2;
            this.button.heightInPixels = this.height;
        } else {
            this.container.leftInPixels = this.height / 4;
            this.button.heightInPixels = this.height * 1.8;
        }

        for (let o of this.options.children) {
            o.heightInPixels = this.height;
            (o as Button).textBlock!.fontSizeInPixels = this.height / 2;
        }
    }

    setContent(text: string, url: string | null = null) {
        if (this.button.textBlock) {
            this.button.textBlock.text = text;
        }

        if (url && this.categoryIcon) {
            this.categoryIcon.source = url;
        }
    }

    addOption(text: string, callback: () => void, imageUrl: string | null = null): void {
        let button;
        
        if (imageUrl != null) {
            button = Button.CreateImageButton(text, text, imageUrl);
        } else {
            button = Button.CreateSimpleButton(text, text);
        }

        button.heightInPixels = this.height;
        button.paddingTopInPixels = -1;
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
